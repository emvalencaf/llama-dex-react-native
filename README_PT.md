# LLAMADex

## Resumo

Este projeto fornece um endpoint para processar imagens e retornar entradas semelhantes a Pokédex, alimentadas por um modelo de LLM. O usuário envia uma imagem (por exemplo, JPG) para o servidor backend, que invoca um modelo multimodal de LLM para identificar o objeto ou animal (por exemplo, cegonha) e criar uma entrada de Pokédex para o que foi identificado na imagem.

![Imagem LLAMADex](/docs/images/diagram_llama_dex.jpg)

## Estrutura
```
|__ docs              # documentação
|__ src               # código fonte
     |__ dex          # endpoint para a chamada do modelo de ia
     |    |__ prompts # prompt template
     |
     |__ config.py    # configuração das variáveis de ambiente principais
     |__ main.py      # a lógica principal do projeto
     |__ router.py    # o roteador principal
```

## Solução

### Tecnologias

<img src="https://img.shields.io/badge/Python-005571?style=for-the-badge&logo=python" alt="python logo" />
<img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="fastapi logo" />
<img src="https://img.shields.io/badge/LangChain-005571?style=for-the-badge&logo=langchain" alt="langchain logo"/>
<img src="https://img.shields.io/badge/LLAMA-005571?style=for-the-badge&logo=meta" alt="llama logo" />
<img src="https://img.shields.io/badge/Groq-005571?style=for-the-badge&logo=groq" alt="groq logo" />

O código deste projeto foi escrito em Python, escolhido por sua dominância no desenvolvimento de IA/ML e sua versatilidade para construir aplicações web. O framework FastAPI foi utilizado para desenvolver a API principal, responsável por gerenciar endpoints que interagem com o modelo generativo e processam as requisições.

Para otimizar as interações com o modelo generativo, o LangChain foi empregado. Esse framework estruturou o fluxo de prompts e respostas, permitindo um processamento e recuperação eficientes das informações.

No núcleo do projeto está o modelo de IA generativa LLAMA (llama-3.2-11b-vision-preview), um modelo multimodal capaz de realizar tarefas de geração de texto e visão computacional. Modelos multimodais podem processar entradas como imagens, ampliando suas aplicações. O LLAMA foi escolhido por ser um modelo de ponta, open-source, desenvolvido pela Meta, oferecendo recursos avançados e flexibilidade.

Por fim, o Groq, um serviço baseado na nuvem, foi utilizado para hospedar o modelo generativo e fornecer acesso aos seus endpoints gratuitamente (na época deste projeto). Este serviço foi especialmente adequado, pois o projeto serve como uma prova de conceito para demonstrar habilidades no desenvolvimento de IA, e não como uma solução comercial ou pronta para produção.

### Diagrama

![Fluxo de Interação](/docs/images/diagram_llama_dex_2.jpg)

### Arquitetura

O projeto foi desenvolvido com escalabilidade em mente e organizado de maneira profissional, inspirando-se no projeto [Netflix Dispatch](https://github.com/Netflix/dispatch).

A arquitetura escolhida é baseada no design `N-Layer`, com o objetivo de melhorar a legibilidade do código e facilitar o desenvolvimento de novas funcionalidades e a manutenção. Cada `feature` do projeto é encapsulada dentro de seu próprio módulo (por exemplo, o módulo Dex), garantindo autonomia e independência.

Essa abordagem modular garante que o projeto esteja pronto para ser implantado como um microserviço.

#### Módulo Dex

O **Módulo Dex** centraliza toda a lógica relacionada à criação de entradas semelhantes a Pokédex alimentadas pelo modelo LLAMA. Ele inclui:
- **Roteador**: Gerencia os endpoints da API do módulo.
- **Serviços**: Contém a lógica central.
- **Dependências**: Gerencia recursos e utilitários compartilhados.

Além disso, o Módulo Dex contém os **prompts** usados para interagir com o modelo de IA generativa.

### Ajuste de Parâmetros

Como o núcleo do projeto é um classificador de imagens, é crucial tornar o modelo mais previsível e estável para evitar classificações erráticas.

O projeto enfrenta três desafios principais:

1. **Classificação Errática**: O modelo pode gerar classificações aleatórias ou incorretas.
2. **Formato de Saída Imrevisível**: O formato da saída do modelo pode variar a cada execução, dificultando o consumo de dados de forma consistente pela API.
3. **Excesso de Palavras**: O modelo pode gerar saídas excessivamente longas, aumentando o custo e reduzindo a experiência do usuário.

Para resolver esses desafios, focamos em **engenharia de prompts** e **ajustes nos parâmetros do modelo**.

Como o modelo serve como um classificador de imagens, minimizar a aleatoriedade é essencial. Para isso, o parâmetro `temperature` é definido como zero por padrão para garantir um comportamento mais determinístico:

```python
def get_model(max_token: int = 200,
              temperature: float = 0,
              stream: bool = False):
    return ChatGroq(temperature=temperature,
                    max_tokens=max_token,
                    streaming=stream,
                    model=dex_settings.MODEL_NAME,
                    api_key=dex_settings.GROQ_API_KEY)
```
Além disso, para reduzir a verbosidade e manter as respostas concisas, a saída do modelo é limitada a 200 tokens. Isso garante que a saída seja mais focada e evita textos desnecessariamente longos.

Uma abordagem alternativa para resultados mais criativos poderia envolver separar as tarefas em duas etapas e encadear as respostas do modelo:

**Classificador**: Classifica a imagem.
**Indicador de Output**: Gera uma saída com base na classificação.

No entanto, neste projeto, a classificação e a geração da entrada são combinadas em uma única etapa para manter a saída mais estruturada e "robótica", semelhante a como uma entrada de Pokédex seria.

Aviso: Tokens de entrada são significativamente mais baratos que tokens de saída, então considerar o comprimento da saída pode ajudar a gerenciar os custos de forma eficaz.

### Engenharia de Prompt

O núcleo do projeto depende fortemente da **engenharia de prompt** para tornar o modelo generativo mais previsível e estável.

Neste projeto, os elementos do prompt são estruturados usando tags para garantir que o modelo se concentre nas instruções corretas. Esses elementos são os seguintes:

1. **Role**: Atribui um papel específico ao modelo de IA, fornecendo contexto sobre como ele deve executar suas tarefas.
2. **Instruções**: Especifica diretrizes detalhadas sobre como o modelo deve gerar o texto.
3. **Indicador de Saída**: Define o formato esperado da saída do modelo. Para este projeto, a saída deve ser estritamente um objeto JSON. Saídas impróprias, como o exemplo abaixo, fariam o aplicativo falhar:
```
Aqui está minha entrada de Pokédex:
{
    "name": "Humano",
    "entry": "loren ipsum"
}

```
4. **Exemploes**: Fornece entradas e saídas de exemplo para guiar o modelo na execução de seu papel e no cumprimento das instruções. Exemplos ajudam a melhorar a compreensão do modelo e a garantir a consistência da saída.

Ao combinar esses elementos, o projeto atinge uma abordagem estruturada e confiável para gerar entradas de Pokédex, garantindo compatibilidade com os requisitos da aplicação.

## Como usar

### Backend

1. Primeiramente, crie uma conta em [GROQ](https://groq.com/)  e gere uma chave de API para o projeto.
2. Clone o projeto executando o seguinte comando:
```bash
git clone https://github.com/emvalencaf/llama-dex.git

```
3. Navegue até a raiz do projeto executando o comando no terminal:
```bash
cd llama-dex
```
4. Crie um ambiente virtual para o projeto:
- para Linux
```bash
python -m venv .venv
source .venv/bin/activate
```
- para windows
```bash
python -m venv .venv
.venv/Scripts/activate
```
5. Instale as dependências do projeto:
```bash
pip install -r requirements.txt
```
6. Configure um arquivo `.env` na raiz do projeto e defina todas as variáveis de ambiente necessárias:
```makefile
GROQ_API_KEY=<defina a chave da API do Groq, sem a chave o projeto não funcionará>
API_V_STR=/api/v1
MODEL_NAME=llama-3.2-11b-vision-preview
FRONTEND_URL=<defina a URL do frontend, por padrão é localhost:3000>
ENVIRONMENT=<defina o ambiente, por padrão é development>
BACKEND_HOST=<defina o host do backend, por padrão é localhost>
BACKEND_PORT=<defina a porta do backend, por padrão é 8000>
```
7. Finalmente, execute o servidor com o comando:
```bash
python src/main.py
```

## Frontend
1. Abra um terminal no diretório raiz do projeto e execute o comando a seguir para instalar as dependências do projeto:
```bash
npm install
```
2. Vá ao arquivo `DexScanner.js` e modifique a linha 85 mudando o hostname da api para o servidor do backend
![Print of DexScanner.js](/docs/images/dexscanner_sc.png)
3. Execute o commando to para rodar o projeto:
```bash
npm run start
```
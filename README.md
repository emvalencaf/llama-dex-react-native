# LLAMADex

## Summary

This project provides an endpoint for processing images and returning pokedex alike entries powered by an LLM Model. The user send to the backend server an image (e.g. jpg) and then the server will invoke a multimodal LLM model for identify the object or animal (e.g. stork) and create a pokedex entry for what was identified in the image.

![Image LLMDex](/docs/images/diagram_llama_dex.jpg)

## Structure
```
|__ docs              # documentations
|__ src               # codes
     |__ dex          # endpoint for chat completion
     |    |__ prompts # prompt template
     |
     |__ config.py    # the main configuration env. vars for project
     |__ main.py      # the main logic
     |__ router.py    # the main router
```

## Solution 

### Technologies

<div style="display:flex; gap: 10px;">
<img src="https://img.shields.io/badge/Python-005571?style=for-the-badge&logo=python" alt="python logo" />
<img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="fastapi logo" />
<img src="https://img.shields.io/badge/LangChain-005571?style=for-the-badge&logo=langchain" alt="langchain logo"/>
<img src="https://img.shields.io/badge/LLAMA-005571?style=for-the-badge&logo=meta" alt="llama logo" />
<img src="https://img.shields.io/badge/Groq-005571?style=for-the-badge&logo=groq" alt="groq logo" />
</div>

The code for this project was written in Python, chosen for its dominance in AI/ML development and its versatility in building web applications. The FastAPI framework was utilized to develop the main API, responsible for managing endpoints that interact with the generative model and handle incoming requests.

To streamline interactions with the generative model, LangChain was employed. This framework structured the flow of prompts and responses, enabling efficient processing and retrieval of information.

At the core of the project is the generative AI model LLAMA (llama-3.2-11b-vision-preview), a multimodal model capable of text generation and computer vision tasks. Multimodal models can process inputs such as images, broadening their applicability. LLAMA was selected because it is a leading open-source model developed by Meta, offering cutting-edge capabilities and flexibility.

Finally, Groq, a cloud-based service, was used to host the generative model and provide access to its endpoints for free (at the time of this project). This service was particularly suitable as the project serves as a proof of concept aimed at showcasing AI application development skills, rather than being a commercial or production-ready solution.

### Diagram

![Interaction Flow](/docs//images/diagram_llama_dex_2.jpg)

### Architecture

The project was designed with scalability in mind and organized in a professional manner, taking inspiration from the [Netflix Dispatch](https://github.com/Netflix/dispatch) project.

The chosen architecture is based on an `N-Layer` design, aimed at improving code readability and facilitating the development of new features and maintenance. Each project `feature` is encapsulated within its own module (e.g., the Dex module), ensuring autonomy and independence. 

This modular approach ensures the project is ready to be deployed as a microservice.

#### Dex Module

The **Dex Module** centralizes all logic related to creating Pokédex-like entries powered by the LLAMA model. It includes:
- **Router**: Handles the module’s API endpoints.
- **Services**: Contains the core logic.
- **Dependencies**: Manages shared resources and utilities.

Additionally, the Dex Module contains the **prompts** used for interacting with the generative AI model.

### Adjusting Parameters

Since the core of the project is an image classifier, it is crucial to make the model more predictable and stable to avoid erratic classifications.

The project faces three primary challenges:

1. **Crazy Classification**: The model may produce highly random or incorrect classifications.
2. **Unpredictable Output Format**: The model’s output format may vary each time, making it difficult to consume data consistently through the API.
3. **Wordiness**: The model can generate unnecessarily long outputs, increasing the cost and reducing the user experience.

To address these challenges, we focus on **prompt engineering** and **adjusting model parameters**.

Since the model serves as an image classifier, minimizing randomness is essential. To achieve this, the `temperature` parameter is set to zero by default to ensure more deterministic behavior:

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
Additionally, to reduce wordiness and keep responses concise, the model's output is capped at 200 tokens. This ensures the output is more focused and avoids unnecessarily long texts.

An alternative approach for more creative outputs could involve separating the tasks into two stages and chaining the model's responses:

**Classifier**: Classifies the image.
**Entry Generation**: Generates an entry based on the classification.

However, in this project, the classification and entry generation are combined in a single step to keep the output more structured and "robotic," similar to how a Pokedex entry would look.

**Disclaimer**: Input tokens are significantly cheaper than output tokens, so careful consideration of output length can help manage costs effectively.


### Prompt Engineering

The project's core relies heavily on **prompt engineering** to make the generative AI more predictable and stable.

In this project, prompt elements are structured using tags to ensure the model focuses on the correct instructions. These elements are as follows:

1. **Role**: Assigns a specific role to the AI model, providing context on how it should execute its tasks.
2. **Instructions**: Specifies detailed guidelines on how the model should generate text.
3. **Output Indicator**: Defines the expected format of the model's output. For this project, the output must strictly be a JSON object. Improper outputs like the example below would cause the application to crash:
    ```json
    Here is my pokedex entry:
    {
        "name": "Human",
        "entry": "loren ipsum"
    }
    ```
4. **Examples**: Provides sample inputs and outputs to guide the model in executing its role and following instructions. Examples enhance the model's understanding and help ensure output consistency.

By combining these elements, the project achieves a structured and reliable approach to generating Pokedex entries, ensuring compatibility with the application’s requirements.


## How use

## Backend
1. First of all, create an account in [GROQ](https://groq.com/) and generate an api key for the project.
2. Now you clone the project by execute the following command:
```bash
git clone https://github.com/emvalencaf/llama-dex.git

```
3. Then you navigate to the project root by excute the following command at the same terminal:
```bash
cd llama-dex
```
4. You will create a virtual environment for the project
- for Linux
```bash
python -m venv .venv
source .venv/bin/activate
```
- for windows
```bash
python -m venv .venv
.venv/Scripts/activate
```
5. Then you will install all dependencies:
```
pip install -r requirements.txt
```
6. You will configure at the root of the project a `.env` file and set all the necessary environment variables:
```
GROQ_API_KEY=<set groq api key, without the key the project wont run>
API_V_STR=/api/v1
MODEL_NAME=llama-3.2-11b-vision-preview
FRONTEND_URL=<set a frontend url, by default is localhost:3000>
ENVIRONMENT=<set environment, by default is development>
BACKEND_HOST=<set backend host, by default it localhost>
BACKEND_PORT=<set backend port, by default it 8000>
```
7. Finally you can run the server by execute the command:
```bash
python src/main.py
```

## Frontend
1. Open up a terminal at the project's root and execute the following command to install all dependencies:
```bash
npm install
```
2. Go to the file `DexScanner.js` and change at the line 85 the hostname of your backend server
![Print of DexScanner.js](/docs/images/dexscanner_sc.png)
3. Execute the command to execute the project:
```bash
npm run start
```
import { useState } from "react";
import {
    TouchableOpacity,
    Image,
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    Alert,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';


const { width } = Dimensions.get('window');


export default function DexScanner() {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const requestPermissions = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraPermission.status !== 'granted' || galleryPermission.status !== 'granted') {
            Alert.alert(
                'Necessaries permissions',
                'We need access to your camera and gallery to identifies object or animals',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const pickImage = async (useCamera = false) => {
        if (!(await requestPermissions())) return;

        try {
            const result = await (useCamera
                ? ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 1,
                })
                : ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaType.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 1,
                }));

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                setData(null);
                setError(null);
            }
        } catch (err) {
            setError('Error in capture a photo from gallery. Try again later');
        }
    };

    const uploadImage = async () => {
        if (!image) {
            Alert.alert('None Image', 'Please select or take a photo first');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', {
            uri: image,
            name: 'image.jpg',
            type: 'image/jpeg',
        });

        try {
            const api_url = 'http://10.0.0.151:8000/api/v1/dex/chat_completion'; // COLOQUE AQUI A URL DO BACKEND
            const response = await fetch(api_url, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error(`Validation Error: ${responseData.detail.msg}`);
                } else if (response.status === 500) {
                    throw new Error(`Server Error: ${responseData.detail}`);
                } else {
                    throw new Error('Unknown Error in processing image');
                }
            }

            setData(responseData.data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.dexHeader}>
                <View style={styles.headerLights}>
                    <View style={styles.mainLight} />
                    <View style={styles.smallLight} />
                    <View style={styles.smallLight} />
                    <View style={styles.smallLight} />
                </View>
                <Text style={styles.title}>Dex Scanner</Text>
            </View>

            <View style={styles.imageContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <MaterialIcons name="camera-alt" size={50} color="#666" />
                        <Text style={styles.placeholderText}>Nenhuma imagem selecionada</Text>
                    </View>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.cameraButton]}
                    onPress={() => pickImage(true)}
                >
                    <MaterialIcons name="camera-alt" size={24} color="white" />
                    <Text style={styles.buttonText}>Câmera</Text>
                </TouchableOpacity>

            </View>

            <TouchableOpacity
                style={[styles.button, styles.scanButton, !image && styles.buttonDisabled]}
                onPress={uploadImage}
                disabled={!image || loading}
            >
                <MaterialIcons name="search" size={24} color="white" />
                <Text style={styles.buttonText}>Identificar Objeto/Animal</Text>
            </TouchableOpacity>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#DC0A2D" />
                    <Text style={styles.loadingText}>Analisando...</Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error" size={24} color="#DC0A2D" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {data && (
                <View style={styles.resultContainer}>
                    <Text style={styles.dexName}>{data.name}</Text>
                    <Text style={styles.dexEntry}>{data.entry}</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DC0A2D',
        paddingBottom: 10,
    },
    dexHeader: {
        backgroundColor: '#DC0A2D',
        padding: 10,
        alignItems: 'center',
    },
    headerLights: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    mainLight: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#7FCDFF',
        borderWidth: 2,
        borderColor: 'white',
        marginRight: 10,
    },
    smallLight: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: '#FF5555',
        marginHorizontal: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    imageContainer: {
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 15,
        overflow: 'hidden',
        alignItems: "center",
        alignSelf: "center",
        maxHeight: 200,
        width: width - 20, // Ajuste para a largura da tela
        aspectRatio: 1, // Tornando a imagem quadrada
        height: width - 20, // Ajuste de altura para manter o aspecto
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    placeholderText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 25,
        minWidth: 120, // Ajuste de largura mínima para botões
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    cameraButton: {
        backgroundColor: '#395BA7',
    },
    galleryButton: {
        backgroundColor: '#4CAF50',
    },
    scanButton: {
        backgroundColor: '#2E3147',
        marginHorizontal: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    loadingText: {
        color: 'white',
        fontSize: 16,
        marginTop: 10,
    },
    errorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    errorText: {
        color: '#DC0A2D',
        fontSize: 16,
        marginLeft: 8,
    },
    resultContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        marginHorizontal: 20,
    },
    dexName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    dexEntry: {
        fontSize: 16,
        color: '#555',
    },
});
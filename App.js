import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import DexScanner from './DexScanner';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <DexScanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ZenFlow</Text>

      <Text style={styles.subtitle}>
        Cuide da sua mente, um momento de cada vez.
      </Text>

      {/* Botão Respiração */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Respiração Guiada</Text>
      </TouchableOpacity>

      {/* Botão Humor */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Registro de Humor</Text>
      </TouchableOpacity>

      {/* Botão Meditação */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Meditações</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F4F6FA",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4A6FA5",
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: "#567",
    textAlign: "center",
  },

  button: {
    width: "80%",
    padding: 15,
    backgroundColor: "#4A6FA5",
    borderRadius: 10,
    marginBottom: 15,
  },

  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

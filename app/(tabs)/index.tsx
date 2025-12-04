import { Link } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Fundo gradiente */}
      <View style={styles.gradient} />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>ZenFlow</Text>
        <Text style={styles.subtitle}>
          Cuide da sua mente. Respire, relaxe e evolua.
        </Text>
      </Animated.View>

      <View style={styles.options}>
        <Link href="/breathing" asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>🌬️</Text>
            <Text style={styles.cardTitle}>Respiração Guiada</Text>
            <Text style={styles.cardText}>
              Acalme sua mente com ciclos respiratórios.
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/mood" asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>📝</Text>
            <Text style={styles.cardTitle}>Registro de Humor</Text>
            <Text style={styles.cardText}>
              Acompanhe sua jornada emocional.
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/meditation" asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>🎧</Text>
            <Text style={styles.cardTitle}>Meditações</Text>
            <Text style={styles.cardText}>
              Sessões guiadas para foco e relaxamento.
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1229",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 80,
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "linear-gradient(180deg, #122044, #0A1229)",
  },

  header: {
    width: "100%",
    paddingHorizontal: 30,
    marginBottom: 30,
  },

  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#EAF6FF",
    textAlign: "left",
  },

  subtitle: {
    fontSize: 16,
    color: "#AAC7D9",
    marginTop: 6,
  },

  options: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },

  card: {
    backgroundColor: "#1A2647",
    padding: 20,
    borderRadius: 18,
    marginBottom: 18,
    shadowColor: "#4F8CFB",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },

  cardIcon: {
    fontSize: 26,
    marginBottom: 4,
    color: "#8FC6FF",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E8F4FF",
  },

  cardText: {
    marginTop: 4,
    fontSize: 14,
    color: "#BBD1E0",
  },
});

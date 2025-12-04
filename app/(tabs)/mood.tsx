import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MoodScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [currentDate] = useState(new Date());

  const moodOptions = [
    { value: 1, emoji: "😞", label: "Ruim" },
    { value: 2, emoji: "😟", label: "Triste" },
    { value: 3, emoji: "😐", label: "Neutro" },
    { value: 4, emoji: "🙂", label: "Bom" },
    { value: 5, emoji: "😄", label: "Ótimo" },
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem("mood_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch (error) {
      console.log("Erro ao carregar histórico", error);
    }
  };

  const saveHistory = async (newEntry: any) => {
    try {
      const updated = [...history, newEntry];
      setHistory(updated);
      await AsyncStorage.setItem("mood_history", JSON.stringify(updated));
    } catch (error) {
      console.log("Erro ao salvar histórico", error);
    }
  };

  const handleSave = () => {
    if (!selectedMood) return;

    const entry = {
      mood: selectedMood,
      note,
      date: new Date().toISOString(),
    };

    saveHistory(entry);

    setSelectedMood(null);
    setNote("");
  };

  /** 🔥 Botão para limpar histórico */
  const clearHistory = () => {
    Alert.alert(
      "Limpar Histórico",
      "Tem certeza que deseja apagar todo o histórico?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("mood_history");
            setHistory([]);
          },
        },
      ]
    );
  };

  /** Calcula dias do mês */
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = getDaysInMonth(
    currentDate.getMonth(),
    currentDate.getFullYear()
  );

  const getMoodColor = (moodValue: number) => {
    if (moodValue <= 2) return "#E57373";
    if (moodValue === 3) return "#FFD54F";
    return "#81C784";
  };

  /** 🔥 Agora marca certo considerando mês e ano */
  const getDayMood = (day: number) => {
    const entry = history.find((h) => {
      const d = new Date(h.date);
      return (
        d.getDate() === day &&
        d.getMonth() === currentDate.getMonth() &&
        d.getFullYear() === currentDate.getFullYear()
      );
    });
    return entry ? getMoodColor(entry.mood) : "#1C3554";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registro de Humor</Text>

        {/* Emojis */}
        <View style={styles.moodRow}>
          {moodOptions.map((m) => (
            <TouchableOpacity
              key={m.value}
              style={[
                styles.moodCircle,
                selectedMood === m.value && styles.moodSelected,
              ]}
              onPress={() => setSelectedMood(m.value)}
            >
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Como você está se sentindo?</Text>

        {/* Nota */}
        <TextInput
          style={styles.noteInput}
          placeholder="Escreva algo sobre seu dia..."
          placeholderTextColor="#9aa1b2"
          value={note}
          onChangeText={setNote}
          multiline
        />

        {/* Botão */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            !selectedMood && { backgroundColor: "#828282" },
          ]}
          disabled={!selectedMood}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>

        {/* Botão de apagar histórico */}
        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <Text style={styles.clearText}>Limpar Histórico</Text>
        </TouchableOpacity>

        {/* Mês */}
        <Text style={styles.sectionTitle}>Seu Mês</Text>

        {/* Calendário */}
        <View style={styles.calendar}>
          {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
            <View
              key={day}
              style={[styles.dayBox, { backgroundColor: getDayMood(day) }]}
            >
              <Text style={styles.dayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Histórico */}
        <Text style={styles.sectionTitle}>Histórico</Text>

        {history
          .slice()
          .reverse()
          .map((item, index) => (
            <View key={index} style={styles.historyBox}>
              <Text style={styles.historyItem}>
                {moodOptions[item.mood - 1].emoji} •{" "}
                {new Date(item.date).toLocaleDateString("pt-BR")}
              </Text>
              {item.note ? (
                <Text style={styles.historyNote}>{item.note}</Text>
              ) : null}
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F1C2E",
  },
  container: {
    paddingTop: 20,
    padding: 20,
    paddingBottom: 200,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#E8F7FF",
    textAlign: "center",
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  moodCircle: {
    width: 70,
    height: 70,
    backgroundColor: "#162941",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  moodSelected: {
    borderWidth: 3,
    borderColor: "#81C784",
  },
  moodEmoji: {
    fontSize: 32,
  },
  label: {
    textAlign: "center",
    color: "#E8F7FF",
    marginBottom: 12,
    fontSize: 16,
  },
  noteInput: {
    backgroundColor: "#142233",
    color: "#fff",
    borderRadius: 14,
    padding: 15,
    minHeight: 90,
    marginBottom: 20,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  saveText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  /** 🔥 Botão de limpar histórico */
  clearButton: {
    backgroundColor: "#D9534F",
    padding: 12,
    borderRadius: 12,
    marginBottom: 25,
  },
  clearText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#E8F7FF",
    marginBottom: 12,
    marginTop: 10,
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginBottom: 20,
  },
  dayBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    color: "#fff",
    fontWeight: "600",
  },
  historyBox: {
    backgroundColor: "#11293E",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  historyItem: {
    color: "#E8F7FF",
    fontWeight: "700",
    fontSize: 15,
  },
  historyNote: {
    color: "#C7CED6",
    marginTop: 6,
    fontSize: 14,
  },
});


import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

type Phase = "idle" | "inhale" | "hold" | "exhale";

const TIMINGS = {
  inhale: 4000,
  hold: 2000,
  exhale: 4000,
};

const TOTAL_CYCLE = TIMINGS.inhale + TIMINGS.hold + TIMINGS.exhale;

const SUGGESTIONS = [
  {
    id: "s1",
    title: "Mindfulness Rápido",
    minutes: 5,
    desc: "Foco na respiração e presença.",
  },
  {
    id: "s2",
    title: "Relaxamento Profundo",
    minutes: 10,
    desc: "Relaxamento corporal guiado.",
  },
  {
    id: "s3",
    title: "Atenção Plena",
    minutes: 15,
    desc: "Varredura corporal e respiração.",
  },
  {
    id: "s4",
    title: "Respiração Energizante",
    minutes: 3,
    desc: "Curta e revigorante.",
  },
];

export default function MeditationScreen() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sessionMsRemaining, setSessionMsRemaining] = useState<number>(0);

  // timestamps
  const sessionEndRef = useRef<number | null>(null);
  const cycleStartRef = useRef<number | null>(null);

  // polling interval ref
  const tickRef = useRef<number | null>(null);

  // prev phase to detect changes
  const prevPhaseRef = useRef<Phase>("idle");

  // aura animation
  const aura = useRef(new Animated.Value(1)).current;
  const auraAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // vibrate helper
  const vibrateFor = (p: Phase) => {
    if (p === "idle") return;
    const dur = p === "inhale" ? 80 : p === "hold" ? 60 : 120;
    // short vibrate works on both
    Vibration.vibrate(dur);
  };

  // animate aura to a target value in given duration (ms)
  const animateAuraTo = (toValue: number, duration: number) => {
    // stop previous and start new with exact duration
    aura.stopAnimation();
    if (auraAnimRef.current) {
      try {
        auraAnimRef.current.stop && auraAnimRef.current.stop();
      } catch {}
      auraAnimRef.current = null;
    }
    auraAnimRef.current = Animated.timing(aura, {
      toValue,
      duration: Math.max(0, duration),
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });
    auraAnimRef.current.start(() => {
      auraAnimRef.current = null;
    });
  };

  // compute phase from cycle position (0..TOTAL_CYCLE-1)
  const getPhaseFromCyclePos = (cyclePos: number): Phase => {
    if (cyclePos < TIMINGS.inhale) return "inhale";
    if (cyclePos < TIMINGS.inhale + TIMINGS.hold) return "hold";
    return "exhale";
  };

  // compute remaining time for current phase given cyclePos
  const getRemainingForPhase = (cyclePos: number) => {
    if (cyclePos < TIMINGS.inhale) {
      return TIMINGS.inhale - cyclePos;
    } else if (cyclePos < TIMINGS.inhale + TIMINGS.hold) {
      return TIMINGS.inhale + TIMINGS.hold - cyclePos;
    } else {
      return TOTAL_CYCLE - cyclePos;
    }
  };

  // start session (minutes)
  const startSession = (minutes = 5) => {
    // stop any existing
    stopSession();

    const now = Date.now();
    const ms = minutes * 60 * 1000;
    sessionEndRef.current = now + ms;
    cycleStartRef.current = now; // align cycle to now (so aura starts immediately)
    setSessionMsRemaining(ms);
    setRunning(true);

    // immediate phase and aura start
    const cyclePos = 0; // at start
    const initialPhase = getPhaseFromCyclePos(cyclePos);
    setPhase(initialPhase);
    prevPhaseRef.current = initialPhase;
    vibrateFor(initialPhase);
    const remaining = getRemainingForPhase(cyclePos);
    // map phase to scale
    const scale =
      initialPhase === "inhale" ? 1.25 : initialPhase === "hold" ? 1.12 : 0.92;
    animateAuraTo(scale, remaining);

    // start tick loop (100ms) to update phase and remaining time precisely
    tickRef.current = setInterval(() => {
      const nowTick = Date.now();
      // update remaining
      const end = sessionEndRef.current ?? nowTick;
      const rem = Math.max(0, end - nowTick);
      setSessionMsRemaining(rem);

      // if session ended
      if (rem <= 0) {
        stopSession();
        return;
      }

      // compute cyclePos using cycleStartRef anchored to session start
      const start = cycleStartRef.current ?? nowTick;
      const elapsed = nowTick - start;
      const cyclePos = elapsed % TOTAL_CYCLE;
      const currentPhase = getPhaseFromCyclePos(cyclePos);

      // detect change
      if (currentPhase !== prevPhaseRef.current) {
        // phase changed
        prevPhaseRef.current = currentPhase;
        setPhase(currentPhase);
        vibrateFor(currentPhase);

        // compute remaining time for this new phase and animate aura accordingly
        const remainingPhaseMs = getRemainingForPhase(cyclePos);
        const toScale =
          currentPhase === "inhale"
            ? 1.25
            : currentPhase === "hold"
            ? 1.12
            : 0.92;
        animateAuraTo(toScale, remainingPhaseMs);
      }
      // otherwise aura animation already running for the remaining duration
    }, 100) as unknown as number;
  };

  // stop everything
  const stopSession = () => {
    setRunning(false);
    setPhase("idle");
    setSessionMsRemaining(0);

    // clear refs
    if (tickRef.current !== null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    sessionEndRef.current = null;
    cycleStartRef.current = null;
    prevPhaseRef.current = "idle";

    // stop and reset aura gracefully
    aura.stopAnimation();
    animateAuraTo(1, 300);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current !== null) clearInterval(tickRef.current);
    };
  }, []);

  const formatMsToClock = (ms: number) => {
    const totalSec = Math.ceil(ms / 1000);
    const mm = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, "0");
    const ss = (totalSec % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // small card render
  const renderSuggestion = ({ item }: { item: (typeof SUGGESTIONS)[0] }) => (
    <TouchableOpacity
      style={styles.suggestionCard}
      onPress={() => startSession(item.minutes)}
      activeOpacity={0.85}
    >
      <View style={styles.suggLeft}>
        <View style={styles.suggIcon}>
          <Feather name="music" size={18} color="#0A1A2F" />
        </View>
      </View>
      <View style={styles.suggMid}>
        <Text style={styles.suggTitle}>{item.title}</Text>
        <Text style={styles.suggDesc}>{item.desc}</Text>
      </View>
      <View style={styles.suggRight}>
        <Text style={styles.suggTime}>{item.minutes} min</Text>
        <Feather name="play" size={20} color="#BBD4F5" />
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#0A1A2F", "#05101E"]} style={styles.container}>
      <Text style={styles.title}>Meditação</Text>

      <View style={styles.centerWrapper}>
        <Animated.View
          style={[styles.circleWrapper, { transform: [{ scale: aura }] }]}
        >
          <LinearGradient
            colors={["#0E2A47", "#0A1A2F"]}
            style={styles.circleInner}
          >
            <Feather name="feather" size={44} color="#BBD4F5" />
            <Text style={styles.phaseText}>
              {phase === "idle"
                ? "Respire"
                : phase === "inhale"
                ? "Inspire"
                : phase === "hold"
                ? "Segure"
                : "Expire"}
            </Text>

            {running && (
              <Text style={styles.timerText}>
                {formatMsToClock(sessionMsRemaining)}
              </Text>
            )}
          </LinearGradient>
        </Animated.View>
      </View>

      {!running && (
        <Text style={styles.quote}>
          “Silencie o mundo. Encontre sua presença.”
        </Text>
      )}

      <View style={styles.controls}>
        {!running ? (
          <>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => startSession(5)}
              activeOpacity={0.9}
            >
              <Text style={styles.startButtonText}>Iniciar Sessão</Text>
            </TouchableOpacity>

            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => startSession(5)}
                activeOpacity={0.85}
              >
                <Text style={styles.presetText}>Mindfulness — 5 min</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => startSession(10)}
                activeOpacity={0.85}
              >
                <Text style={styles.presetText}>Relaxamento — 10 min</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopSession}
              activeOpacity={0.9}
            >
              <Text style={styles.stopButtonText}>Encerrar Meditação</Text>
            </TouchableOpacity>
            <Text style={styles.runningHint}>
              Sessão em andamento — toque em encerrar para finalizar.
            </Text>
          </>
        )}
      </View>

      {/* SUGESTÕES */}
      <View style={styles.suggestionsWrapper}>
        <Text style={styles.suggestionsTitle}>Sugestões de meditação</Text>
        <FlatList
          data={SUGGESTIONS}
          keyExtractor={(i) => i.id}
          renderItem={renderSuggestion}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </LinearGradient>
  );
}

/* ========= STYLES (melhoria visual leve mantendo estética) ========= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
    alignItems: "center",
    backgroundColor: "#071421",
  },
  title: {
    fontSize: 30,
    color: "#E4EEFF",
    fontWeight: "700",
    marginBottom: 8,
  },

  centerWrapper: {
    marginTop: 6,
    marginBottom: 8,
  },

  circleWrapper: {
    width: 260,
    height: 260,
    borderRadius: 260,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  circleInner: {
    width: "78%",
    height: "78%",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  phaseText: {
    marginTop: 10,
    color: "#CFE6FF",
    fontSize: 20,
    fontWeight: "600",
  },

  timerText: {
    marginTop: 8,
    color: "#BBD4F5",
    fontSize: 18,
    fontWeight: "700",
  },

  quote: {
    fontSize: 16,
    color: "#BBD4F5",
    textAlign: "center",
    marginHorizontal: 36,
    marginBottom: 12,
    opacity: 0.95,
  },

  controls: {
    width: "90%",
    alignItems: "center",
    marginTop: 6,
  },

  startButton: {
    width: "100%",
    backgroundColor: "#1E4C7A",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 10,
  },
  startButtonText: {
    color: "#EAF3FF",
    fontSize: 18,
    fontWeight: "700",
  },

  quickRow: {
    width: "100%",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  presetButton: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  presetText: {
    color: "#CFE6FF",
    fontSize: 15,
    fontWeight: "600",
  },

  stopButton: {
    width: "100%",
    backgroundColor: "#C0392B",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 8,
  },
  stopButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },

  runningHint: {
    marginTop: 8,
    color: "#BBD4F5",
    fontSize: 13,
    textAlign: "center",
  },

  suggestionsWrapper: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 14,
    flex: 1,
  },
  suggestionsTitle: {
    color: "#E4EEFF",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
  },

  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0b2538",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  suggLeft: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  suggIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#BBD4F5",
    justifyContent: "center",
    alignItems: "center",
  },
  suggMid: {
    flex: 1,
    paddingHorizontal: 12,
  },
  suggTitle: {
    color: "#EAF3FF",
    fontWeight: "700",
    fontSize: 15,
  },
  suggDesc: {
    color: "#BBD4F5",
    fontSize: 13,
    marginTop: 4,
  },
  suggRight: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  suggTime: {
    color: "#CFE6FF",
    fontWeight: "700",
    marginBottom: 6,
  },
});

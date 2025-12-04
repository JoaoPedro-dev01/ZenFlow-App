// app/(tabs)/breathing.tsx
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router"; // para botão Voltar para a aba inicial
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

const DURATIONS = [3, 4, 5, 6]; // segundos por fase
const CYCLES = [3, 5, 8];

export default function RespirationScreen() {
  const router = useRouter();

  // configs (visíveis apenas antes de iniciar)
  const [phaseDuration, setPhaseDuration] = useState<number>(4);
  const [cycles, setCycles] = useState<number>(5);

  // estado de execução
  const [started, setStarted] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [phase, setPhase] = useState<"Inspire" | "Expire">("Inspire");
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const currentCycleRef = useRef<number>(1); // evita stale closure

  // animação da aura/pulse
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // timeout ref (compatível com RN/TS)
  const timeoutRef = useRef<number | null>(null);

  // helper vibração compatível (Android: Vibration, iOS: Haptics)
  const triggerVibration = (durationMs = 60) => {
    try {
      if (Platform.OS === "android") {
        Vibration.vibrate(durationMs);
      } else {
        // Haptics é mais suave em iOS
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    } catch {
      // fallback silencioso
    }
  };

  // anima a aura para inspirar/expirar (chamar no momento de troca de fase)
  // correção: usa stopAnimation(callback) para obter o valor atual em TS
  const animateAura = (toValue: number, durationMs: number) => {
    // para animação anterior e usa o valor atual como ponto de partida
    scaleAnim.stopAnimation((currentValue: number) => {
      // define explicitamente o valor atual (seguro)
      try {
        scaleAnim.setValue(currentValue);
      } catch {
        scaleAnim.setValue(1);
      }

      Animated.timing(scaleAnim, {
        toValue,
        duration: durationMs,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
  };

  // limpa timeout e animação
  const clearCycleTimeout = () => {
    if (timeoutRef.current !== null) {
      try {
        clearTimeout(timeoutRef.current);
      } catch {
        // ignore
      }
      timeoutRef.current = null;
    }
  };

  const stopAnimations = () => {
    // Para animação e reseta scale
    try {
      // stopAnimation sem callback só cancela, mas podemos resetar para 1
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);
    } catch {
      // ignore
    }
  };

  // inicia a sessão por completo
  const startBreathing = () => {
    // garante que quaisquer timeouts anteriores são limpos
    clearCycleTimeout();
    stopAnimations();

    // reset states
    setStarted(true);
    setFinished(false);
    setPhase("Inspire");
    setCurrentCycle(1);
    currentCycleRef.current = 1;

    // inicia animação e começa fase
    animateAura(1.35, phaseDuration * 1000);
    triggerVibration(80);
    schedulePhaseSwitch("Inspire");
  };

  // agendar próxima troca de fase (usa timeoutRef e currentCycleRef)
  const schedulePhaseSwitch = (currentPhase: "Inspire" | "Expire") => {
    // limpa timeout anterior por segurança
    clearCycleTimeout();

    // programa troca após phaseDuration segundos
    timeoutRef.current = setTimeout(() => {
      // troca fase
      const nextPhase = currentPhase === "Inspire" ? "Expire" : "Inspire";

      // atualiza fase (estado) — importante para render
      setPhase(nextPhase);

      // vibração no início da nova fase
      triggerVibration(60);

      // anima conforme a nova fase
      animateAura(nextPhase === "Inspire" ? 1.35 : 0.85, phaseDuration * 1000);

      if (nextPhase === "Inspire") {
        // se entrou em Inspire isso significa que a fase anterior foi "Expire"
        // portanto um ciclo foi concluído; atualizamos o contador
        currentCycleRef.current = currentCycleRef.current + 1;
        setCurrentCycle(currentCycleRef.current);

        // se já passou do número de ciclos, finaliza
        if (currentCycleRef.current > cycles) {
          // finalizar e não agendar nada mais
          endBreathing();
          return;
        }
      }

      // se ainda não terminou, agendar próxima troca (recursivo)
      schedulePhaseSwitch(nextPhase);
    }, phaseDuration * 1000) as unknown as number;
  };

  // finaliza a sessão (animação suave de retorno)
  const endBreathing = () => {
    clearCycleTimeout();
    stopAnimations();
    setStarted(false);
    setFinished(true);
    setPhase("Inspire");
    // animação suave final
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  // reiniciar a sessão com as mesmas configurações
  const restart = () => {
    // limpa e reinicia
    clearCycleTimeout();
    stopAnimations();
    setFinished(false);
    setStarted(true);
    setPhase("Inspire");
    setCurrentCycle(1);
    currentCycleRef.current = 1;
    animateAura(1.35, phaseDuration * 1000);
    triggerVibration(80);
    schedulePhaseSwitch("Inspire");
  };

  // voltar para a view de configuração dentro desta tela
  const backToConfigure = () => {
    // faz com que as configurações reapareçam na mesma aba
    clearCycleTimeout();
    stopAnimations();
    setStarted(false);
    setFinished(false);
    setPhase("Inspire");
    setCurrentCycle(1);
    currentCycleRef.current = 1;
  };

  // voltar para a aba inicial (router)
  const goToHome = () => {
    clearCycleTimeout();
    stopAnimations();
    // ajustar o caminho se sua aba inicial for diferente
    router.push("/");
  };

  // cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      clearCycleTimeout();
      stopAnimations();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // layout
  return (
    <View style={styles.container}>
      {/* título um pouco mais centralizado */}
      <Text style={styles.title}>Respiração Guiada</Text>

      {/* AURA – centralizada */}
      <View style={styles.centerWrap}>
        <Animated.View
          style={[
            styles.aura,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
      </View>

      {/* DURANTE A SESSÃO: minimalista */}
      {started && !finished && (
        <>
          <Text style={styles.phaseText}>{phase}</Text>
          <Text style={styles.cycleText}>
            Ciclo {currentCycle} de {cycles}
          </Text>
        </>
      )}

      {/* ANTES DE INICIAR: controles de configuração */}
      {!started && !finished && (
        <View style={styles.controls}>
          <Text style={styles.label}>Duração por fase</Text>
          <View style={styles.row}>
            {DURATIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.option,
                  phaseDuration === d && styles.optionActive,
                ]}
                onPress={() => setPhaseDuration(d)}
              >
                <Text
                  style={[
                    styles.optionText,
                    phaseDuration === d && styles.optionTextActive,
                  ]}
                >
                  {d}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 18 }]}>Ciclos</Text>
          <View style={styles.row}>
            {CYCLES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.option, cycles === c && styles.optionActive]}
                onPress={() => setCycles(c)}
              >
                <Text
                  style={[
                    styles.optionText,
                    cycles === c && styles.optionTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={startBreathing}>
            <Text style={styles.startText}>Iniciar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TELA FINAL: mostrar botões Reiniciar / Configurar / Voltar */}
      {finished && (
        <View style={styles.finishBox}>
          <Text style={styles.finishTitle}>Excelente trabalho ✨</Text>
          <Text style={styles.finishSub}>Você concluiu {cycles} ciclos.</Text>

          <View style={styles.finishBtns}>
            <TouchableOpacity style={styles.restartBtn} onPress={restart}>
              <Text style={styles.restartText}>Reiniciar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.configureBtn}
              onPress={backToConfigure}
            >
              <Text style={styles.configureText}>Configurar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeBtn} onPress={goToHome}>
              <Text style={styles.homeText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Se a sessão estiver rodando e o usuário quiser parar/reiniciar rapidamente */}
      {started && !finished && (
        <View style={{ marginTop: 22 }}>
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={() => {
              clearCycleTimeout();
              stopAnimations();
              setStarted(false);
            }}
          >
            <Text style={styles.stopText}>Parar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* ---------- ESTILOS ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071229",
    alignItems: "center",
    justifyContent: "center", // mais centralizado verticalmente
    paddingTop: Platform.OS === "ios" ? 30 : 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#E8F7FF",
    marginBottom: 12,
  },
  centerWrap: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  aura: {
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "#A1CEDC22",
    shadowColor: "#60AFFF",
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 12,
  },
  phaseText: {
    marginTop: 18,
    fontSize: 28,
    color: "#E8F7FF",
    fontWeight: "700",
    textAlign: "center",
  },
  cycleText: {
    marginTop: 8,
    color: "#BFDCE6",
    textAlign: "center",
  },
  controls: {
    marginTop: 18,
    width: "100%",
    alignItems: "center",
  },
  label: {
    color: "#9CC7D6",
    fontWeight: "600",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  option: {
    borderWidth: 1,
    borderColor: "#123",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#081621",
    marginHorizontal: 6,
  },
  optionActive: {
    backgroundColor: "#3F76FF",
    borderColor: "#3F76FF",
  },
  optionText: {
    color: "#A9C8D6",
    fontWeight: "600",
  },
  optionTextActive: {
    color: "#FFF",
  },
  startBtn: {
    marginTop: 20,
    backgroundColor: "#3F76FF",
    paddingVertical: 12,
    paddingHorizontal: 38,
    borderRadius: 12,
  },
  startText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  finishBox: {
    marginTop: 18,
    alignItems: "center",
  },
  finishTitle: {
    color: "#E8F7FF",
    fontSize: 22,
    fontWeight: "700",
  },
  finishSub: {
    color: "#BFDCE6",
    marginTop: 6,
  },
  finishBtns: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  restartBtn: {
    backgroundColor: "#3F76FF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  restartText: {
    color: "#fff",
    fontWeight: "700",
  },
  configureBtn: {
    borderWidth: 1,
    borderColor: "#3F76FF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  configureText: {
    color: "#3F76FF",
    fontWeight: "700",
  },
  homeBtn: {
    backgroundColor: "#0B3048",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  homeText: {
    color: "#9CC7D6",
    fontWeight: "700",
  },
  stopBtn: {
    backgroundColor: "#E24A4A",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  stopText: {
    color: "#fff",
    fontWeight: "700",
  },
});

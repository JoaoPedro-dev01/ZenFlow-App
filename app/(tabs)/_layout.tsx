import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0d0f14",
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#6a5acd",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="breathing"
        options={{
          title: "Respirar",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="cloud-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="meditation"
        options={{
          title: "Meditar",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="radio-button-on" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="mood"
        options={{
          title: "Humor",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="happy-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

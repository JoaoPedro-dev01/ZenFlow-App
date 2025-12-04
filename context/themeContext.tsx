// context/themeContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Appearance } from "react-native";

type ThemeType = "light" | "dark";

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  toggleTheme: () => {},
});

// Paletas
const themes = {
  light: {
    background: "#F4F6FA",
    text: "#1A1A1A",
    primary: "#4A6FA5",
    card: "#FFFFFF",
  },
  dark: {
    background: "#0D0D0D",
    text: "#FFFFFF",
    primary: "#7CB7FF",
    card: "#1A1A1A",
  },
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const deviceTheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState<ThemeType>(
    deviceTheme === "dark" ? "dark" : "light"
  );

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeWrapper theme={themes[theme]}>{children}</ThemeWrapper>
    </ThemeContext.Provider>
  );
};

// Wrapper para aplicar o background
const ThemeWrapper = ({
  children,
  theme,
}: {
  children: ReactNode;
  theme: any;
}) => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      {children}
    </div>
  );
};

export const useTheme = () => useContext(ThemeContext);
export const themeStyles = themes;

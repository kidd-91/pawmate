import { MD3LightTheme } from "react-native-paper";

export const colors = {
  primary: "#FF8C42",
  secondary: "#FFB4A2",
  background: "#FFF5E1",
  surface: "#FFFFFF",
  text: "#3D2C2E",
  textSecondary: "#8B7355",
  accent: "#FF6B6B",
  success: "#4CAF50",
  border: "#F0E0C8",
  card: "#FFFFFF",
  like: "#FF6B6B",
  pass: "#B0BEC5",
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.text,
  },
  roundness: 20,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

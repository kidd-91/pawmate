import { MD3LightTheme } from "react-native-paper";

export const colors = {
  // Brand
  primary: "#FF8C69",       // 珊瑚橘
  secondary: "#FFD166",     // 奶油黃
  accent: "#FF6B6B",        // 配對/強調紅

  // Surfaces
  background: "#FFF9F5",    // 米白背景
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#F0E4D8",

  // Text
  text: "#3D3D3D",
  textSecondary: "#8A8A8A",

  // Semantic
  success: "#66BB6A",
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

export const shadows = {
  card: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardLifted: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  button: {
    elevation: 3,
    shadowColor: "#FF8C69",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 12,
  md: 20,
  lg: 28,
  full: 999,
} as const;

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const spacing = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  pill: 18,
};

export const fonts = {
  heading: "Georgia",
  body: "Inter_400Regular",
  bodySemiBold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
};

export const withAlpha = (hex, alpha) => {
  if (!hex || typeof hex !== "string") {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  let normalized = hex.replace("#", "");

  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (normalized.length !== 6) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const DEFAULT_THEME_NAME = "default";
export const THEME_STORAGE_KEY = "@ghc_app:selected_theme";

const themePalettes = {
  default: {
    label: "Judicial Dark",
    isDark: true,
    blurTint: "dark",
    statusBarStyle: "light-content",
    gradients: {
      header: ["#000000", "#000000"],
      splash: ["#0A0A0A", "#000000"],
    },
    colors: {
      primary: "#000000",
      primaryDark: "#000000",
      accent: "#D4AF37",
      navy: "#0A0A0A",
      textInverse: "#FFFFFF",
      textPrimary: "#FFFFFF",
      textSecondary: "#A3A3A3",
      textMuted: "#ADB9D8",
      textTertiary: "#666666",
      textQuaternary: "#888888",
      card: "#111111",
      cardAlt: "#1A1A1A",
      cardSubtle: "#0A0A0A",
      overlay: "rgba(0,0,0,0.7)",
      border: "#333333",
      borderSoft: "#222222",
      surface: "#000000",
      footer: "#050505",
      badgeAll: "#0F2349",
      success: "#059669",
      warning: "#D4AF37",
      danger: "#DC2626",
      info: "#2563EB",
      causeList: {
        daily: "#D4AF37",
        supplementary: "#2563EB",
        lawazima: "#10B981",
        notices: "#DC2626",
      },
    },
  },
  midnightBlue: {
    label: "Midnight Blue",
    isDark: true,
    blurTint: "dark",
    statusBarStyle: "light-content",
    gradients: {
      header: ["#030A14", "#07111F"],
      splash: ["#030A14", "#07111F"],
    },
    colors: {
      primary: "#07111F",
      primaryDark: "#030A14",
      accent: "#4DA3FF",
      navy: "#0B1C33",
      textInverse: "#FFFFFF",
      textPrimary: "#F5F9FF",
      textSecondary: "#9CB1CC",
      textMuted: "#C1D2EA",
      textTertiary: "#6F86A4",
      textQuaternary: "#8AA0BD",
      card: "#0E1B2D",
      cardAlt: "#13243A",
      cardSubtle: "#0B1C33",
      overlay: "rgba(3,10,20,0.72)",
      border: "#1E3652",
      borderSoft: "#18304B",
      surface: "#081423",
      footer: "#040C16",
      badgeAll: "#14304A",
      success: "#34D399",
      warning: "#FBBF24",
      danger: "#F87171",
      info: "#60A5FA",
      causeList: {
        daily: "#4DA3FF",
        supplementary: "#9333EA",
        lawazima: "#14B8A6",
        notices: "#F59E0B",
      },
    },
  },
  heritageLight: {
    label: "Heritage Paper",
    isDark: false,
    blurTint: "light",
    statusBarStyle: "dark-content",
    gradients: {
      header: ["#EFE6D8", "#F5F0E6"],
      splash: ["#DED2C0", "#F5F0E6"],
    },
    colors: {
      primary: "#F5F0E6",
      primaryDark: "#E9DDCC",
      accent: "#8A5A2B",
      navy: "#DED2C0",
      textInverse: "#FFF9F0",
      textPrimary: "#261A11",
      textSecondary: "#6B5A4A",
      textMuted: "#7A6552",
      textTertiary: "#8E7762",
      textQuaternary: "#9A846E",
      card: "#FFF9F0",
      cardAlt: "#F0E5D5",
      cardSubtle: "#E9DDCC",
      overlay: "rgba(38,26,17,0.18)",
      border: "#D1C2AC",
      borderSoft: "#DDCEB8",
      surface: "#EFE6D8",
      footer: "#E2D6C2",
      badgeAll: "#6B4F2A",
      success: "#047857",
      warning: "#A16207",
      danger: "#B42318",
      info: "#1D4ED8",
      causeList: {
        daily: "#7C4C22",
        supplementary: "#1E40AF",
        lawazima: "#166534",
        notices: "#881337",
      },
    },
  },
};

const buildTheme = (name, palette) => ({
  name,
  label: palette.label,
  isDark: palette.isDark,
  blurTint: palette.blurTint,
  statusBarStyle: palette.statusBarStyle,
  gradients: palette.gradients,
  colors: palette.colors,
  spacing,
  radius,
  fonts,
});

export const themes = Object.fromEntries(
  Object.entries(themePalettes).map(([name, palette]) => [name, buildTheme(name, palette)])
);

export const themeOptions = Object.values(themes).map(({ name, label }) => ({ name, label }));

export const getTheme = (themeName = DEFAULT_THEME_NAME) => themes[themeName] || themes[DEFAULT_THEME_NAME];

// Keep the current imports working while we migrate screens to the theme hook.
export const colors = themes[DEFAULT_THEME_NAME].colors;

const ThemeContext = createContext({
  themeName: DEFAULT_THEME_NAME,
  theme: themes[DEFAULT_THEME_NAME],
  colors: themes[DEFAULT_THEME_NAME].colors,
  spacing,
  radius,
  fonts,
  isDark: themes[DEFAULT_THEME_NAME].isDark,
  blurTint: themes[DEFAULT_THEME_NAME].blurTint,
  statusBarStyle: themes[DEFAULT_THEME_NAME].statusBarStyle,
  gradients: themes[DEFAULT_THEME_NAME].gradients,
  isThemeReady: false,
  setThemeName: () => {},
  availableThemes: themeOptions,
});

export function ThemeProvider({ children, initialThemeName = DEFAULT_THEME_NAME }) {
  const [themeName, setThemeNameState] = useState(getTheme(initialThemeName).name);
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadStoredTheme = async () => {
      try {
        const storedThemeName = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const resolvedThemeName = getTheme(storedThemeName || initialThemeName).name;

        if (isMounted) {
          setThemeNameState(resolvedThemeName);
        }
      } catch (error) {
        console.log("Failed to load stored theme", error);
      } finally {
        if (isMounted) {
          setIsThemeReady(true);
        }
      }
    };

    loadStoredTheme();

    return () => {
      isMounted = false;
    };
  }, [initialThemeName]);

  const setThemeName = useCallback(async (nextThemeName) => {
    const resolvedThemeName = getTheme(nextThemeName).name;

    setThemeNameState(resolvedThemeName);

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, resolvedThemeName);
    } catch (error) {
      console.log("Failed to persist theme", error);
    }
  }, []);

  const value = useMemo(() => {
    const theme = getTheme(themeName);

    return {
      themeName: theme.name,
      theme,
      colors: theme.colors,
      spacing: theme.spacing,
      radius: theme.radius,
      fonts: theme.fonts,
      isDark: theme.isDark,
      blurTint: theme.blurTint,
      statusBarStyle: theme.statusBarStyle,
      gradients: theme.gradients,
      isThemeReady,
      setThemeName,
      availableThemes: themeOptions,
    };
  }, [isThemeReady, setThemeName, themeName]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

import React, { useEffect, useMemo } from "react";
import { Dimensions, Image, StyleSheet, Text, View, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme";

const { width, height } = Dimensions.get("window");
const logo = require("../assets/logo.png");

export const SplashScreen = ({ ready, onDone }) => {
  const { t, i18n } = useTranslation();
  const { theme, colors, spacing } = useAppTheme();
  useEffect(() => {
    if (ready && onDone) {
      const t = setTimeout(() => onDone(), 3000);
      return () => clearTimeout(t);
    }
  }, [ready, onDone]);

  const bgColors = useMemo(() => theme.gradients.splash, [theme.gradients.splash]);
  const styles = useMemo(() => createStyles(colors, spacing, i18n.language), [colors, spacing, i18n.language]);

  return (
    <LinearGradient colors={bgColors} style={styles.container}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={colors.primary} translucent={false} />
      <View style={styles.center}> 
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brand}>{t("splash.title")}</Text>
        <Text style={styles.subline}>{t("splash.subtitle")}</Text>
      </View>
      <View style={styles.footerWrap}>
        <Text style={styles.meta}>{t("splash.meta")}</Text>
        <Text style={styles.copyright}>{t("splash.copyright")}</Text>
      </View>
    </LinearGradient>
  );
};

const createStyles = (colors, spacing, language) => {
  const isAssamese = language === "as";

  return (
  StyleSheet.create({
    container: { flex: 1, width, height, alignItems: "center", justifyContent: "space-between", backgroundColor: colors.primary, paddingVertical: 40 },
    center: { alignItems: "center", justifyContent: "center", flex: 1 },
    logo: { width: 180, height: 180, marginBottom: spacing.md },
    brand: { color: colors.textPrimary, fontSize: 24, fontFamily: isAssamese ? undefined : "Georgia-Bold", marginBottom: spacing.sm, textAlign: "center" },
    subline: { color: colors.textSecondary, fontSize: 14, fontFamily: isAssamese ? undefined : "Inter_400Regular", textAlign: "center" },
    footerWrap: { alignItems: "center", paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
    meta: { color: colors.textQuaternary, fontSize: 11, fontFamily: isAssamese ? undefined : "Inter_400Regular", textAlign: "center", lineHeight: 16 },
    copyright: { color: colors.textTertiary, fontSize: 11, fontFamily: isAssamese ? undefined : "Inter_400Regular", textAlign: "center", marginTop: 4 },
  })
  );
};

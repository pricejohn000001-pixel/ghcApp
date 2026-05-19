import React, { useEffect, useMemo } from "react";
import { Dimensions, Image, StyleSheet, Text, View, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "../theme";

const { width, height } = Dimensions.get("window");
const logo = require("../assets/logo.png");

export const SplashScreen = ({ ready, onDone }) => {
  useEffect(() => {
    if (ready && onDone) {
      const t = setTimeout(() => onDone(), 3000);
      return () => clearTimeout(t);
    }
  }, [ready, onDone]);

  const bgColors = useMemo(() => ["#0A0A0A", colors.primary], []);

  return (
    <LinearGradient colors={bgColors} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
      <View style={styles.center}> 
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brand}>The Gauhati High Court</Text>
        <Text style={styles.subline}>Official Mobile Application</Text>
      </View>
      <View style={styles.footerWrap}>
        <Text style={styles.meta}>Designed and Developed by e-Courts Services, Gauhati High Court, Guwahati.</Text>
        <Text style={styles.copyright}>© Gauhati High Court, Guwahati. All rights reserved.</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width, height, alignItems: "center", justifyContent: "space-between", backgroundColor: colors.primary, paddingVertical: 40 },
  center: { alignItems: "center", justifyContent: "center", flex: 1 },
  logo: { width: 180, height: 180, marginBottom: spacing.md },
  brand: { color: "#FFFFFF", fontSize: 24, fontFamily: 'Georgia-Bold', marginBottom: spacing.sm, textAlign: "center" },
  subline: { color: "#AAAAAA", fontSize: 14, fontFamily: 'Inter_400Regular' },
  footerWrap: { alignItems: "center", paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  meta: { color: "#888888", fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: "center", lineHeight: 16 },
  copyright: { color: "#777777", fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: "center", marginTop: 4 },
});

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

  const bgColors = useMemo(() => ["#0D1B38", colors.primary], []);

  return (
    <LinearGradient colors={bgColors} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
      <View style={styles.center}> 
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brand}>The Gauhati High Court</Text>
        <Text style={styles.subline}>Official Mobile Application</Text>
        <Text style={styles.meta}>Developed by eCourts Team Gauhati High Court</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width, height, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  center: { alignItems: "center", justifyContent: "center" },
  logo: { width: 180, height: 180, marginBottom: spacing.md },
  brand: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: spacing.sm },
  subline: { color: "#ADB9D8", fontSize: 14, marginBottom: 40 },
  meta: { color: "#ADB9D8", fontSize: 12 },
});

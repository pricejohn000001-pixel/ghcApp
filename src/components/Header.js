import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from "react-i18next";

const logo = require("../assets/logo.png");

export const Header = ({ onMenu }) => {
  const { t } = useTranslation();
  const monthNames = t("months", { returnObjects: true });

  const now = new Date();
  const dateText = `${String(now.getDate()).padStart(2, "0")} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  return (
    <LinearGradient colors={["#0F2349", colors.primary]} style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <View style={styles.brandTextBlock}>
            <Text style={styles.brand}>{t("header.title")}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onMenu} activeOpacity={0.8} style={styles.menuButton}>
          <Entypo name="menu" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.welcomeCard}>
        <View>
          <Text style={styles.welcomeLabel}>{t("header.welcome")}</Text>
          <Text style={styles.dateText}>{dateText}</Text>
        </View>
      </View>
      
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: 12,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logo: {
    width: 56,
    height: 56,
  },
  brandTextBlock: { marginLeft: 12 },
  brand: { color: "#fff", fontSize: 18, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 9 },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: "#112951",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#264172",
    borderWidth: 1,
  },
  welcomeCard: {
    marginTop: spacing.md,
    backgroundColor: "#0F2B57",
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeLabel: { color: colors.textSecondary, fontSize: 14 },
  dateText: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 2 },
  
});

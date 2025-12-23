import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors, spacing } from "../theme";

export const BottomNav = ({ onHome, onBack, onForward, disableBack, disableForward }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} activeOpacity={0.8} onPress={onHome}>
        <AntDesign name="home" size={20} color="#ADB9D8" />
        <Text style={styles.navText}>{t("nav.home")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navItem, disableBack && styles.disabled]}
        activeOpacity={0.8}
        onPress={onBack}
        disabled={disableBack}
      >
        <AntDesign name="arrowleft" size={20} color="#ADB9D8" />
        <Text style={styles.navText}>{t("nav.back")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navItem, disableForward && styles.disabled]}
        activeOpacity={0.8}
        onPress={onForward}
        disabled={disableForward}
      >
        <AntDesign name="arrowright" size={20} color="#ADB9D8" />
        <Text style={styles.navText}>{t("nav.forward")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.md,
    backgroundColor: colors.footer,
    borderTopColor: "#182442",
    borderTopWidth: 1,
  },
  navItem: { alignItems: "center", gap: spacing.xs },
  navText: { color: "#ADB9D8", fontSize: 12 },
  disabled: { opacity: 0.5 },
});


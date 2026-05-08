import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors, spacing } from "../theme";

export const BottomNav = ({ onHome, onMactCal, onCaseDisplay, onBack, onForward, disableBack, disableForward, activeTab }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} activeOpacity={0.8} onPress={onHome}>
        <AntDesign name="home" size={20} color={activeTab === 'home' ? colors.accent : "#666666"} />
        <Text style={[styles.navText, activeTab === 'home' && styles.activeText]}>{t("nav.home")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} activeOpacity={0.8} onPress={onMactCal}>
        <AntDesign name="calculator" size={20} color={activeTab === 'mactCal' ? colors.accent : "#666666"} />
        <Text style={[styles.navText, activeTab === 'mactCal' && styles.activeText]}>MACT Cal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} activeOpacity={0.8} onPress={onCaseDisplay}>
        <AntDesign name="database" size={20} color="#666666" />
        <Text style={styles.navText}>Case Display</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, disableBack && styles.disabled]}
        activeOpacity={0.8}
        onPress={onBack}
        disabled={disableBack}
      >
        <AntDesign name="arrowleft" size={20} color="#666666" />
        <Text style={styles.navText}>{t("nav.back")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navItem, disableForward && styles.disabled]}
        activeOpacity={0.8}
        onPress={onForward}
        disabled={disableForward}
      >
        <AntDesign name="arrowright" size={20} color="#666666" />
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
    borderTopColor: "#333333",
    borderTopWidth: 1,
  },
  navItem: { alignItems: "center", gap: spacing.xs },
  navText: { color: "#666666", fontSize: 12, fontFamily: 'Inter_400Regular' },
  activeText: { color: colors.accent, fontFamily: 'Inter_600SemiBold' },
  disabled: { opacity: 0.5 },
});

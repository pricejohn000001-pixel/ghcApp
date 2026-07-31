import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme";

export const BottomNav = ({ onHome, onMactCal, onCaseDisplay, onBack, onForward, disableBack, disableForward, activeTab }) => {
  const { colors, spacing, fonts } = useAppTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(colors, spacing, fonts), [colors, spacing, fonts]);
  const inactiveColor = colors.textTertiary;

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} activeOpacity={0.8} onPress={onHome}>
        <Ionicons name="home" size={20} color={activeTab === 'home' ? colors.accent : inactiveColor} />
        <Text style={[styles.navText, activeTab === 'home' && styles.activeText]}>{t("nav.home")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} activeOpacity={0.8} onPress={onMactCal}>
        <Ionicons name="calculator" size={20} color={activeTab === 'mactCal' ? colors.accent : inactiveColor} />
        <Text style={[styles.navText, activeTab === 'mactCal' && styles.activeText]}>{t("nav.mact_cal")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} activeOpacity={0.8} onPress={onCaseDisplay}>
        <Ionicons name="server" size={20} color={inactiveColor} />
        <Text style={styles.navText}>{t("nav.case_display")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, disableBack && styles.disabled]}
        activeOpacity={0.8}
        onPress={onBack}
        disabled={disableBack}
      >
        <Ionicons name="arrow-back" size={20} color={inactiveColor} />
        <Text style={styles.navText}>{t("nav.back")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navItem, disableForward && styles.disabled]}
        activeOpacity={0.8}
        onPress={onForward}
        disabled={disableForward}
      >
        <Ionicons name="arrow-forward" size={20} color={inactiveColor} />
        <Text style={styles.navText}>{t("nav.forward")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors, spacing, fonts) =>
  StyleSheet.create({
    bottomNav: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: spacing.md,
      backgroundColor: colors.footer,
      borderTopColor: colors.border,
      borderTopWidth: 1,
    },
    navItem: { alignItems: "center", gap: spacing.xs },
    navText: { color: colors.textTertiary, fontSize: 12, fontFamily: fonts.body },
    activeText: { color: colors.accent, fontFamily: fonts.bodySemiBold },
    disabled: { opacity: 0.5 },
  });

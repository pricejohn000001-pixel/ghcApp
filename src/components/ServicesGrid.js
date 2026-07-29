import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme";

const { width } = Dimensions.get("window");

export const ServicesGrid = ({ services = [], onServicePress }) => {
  const { colors, radius, spacing, fonts } = useAppTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(colors, radius, spacing, fonts), [colors, radius, spacing, fonts]);

  return (
    <View style={[styles.section, { paddingTop: 0 }]}>
      <View style={styles.grid}>
        {Array.isArray(services) && services.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.serviceCard, card.fullWidth && styles.serviceCardFull]}
            activeOpacity={0.85}
            onPress={() => onServicePress && onServicePress(card.id)}
          >
            <View style={styles.serviceIconWrap}>
              <Ionicons name={card.icon} size={22} color={colors.accent} />
            </View>
            <View style={styles.serviceTextContent}>
              <Text style={styles.serviceTitle}>
                {t(`services.${card.id}.title`)}
              </Text>
              <Text style={styles.serviceHint}>
                {t(`services.${card.id}.subtitle`)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors, radius, spacing, fonts) =>
  StyleSheet.create({
    section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, gap: spacing.xs },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 12,
    },
    serviceCard: {
      width: (width - spacing.lg * 2 - 12) / 2,
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      padding: spacing.md,
      gap: spacing.xs,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.borderSoft,
      shadowColor: colors.primaryDark,
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 10,
      elevation: 3,
    },
    serviceCardFull: {
      width: "100%",
      paddingVertical: spacing.xl,
    },
    serviceIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardAlt,
    },
    serviceTitle: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 14, textAlign: "center" },
    serviceHint: { color: colors.textSecondary, fontSize: 12, textAlign: "center", fontFamily: fonts.body },
    serviceTextContent: { alignItems: "center", width: "100%" },
  });


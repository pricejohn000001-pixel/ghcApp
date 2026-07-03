import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

export const ServicesGrid = ({ services = [], onServicePress }) => {
  const { t } = useTranslation();
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
            <View style={[styles.serviceIconWrap, { backgroundColor: "#1A1A1A" }]}>
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

const styles = StyleSheet.create({
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, gap: spacing.xs },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  serviceCard: {
    width: (width - spacing.lg * 2 - 12) / 2,
    backgroundColor: "#111111",
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
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
  },
  serviceTitle: { color: "#FFFFFF", fontFamily: 'Inter_700Bold', fontSize: 14, textAlign: "center" },
  serviceHint: { color: "#AAAAAA", fontSize: 12, textAlign: "center", fontFamily: 'Inter_400Regular' },
  serviceTextContent: { alignItems: "center", width: "100%" },
});


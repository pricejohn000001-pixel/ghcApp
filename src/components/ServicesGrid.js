import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AntDesign, Entypo, Feather, FontAwesome } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const iconMap = {
  "clipboard-list": <FontAwesome name="list-alt" size={22} color="#fff" />,
  video: <Entypo name="video-camera" size={22} color="#fff" />,
  search1: <AntDesign name="search1" size={22} color="#fff" />,
  tool: <Feather name="tool" size={22} color="#fff" />,
  calendar: <AntDesign name="calendar" size={22} color="#fff" />,
  clock: <Feather name="clock" size={22} color="#fff" />,
  inbox: <Feather name="inbox" size={22} color="#fff" />,
  bank: <AntDesign name="bank" size={22} color="#fff" />,
  team: <AntDesign name="team" size={22} color="#fff" />,
  book: <Feather name="book" size={22} color="#fff" />,
};

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
            <View style={[styles.serviceIconWrap, { backgroundColor: card.color }]}>
              {iconMap[card.icon]}
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
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0B1A38",
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
  serviceTitle: { color: "#0B1B3A", fontWeight: "700", fontSize: 14, textAlign: "center" },
  serviceHint: { color: "#6B7280", fontSize: 12, textAlign: "center" },
  serviceTextContent: { alignItems: "center", width: "100%" },
});


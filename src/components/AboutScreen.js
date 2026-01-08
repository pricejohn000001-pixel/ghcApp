import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing } from "../theme";
import { judges } from "../data";

export const AboutScreen = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0F2349", colors.primary]} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}><Feather name="info" size={20} color="#fff" /></View>
          <Text style={styles.heroTitle}>{t("about.title")}</Text>
        </View>
        <Text style={styles.heroSub}>{t("about.subtitle")}</Text>
      </LinearGradient>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="book" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>{t("about.constitution_title")}</Text>
          </View>
          <Text style={styles.paragraph}><Text style={styles.bold}>{t("about.article_214_intro")}</Text></Text>
          <Text style={[styles.paragraph, styles.bold]}>{t("about.article_214_text")}</Text>
          <Text style={styles.paragraph}>{t("about.article_215_text")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="users" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>{t("about.judges_title")}</Text>
          </View>
          <Text style={styles.paragraph}>{t("about.judges_strength")}</Text>
          <Text style={styles.subheading}>{t("about.chief_justice")}</Text>
          {(() => {
            const cj = judges.find((j) => j.title === "Chief Justice");
            if (!cj) return null;
            return <Text style={styles.paragraph}>{cj.name}</Text>;
          })()}
          <Text style={styles.subheading}>{t("about.puisne_judges")}</Text>
          {judges
            .filter((j) => j.title !== "Chief Justice")
            .map((j) => (
              <Text key={j.id} style={styles.paragraph}>{j.name}</Text>
            ))}
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="briefcase" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>{t("about.jurisdiction_title")}</Text>
          </View>
          <Text style={styles.paragraph}>{t("about.article_226_text")}</Text>
          <Text style={styles.paragraph}>{t("about.article_227_text")}</Text>
          <Text style={styles.paragraph}>{t("about.jurisdiction_details")}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  hero: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  heroRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  heroIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#1B2C52", alignItems: "center", justifyContent: "center" },
  heroTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
  heroSub: { color: "#ADB9D8", marginTop: 6 },
  scroll: { flex: 1 },
  content: { backgroundColor: "#ECF1FF", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: "#fff", borderRadius: radius.xl, padding: spacing.lg, shadowColor: "#0B1A38", shadowOpacity: 0.12, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  cardTitle: { color: colors.primary, fontWeight: "700" },
  paragraph: { color: "#111827", fontSize: 14, lineHeight: 22, marginBottom: spacing.sm },
  subheading: { color: colors.primary, fontWeight: "700", fontSize: 14, marginTop: spacing.sm, marginBottom: 6 },
  bold: { fontWeight: "700" },
});

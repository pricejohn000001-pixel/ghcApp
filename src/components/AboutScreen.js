import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme";

export const AboutScreen = ({ scrollY, judges = [] }) => {
  const { theme, colors, radius, spacing, fonts } = useAppTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(theme, colors, radius, spacing, fonts), [theme, colors, radius, spacing, fonts]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.header} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}><Ionicons name="information-circle" size={20} color={colors.accent} /></View>
          <Text style={styles.heroTitle}>{t("about.title")}</Text>
        </View>
        <Text style={styles.heroSub}>{t("about.subtitle")}</Text>
      </LinearGradient>
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={
          scrollY
            ? Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )
            : undefined
        }
        scrollEventThrottle={16}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={18} color={colors.accent} />
            <Text style={styles.cardTitle}>{t("about.constitution_title")}</Text>
          </View>
          <Text style={styles.paragraph}><Text style={styles.bold}>{t("about.article_214_intro")}</Text></Text>
          <Text style={[styles.paragraph, styles.bold]}>{t("about.article_214_text")}</Text>
          <Text style={styles.paragraph}>{t("about.article_215_text")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={18} color={colors.accent} />
            <Text style={styles.cardTitle}>{t("about.judges_title")}</Text>
          </View>
          <Text style={styles.paragraph}>{t("about.judges_strength", { count: judges.length })}</Text>
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
            <Ionicons name="briefcase" size={18} color={colors.accent} />
            <Text style={styles.cardTitle}>{t("about.jurisdiction_title")}</Text>
          </View>
          <Text style={styles.paragraph}>{t("about.article_226_text")}</Text>
          <Text style={styles.paragraph}>{t("about.article_227_text")}</Text>
          <Text style={styles.paragraph}>{t("about.jurisdiction_details")}</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const createStyles = (theme, colors, radius, spacing, fonts) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primary },
    hero: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.lg },
    heroRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    heroIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.cardAlt, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.borderSoft },
    heroTitle: { color: colors.textPrimary, fontFamily: fonts.heading, fontSize: 18 },
    heroSub: { color: colors.textSecondary, marginTop: 6, fontFamily: fonts.body },
    scroll: { flex: 1 },
    content: {
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.accent,
      borderBottomWidth: 0,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
      flexGrow: 1,
    },
    card: { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderSoft, padding: spacing.lg, elevation: 0, overflow: "hidden" },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
    cardTitle: { color: colors.textPrimary, fontFamily: fonts.heading },
    paragraph: { color: colors.textPrimary, fontSize: 14, lineHeight: 22, marginBottom: spacing.sm, fontFamily: fonts.body },
    subheading: { color: colors.textPrimary, fontFamily: fonts.heading, fontSize: 14, marginTop: spacing.sm, marginBottom: 6 },
    bold: { fontFamily: fonts.bodyBold },
  });

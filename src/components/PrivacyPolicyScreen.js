import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing } from "../theme";

export const PrivacyPolicyScreen = ({ scrollY }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0F2349", colors.primary]} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}><Feather name="shield" size={20} color="#fff" /></View>
          <Text style={styles.heroTitle}>{t("privacy.title")}</Text>
        </View>
        <Text style={styles.heroSub}>{t("privacy.subtitle")}</Text>
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
          <View style={styles.cardHeader}><Feather name="file-text" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("privacy.overview")}</Text></View>
          <Text style={styles.paragraph}>{t("privacy.overview_text")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><Feather name="user" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("privacy.user_info")}</Text></View>
          <Text style={styles.paragraph}>{t("privacy.user_info_text1")}</Text>
          <Text style={styles.paragraph}>{t("privacy.user_info_text2")}</Text>
          <Text style={styles.paragraph}>{t("privacy.user_info_text3")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><Feather name="cpu" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("privacy.auto_info")}</Text></View>
          <Text style={styles.paragraph}>{t("privacy.auto_info_text")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><Feather name="lock" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("privacy.disclosure")}</Text></View>
          <Text style={styles.paragraph}>{t("privacy.disclosure_text1")}</Text>
          <Text style={styles.paragraph}>{t("privacy.disclosure_text2")}</Text>
          <Text style={styles.paragraph}>{t("privacy.disclosure_text3")}</Text>
          <Text style={styles.paragraph}>{t("privacy.disclosure_text4")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><Feather name="database" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("privacy.retention")}</Text></View>
          <Text style={styles.paragraph}>{t("privacy.retention_text")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><Feather name="target" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("privacy.non_targeted")}</Text></View>
          <Text style={styles.paragraph}>{t("privacy.non_targeted_text")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><Feather name="shield" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("privacy.security")}</Text></View>
          <Text style={styles.paragraph}>{t("privacy.security_text")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><Feather name="refresh-ccw" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("privacy.changes")}</Text></View>
          <Text style={styles.paragraph}>{t("privacy.changes_text")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><Feather name="check-circle" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("privacy.consent")}</Text></View>
          <Text style={styles.paragraph}>{t("privacy.consent_text")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><Feather name="mail" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("privacy.contact")}</Text></View>
          <Text style={styles.paragraph}>{t("privacy.contact_text")}</Text>
        </View>
      </Animated.ScrollView>
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
});

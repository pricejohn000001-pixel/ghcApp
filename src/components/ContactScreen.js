import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing } from "../theme";

export const ContactScreen = ({ scrollY }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0F2349", colors.primary]} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}><Feather name="phone" size={20} color="#fff" /></View>
          <Text style={styles.heroTitle}>{t("contact.title")}</Text>
        </View>
        <Text style={styles.heroSub}>{t("contact.subtitle")}</Text>
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
          <View style={styles.cardHeader}><Feather name="phone" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("contact.epabx")}</Text></View>
          <Text style={styles.paragraph}>2600008, 2731245, 2735869, 2731264, 2637179, 2734439, 2734441</Text>
          <Text style={styles.metaSmall}>{t("contact.std_code")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><AntDesign name="printer" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("contact.fax")}</Text></View>
          <Text style={styles.paragraph}>(0361) 2735863, 2735867,2732541, 2734346, 2733439</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><AntDesign name="mail" size={18} color={colors.primary} /><Text style={styles.cardTitle}>{t("contact.email")}</Text></View>
          <Text style={styles.paragraph}>hc-asm[at]nic[dot]in</Text>
          <Text style={styles.paragraph}>highcourt[dot]ghc[at]gmail[dot]com</Text>
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
  paragraph: { color: "#111827", fontSize: 14, lineHeight: 22, marginBottom: spacing.xs },
  metaSmall: { color: "#6B7280", fontSize: 12 },
});

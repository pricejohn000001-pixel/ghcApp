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
      <LinearGradient colors={["#000000", "#000000"]} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}><Feather name="phone" size={20} color={colors.accent} /></View>
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
          <View style={styles.cardHeader}><Feather name="phone" size={18} color={colors.accent} /><Text style={styles.cardTitle}>{t("contact.epabx")}</Text></View>
          <Text style={styles.paragraph}>2600008, 2731245, 2735869, 2731264, 2637179, 2734439, 2734441</Text>
          <Text style={styles.metaSmall}>{t("contact.std_code")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><AntDesign name="printer" size={18} color={colors.accent} /><Text style={styles.cardTitle}>{t("contact.fax")}</Text></View>
          <Text style={styles.paragraph}>(0361) 2735863, 2735867,2732541, 2734346, 2733439</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><AntDesign name="mail" size={18} color={colors.accent} /><Text style={styles.cardTitle}>{t("contact.email")}</Text></View>
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
  heroIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#222222", alignItems: "center", justifyContent: "center" },
  heroTitle: { color: "#FFFFFF", fontFamily: 'Georgia', fontSize: 18 },
  heroSub: { color: "#AAAAAA", marginTop: 6, fontFamily: 'Inter_400Regular' },
  scroll: { flex: 1 },
  content: { backgroundColor: "#000000", borderWidth: 1, borderColor: colors.accent || "#D4AF37", borderBottomWidth: 0, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  card: { backgroundColor: "#111111", borderRadius: radius.xl, borderWidth: 1, borderColor: "#222222", borderWidth: 1, borderColor: "#222222", padding: spacing.lg, elevation: 0, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  cardTitle: { color: colors.textPrimary, fontFamily: 'Georgia' },
  paragraph: { color: "#FFFFFF", fontSize: 14, lineHeight: 22, marginBottom: spacing.xs, fontFamily: 'Inter_400Regular' },
  metaSmall: { color: "#AAAAAA", fontSize: 12, fontFamily: 'Inter_400Regular' },
});

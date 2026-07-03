import React from "react";
import { Animated, StyleSheet, Text, View, TouchableOpacity, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing } from "../theme";

export const ContactScreen = ({ scrollY }) => {
  const { t } = useTranslation();

  const handleEmailPress = (email) => {
    // Replace [at] and [dot] with actual characters
    const cleanEmail = email.replace(/\[at\]/g, '@').replace(/\[dot\]/g, '.');
    Linking.openURL(`mailto:${cleanEmail}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000000", "#000000"]} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}><Ionicons name="call" size={20} color={colors.accent} /></View>
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
          <View style={styles.cardHeader}><Ionicons name="call" size={18} color={colors.accent} /><Text style={styles.cardTitle}>{t("contact.epabx")}</Text></View>
          <Text style={styles.paragraph}>2600008, 2731245, 2735869, 2731264, 2637179, 2734439, 2734441</Text>
          <Text style={styles.metaSmall}>{t("contact.std_code")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}><Ionicons name="print" size={18} color={colors.accent} /><Text style={styles.cardTitle}>{t("contact.fax")}</Text></View>
          <Text style={styles.paragraph}>(0361) 2735863, 2735867,2732541, 2734346, 2733439</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="mail" size={18} color={colors.accent} />
            <Text style={styles.cardTitle}>{t("contact.email")}</Text>
          </View>
          
          <View style={styles.emailSection}>
            <View style={styles.subSectionHeader}>
              <Ionicons name="cube" size={14} color={colors.accent} />
              <Text style={styles.subSectionTitle}>Registry</Text>
            </View>
            <View style={styles.emailRowContainer}>
              <TouchableOpacity style={styles.emailRow} onPress={() => handleEmailPress('hc-asm[at]nic[dot]in')}>
                <Ionicons name="at" size={14} color="#777777" />
                <Text style={styles.emailText}>hc-asm[at]nic[dot]in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emailRow} onPress={() => handleEmailPress('highcourt[dot]ghc[at]gmail[dot]com')}>
                <Ionicons name="at" size={14} color="#777777" />
                <Text style={styles.emailText}>highcourt[dot]ghc[at]gmail[dot]com</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.subSection}>
            <View style={styles.subSectionHeader}>
              <Ionicons name="desktop" size={14} color={colors.accent} />
              <Text style={styles.subSectionTitle}>eCourts Services</Text>
            </View>
            <View style={styles.emailRowContainer}>
              <TouchableOpacity style={styles.emailRow} onPress={() => handleEmailPress('cpc-asm[at]aji[dot]gov[dot]in')}>
                <Ionicons name="at" size={14} color="#777777" />
                <Text style={styles.emailText}>cpc-asm[at]aji[dot]gov[dot]in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emailRow} onPress={() => handleEmailPress('ecourts[dot]ghc-as[at]nic[dot]in')}>
                <Ionicons name="at" size={14} color="#777777" />
                <Text style={styles.emailText}>ecourts[dot]ghc-as[at]nic[dot]in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.card, styles.locationCard]} 
          activeOpacity={0.85}
          onPress={() => Linking.openURL("https://www.google.com/maps/search/?api=1&query=Gauhati+High+Court,+Mahatma+Gandhi+Rd,+Latasil,+Uzan+Bazar,+Guwahati,+Assam+781001")}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={18} color={colors.accent} />
            <Text style={styles.cardTitle}>Find Us Here</Text>
          </View>
          <Text style={styles.paragraph}>Gauhati High Court, New Block</Text>
          <Text style={styles.metaSmall}>Mahatma Gandhi Rd, Latasil, Uzan Bazar, Guwahati, Assam 781001</Text>
          
          <View style={styles.locationAction}>
            <Text style={styles.locationActionText}>Get Directions on Google Maps</Text>
            <Ionicons name="navigate" size={14} color={colors.accent} />
          </View>
        </TouchableOpacity>
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
  emailSection: { marginTop: spacing.xs },
  emailRowContainer: { gap: 8, marginTop: 4 },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#1A1A1A", padding: 10, borderRadius: radius.md },
  emailText: { color: "#FFFFFF", fontSize: 14, fontFamily: 'Inter_400Regular' },
  subSection: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: "#222222" },
  subSectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.xs },
  subSectionTitle: { color: "#ADB9D8", fontSize: 13, fontFamily: 'Inter_600SemiBold', textTransform: "uppercase", letterSpacing: 0.5 },
  locationCard: {
    borderColor: "#333333",
  },
  locationAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#222222",
  },
  locationActionText: {
    color: colors.accent,
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
});

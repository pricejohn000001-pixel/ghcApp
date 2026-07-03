import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from "react-i18next";

export const Footer = ({ onAbout, onContact }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.footer}>
      <View style={styles.linksRow}>
        <TouchableOpacity activeOpacity={0.85} onPress={onAbout}>
          <Text style={styles.footerLink}>{t("footer.about")}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.85} onPress={onContact}>
          <Text style={styles.footerLink}>{t("footer.contact")}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.metaContainer}>
        <Text style={styles.footerMeta}>
          Designed and Developed by{" "}
          <Text 
            style={styles.linkText} 
            onPress={() => Linking.openURL("https://ecourtsghc.assam.gov.in/")}
          >
            e-Courts Services
          </Text>
          , Gauhati High Court, Guwahati.
        </Text>
        <Text style={styles.footerCopyright}>
          © Gauhati High Court, Guwahati. All rights reserved.
        </Text>
      </View>
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={() => Linking.openURL("https://t.me/GHCInfoChannel")}>
          <Ionicons name="paper-plane" size={16} color={colors.accent} />
          <Text style={styles.socialText}>Telegram</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={() => Linking.openURL("https://youtube.com/@ecourtsgauhatihighcourt4597?si=AGl6ey2vxW1D3IzA")}>
          <Ionicons name="logo-youtube" size={16} color={colors.accent} />
          <Text style={styles.socialText}>YouTube</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={() => Linking.openURL("https://www.facebook.com/GuwahatiHighCourt/")}> 
          <Ionicons name="logo-facebook" size={16} color={colors.accent} />
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.footer,
  },
  linksRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  footerLink: { color: "#FFFFFF", fontWeight: "700" },
  metaContainer: { alignItems: "center", marginTop: 8, paddingHorizontal: spacing.md },
  footerMeta: { color: "#ADB9D8", textAlign: "center", fontSize: 11, lineHeight: 16 },
  linkText: { color: colors.accent, textDecorationLine: "underline" },
  footerCopyright: { color: "#ADB9D8", textAlign: "center", fontSize: 11, marginTop: 4, opacity: 0.8 },
  socialRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  socialButton: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#111111",
    borderRadius: radius.lg,
    alignItems: "center",
  },
  socialText: { color: "#ADB9D8", fontWeight: "700" },
});

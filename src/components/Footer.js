import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AntDesign, Entypo, Feather } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from "react-i18next";

export const Footer = ({ onAbout, onContact, onPrivacy }) => {
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
        <TouchableOpacity activeOpacity={0.85} onPress={onPrivacy}>
          <Text style={styles.footerLink}>{t("footer.privacy")}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footerMeta}>
        Developed by eCourts Team Gauhati High Court{"\n"}Assam.
      </Text>
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={() => Linking.openURL("https://t.me/GHCInfoChannel")}>
          <Entypo name="paper-plane" size={16} color="#ADB9D8" />
          <Text style={styles.socialText}>Telegram</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={() => Linking.openURL("https://www.youtube.com/@gauhatihighcourtguwahatili6982")}>
          <AntDesign name="youtube" size={16} color="#ADB9D8" />
          <Text style={styles.socialText}>YouTube</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={() => Linking.openURL("https://www.facebook.com/GuwahatiHighCourt/")}> 
          <Feather name="facebook" size={16} color="#ADB9D8" />
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>
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
  footerLink: { color: "#fff", fontWeight: "700" },
  footerMeta: { color: "#ADB9D8", textAlign: "center", marginTop: 4 },
  socialRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  socialButton: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#121E3D",
    borderRadius: radius.lg,
    alignItems: "center",
  },
  socialText: { color: "#ADB9D8", fontWeight: "700" },
});

import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../theme";
import { useTranslation } from "react-i18next";

const SOCIAL_LINKS = {
  telegram: {
    appUrl: "tg://resolve?domain=GHCInfoChannel",
    webUrl: "https://t.me/GHCInfoChannel",
  },
  whatsapp: {
    appUrl: "whatsapp://channel/0029VbBoYt84dTnDJq9Qsp0J",
    webUrl: "https://www.whatsapp.com/channel/0029VbBoYt84dTnDJq9Qsp0J",
  },
  youtube: {
    appUrl: "youtube://www.youtube.com/@ecourtsgauhatihighcourt4597",
    webUrl: "https://youtube.com/@ecourtsgauhatihighcourt4597",
  },
};

const openSocialLink = async ({ appUrl, webUrl }) => {
  try {
    if (appUrl) {
      const supported = await Linking.canOpenURL(appUrl);
      if (supported) {
        await Linking.openURL(appUrl);
        return;
      }
    }
  } catch (error) {
    // Fall back to the universal web URL when the app scheme is unavailable.
  }

  await Linking.openURL(webUrl);
};

export const Footer = ({ onAbout, onContact }) => {
  const { colors, radius, spacing } = useAppTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(colors, radius, spacing), [colors, radius, spacing]);

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
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={() => openSocialLink(SOCIAL_LINKS.telegram)}>
          <Ionicons name="paper-plane" size={16} color={colors.accent} />
          <Text style={styles.socialText}>Telegram</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={() => openSocialLink(SOCIAL_LINKS.whatsapp)}>
          <Ionicons name="logo-whatsapp" size={16} color={colors.accent} />
          <Text style={styles.socialText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={() => openSocialLink(SOCIAL_LINKS.youtube)}>
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

const createStyles = (colors, radius, spacing) =>
  StyleSheet.create({
    footer: {
      padding: spacing.lg,
      alignItems: "center",
      gap: spacing.xs,
      backgroundColor: colors.footer,
    },
    linksRow: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap", justifyContent: "center" },
    footerLink: { color: colors.textPrimary, fontWeight: "700" },
    metaContainer: { alignItems: "center", marginTop: 8, paddingHorizontal: spacing.md },
    footerMeta: { color: colors.textMuted, textAlign: "center", fontSize: 11, lineHeight: 16 },
    linkText: { color: colors.accent, textDecorationLine: "underline" },
    footerCopyright: { color: colors.textMuted, textAlign: "center", fontSize: 11, marginTop: 4, opacity: 0.8 },
    socialRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap", justifyContent: "center" },
    socialButton: {
      flexDirection: "row",
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      alignItems: "center",
    },
    socialText: { color: colors.textMuted, fontWeight: "700" },
  });

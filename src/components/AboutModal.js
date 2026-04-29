import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing } from "../theme";

export const AboutModal = ({ visible, onClose, judges = [] }) => {
  const { t } = useTranslation();

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("about.title")}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
            <AntDesign name="close" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.paragraph}><Text style={styles.bold}>{t("about.article_214_intro")}</Text></Text>
          <Text style={[styles.paragraph, styles.bold]}>{t("about.article_214_text")}</Text>
          <Text style={styles.paragraph}>{t("about.article_215_text")}</Text>
          <Text style={styles.paragraph}>{t("about.judges_strength", { count: judges.length })}</Text>
          <Text style={styles.subheading}>{t("about.chief_justice")}:</Text>
          {(() => {
            const cj = judges.find((j) => j.title === "Chief Justice");
            if (!cj) return null;
            return <Text style={styles.paragraph}>{cj.name}</Text>;
          })()}
          <Text style={styles.subheading}>{t("about.puisne_judges")}:</Text>
          {judges
            .filter((j) => j.title !== "Chief Justice")
            .map((j) => (
              <Text key={j.id} style={styles.paragraph}>{j.name}</Text>
            ))}
          <Text style={styles.paragraph}>{t("about.article_226_text")}</Text>
          <Text style={styles.paragraph}>{t("about.article_227_text")}</Text>
          <Text style={styles.paragraph}>{t("about.jurisdiction_details")}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { margin: 0, padding: spacing.lg, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: radius.xl, padding: spacing.lg, width: "100%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  title: { color: colors.primary, fontWeight: "800", fontSize: 18 },
  scrollArea: { maxHeight: 520 },
  scrollContent: { paddingBottom: spacing.md },
  paragraph: { color: "#111827", fontSize: 14, lineHeight: 22, marginBottom: spacing.sm },
  subheading: { color: colors.primary, fontWeight: "700", fontSize: 14, marginTop: spacing.sm, marginBottom: 6 },
  bold: { fontWeight: "700" },
});


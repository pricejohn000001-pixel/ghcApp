import { BlurView } from "expo-blur";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Pressable } from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme";
import { placeholderBio } from "../data";
import { decodeHtmlEntities } from "../utils/decodeHtmlEntities";

const getLabelKey = (label) => {
  const map = {
    "Parent High Court": "parent_high_court",
    "Stream": "stream",
    "Date of Birth": "date_of_birth",
    "Date of Elevation": "date_of_elevation",
    "Date of Transfer": "date_of_transfer",
    "Date of Retirement": "date_of_retirement",
    "Postal Address": "postal_address",
    "Place of Stationing": "place_of_stationing",
    "Telephone": "telephone",
  };
  return map[label];
};

const getValueKey = (value) => {
  const map = {
    "Gauhati": "gauhati",
    "Bar": "bar",
    "Judicial Service": "judicial_service",
    "Principal Seat": "principal_seat",
    "Itanagar Bench": "itanagar_bench",
    "Aizawl Bench": "aizawl_bench",
    "Kohima Bench": "kohima_bench"
  };
  return map[value];
};

export const PortfolioModal = ({ visible, onClose, judge }) => {
  const { theme, colors, radius, spacing, fonts } = useAppTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(colors, radius, spacing, fonts), [colors, radius, spacing, fonts]);

  return (
    <Modal 
      customBackdrop={
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView style={StyleSheet.absoluteFill} intensity={80} tint={theme.blurTint} />
        </Pressable>
      }
      backdropOpacity={1}
      hideModalContentWhileAnimating={true} 
      useNativeDriverForBackdrop={true} 
      isVisible={visible} 
      onBackdropPress={onClose} 
      style={styles.portfolioModal}
    >
      <View style={styles.portfolioCard}>
        <View style={styles.portfolioHeader}>
          <Text style={styles.portfolioTitle}>{t("portfolio.title")}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.portfolioName}>{judge?.name?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().replace(/,?\s*chief justice/gi, '').trim()}</Text>
          <Text style={styles.portfolioRole}>{judge?.title}</Text>
          {judge?.biography && judge.biography !== placeholderBio ? (
            <>
              <Text style={styles.bioTitle}>{t("portfolio.biography")}</Text>
              {(() => {
                const decoded = decodeHtmlEntities(judge.biography || "");
                const parts = decoded.split(/(?<=\.)\s+/).reduce((acc, cur) => {
                  const last = acc[acc.length - 1];
                  if (!last || last.split(" ").length > 40) acc.push(cur);
                  else acc[acc.length - 1] = `${last} ${cur}`;
                  return acc;
                }, []);
                return parts.map((p, idx) => (
                  <Text key={`bio-${idx}`} style={styles.bioParagraph}>{p}</Text>
                ));
              })()}
            </>
          ) : null}
          <View style={styles.table}>
            {(judge?.details || []).map((row) => {
              const labelKey = getLabelKey(row.label);
              const valueKey = getValueKey(row.value);
              return (
                <View key={row.label} style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{labelKey ? t(`judge_details.${labelKey}`) : row.label}</Text>
                  <Text style={styles.tableValue}>{valueKey ? t(`common.${valueKey}`) : row.value}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const createStyles = (colors, radius, spacing, fonts) =>
  StyleSheet.create({
    portfolioModal: {
      margin: 0,
      padding: spacing.lg,
      justifyContent: "center",
      alignItems: "center",
    },
    portfolioCard: {
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.xl,
      padding: spacing.lg,
      width: "100%",
      maxHeight: "90%",
    },
    scrollArea: { maxHeight: "100%" },
    scrollContent: { paddingBottom: spacing.md },
    portfolioHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    portfolioTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.textPrimary },
    portfolioName: { fontFamily: fonts.heading, fontSize: 16, color: colors.textPrimary },
    portfolioRole: { color: colors.textSecondary, marginTop: 2, marginBottom: spacing.md, fontFamily: fonts.body },
    bioTitle: { fontFamily: fonts.heading, fontSize: 14, marginBottom: spacing.xs, color: colors.textPrimary },
    bioParagraph: { color: colors.textPrimary, lineHeight: 20, marginBottom: spacing.sm, fontFamily: fonts.body },
    table: { marginTop: spacing.md, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.borderSoft },
    tableRow: {
      flexDirection: "row",
      borderBottomColor: colors.borderSoft,
      borderBottomWidth: 1,
      backgroundColor: colors.card,
    },
    tableLabel: { flex: 1, backgroundColor: colors.cardAlt, padding: spacing.md, color: colors.textPrimary, fontFamily: fonts.bodySemiBold },
    tableValue: { flex: 1, padding: spacing.md, color: colors.textPrimary, fontFamily: fonts.body },
  });


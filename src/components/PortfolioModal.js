import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing } from "../theme";
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
  const { t } = useTranslation();

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} style={styles.portfolioModal}>
      <View style={styles.portfolioCard}>
        <View style={styles.portfolioHeader}>
          <Text style={styles.portfolioTitle}>{t("portfolio.title")}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
            <AntDesign name="close" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.portfolioName}>{judge?.name}</Text>
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
            {judge.details.map((row) => {
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

const styles = StyleSheet.create({
  portfolioModal: {
    margin: 0,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  portfolioCard: {
    backgroundColor: "#fff",
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
  portfolioTitle: { fontWeight: "700", fontSize: 18, color: colors.primary },
  portfolioName: { fontWeight: "700", fontSize: 16, color: colors.primary },
  portfolioRole: { color: "#6B7280", marginTop: 2, marginBottom: spacing.md },
  bioTitle: { fontWeight: "700", fontSize: 14, marginBottom: spacing.xs, color: colors.primary },
  bioText: { color: "#111827", lineHeight: 20 },
  bioParagraph: { color: "#111827", lineHeight: 20, marginBottom: spacing.sm },
  table: { marginTop: spacing.md, borderRadius: radius.lg, overflow: "hidden" },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  tableLabel: { flex: 1, backgroundColor: "#F3F4F6", padding: spacing.md, color: "#111827" },
  tableValue: { flex: 1, padding: spacing.md, color: "#111827" },
});


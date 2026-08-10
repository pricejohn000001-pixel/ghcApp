import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme";
import { formatLocalizedNumber, localizeDigitsInText } from "../utils/localization";

const ERROR_RED = "#EF4444";
const CASE_STATUS_BEARER_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN;

const hexToRgba = (hex, alpha) => {
  if (!hex || typeof hex !== "string") {
    return `rgba(212, 175, 55, ${alpha})`;
  }

  let normalized = hex.replace("#", "");

  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (normalized.length !== 6) {
    return `rgba(212, 175, 55, ${alpha})`;
  }

  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getStatusStyles = (status, colors) => {
  const normalizedStatus = status?.toUpperCase();

  if (normalizedStatus === "PENDING" || normalizedStatus === "DISPOSED") {
    return {
      bg: hexToRgba(colors.accent, 0.25),
      text: colors.accent,
      border: hexToRgba(colors.accent, 0.32),
    };
  }

  return {
    bg: colors.cardAlt,
    text: colors.textPrimary,
    border: colors.borderSoft,
  };
};

export const CaseDetailsScreen = ({ caseItem, scrollY }) => {
  const { theme, colors, radius, spacing, fonts } = useAppTheme();
  const { t, i18n } = useTranslation();
  const styles = React.useMemo(
    () => createStyles(theme, colors, radius, spacing, fonts),
    [theme, colors, radius, spacing, fonts]
  );
  const monthNames = t("months_short", { returnObjects: true });

  const [data, setData] = useState(caseItem);
  const [subMatters, setSubMatters] = useState([]);
  const [linkedCases, setLinkedCases] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [loadingMoreOrders, setLoadingMoreOrders] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cinoToFetch = caseItem?.cino;

  useEffect(() => {
    if (!cinoToFetch) {
      setError(t("case_details_screen.no_case_selected"));
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);

        const headers = {
          Authorization: `Bearer ${CASE_STATUS_BEARER_TOKEN}`,
        };

        const [mainRes, subRes, linkRes, ordersRes] = await Promise.allSettled([
          fetch(`https://ghcservices.assam.gov.in/cis-api/api/v1/cases-by-cino/${cinoToFetch}`, { headers }),
          fetch(`https://ghcservices.assam.gov.in/cis-api/api/v1/cases-sub-case/${cinoToFetch}`, { headers }),
          fetch(`https://ghcservices.assam.gov.in/cis-api/api/v1/cases-link/${cinoToFetch}`, { headers }),
          fetch(`https://ghcservices.assam.gov.in/cis-api/api/v1/cases-orders/${cinoToFetch}?page=1&per_page=15`, { headers }),
        ]);

        if (mainRes.status === "fulfilled" && mainRes.value.ok) {
          const mainData = await mainRes.value.json();

          if (mainData.status && mainData.data) {
            setData((prev) => ({ ...prev, ...(mainData.data || {}) }));
          }
        }

        if (subRes.status === "fulfilled" && subRes.value.ok) {
          const subData = await subRes.value.json();
          if (subData.status && subData.data) setSubMatters(subData.data);
        }

        if (linkRes.status === "fulfilled" && linkRes.value.ok) {
          const linkData = await linkRes.value.json();
          if (linkData.status && linkData.data) setLinkedCases(linkData.data);
        }

        if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
          const ordersData = await ordersRes.value.json();

          if (ordersData.status && ordersData.data?.data) {
            setOrders(ordersData.data.data);
            setOrdersPage(ordersData.data.current_page || 1);
            setOrdersTotalPages(ordersData.data.last_page || 1);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [cinoToFetch, t]);

  const loadMoreOrders = async () => {
    if (ordersPage >= ordersTotalPages || loadingMoreOrders) return;

    setLoadingMoreOrders(true);

    try {
      const nextPage = ordersPage + 1;
      const response = await fetch(
        `https://ghcservices.assam.gov.in/cis-api/api/v1/cases-orders/${cinoToFetch}?page=${nextPage}&per_page=15`,
        {
          headers: {
            Authorization: `Bearer ${CASE_STATUS_BEARER_TOKEN}`,
          },
        }
      );

      if (response.ok) {
        const json = await response.json();

        if (json.status && json.data?.data) {
          setOrders((prev) => [...prev, ...json.data.data]);
          setOrdersPage(json.data.current_page);
          setOrdersTotalPages(json.data.last_page);
        }
      }
    } catch (err) {
      console.log("Failed to load more orders:", err);
    } finally {
      setLoadingMoreOrders(false);
    }
  };

  const localizeStatus = (status) => {
    const normalized = status?.toUpperCase();
    if (!normalized) return t("case_common.unknown");
    if (normalized === "PENDING") return t("case_common.pending");
    if (normalized === "DISPOSED") return t("case_common.disposed");
    if (normalized === "UNKNOWN") return t("case_common.unknown");
    return localizeDigitsInText(status, i18n.language);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return localizeDigitsInText(dateString, i18n.language);

      const day = formatLocalizedNumber(String(date.getDate()).padStart(2, "0"), i18n.language);
      const month = monthNames[date.getMonth()];
      const year = formatLocalizedNumber(date.getFullYear(), i18n.language);
      return `${day} ${month} ${year}`;
    } catch {
      return localizeDigitsInText(dateString, i18n.language);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return localizeDigitsInText(dateString, i18n.language);

      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return localizeDigitsInText(`${day}-${month}-${year} ${hours}:${minutes}`, i18n.language);
    } catch {
      return localizeDigitsInText(dateString, i18n.language);
    }
  };

  const getCaseAge = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";

    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) {
      return `${formatLocalizedNumber(Math.floor(diffDays / 365), i18n.language)} ${t("case_common.years_short")}, ${formatLocalizedNumber(diffDays % 365, i18n.language)} ${t("case_common.days")}`;
    }

    return `${formatLocalizedNumber(diffDays, i18n.language)} ${t("case_common.days")}`;
  };

  const getCaseTypeName = () => "";

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>{t("case_details_screen.loading")}</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.errorScreen}>
        <View style={styles.errorStateCard}>
          <View style={styles.errorStateIconBg}>
            <Ionicons name="alert-circle" size={40} color={ERROR_RED} />
          </View>
          <Text style={styles.errorStateTitle}>{t("case_details_screen.data_unavailable")}</Text>
          <Text style={styles.errorStateSub}>
            {error || t("case_details_screen.data_unavailable_subtitle")}
          </Text>
        </View>
      </View>
    );
  }

  const shouldHideParties =
    data.hide_partyname === "Y" || data.hide_pet_name === "Y" || data.hide_res_name === "Y";

  const getPartyName = (name, item) => {
    const isHidden =
      shouldHideParties ||
      (item && (item.hide_partyname === "Y" || item.hide_pet_name === "Y" || item.hide_res_name === "Y"));

    return isHidden && name ? "XXXX" : name;
  };

  const caseTypeName = data.filing_case_type?.type_name || getCaseTypeName(data.filcase_type);
  const regTypeName = data.registered_case_type?.type_name || getCaseTypeName(data.regcase_type);
  const caseNo = `${caseTypeName} ${localizeDigitsInText(`${data.fil_no || ""}/${data.fil_year || ""}`, i18n.language)}`;
  const regNo = `${regTypeName} ${localizeDigitsInText(`${data.reg_no || ""}/${data.reg_year || ""}`, i18n.language)}`;

  const renderDetailRow = (label, value, isHighlight = false, isStatus = false) => {
    const statusStyle = isStatus ? getStatusStyles(value, colors) : null;
    const displayValue = isStatus ? localizeStatus(value) : value;

    return (
      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, isHighlight && styles.detailLabelHighlight]}>{label}</Text>
        <View style={styles.detailValueContainer}>
          {isHighlight && (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingBadgeText}>{t("case_common.upcoming")}</Text>
            </View>
          )}
          {isStatus ? (
            <View style={[styles.statusPill, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
              <Text style={[styles.statusPillText, { color: statusStyle.text }]}>{displayValue}</Text>
            </View>
          ) : (
            <Text style={[styles.detailValue, isHighlight && styles.detailValueHighlight]}>{displayValue || "-"}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderAdvocates = (advName, advReg, extraAdvs = []) => {
    const advocates = [];

    if (advName) {
      advocates.push(`${advName} ${advReg ? `(${advReg})` : ""}`.trim());
    }

    extraAdvs?.forEach((extra) => {
      advocates.push(`${extra.adv_name} ${extra.adv_reg ? `(${extra.adv_reg})` : ""}`.trim());
    });

    if (advocates.length === 0) return null;

    return (
      <View style={styles.advocateRow}>
        <View style={styles.advBadge}>
          <Text style={styles.advBadgeText}>{t("case_common.advocate_short")}</Text>
        </View>
        <Text style={styles.advName}>{advocates.join(", ")}</Text>
      </View>
    );
  };

  const allPetitioners = [];
  if (data.pet_name) {
    allPetitioners.push({
      party_no: 1,
      name: getPartyName(data.pet_name),
      age: data.pet_age,
      address: null,
      adv_name: data.petitioner_advocate?.adv_name || data.pet_adv,
      adv_reg: data.petitioner_advocate?.adv_reg || data.pet_adv_cd,
      extra_advs: data.petitioner_advocate?.extra_advocates || [],
    });

    if (data.petitioners && data.petitioners.length > 0) {
      data.petitioners.forEach((petitioner, index) => {
        allPetitioners.push({
          party_no: index + 2,
          name: getPartyName(petitioner.pet_name || petitioner.name),
          age: petitioner.pet_age || petitioner.age,
          address: petitioner.address,
          adv_name: null,
          adv_reg: null,
          extra_advs: [],
        });
      });
    }
  }

  const allRespondents = [];
  if (data.res_name) {
    allRespondents.push({
      party_no: 1,
      name: getPartyName(data.res_name),
      age: data.res_age,
      address: null,
      adv_name: data.respondent_advocate?.adv_name || data.res_adv,
      adv_reg: data.respondent_advocate?.adv_reg || data.res_adv_cd,
      extra_advs: data.respondent_advocate?.extra_advocates || [],
    });

    if (data.respondents && data.respondents.length > 0) {
      data.respondents.forEach((respondent, index) => {
        allRespondents.push({
          party_no: index + 2,
          name: getPartyName(respondent.res_name || respondent.name),
          age: respondent.res_age || respondent.age,
          address: respondent.address,
          adv_name: null,
          adv_reg: null,
          extra_advs: [],
        });
      });
    }
  }

  const listedFor = data.next_purpose?.purpose_name || data.purpose_next || "-";
  const daysSinceListed = data.days_since_last_listed
    ? `${formatLocalizedNumber(Math.floor(data.days_since_last_listed), i18n.language)} ${t("case_common.days")}`
    : getCaseAge(data.date_last_list);
  const currentStatus = data.case_state ? data.case_state.toUpperCase() : data.last_status === "D" ? "DISPOSED" : "PENDING";
  const currentStatusDisplay = localizeStatus(currentStatus);
  const listedBefore = data.bench
    ? `${data.bench.bench_type_name} (${data.bench.bench_abbreviation})`
    : data.benchtype || "-";
  const caseAgeFormatted = data.age_of_case_formatted || getCaseAge(data.date_of_filing);
  const isDisposed = currentStatus === "DISPOSED";
  const isDateNotGiven =
    data.date_next_list?.startsWith("5000-01-01") || data.date_next_list?.startsWith("4999-12-31");
  const nextHearingDisplay = isDateNotGiven
    ? t("case_common.date_not_given")
    : formatDate(data.date_next_list);
  const heroStatusStyle = getStatusStyles(currentStatus, colors);

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.header} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}>
            <Ionicons name="hammer" size={20} color={colors.accent} />
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              {regTypeName} / {localizeDigitsInText(data.reg_no || "-", i18n.language)} / {localizeDigitsInText(data.reg_year || "-", i18n.language)}
            </Text>
            <Text style={styles.heroSub}>CINO: {localizeDigitsInText(data.cino || "-", i18n.language)}</Text>
            <View style={styles.heroPillRow}>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>{caseTypeName || t("case_details_screen.case_fallback")}</Text>
              </View>
              <View
                style={[
                  styles.heroPill,
                  styles.heroStatusPill,
                  { backgroundColor: heroStatusStyle.bg, borderColor: heroStatusStyle.border },
                ]}
              >
                <Text style={[styles.heroPillText, { color: heroStatusStyle.text }]}>{currentStatusDisplay}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={
          scrollY
            ? Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                useNativeDriver: false,
              })
            : undefined
        }
        scrollEventThrottle={16}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="document-text" size={18} color={colors.accent} />
            </View>
            <Text style={styles.cardTitle}>{t("case_details_screen.case_details")}</Text>
          </View>

          <View style={styles.detailsContainer}>
            {renderDetailRow(t("case_details_screen.labels.filing_no"), caseNo)}
            <View style={styles.detailDivider} />
            {renderDetailRow(t("case_details_screen.labels.filing_date"), formatDate(data.date_of_filing))}
            <View style={styles.detailDivider} />
            {renderDetailRow(t("case_details_screen.labels.registration_no"), regNo)}
            <View style={styles.detailDivider} />
            {renderDetailRow(t("case_details_screen.labels.registration_date"), formatDate(data.dt_regis))}
            {!isDisposed && (
              <>
                <View style={styles.detailDivider} />
                {renderDetailRow(t("case_details_screen.labels.next_hearing"), nextHearingDisplay, !isDateNotGiven)}
              </>
            )}
            <View style={styles.detailDivider} />
            {renderDetailRow(t("case_details_screen.labels.listed_for"), listedFor)}
            <View style={styles.detailDivider} />
            {renderDetailRow(t("case_details_screen.labels.last_listing"), formatDate(data.date_last_list))}
            <View style={styles.detailDivider} />
            {renderDetailRow(t("case_details_screen.labels.efiling_ref_no"), localizeDigitsInText(data.efilno, i18n.language))}
          </View>

          <View style={styles.cardFooter}>
            <Ionicons name="information-circle" size={12} color={colors.textSecondary} />
            <Text style={styles.footerText}>{t("case_details_screen.hearing_dates_note")}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="pulse" size={18} color={colors.accent} />
            </View>
            <Text style={styles.cardTitle}>{t("case_details_screen.additional_information")}</Text>
          </View>

          <View style={styles.detailsContainer}>
            {renderDetailRow(t("case_details_screen.labels.current_status"), currentStatus, false, true)}
            <View style={styles.detailDivider} />
            {renderDetailRow(t("case_details_screen.labels.listed_before"), listedBefore)}
            <View style={styles.detailDivider} />
            {renderDetailRow(t("case_details_screen.labels.case_age"), localizeDigitsInText(caseAgeFormatted, i18n.language))}
            {!isDisposed && (
              <>
                <View style={styles.detailDivider} />
                {renderDetailRow(t("case_details_screen.labels.days_since_last_listed"), daysSinceListed)}
              </>
            )}
            <View style={styles.detailDivider} />
            {renderDetailRow(t("case_details_screen.labels.case_category"), data.subject?.subject_name || "-")}
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>
              {data.filing_case_type?.full_form || t("case_details_screen.fallback_case_type_full_form")}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={[styles.cardHeader, styles.partiesHeader]}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="people" size={18} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.cardTitle}>{t("case_details_screen.parties")}</Text>
              <Text style={styles.cardSubtitle}>
                {t("case_details_screen.petitioners_respondents", {
                  petitioners: formatLocalizedNumber(allPetitioners.length, i18n.language),
                  respondents: formatLocalizedNumber(allRespondents.length, i18n.language),
                })}
              </Text>
            </View>
          </View>

          <View style={styles.partiesStackLayout}>
            <View style={styles.partyStackColumn}>
              <View style={styles.partyHeaderBg}>
                <Text style={styles.partyHeaderTitle}>{t("case_details_screen.petitioners_header")}</Text>
              </View>
              <View style={styles.verticalListContainer}>
                {allPetitioners.map((petitioner, index) => (
                  <View key={index} style={styles.partyCard}>
                    <View style={styles.partyCardHeader}>
                      <View style={styles.partyAvatar}>
                        <Text style={styles.partyAvatarText}>{formatLocalizedNumber(petitioner.party_no, i18n.language)}</Text>
                      </View>
                      <Text style={styles.partyCardName}>
                        {petitioner.name} <Text style={styles.partyAge}>{petitioner.age ? `${formatLocalizedNumber(petitioner.age, i18n.language)}${t("case_common.age_suffix")}` : ""}</Text>
                      </Text>
                    </View>
                    {renderAdvocates(petitioner.adv_name, petitioner.adv_reg, petitioner.extra_advs)}
                    {petitioner.address && <Text style={styles.partyAddress}>{petitioner.address}</Text>}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.partyStackColumn}>
              <View style={styles.partyHeaderBg}>
                <Text style={styles.partyHeaderTitle}>{t("case_details_screen.respondents_header")}</Text>
              </View>
              <View style={styles.verticalListContainer}>
                {allRespondents.map((respondent, index) => (
                  <View key={index} style={styles.partyCard}>
                    <View style={styles.partyCardHeader}>
                      <View style={styles.partyAvatar}>
                        <Text style={styles.partyAvatarText}>{formatLocalizedNumber(respondent.party_no, i18n.language)}</Text>
                      </View>
                      <Text style={styles.partyCardName}>
                        {respondent.name} <Text style={styles.partyAge}>{respondent.age ? `${formatLocalizedNumber(respondent.age, i18n.language)}${t("case_common.age_suffix")}` : ""}</Text>
                      </Text>
                    </View>
                    {renderAdvocates(respondent.adv_name, respondent.adv_reg, respondent.extra_advs)}
                    {respondent.address && <Text style={styles.partyAddress}>{respondent.address}</Text>}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="layers" size={18} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.cardTitle}>{t("case_details_screen.sub_matters")}</Text>
              <Text style={styles.cardSubtitle}>
                {t("case_details_screen.applications_filed", {
                  count: formatLocalizedNumber(subMatters.length, i18n.language),
                })}
              </Text>
            </View>
          </View>

          {subMatters.length > 0 ? (
            <View style={styles.verticalListContainer}>
              {subMatters.map((subMatter, index) => {
                const statusStyle = getStatusStyles(subMatter.case_state, colors);

                return (
                  <View key={index} style={styles.verticalCard}>
                    <View style={styles.verticalCardHeader}>
                      <View style={styles.verticalCardHeaderContent}>
                        <Text style={styles.verticalCardTitle}>
                          {`${subMatter.filing_case_type?.type_name || ""} ${localizeDigitsInText(`${subMatter.reg_no || ""}/${subMatter.reg_year || ""}`, i18n.language)}`}
                        </Text>
                        <Text style={styles.verticalCardSub}>{localizeDigitsInText(subMatter.cino, i18n.language)}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
                        ]}
                      >
                        <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
                          {localizeStatus(subMatter.case_state?.toUpperCase() || "UNKNOWN")}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.verticalCardBody}>
                      <View style={styles.verticalCardRow}>
                        <Text style={styles.verticalCardLabel}>{t("case_details_screen.labels.petitioner")}</Text>
                        <Text style={styles.verticalCardValue}>{getPartyName(subMatter.pet_name, subMatter)}</Text>
                      </View>
                      <View style={styles.verticalCardRow}>
                        <Text style={styles.verticalCardLabel}>{t("case_details_screen.labels.respondent")}</Text>
                        <Text style={styles.verticalCardValue}>{getPartyName(subMatter.res_name, subMatter)}</Text>
                      </View>
                      <View style={styles.verticalCardRow}>
                        <Text style={styles.verticalCardLabel}>{t("case_details_screen.labels.filed_on")}</Text>
                        <Text style={styles.verticalCardValue}>{formatDate(subMatter.date_of_filing)}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyDataCard}>
              <View style={styles.emptyDataIconBg}>
                <Ionicons name="layers" size={24} color={colors.textQuaternary} />
              </View>
              <Text style={styles.emptyDataTitle}>{t("case_details_screen.no_sub_matters")}</Text>
              <Text style={styles.emptyDataSub}>{t("case_details_screen.no_sub_matters_subtitle")}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="link" size={18} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.cardTitle}>{t("case_details_screen.linked_cases")}</Text>
              <Text style={styles.cardSubtitle}>
                {t("case_details_screen.linked_cases_found", {
                  count: formatLocalizedNumber(linkedCases.length, i18n.language),
                })}
              </Text>
            </View>
          </View>

          {linkedCases.length > 0 ? (
            <View style={styles.verticalListContainer}>
              {linkedCases.map((linkedCase, index) => {
                const statusStyle = getStatusStyles(linkedCase.status, colors);

                return (
                  <View key={index} style={styles.verticalCard}>
                    <View style={styles.verticalCardHeader}>
                      <View style={styles.verticalCardHeaderContent}>
                        <Text style={styles.verticalCardTitle}>{localizeDigitsInText(linkedCase.caseno, i18n.language)}</Text>
                        <Text style={styles.verticalCardSub}>{localizeDigitsInText(linkedCase.cino, i18n.language)}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
                        ]}
                      >
                        <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
                          {localizeStatus(linkedCase.status?.toUpperCase() || "UNKNOWN")}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.verticalCardBody}>
                      <Text style={[styles.verticalCardValue, styles.verticalCardValueLeft]}>
                        {`${getPartyName(linkedCase.pet_name, linkedCase)} VS ${getPartyName(linkedCase.res_name, linkedCase)}`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyDataCard}>
              <View style={styles.emptyDataIconBg}>
                <Ionicons name="link" size={24} color={colors.textQuaternary} />
              </View>
              <Text style={styles.emptyDataTitle}>{t("case_details_screen.no_linked_cases")}</Text>
              <Text style={styles.emptyDataSub}>{t("case_details_screen.no_linked_cases_subtitle")}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="document-text" size={18} color={colors.accent} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.cardTitle}>{t("case_details_screen.orders")}</Text>
              <Text style={styles.cardSubtitle}>
                {t("case_details_screen.orders_loaded", {
                  count: formatLocalizedNumber(orders.length, i18n.language),
                })}
              </Text>
            </View>
          </View>

          {orders.length > 0 ? (
            <>
              <View style={styles.verticalListContainer}>
                {orders.map((order, index) => (
                  <View key={order.order_no || index} style={styles.verticalCard}>
                    <View style={styles.verticalCardHeader}>
                      <View style={styles.orderHeader}>
                        <View style={styles.orderBadge}>
                          <Text style={styles.orderBadgeText}>{localizeDigitsInText(order.order_no, i18n.language)}</Text>
                        </View>
                        <Text style={styles.orderDate}>{formatDate(order.order_dt)}</Text>
                      </View>
                      <View>
                        <Text style={styles.orderTypeText}>{order.document_type?.docu_name || t("case_common.unknown")}</Text>
                      </View>
                    </View>
                    <View style={styles.verticalCardBody}>
                      <View style={styles.verticalCardRow}>
                        <Text style={styles.verticalCardLabel}>{t("case_details_screen.uploaded")}</Text>
                        <Text style={styles.verticalCardValue}>{formatDateTime(order.timestamp)}</Text>
                      </View>
                      <View style={styles.verticalCardRow}>
                        <Text style={styles.verticalCardLabel}>{t("case_details_screen.reportable")}</Text>
                        <Text style={styles.verticalCardValue}>{order.reportable_judgement === "Y" ? t("case_common.yes") : t("case_common.no")}</Text>
                      </View>
                    </View>
                    <View style={styles.verticalCardFooter}>
                      {order.uploaded_file_exists ? (
                        shouldHideParties ? (
                          <View style={[styles.pdfBtn, styles.pdfBtnRestricted]}>
                            <Ionicons name="lock-closed" size={12} color={ERROR_RED} />
                            <Text style={styles.pdfBtnRestrictedText}>{t("case_common.restricted")}</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.pdfBtn}
                            onPress={() =>
                              Linking.openURL(
                                `https://ghcservices.assam.gov.in/case-status/order-document/${order.uploaded_file_year}/${order.uploaded_file_name}`
                              )
                            }
                          >
                            <Ionicons name="document" size={12} color={colors.accent} />
                            <Text style={styles.pdfBtnText}>{t("case_common.view_pdf")}</Text>
                          </TouchableOpacity>
                        )
                      ) : (
                        <Text style={styles.documentUnavailableText}>{t("case_common.document_unavailable")}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {ordersPage < ordersTotalPages && (
                <View style={styles.loadMoreContainer}>
                  <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMoreOrders} disabled={loadingMoreOrders}>
                    {loadingMoreOrders ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <Text style={styles.loadMoreText}>
                        {t("case_details_screen.load_more_orders", {
                          count: formatLocalizedNumber(ordersTotalPages - ordersPage, i18n.language),
                        })}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyDataCard}>
              <View style={styles.emptyDataIconBg}>
                <Ionicons name="document-text" size={24} color={colors.textQuaternary} />
              </View>
              <Text style={styles.emptyDataTitle}>{t("case_details_screen.no_orders")}</Text>
              <Text style={styles.emptyDataSub}>{t("case_details_screen.no_orders_subtitle")}</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const createStyles = (theme, colors, radius, spacing, fonts) => {
  const accentBorder = hexToRgba(colors.accent, 0.32);
  const dangerTint = hexToRgba(ERROR_RED, theme.isDark ? 0.16 : 0.1);
  const dangerBorder = hexToRgba(ERROR_RED, theme.isDark ? 0.28 : 0.2);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: spacing.lg,
      color: colors.textPrimary,
      fontFamily: fonts.bodySemiBold,
    },
    errorScreen: {
      flex: 1,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    hero: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
    },
    heroRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },
    heroIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.cardAlt,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    heroContent: {
      flex: 1,
    },
    heroTitle: {
      color: colors.textPrimary,
      fontFamily: fonts.heading,
      fontSize: 18,
    },
    heroSub: {
      color: colors.textMuted,
      marginTop: 4,
      fontSize: 13,
      fontFamily: fonts.body,
      letterSpacing: 0.5,
    },
    heroPillRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
      flexWrap: "wrap",
    },
    heroPill: {
      backgroundColor: colors.card,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.pill,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    heroStatusPill: {
      borderColor: accentBorder,
    },
    heroPillText: {
      color: colors.textPrimary,
      fontSize: 10,
      fontFamily: fonts.bodyBold,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    scroll: {
      flex: 1,
    },
    content: {
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.accent,
      borderBottomWidth: 0,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
      paddingBottom: 60,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      overflow: "hidden",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.lg,
    },
    partiesHeader: {
      paddingBottom: spacing.sm,
    },
    headerIconContainer: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.cardSubtle,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    cardTitle: {
      fontSize: 17,
      fontFamily: fonts.heading,
      color: colors.textPrimary,
    },
    cardSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
      fontFamily: fonts.body,
    },
    detailsContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.md,
      gap: spacing.lg,
    },
    detailDivider: {
      height: 1,
      backgroundColor: colors.borderSoft,
    },
    detailLabel: {
      flex: 1,
      fontSize: 12,
      fontFamily: fonts.bodySemiBold,
      color: colors.textSecondary,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    detailLabelHighlight: {
      color: colors.accent,
    },
    detailValueContainer: {
      flex: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: spacing.sm,
    },
    detailValue: {
      fontSize: 14,
      fontFamily: fonts.bodyBold,
      color: colors.textPrimary,
      textAlign: "right",
      flexShrink: 1,
    },
    detailValueHighlight: {
      color: colors.accent,
    },
    upcomingBadge: {
      backgroundColor: colors.accent,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: radius.pill,
    },
    upcomingBadgeText: {
      fontSize: 9,
      color: colors.textInverse,
      fontFamily: fonts.bodyBold,
      textTransform: "uppercase",
    },
    cardFooter: {
      backgroundColor: colors.card,
      padding: spacing.md,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      borderTopWidth: 1,
      borderTopColor: colors.borderSoft,
    },
    footerText: {
      fontSize: 12,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 18,
      fontFamily: fonts.body,
    },
    partiesStackLayout: {
      marginTop: spacing.sm,
    },
    partyStackColumn: {
      borderBottomWidth: 4,
      borderBottomColor: colors.card,
    },
    partyHeaderBg: {
      paddingVertical: 10,
      paddingHorizontal: spacing.lg,
      alignItems: "center",
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.borderSoft,
    },
    partyHeaderTitle: {
      fontSize: 12,
      fontFamily: fonts.bodyBold,
      letterSpacing: 1,
      color: colors.accent,
    },
    partyCard: {
      width: "100%",
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    partyCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 8,
    },
    partyAvatar: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
      backgroundColor: colors.accent,
    },
    partyAvatarText: {
      color: colors.textInverse,
      fontSize: 11,
      fontFamily: fonts.bodyBold,
    },
    partyCardName: {
      flex: 1,
      fontSize: 15,
      fontFamily: fonts.heading,
      lineHeight: 22,
      color: colors.accent,
    },
    partyAge: {
      fontSize: 13,
      fontFamily: fonts.body,
      color: colors.textQuaternary,
    },
    advocateRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginBottom: 8,
      backgroundColor: colors.cardAlt,
      padding: 8,
      borderRadius: radius.sm,
    },
    advBadge: {
      backgroundColor: ERROR_RED,
      paddingHorizontal: 5,
      paddingVertical: 3,
      borderRadius: 4,
      marginTop: 1,
    },
    advBadgeText: {
      color: colors.textInverse,
      fontSize: 9,
      fontFamily: fonts.bodyBold,
    },
    advName: {
      fontSize: 13,
      fontFamily: fonts.bodySemiBold,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 18,
    },
    partyAddress: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      fontFamily: fonts.body,
    },
    statusPill: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.pill,
      borderWidth: 1,
    },
    statusPillText: {
      fontSize: 10,
      fontFamily: fonts.bodyBold,
      textTransform: "uppercase",
    },
    verticalListContainer: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    verticalCard: {
      backgroundColor: colors.cardAlt,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    verticalCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
      gap: spacing.md,
    },
    verticalCardHeaderContent: {
      flex: 1,
      marginRight: spacing.md,
    },
    verticalCardTitle: {
      fontSize: 14,
      fontFamily: fonts.bodyBold,
      color: colors.textPrimary,
    },
    verticalCardSub: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      fontFamily: fonts.body,
    },
    verticalCardBody: {
      gap: 10,
    },
    verticalCardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.lg,
    },
    verticalCardLabel: {
      fontSize: 11,
      fontFamily: fonts.bodySemiBold,
      color: colors.textQuaternary,
      letterSpacing: 0.5,
    },
    verticalCardValue: {
      fontSize: 13,
      color: colors.textMuted,
      flex: 1,
      textAlign: "right",
      fontFamily: fonts.body,
    },
    verticalCardValueLeft: {
      textAlign: "left",
      color: colors.textSecondary,
    },
    verticalCardFooter: {
      alignItems: "stretch",
      borderTopWidth: 1,
      borderTopColor: colors.borderSoft,
      paddingTop: 12,
      marginTop: 12,
    },
    orderHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      flex: 1,
    },
    orderBadge: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      width: 28,
      height: 28,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    orderBadgeText: {
      fontSize: 12,
      fontFamily: fonts.bodyBold,
      color: colors.accent,
    },
    orderDate: {
      fontSize: 15,
      color: colors.textPrimary,
      fontFamily: fonts.bodyBold,
    },
    orderTypeText: {
      fontSize: 11,
      fontFamily: fonts.bodySemiBold,
      color: colors.accent,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    pdfBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: radius.md,
    },
    pdfBtnRestricted: {
      borderColor: dangerBorder,
    },
    pdfBtnText: {
      fontSize: 14,
      fontFamily: fonts.bodyBold,
      color: colors.accent,
    },
    pdfBtnRestrictedText: {
      fontSize: 14,
      fontFamily: fonts.bodyBold,
      color: ERROR_RED,
    },
    documentUnavailableText: {
      color: colors.textQuaternary,
      fontSize: 12,
      fontFamily: fonts.body,
      textAlign: "center",
    },
    loadMoreContainer: {
      padding: spacing.md,
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors.borderSoft,
    },
    loadMoreBtn: {
      backgroundColor: colors.cardAlt,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    loadMoreText: {
      fontSize: 12,
      fontFamily: fonts.bodyBold,
      color: colors.textPrimary,
    },
    emptyDataCard: {
      padding: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardAlt,
      margin: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      borderStyle: "dashed",
    },
    emptyDataIconBg: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    emptyDataTitle: {
      fontSize: 15,
      fontFamily: fonts.bodyBold,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    emptyDataSub: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
      fontFamily: fonts.body,
    },
    errorStateCard: {
      backgroundColor: dangerTint,
      borderRadius: radius.xl,
      padding: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: dangerBorder,
      width: "100%",
    },
    errorStateIconBg: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.cardAlt,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    errorStateTitle: {
      fontSize: 20,
      fontFamily: fonts.bodyBold,
      color: ERROR_RED,
      marginBottom: 8,
    },
    errorStateSub: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      fontFamily: fonts.body,
    },
    flex1: {
      flex: 1,
    },
  });
};

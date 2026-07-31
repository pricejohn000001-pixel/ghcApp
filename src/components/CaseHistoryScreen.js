import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme";
import { formatLocalizedNumber, localizeDigitsInText } from "../utils/localization";

const ERROR_RED = "#EF4444";

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

const CaseTypeItem = React.memo(({ item, isSelected, onSelect, styles, colors }) => (
  <TouchableOpacity
    style={[styles.modalItem, isSelected && styles.modalItemActive]}
    onPress={() => onSelect(item)}
  >
    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>{item.label}</Text>
    {isSelected && <Ionicons name="checkmark" size={20} color={colors.accent} />}
  </TouchableOpacity>
));

export const CaseHistoryScreen = ({ scrollY, onViewDetails }) => {
  const { theme, colors, radius, spacing, fonts } = useAppTheme();
  const { t, i18n } = useTranslation();
  const styles = React.useMemo(
    () => createStyles(theme, colors, radius, spacing, fonts),
    [theme, colors, radius, spacing, fonts]
  );

  const [category, setCategory] = useState("Civil");
  const [selectedType, setSelectedType] = useState(null);
  const [regNo, setRegNo] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [searchMode, setSearchMode] = useState("case_no");
  const [cnr, setCnr] = useState("");
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [caseTypes, setCaseTypes] = useState({ Civil: [], Criminal: [] });
  const [caseTypesLoading, setCaseTypesLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);

  const scrollViewRef = useRef(null);
  const flatListRef = useRef(null);
  const availableTypes = category === "Civil" ? caseTypes.Civil : caseTypes.Criminal;
  const monthNames = t("months_short", { returnObjects: true });
  const searchModes = React.useMemo(
    () => [
      { key: "case_no", label: t("case_status_screen.search_modes.case_no") },
      { key: "cnr", label: t("case_status_screen.search_modes.cnr") },
      { key: "qr_scan", label: t("case_status_screen.search_modes.qr_scan") },
    ],
    [t]
  );

  useEffect(() => {
    const fetchCaseTypes = async () => {
      try {
        setCaseTypesLoading(true);

        const response = await fetch("https://ghcservices.assam.gov.in/cis-api/api/v1/cases/case-type", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_TOKEN}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const mapped = { Civil: [], Criminal: [] };
          const items = Array.isArray(data) ? data : data.data || [];

          items.forEach((type) => {
            const item = {
              label: type.type_name,
              value: String(type.case_type),
            };

            if (type.type_flag === "1" || type.type_flag === 1) {
              mapped.Civil.push(item);
            } else if (type.type_flag === "2" || type.type_flag === 2) {
              mapped.Criminal.push(item);
            }
          });

          mapped.Civil.sort((a, b) => a.label.localeCompare(b.label));
          mapped.Criminal.sort((a, b) => a.label.localeCompare(b.label));

          setCaseTypes(mapped);
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch case types from new API. Status:", response.status, "Response:", errorText);
        }
      } catch (err) {
        console.error("Failed to fetch case types from new API. Network Error:", err);
      } finally {
        setCaseTypesLoading(false);
      }
    };

    fetchCaseTypes();
  }, []);

  const filteredTypes = React.useMemo(() => {
    if (!typeSearchQuery) return availableTypes;

    return availableTypes.filter(
      (type) =>
        type.label.toLowerCase().includes(typeSearchQuery.toLowerCase()) ||
        type.value.toLowerCase().includes(typeSearchQuery.toLowerCase())
    );
  }, [availableTypes, typeSearchQuery]);

  const selectedTypeIndex = React.useMemo(() => {
    if (!selectedType || typeSearchQuery) return 0;

    const index = availableTypes.findIndex((type) => type.value === selectedType.value);
    return index >= 0 ? index : 0;
  }, [availableTypes, selectedType, typeSearchQuery]);

  const handleCategorySwitch = (nextCategory) => {
    setCategory(nextCategory);
    setSelectedType(null);
    setTypeSearchQuery("");
  };

  const handleTypeSelect = React.useCallback((item) => {
    setSelectedType(item);
    setTypeModalVisible(false);
    setTypeSearchQuery("");
  }, []);

  const renderTypeItem = React.useCallback(
    ({ item }) => (
      <CaseTypeItem
        item={item}
        isSelected={selectedType?.value === item.value}
        onSelect={handleTypeSelect}
        styles={styles}
        colors={colors}
      />
    ),
    [colors, handleTypeSelect, selectedType, styles]
  );

  const handleSearch = async (overrideCnr = null) => {
    const cnrToSearch = typeof overrideCnr === "string" ? overrideCnr : cnr;

    if (searchMode === "case_no" && (!selectedType || !regNo || !year)) return;
    if ((searchMode === "cnr" || searchMode === "qr_scan") && !cnrToSearch) return;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(false);

    try {
      if (searchMode === "case_no") {
        const url = `https://ghcservices.assam.gov.in/cis-api/api/v1/cases/search/registration?case_type=${selectedType.value}&reg_no=${regNo}&reg_year=${year}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_TOKEN}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Search failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.status && data.data) {
          if (Array.isArray(data.data)) {
            setSearchResults(data.data.length > 0 ? data.data : []);
          } else if (data.data !== null && typeof data.data === "object" && Object.keys(data.data).length > 0) {
            setSearchResults([data.data]);
          } else {
            setSearchResults([]);
          }
        } else {
          setSearchResults([]);
        }
      } else {
        const url = `https://ghcservices.assam.gov.in/case-status/proxy/cases/${cnrToSearch}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data.status && data.data) {
          setSearchResults([data.data]);
        } else {
          setSearchResults([]);
        }
      }
    } catch (err) {
      setSearchError(t("case_status_screen.search_error"));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);

      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return localizeDigitsInText(dateString, i18n.language);

      const day = formatLocalizedNumber(String(date.getDate()).padStart(2, "0"), i18n.language);
      const month = monthNames[date.getMonth()];
      const displayYear = formatLocalizedNumber(date.getFullYear(), i18n.language);
      return `${day} ${month} ${displayYear}`;
    } catch {
      return localizeDigitsInText(dateString, i18n.language);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <LinearGradient colors={theme.gradients.header} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}>
            <Ionicons name="document-text" size={20} color={colors.accent} />
          </View>
          <Text style={styles.heroTitle}>{t("case_status_screen.title")}</Text>
        </View>
        <Text style={styles.heroSub}>{t("case_status_screen.subtitle")}</Text>
      </LinearGradient>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
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
          <View style={styles.searchModeContainer}>
            {searchModes.map((mode) => (
              <TouchableOpacity
                key={mode.key}
                style={[styles.modeTab, searchMode === mode.key && styles.modeTabActive]}
                onPress={() => {
                  setSearchMode(mode.key);
                  setHasSearched(false);
                  setSearchResults([]);
                  setScanned(false);

                  if (mode.key === "qr_scan" && (!permission || !permission.granted)) {
                    requestPermission();
                  }
                }}
              >
                <Text style={[styles.modeTabText, searchMode === mode.key && styles.modeTabTextActive]}>{mode.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {searchMode === "case_no" && (
            <>
              <Text style={styles.label}>{t("case_status_screen.case_category")}</Text>
              <View style={styles.pillContainer}>
                <TouchableOpacity
                  style={[styles.pill, category === "Civil" && styles.pillActive]}
                  onPress={() => handleCategorySwitch("Civil")}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, category === "Civil" && styles.pillTextActive]}>
                    {t("case_status_screen.civil")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pill, category === "Criminal" && styles.pillActive]}
                  onPress={() => handleCategorySwitch("Criminal")}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, category === "Criminal" && styles.pillTextActive]}>
                    {t("case_status_screen.criminal")}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>{t("case_status_screen.case_type")}</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setTypeModalVisible(true)}
                activeOpacity={0.8}
                disabled={caseTypesLoading}
              >
                <Text style={[styles.dropdownText, !selectedType && styles.placeholderText]}>
                  {caseTypesLoading
                    ? t("case_status_screen.loading_case_types")
                    : selectedType
                      ? selectedType.label
                      : t("case_status_screen.select_case_type")}
                </Text>
                {caseTypesLoading ? (
                  <ActivityIndicator size="small" color={colors.textSecondary} />
                ) : (
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>

              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.label}>{t("case_status_screen.registration_no")}</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="pricetag" size={16} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 1234"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      value={regNo}
                      onChangeText={setRegNo}
                    />
                  </View>
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.label}>{t("case_status_screen.year")}</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="calendar" size={16} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      maxLength={4}
                      value={year}
                      onChangeText={setYear}
                    />
                  </View>
                </View>
              </View>
            </>
          )}

          {searchMode === "cnr" && (
            <View style={styles.singleFieldSection}>
              <Text style={styles.label}>{t("case_status_screen.enter_cnr_number")}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="pricetag" size={16} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ASGH010000012023"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                  value={cnr}
                  onChangeText={setCnr}
                />
              </View>
            </View>
          )}

          {searchMode === "qr_scan" && (
            <View style={styles.qrSection}>
              {!permission ? (
                <View style={styles.cameraPlaceholder}>
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              ) : !permission.granted ? (
                <View style={styles.cameraPlaceholder}>
                  <Text style={styles.cameraText}>{t("case_status_screen.camera_permission")}</Text>
                  <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                    <Text style={styles.permissionBtnText}>{t("case_status_screen.grant_permission")}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cameraContainer}>
                  <CameraView
                    style={styles.cameraView}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                    onBarcodeScanned={(result) => {
                      if (scanned || !result.data) return;
                      setScanned(true);
                      setCnr(result.data);
                      handleSearch(result.data);
                    }}
                  />
                  <View style={styles.scannerOverlay} pointerEvents="none">
                    <View style={styles.scannerTarget} />
                  </View>
                  {scanned && (
                    <View style={styles.scannedActionWrap}>
                      <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
                        <Text style={styles.rescanBtnText}>{t("case_status_screen.tap_to_scan_again")}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {searchMode !== "qr_scan" && (
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => handleSearch()}
              disabled={
                isSearching ||
                (searchMode === "case_no" && (caseTypesLoading || !selectedType || !regNo || !year)) ||
                (searchMode === "cnr" && !cnr)
              }
              activeOpacity={0.8}
            >
              {isSearching || (searchMode === "case_no" && caseTypesLoading) ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <>
                  <Ionicons name="search" size={18} color={colors.textInverse} />
                  <Text style={styles.searchButtonText}>{t("case_status_screen.search_case")}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {hasSearched && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>{t("case_status_screen.search_results")}</Text>

            {searchError ? (
              <View style={styles.errorStateCard}>
                <View style={styles.errorStateIconBg}>
                  <Ionicons name="alert-circle" size={32} color={ERROR_RED} />
                </View>
                <Text style={styles.errorStateTitle}>{t("case_status_screen.search_failed")}</Text>
                <Text style={styles.errorStateSub}>{searchError}</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyStateCard}>
                <View style={styles.emptyStateIconBg}>
                  <Ionicons name="search" size={32} color={colors.textQuaternary} />
                </View>
                <Text style={styles.emptyStateTitle}>{t("case_status_screen.no_cases_found")}</Text>
                <Text style={styles.emptyStateSub}>{t("case_status_screen.no_cases_found_subtitle")}</Text>
              </View>
            ) : (
              searchResults.map((item, index) => {
                const caseTypeLabel = selectedType?.label || item.filing_case_type?.type_name || "";
                const itemRegNo = item.reg_no || regNo;
                const itemYear = item.reg_year || year;
                const caseNoStr = caseTypeLabel
                  ? `${caseTypeLabel} ${localizeDigitsInText(`${itemRegNo}/${itemYear}`, i18n.language)}`
                  : localizeDigitsInText(`${itemRegNo}/${itemYear}`, i18n.language);
                const isDisposed = item.archive === "Y";
                const statusStr = isDisposed ? t("case_common.disposed") : t("case_common.pending");
                const isDateNotGiven =
                  item.date_next_list?.startsWith("5000-01-01") || item.date_next_list?.startsWith("4999-12-31");

                const nextHearingDisplay = isDateNotGiven
                  ? t("case_common.date_not_given")
                  : formatDate(item.date_next_list);

                const shouldHideParties =
                  item.hide_partyname === "Y" || item.hide_pet_name === "Y" || item.hide_res_name === "Y";
                const getPartyName = (name) => (shouldHideParties && name ? "XXXX" : name);

                return (
                  <View key={item.cino || index} style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultCaseNo}>{caseNoStr}</Text>
                      <View style={[styles.statusBadge, isDisposed && styles.statusBadgeDisposed]}>
                        <Text style={[styles.statusText, isDisposed && styles.statusTextDisposed]}>{statusStr}</Text>
                      </View>
                    </View>
                    <View style={styles.resultBody}>
                      <Text style={styles.partyText}>
                        <Text style={styles.bold}>{t("case_common.petitioner")}:</Text> {getPartyName(item.pet_name)}
                      </Text>
                      <Text style={styles.partyText}>
                        <Text style={styles.bold}>{t("case_common.respondent")}:</Text> {getPartyName(item.res_name)}
                      </Text>
                      {!isDisposed && (
                        <Text style={styles.partyText}>
                          <Text style={styles.bold}>{t("case_common.next_hearing")}:</Text> {nextHearingDisplay}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity style={styles.viewButton} onPress={() => onViewDetails(item)}>
                      <Text style={styles.viewButtonText}>{t("case_common.view_details")}</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.accent} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}
      </Animated.ScrollView>

      <Modal
        visible={typeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setTypeModalVisible(false);
          setTypeSearchQuery("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {t("case_status_screen.select_case_type_title", {
                    category: t(`case_status_screen.${category.toLowerCase()}`),
                  })}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {t("case_status_screen.types_available", {
                    count: formatLocalizedNumber(filteredTypes.length, i18n.language),
                  })}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setTypeModalVisible(false);
                  setTypeSearchQuery("");
                }}
              >
                <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder={t("case_status_screen.search_case_type")}
                placeholderTextColor={colors.textSecondary}
                value={typeSearchQuery}
                onChangeText={setTypeSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {typeSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setTypeSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              ref={flatListRef}
              data={filteredTypes}
              style={styles.modalList}
              keyExtractor={(item) => item.value}
              renderItem={renderTypeItem}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === "android"}
              keyboardShouldPersistTaps="handled"
              initialScrollIndex={selectedTypeIndex}
              onScrollToIndexFailed={(info) => {
                setTimeout(() => {
                  if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({ index: info.index, animated: false });
                  }
                }, 100);
              }}
              ListEmptyComponent={
                <View style={styles.modalEmptyState}>
                  <Ionicons name="search" size={40} color={colors.textSecondary} />
                  <Text style={styles.modalEmptyText}>{t("case_status_screen.no_matching_case_types")}</Text>
                </View>
              }
              getItemLayout={(_, index) => ({ length: 53, offset: 53 * index, index })}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme, colors, radius, spacing, fonts) => {
  const accentTint = hexToRgba(colors.accent, 0.25);
  const accentSoft = hexToRgba(colors.accent, 0.14);
  const accentBorder = hexToRgba(colors.accent, 0.3);
  const dangerTint = hexToRgba(ERROR_RED, theme.isDark ? 0.16 : 0.1);
  const dangerBorder = hexToRgba(ERROR_RED, theme.isDark ? 0.28 : 0.2);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary,
    },
    hero: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
    },
    heroRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    heroIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.cardAlt,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    heroTitle: {
      color: colors.textPrimary,
      fontFamily: fonts.heading,
      fontSize: 18,
    },
    heroSub: {
      color: colors.textMuted,
      marginTop: 6,
      fontFamily: fonts.body,
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
      flexGrow: 1,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      padding: spacing.lg,
      overflow: "hidden",
    },
    label: {
      fontSize: 13,
      fontFamily: fonts.bodySemiBold,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    searchModeContainer: {
      flexDirection: "row",
      marginBottom: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modeTab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    modeTabActive: {
      borderBottomColor: colors.accent,
    },
    modeTabText: {
      fontSize: 14,
      fontFamily: fonts.body,
      color: colors.textSecondary,
    },
    modeTabTextActive: {
      color: colors.accent,
      fontFamily: fonts.bodySemiBold,
    },
    pillContainer: {
      flexDirection: "row",
      backgroundColor: colors.cardAlt,
      borderRadius: radius.pill,
      padding: 4,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    pill: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: radius.pill,
    },
    pillActive: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    pillText: {
      fontSize: 14,
      fontFamily: fonts.body,
      color: colors.textSecondary,
    },
    pillTextActive: {
      color: colors.accent,
      fontFamily: fonts.bodySemiBold,
    },
    dropdownButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.cardAlt,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: 14,
      marginBottom: spacing.lg,
    },
    dropdownText: {
      flex: 1,
      marginRight: spacing.md,
      fontSize: 15,
      color: colors.textPrimary,
      fontFamily: fonts.body,
    },
    placeholderText: {
      color: colors.textQuaternary,
    },
    row: {
      flexDirection: "row",
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    flex1: {
      flex: 1,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardAlt,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
    },
    inputIcon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      height: 48,
      fontSize: 15,
      color: colors.textPrimary,
      fontFamily: fonts.body,
    },
    singleFieldSection: {
      marginBottom: spacing.xl,
    },
    qrSection: {
      marginBottom: spacing.xl,
      alignItems: "center",
    },
    cameraPlaceholder: {
      height: 300,
      width: "100%",
      backgroundColor: colors.cardAlt,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    cameraText: {
      textAlign: "center",
      color: colors.textSecondary,
      marginBottom: spacing.md,
      fontFamily: fonts.body,
    },
    permissionBtn: {
      backgroundColor: colors.accent,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: radius.md,
    },
    permissionBtnText: {
      color: colors.textInverse,
      fontFamily: fonts.bodySemiBold,
    },
    cameraContainer: {
      height: 300,
      width: "100%",
      borderRadius: radius.lg,
      overflow: "hidden",
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    cameraView: {
      flex: 1,
    },
    scannerOverlay: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    scannerTarget: {
      width: 200,
      height: 200,
      borderWidth: 2,
      borderColor: colors.accent,
      backgroundColor: "transparent",
      borderRadius: radius.md,
    },
    scannedActionWrap: {
      position: "absolute",
      right: 0,
      bottom: 20,
      left: 0,
      alignItems: "center",
      zIndex: 20,
    },
    rescanBtn: {
      backgroundColor: colors.overlay,
      paddingHorizontal: spacing.xl,
      paddingVertical: 12,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rescanBtnText: {
      color: colors.textPrimary,
      fontFamily: fonts.bodySemiBold,
    },
    searchButton: {
      backgroundColor: colors.accent,
      borderRadius: radius.md,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    searchButtonText: {
      color: colors.textInverse,
      fontSize: 16,
      fontFamily: fonts.bodyBold,
    },
    resultsContainer: {
      marginTop: spacing.sm,
    },
    resultsHeader: {
      fontSize: 18,
      fontFamily: fonts.heading,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    resultCard: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      overflow: "hidden",
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
      gap: spacing.md,
    },
    resultCaseNo: {
      flex: 1,
      fontSize: 16,
      fontFamily: fonts.bodyBold,
      color: colors.textPrimary,
    },
    statusBadge: {
      backgroundColor: accentTint,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: accentBorder,
    },
    statusBadgeDisposed: {
      backgroundColor: accentTint,
    },
    statusText: {
      fontSize: 12,
      fontFamily: fonts.bodySemiBold,
      color: colors.accent,
    },
    statusTextDisposed: {
      color: colors.accent,
    },
    resultBody: {
      padding: spacing.md,
      gap: 6,
    },
    partyText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: fonts.body,
    },
    bold: {
      fontFamily: fonts.bodySemiBold,
      color: colors.textPrimary,
    },
    viewButton: {
      backgroundColor: colors.cardSubtle,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.borderSoft,
    },
    viewButtonText: {
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: fonts.bodySemiBold,
    },
    emptyStateCard: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      padding: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    emptyStateIconBg: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.cardAlt,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    emptyStateTitle: {
      fontSize: 18,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
      fontFamily: fonts.bodyBold,
    },
    emptyStateSub: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      paddingHorizontal: spacing.lg,
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
      marginTop: spacing.sm,
    },
    errorStateIconBg: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.cardAlt,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    errorStateTitle: {
      fontSize: 18,
      color: ERROR_RED,
      marginBottom: spacing.sm,
      fontFamily: fonts.bodyBold,
    },
    errorStateSub: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      fontFamily: fonts.body,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.primary,
      overflow: "hidden",
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      height: "85%",
      borderWidth: 1,
      borderColor: accentBorder,
      borderBottomWidth: 0,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: fonts.heading,
      color: colors.textPrimary,
    },
    modalSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
      fontFamily: fonts.body,
    },
    modalSearchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardAlt,
      margin: spacing.lg,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      height: 48,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    modalSearchIcon: {
      marginRight: spacing.sm,
    },
    modalSearchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
      fontFamily: fonts.body,
    },
    modalList: {
      flex: 1,
    },
    modalEmptyState: {
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    modalEmptyText: {
      marginTop: 12,
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
      fontFamily: fonts.body,
    },
    modalItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
    },
    modalItemActive: {
      backgroundColor: accentSoft,
    },
    modalItemText: {
      flex: 1,
      marginRight: spacing.md,
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: fonts.body,
    },
    modalItemTextActive: {
      color: colors.accent,
      fontFamily: fonts.bodySemiBold,
    },
  });
};

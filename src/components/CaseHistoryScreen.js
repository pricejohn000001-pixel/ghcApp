import React, { useState, useRef, useEffect } from "react";
import { Animated, StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, radius, spacing } from "../theme";

const CaseTypeItem = React.memo(({ item, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[styles.modalItem, isSelected && styles.modalItemActive]}
    onPress={() => onSelect(item)}
  >
    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
      {item.label}
    </Text>
    {isSelected && (
      <Feather name="check" size={20} color={colors.accent} />
    )}
  </TouchableOpacity>
));

export const CaseHistoryScreen = ({ scrollY, onViewDetails }) => {
  const [category, setCategory] = useState("Civil");
  const [selectedType, setSelectedType] = useState(null);
  const [regNo, setRegNo] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  const [searchMode, setSearchMode] = useState("Case No"); // "Case No", "CNR", "QR Scan"
  const [cnr, setCnr] = useState("");
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const scrollViewRef = useRef(null);
  const flatListRef = useRef(null);
  
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [caseTypes, setCaseTypes] = useState({ Civil: [], Criminal: [] });
  const [caseTypesLoading, setCaseTypesLoading] = useState(true);
  
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);

  const availableTypes = category === "Civil" ? caseTypes.Civil : caseTypes.Criminal;

  useEffect(() => {
    const fetchCaseTypes = async () => {
      try {
        setCaseTypesLoading(true);
        const res = await fetch('http://10.177.247.79/case-data/index.php?type=getCaseType');
        if (res.ok) {
          const data = await res.json();
          if (data.status && data.data) {
            const mapped = { Civil: [], Criminal: [] };
            data.data.forEach(cat => {
              if (cat.category === 'Civil' || cat.category === 'Criminal') {
                mapped[cat.category] = cat.types.map(t => ({
                  label: t.type_name,
                  value: String(t.case_type)
                }));
              }
            });
            setCaseTypes(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to fetch case types:', err);
      } finally {
        setCaseTypesLoading(false);
      }
    };
    fetchCaseTypes();
  }, []);

  const filteredTypes = React.useMemo(() => {
    if (!typeSearchQuery) return availableTypes;
    return availableTypes.filter(type => 
      type.label.toLowerCase().includes(typeSearchQuery.toLowerCase()) ||
      type.value.toLowerCase().includes(typeSearchQuery.toLowerCase())
    );
  }, [availableTypes, typeSearchQuery]);

  const handleCategorySwitch = (cat) => {
    setCategory(cat);
    setSelectedType(null);
    setTypeSearchQuery("");
  };

  const handleTypeSelect = React.useCallback((item) => {
    setSelectedType(item);
    setTypeModalVisible(false);
    setTypeSearchQuery("");
  }, []);

  const renderTypeItem = React.useCallback(({ item }) => (
    <CaseTypeItem 
      item={item} 
      isSelected={selectedType?.value === item.value} 
      onSelect={handleTypeSelect} 
    />
  ), [selectedType, handleTypeSelect]);

  const handleSearch = async (overrideCnr = null) => {
    const cnrToSearch = typeof overrideCnr === 'string' ? overrideCnr : cnr;

    if (searchMode === "Case No" && (!selectedType || !regNo || !year)) return;
    if ((searchMode === "CNR" || searchMode === "QR Scan") && !cnrToSearch) return;
    
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(false);
    
    try {
      if (searchMode === "Case No") {
        const url = `http://10.177.215.163/case-data/?caseType=${selectedType.value}&reg_no=${regNo}&reg_year=${year}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        if (data.status && data.data) {
          if (Array.isArray(data.data)) {
            setSearchResults(data.data.length > 0 ? data.data : []);
          } else if (data.data !== null && typeof data.data === 'object' && Object.keys(data.data).length > 0) {
            setSearchResults([data.data]);
          } else {
            setSearchResults([]);
          }
        } else {
          setSearchResults([]);
        }
      } else {
        // CNR or QR Scan Search
        const url = `http://10.177.247.79/case-data/index.php?cino=${cnrToSearch}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        if (data.status && data.data) {
          setSearchResults([data.data]);
        } else {
          setSearchResults([]);
        }
      }
    } catch (err) {
      setSearchError('Failed to fetch case. Please check your inputs or ensure you are connected to the court network.');
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
    <LinearGradient colors={["#000000", "#000000"]} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}>
            <AntDesign name="filetext1" size={20} color={colors.accent} />
          </View>
          <Text style={styles.heroTitle}>Case Status Search</Text>
        </View>
        <Text style={styles.heroSub}>Find case details, status, and history</Text>
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
            ? Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )
            : undefined
        }
        scrollEventThrottle={16}
      >
        <View style={styles.card}>
          {/* Search Mode Tabs */}
          <View style={styles.searchModeContainer}>
            {["Case No", "CNR", "QR Scan"].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.modeTab, searchMode === mode && styles.modeTabActive]}
                onPress={() => {
                  setSearchMode(mode);
                  setHasSearched(false);
                  setSearchResults([]);
                  setScanned(false);
                  if (mode === "QR Scan" && (!permission || !permission.granted)) {
                    requestPermission();
                  }
                }}
              >
                <Text style={[styles.modeTabText, searchMode === mode && styles.modeTabTextActive]}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {searchMode === "Case No" && (
            <>
              {/* Category Selector */}
              <Text style={styles.label}>Case Category</Text>
              <View style={styles.pillContainer}>
            <TouchableOpacity
              style={[styles.pill, category === "Civil" && styles.pillActive]}
              onPress={() => handleCategorySwitch("Civil")}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, category === "Civil" && styles.pillTextActive]}>Civil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pill, category === "Criminal" && styles.pillActive]}
              onPress={() => handleCategorySwitch("Criminal")}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, category === "Criminal" && styles.pillTextActive]}>Criminal</Text>
            </TouchableOpacity>
          </View>

          {/* Case Type Selector */}
          <Text style={styles.label}>Case Type</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setTypeModalVisible(true)}
            activeOpacity={0.8}
            disabled={caseTypesLoading}
          >
            <Text style={[styles.dropdownText, !selectedType && styles.placeholderText]}>
              {caseTypesLoading ? "Loading case types..." : (selectedType ? selectedType.label : "Select Case Type")}
            </Text>
            {caseTypesLoading ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <Feather name="chevron-down" size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          {/* Reg No and Year Row */}
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Registration No.</Text>
              <View style={styles.inputContainer}>
                <Feather name="hash" size={16} color={colors.textSecondary} style={styles.inputIcon} />
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
              <Text style={styles.label}>Year</Text>
              <View style={styles.inputContainer}>
                <Feather name="calendar" size={16} color={colors.textSecondary} style={styles.inputIcon} />
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

      {searchMode === "CNR" && (
            <View style={{ marginBottom: spacing.xl }}>
              <Text style={styles.label}>Enter CNR Number</Text>
              <View style={styles.inputContainer}>
                <Feather name="hash" size={16} color={colors.textSecondary} style={styles.inputIcon} />
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

          {searchMode === "QR Scan" && (
            <View style={{ marginBottom: spacing.xl, alignItems: "center" }}>
              {!permission ? (
                <View style={styles.cameraPlaceholder}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : !permission.granted ? (
                <View style={styles.cameraPlaceholder}>
                  <Text style={styles.cameraText}>We need your permission to show the camera</Text>
                  <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                    <Text style={styles.permissionBtnText}>Grant Permission</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cameraContainer}>
                  <CameraView
                    style={styles.camera}
                    facing="back"
                    barcodeScannerSettings={{
                      barcodeTypes: ["qr"],
                    }}
                    onBarcodeScanned={scanned ? undefined : ({ data }) => {
                      setScanned(true);
                      setCnr(data); // Assume QR contains just the CNR
                      handleSearch(data);
                    }}
                  />
                  <View style={styles.scannerOverlay}>
                    <View style={styles.scannerTarget} />
                  </View>
                  {scanned && (
                    <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
                      <Text style={styles.rescanBtnText}>Tap to Scan Again</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Search Button */}
          {searchMode !== "QR Scan" && (
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => handleSearch()}
              disabled={
                isSearching || 
                (searchMode === "Case No" && (caseTypesLoading || !selectedType || !regNo || !year)) ||
                (searchMode === "CNR" && !cnr)
              }
              activeOpacity={0.8}
            >
              {isSearching || (searchMode === "Case No" && caseTypesLoading) ? (
                <ActivityIndicator color={colors.accent} size="small" />
              ) : (
                <>
                  <Feather name="search" size={18} color="#FFFFFF" />
                  <Text style={styles.searchButtonText}>Search Case</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results Area */}
        {hasSearched && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>Search Results</Text>
            
            {searchError ? (
              <View style={styles.errorStateCard}>
                 <View style={styles.errorStateIconBg}>
                   <Feather name="alert-circle" size={32} color="#EF4444" />
                 </View>
                 <Text style={styles.errorStateTitle}>Search Failed</Text>
                 <Text style={styles.errorStateSub}>{searchError}</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.emptyStateCard}>
                 <View style={styles.emptyStateIconBg}>
                   <Feather name="search" size={32} color="#777777" />
                 </View>
                 <Text style={styles.emptyStateTitle}>No Cases Found</Text>
                 <Text style={styles.emptyStateSub}>We couldn't find any cases matching your search criteria. Please check the registration number and year.</Text>
              </View>
            ) : searchResults.map((item, index) => {
              const caseTypeLabel = selectedType?.label || item.filing_case_type?.type_name || '';
              const itemRegNo = item.reg_no || regNo;
              const itemYear = item.reg_year || year;
              const caseNoStr = caseTypeLabel ? `${caseTypeLabel} ${itemRegNo}/${itemYear}` : `${itemRegNo}/${itemYear}`;
              const isDisposed = item.archive === 'Y';
              const statusStr = isDisposed ? 'Disposed' : 'Pending';
              const isDateNotGiven = item.date_next_list?.startsWith('5000-01-01');
              const formatDate = (dateString) => {
                if (!dateString) return "-";
                try {
                  const d = new Date(dateString);
                  if (isNaN(d.getTime())) return dateString;
                  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                } catch {
                  return dateString;
                }
              };
              const nextHearingDisplay = isDateNotGiven ? 'Date not given. Refer the last order for details' : formatDate(item.date_next_list);

              return (
                <View key={item.cino || index} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultCaseNo}>{caseNoStr}</Text>
                    <View style={[styles.statusBadge, isDisposed && styles.statusBadgeDisposed]}>
                      <Text style={[styles.statusText, isDisposed && styles.statusTextDisposed]}>{statusStr}</Text>
                    </View>
                  </View>
                  <View style={styles.resultBody}>
                    <Text style={styles.partyText}><Text style={styles.bold}>Petitioner:</Text> {item.pet_name}</Text>
                    <Text style={styles.partyText}><Text style={styles.bold}>Respondent:</Text> {item.res_name}</Text>
                    {!isDisposed && (
                      <Text style={styles.partyText}><Text style={styles.bold}>Next Hearing:</Text> {nextHearingDisplay}</Text>
                    )}
                  </View>
                  <TouchableOpacity style={styles.viewButton} onPress={() => onViewDetails(item)}>
                    <Text style={styles.viewButtonText}>View Details</Text>
                    <Feather name="arrow-right" size={16} color={colors.accent} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </Animated.ScrollView>

      {/* Case Type Modal */}
      <Modal 
        visible={typeModalVisible} 
        animationType="slide" 
        transparent={true}
        onRequestClose={() => {
          setTypeModalVisible(false);
          setTypeSearchQuery("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select {category} Case Type</Text>
                <Text style={styles.modalSubtitle}>{filteredTypes.length} types available</Text>
              </View>
              <TouchableOpacity onPress={() => {
                setTypeModalVisible(false);
                setTypeSearchQuery("");
              }}>
                <AntDesign name="closecircle" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <Feather name="search" size={18} color={colors.textSecondary} style={styles.modalSearchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search case type"
                placeholderTextColor={colors.textSecondary}
                value={typeSearchQuery}
                onChangeText={setTypeSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {typeSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setTypeSearchQuery("")}>
                  <Feather name="x-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              ref={flatListRef}
              data={filteredTypes}
              style={{ flex: 1 }}
              keyExtractor={(item) => item.value}
              renderItem={renderTypeItem}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === 'android'}
              keyboardShouldPersistTaps="handled"
              initialScrollIndex={selectedType && !typeSearchQuery ? availableTypes.findIndex(t => t.value === selectedType.value) : 0}
              onScrollToIndexFailed={(info) => {
                // Fallback for when scroll index fails
                setTimeout(() => {
                  if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({ index: info.index, animated: false });
                  }
                }, 100);
              }}
              ListEmptyComponent={
                <View style={styles.modalEmptyState}>
                  <Feather name="search" size={40} color={colors.textSecondary} />
                  <Text style={styles.modalEmptyText}>No matching case types found</Text>
                </View>
              }
              getItemLayout={(data, index) => (
                {length: 53, offset: 53 * index, index} // Estimate of item height + border
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  hero: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  heroRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  heroIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#222222", alignItems: "center", justifyContent: "center" },
  heroTitle: { color: "#FFFFFF", fontFamily: 'Georgia', fontSize: 18 },
  heroSub: { color: "#ADB9D8", marginTop: 6, fontFamily: 'Inter_400Regular' },
  scroll: { flex: 1 },
  content: { backgroundColor: "#000000", borderWidth: 1, borderColor: colors.accent || "#D4AF37", borderBottomWidth: 0, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  card: { backgroundColor: "#111111", borderRadius: radius.xl, borderWidth: 1, borderColor: "#222222", borderWidth: 1, borderColor: "#222222", padding: spacing.lg, elevation: 0, overflow: "hidden" },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.textPrimary, marginBottom: 8 },
  pillContainer: { flexDirection: "row", backgroundColor: "#222222", borderRadius: radius.pill, padding: 4, marginBottom: spacing.lg },
  pill: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: radius.pill },
  pillActive: { backgroundColor: "#111111", borderWidth: 1, borderColor: colors.accent, elevation: 0, overflow: "hidden" },
  pillText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: "#AAAAAA" },
  pillTextActive: { color: colors.accent, fontFamily: 'Inter_600SemiBold' },

  searchModeContainer: { flexDirection: "row", marginBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: "#333333" },
  modeTab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  modeTabActive: { borderBottomColor: colors.accent },
  modeTabText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: "#AAAAAA" },
  modeTabTextActive: { color: colors.accent, fontFamily: 'Inter_600SemiBold' },

  cameraPlaceholder: { height: 300, width: "100%", backgroundColor: "#222222", borderRadius: radius.lg, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  cameraText: { textAlign: "center", color: "#CCCCCC", marginBottom: spacing.md },
  permissionBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.md },
  permissionBtnText: { color: "#FFFFFF", fontWeight: "600" },
  cameraContainer: { height: 300, width: "100%", borderRadius: radius.lg, overflow: "hidden", backgroundColor: "#FFFFFF" },
  camera: { flex: 1 },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  scannerTarget: { width: 200, height: 200, borderWidth: 2, borderColor: "#D4AF37", backgroundColor: "transparent" },
  rescanBtn: { position: "absolute", bottom: 20, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.pill },
  rescanBtnText: { color: "#FFFFFF", fontWeight: "600" },
  dropdownButton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#222222", borderWidth: 1, borderColor: "#333333", borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, marginBottom: spacing.lg },
  dropdownText: { fontSize: 15, color: colors.textPrimary },
  placeholderText: { color: "#777777" },
  row: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.xl },
  flex1: { flex: 1 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#222222", borderWidth: 1, borderColor: "#333333", borderRadius: radius.md, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 15, color: colors.textPrimary },
  searchButton: { backgroundColor: colors.accent, borderRadius: radius.md, height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  searchButtonText: { color: "#FFFFFF", fontSize: 16, fontFamily: 'Inter_700Bold' },
  
  // Results UI
  resultsContainer: { marginTop: spacing.sm },
  resultsHeader: { fontSize: 18, fontFamily: 'Georgia', color: colors.textPrimary, marginBottom: spacing.md },
  resultCard: { backgroundColor: "#111111", borderRadius: radius.lg, overflow: "hidden", marginBottom: spacing.md, elevation: 0, borderWidth: 1, borderColor: colors.accent },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.md, borderBottomWidth: 1, borderBottomColor: "#222222" },
  resultCaseNo: { fontSize: 16, fontFamily: 'Inter_700Bold', color: colors.textPrimary },
  statusBadge: { backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  statusBadgeDisposed: { backgroundColor: "#0A0A0A" },
  statusText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: "#B8860B" },
  statusTextDisposed: { color: "#B8860B" },
  resultBody: { padding: spacing.md, gap: 6 },
  partyText: { fontSize: 14, color: "#CCCCCC", fontFamily: 'Inter_400Regular' },
  bold: { fontFamily: 'Inter_600SemiBold', color: colors.textPrimary },
  viewButton: { backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  viewButtonText: { color: "#FFFFFF", fontSize: 15, fontFamily: 'Inter_600SemiBold' },

  emptyStateCard: { backgroundColor: "#111111", borderRadius: radius.xl, padding: spacing.xl, alignItems: "center", justifyContent: "center", elevation: 0, marginTop: spacing.sm, borderWidth: 1, borderColor: "#222222" },
  emptyStateIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#222222", alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  emptyStateTitle: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  emptyStateSub: { fontSize: 14, color: "#AAAAAA", textAlign: "center", lineHeight: 20, paddingHorizontal: spacing.lg },
  errorStateCard: { backgroundColor: "#222222", borderRadius: radius.xl, padding: spacing.xl, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#552222", marginTop: spacing.sm },
  errorStateIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#222222", alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  errorStateTitle: { fontSize: 18, fontWeight: "700", color: "#FF6666", marginBottom: 8 },
  errorStateSub: { fontSize: 14, color: "#FF8888", textAlign: "center", lineHeight: 20 },

  // Modal UI
  modalOverlay: { flex: 1, backgroundColor: "transparent", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#000000", overflow: "hidden", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, height: "85%", borderWidth: 1, borderColor: "rgba(212,175,55,0.25)", borderBottomWidth: 0 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: "#222222" },
  modalTitle: { fontSize: 18, fontFamily: 'Georgia', color: colors.textPrimary },
  modalSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontFamily: 'Inter_400Regular' },
  modalSearchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#222222", margin: spacing.lg, paddingHorizontal: 12, borderRadius: radius.md, height: 48 },
  modalSearchIcon: { marginRight: 8 },
  modalSearchInput: { flex: 1, fontSize: 15, color: colors.textPrimary, fontFamily: 'Inter_400Regular' },
  modalEmptyState: { padding: 40, alignItems: "center", justifyContent: "center" },
  modalEmptyText: { marginTop: 12, color: colors.textSecondary, fontSize: 14, textAlign: "center", fontFamily: 'Inter_400Regular' },
  modalItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: "#222222" },
  modalItemActive: { backgroundColor: "#111111" },
  modalItemText: { fontSize: 16, color: "#CCCCCC", fontFamily: 'Inter_400Regular' },
  modalItemTextActive: { color: colors.accent, fontFamily: 'Inter_600SemiBold' },
});

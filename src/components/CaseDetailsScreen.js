import React, { useState, useEffect } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

export const CaseDetailsScreen = ({ caseItem, scrollY }) => {
  // Start with caseItem (from local API search) as baseline data
  const [data, setData] = useState(caseItem);
  const [subMatters, setSubMatters] = useState([]);
  const [linkedCases, setLinkedCases] = useState([]);
  
  // Orders State with Pagination
  const [orders, setOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [loadingMoreOrders, setLoadingMoreOrders] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cinoToFetch = caseItem?.cino;

  useEffect(() => {
    if (!cinoToFetch) {
      setError("No case selected. Please search for a case first.");
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const [mainRes, subRes, linkRes, ordersRes] = await Promise.allSettled([
          fetch(`https://ghcservices.assam.gov.in/case-status/proxy/cases/${cinoToFetch}`),
          fetch(`https://ghcservices.assam.gov.in/case-status/case-sub/${cinoToFetch}`),
          fetch(`https://ghcservices.assam.gov.in/case-status/case.link/${cinoToFetch}`),
          fetch(`https://ghcservices.assam.gov.in/case-status/case-orders/${cinoToFetch}?page=1&per_page=15`)
        ]);

        if (mainRes.status === 'fulfilled' && mainRes.value.ok) {
          const mainData = await mainRes.value.json();
          if (mainData.status && mainData.data) {
            setData(prev => ({ ...prev, ...(mainData.data || {}) }));
          }
        }

        if (subRes.status === 'fulfilled' && subRes.value.ok) {
          const subData = await subRes.value.json();
          if (subData.status && subData.data) setSubMatters(subData.data);
        }

        if (linkRes.status === 'fulfilled' && linkRes.value.ok) {
          const linkData = await linkRes.value.json();
          if (linkData.status && linkData.data) setLinkedCases(linkData.data);
        }

        if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
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
  }, [cinoToFetch]);

  const loadMoreOrders = async () => {
    if (ordersPage >= ordersTotalPages || loadingMoreOrders) return;
    setLoadingMoreOrders(true);
    try {
      const nextPage = ordersPage + 1;
      const res = await fetch(`https://ghcservices.assam.gov.in/case-status/case-orders/${cinoToFetch}?page=${nextPage}&per_page=15`);
      if (res.ok) {
        const json = await res.json();
        if (json.status && json.data?.data) {
          setOrders(prev => [...prev, ...json.data.data]);
          setOrdersPage(json.data.current_page);
          setOrdersTotalPages(json.data.last_page);
        }
      }
    } catch (err) {
      console.log('Failed to load more orders:', err);
    } finally {
      setLoadingMoreOrders(false);
    }
  };

  const getStatusStyles = (status) => {
    const s = status?.toUpperCase();
    if (s === 'PENDING' || s === 'DISPOSED') {
      return {
        bg: 'rgba(212, 175, 55, 0.25)',
        text: '#D4AF37'
      };
    }
    return {
      bg: 'rgba(255, 255, 255, 0.15)',
      text: '#FFFFFF'
    };
  };

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

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  const getCaseAge = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 365) return `${Math.floor(diffDays/365)} yrs, ${diffDays%365} days`;
    return `${diffDays} days`;
  };

  const getCaseTypeName = (id) => {
    // Case types are fetched dynamically by CaseHistoryScreen; fallback gracefully
    return '';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ marginTop: 16, color: colors.textPrimary, fontWeight: '600' }}>Fetching Complete Case Profile...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: spacing.xl }]}>
        <View style={styles.errorStateCard}>
          <View style={styles.errorStateIconBg}>
            <Ionicons name="alert-circle" size={40} color="#EF4444" />
          </View>
          <Text style={styles.errorStateTitle}>Data Unavailable</Text>
          <Text style={styles.errorStateSub}>{error || 'We could not find the complete profile for this case. It might not be available or there might be an issue with the connection.'}</Text>
        </View>
      </View>
    );
  }

  const shouldHideParties = data.hide_partyname === 'Y' || data.hide_pet_name === 'Y' || data.hide_res_name === 'Y';
  const getPartyName = (name, item) => {
    const isHidden = shouldHideParties || (item && (item.hide_partyname === 'Y' || item.hide_pet_name === 'Y' || item.hide_res_name === 'Y'));
    return isHidden && name ? 'XXXX' : name;
  };

  // Safe mapping with rich field fallbacks
  const caseTypeName = data.filing_case_type?.type_name || getCaseTypeName(data.filcase_type);
  const regTypeName = data.registered_case_type?.type_name || getCaseTypeName(data.regcase_type);
  
  const caseNo = `${caseTypeName} ${data.fil_no || ''}/${data.fil_year || ''}`;
  const regNo = `${regTypeName} ${data.reg_no || ''}/${data.reg_year || ''}`;

  const renderDetailRow = (label, value, isHighlight = false) => {
    const statusStyles = label === "CURRENT STATUS" ? getStatusStyles(value) : null;
    return (
      <View style={styles.detailRow}>
        <Text style={[styles.detailLabel, isHighlight && { color: "#D4AF37" }]}>{label}</Text>
        <View style={styles.detailValueContainer}>
          {isHighlight && <View style={styles.upcomingBadge}><Text style={styles.upcomingBadgeText}>Upcoming</Text></View>}
          {label === "CURRENT STATUS" ? (
            <View style={[styles.statusPill, { alignSelf: 'center', backgroundColor: statusStyles.bg }]}>
              <Text style={[styles.statusPillText, { color: statusStyles.text }]}>{value}</Text>
            </View>
          ) : (
            <Text style={[styles.detailValue, isHighlight && { color: "#D4AF37" }]} textAlign="right">{value || '-'}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderAdvocates = (adv_name, adv_reg, extraAdvs = []) => {
    const advs = [];
    if (adv_name) {
      advs.push(`${adv_name} ${adv_reg ? `(${adv_reg})` : ''}`.trim());
    }
    extraAdvs?.forEach(extra => {
      advs.push(`${extra.adv_name} ${extra.adv_reg ? `(${extra.adv_reg})` : ''}`.trim());
    });

    if (advs.length === 0) return null;

    return (
      <View style={styles.advocateRow}>
        <View style={styles.advBadge}><Text style={styles.advBadgeText}>ADV</Text></View>
        <Text style={styles.advName}>{advs.join(', ')}</Text>
      </View>
    );
  };

  // Build Petitioners Array
  const allPetitioners = [];
  if (data.pet_name) {
    allPetitioners.push({
      party_no: 1,
      name: getPartyName(data.pet_name),
      age: data.pet_age,
      address: null,
      adv_name: data.petitioner_advocate?.adv_name || data.pet_adv,
      adv_reg: data.petitioner_advocate?.adv_reg || data.pet_adv_cd,
      extra_advs: data.petitioner_advocate?.extra_advocates || []
    });

    if (data.petitioners && data.petitioners.length > 0) {
      data.petitioners.forEach((p, idx) => {
        allPetitioners.push({
          party_no: idx + 2,
          name: getPartyName(p.pet_name || p.name),
          age: p.pet_age || p.age,
          address: p.address,
          adv_name: null,
          adv_reg: null,
          extra_advs: []
        });
      });
    }
  }

  // Build Respondents Array
  const allRespondents = [];
  if (data.res_name) {
    allRespondents.push({
      party_no: 1,
      name: getPartyName(data.res_name),
      age: data.res_age,
      address: null,
      adv_name: data.respondent_advocate?.adv_name || data.res_adv,
      adv_reg: data.respondent_advocate?.adv_reg || data.res_adv_cd,
      extra_advs: data.respondent_advocate?.extra_advocates || []
    });

    if (data.respondents && data.respondents.length > 0) {
      data.respondents.forEach((r, idx) => {
        allRespondents.push({
          party_no: idx + 2,
          name: getPartyName(r.res_name || r.name),
          age: r.res_age || r.age,
          address: r.address,
          adv_name: null,
          adv_reg: null,
          extra_advs: []
        });
      });
    }
  }

  // Derived Fields mapped exactly to user request
  const listedFor = data.next_purpose?.purpose_name || data.purpose_next || '-';
  const daysSinceListed = data.days_since_last_listed ? `${Math.floor(data.days_since_last_listed)} days` : getCaseAge(data.date_last_list);
  const currentStatus = data.case_state ? data.case_state.toUpperCase() : (data.last_status === 'D' ? 'DISPOSED' : 'PENDING');
  const listedBefore = data.bench ? `${data.bench.bench_type_name} (${data.bench.bench_abbreviation})` : (data.benchtype || '-');
  const caseAgeFormatted = data.age_of_case_formatted || getCaseAge(data.date_of_filing);
  const isDisposed = currentStatus === 'DISPOSED';
  const isDateNotGiven = data.date_next_list?.startsWith('5000-01-01') || data.date_next_list?.startsWith('4999-12-31');
  const nextHearingDisplay = isDateNotGiven ? 'Date not given. Refer the last order for details' : formatDate(data.date_next_list);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#000000", "#000000"]} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}>
            <Ionicons name="hammer" size={20} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{regTypeName} / {data.reg_no || '-'} / {data.reg_year || '-'}</Text>
            <Text style={styles.heroSub}>CINO: {data.cino || '-'}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <View style={styles.heroPill}><Text style={styles.heroPillText}>{caseTypeName}</Text></View>
              <View style={[styles.heroPill, { backgroundColor: (currentStatus === 'PENDING' || currentStatus === 'DISPOSED') ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.15)' }]}>
                <Text style={[styles.heroPillText, { color: (currentStatus === 'PENDING' || currentStatus === 'DISPOSED') ? '#D4AF37' : '#FFFFFF' }]}>{currentStatus}</Text>
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
            ? Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )
            : undefined
        }
        scrollEventThrottle={16}
      >
        {/* Modern App Vibe: Case Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="document-text" size={18} color={colors.accent} />
            </View>
            <Text style={styles.cardTitle}>Case Details</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            {renderDetailRow("FILING NO.", caseNo)}
            <View style={styles.detailDivider} />
            {renderDetailRow("FILING DATE", formatDate(data.date_of_filing))}
            <View style={styles.detailDivider} />
            {renderDetailRow("REGISTRATION NO.", regNo)}
            <View style={styles.detailDivider} />
            {renderDetailRow("REGISTRATION DATE", formatDate(data.dt_regis))}
            {!isDisposed && (
              <>
                <View style={styles.detailDivider} />
                {renderDetailRow("NEXT HEARING", nextHearingDisplay, !isDateNotGiven)}
              </>
            )}
            <View style={styles.detailDivider} />
            {renderDetailRow("LISTED FOR", listedFor)}
            <View style={styles.detailDivider} />
            {renderDetailRow("LAST LISTING", formatDate(data.date_last_list))}
            <View style={styles.detailDivider} />
            {renderDetailRow("EFILING REF NO", data.efilno)}
          </View>
          <View style={styles.cardFooter}>
            <Ionicons name="information-circle" size={12} color="#AAAAAA" />
            <Text style={styles.footerText}>Hearing dates may change based on court proceedings.</Text>
          </View>
        </View>

        {/* Modern App Vibe: Additional Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="pulse" size={18} color="#D4AF37" />
            </View>
            <Text style={styles.cardTitle}>Additional Information</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            {renderDetailRow("CURRENT STATUS", currentStatus)}
            <View style={styles.detailDivider} />
            {renderDetailRow("LISTED BEFORE", listedBefore)}
            <View style={styles.detailDivider} />
            {renderDetailRow("CASE AGE", caseAgeFormatted)}
            {!isDisposed && (
              <>
                <View style={styles.detailDivider} />
                {renderDetailRow("DAYS SINCE LAST LISTED", daysSinceListed)}
              </>
            )}
            <View style={styles.detailDivider} />
            {renderDetailRow("CASE CATEGORY", data.subject?.subject_name || '-')}
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>{data.filing_case_type?.full_form || "Writ Petition under Article 226 and 227 of the Constitution"}</Text>
          </View>
        </View>

        {/* Modern App Vibe: Parties Vertical Stack */}
        <View style={styles.card}>
          <View style={[styles.cardHeader, { paddingBottom: spacing.sm }]}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="people" size={18} color="#D4AF37" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Parties</Text>
              <Text style={styles.cardSubtitle}>{allPetitioners.length} Petitioners • {allRespondents.length} Respondents</Text>
            </View>
          </View>
          
          <View style={styles.partiesStackLayout}>
            {/* Petitioner List */}
            <View style={styles.partyStackColumn}>
              <View style={[styles.partyHeaderBg, { backgroundColor: "#111111", borderTopWidth: 1, borderTopColor: "#222222" }]}>
                <Text style={[styles.partyHeaderTitle, { color: "#D4AF37" }]}>PETITIONERS</Text>
              </View>
              <View style={styles.verticalListContainer}>
                {allPetitioners.map((pet, idx) => (
                  <View key={idx} style={[styles.partyCard, { width: '100%' }]}>
                    <View style={styles.partyCardHeader}>
                      <View style={[styles.partyAvatar, { backgroundColor: "#D4AF37" }]}><Text style={styles.partyAvatarText}>{pet.party_no}</Text></View>
                      <Text style={[styles.partyCardName, { color: "#D4AF37" }]}>{pet.name} <Text style={styles.partyAge}>{pet.age ? `${pet.age}y` : ''}</Text></Text>
                    </View>
                    {/* Advocates only render if they exist (enforced to be only on first petitioner) */}
                    {renderAdvocates(pet.adv_name, pet.adv_reg, pet.extra_advs)}
                    {pet.address && <Text style={styles.partyAddress}>{pet.address}</Text>}
                  </View>
                ))}
              </View>
            </View>

            {/* Respondent List */}
            <View style={styles.partyStackColumn}>
              <View style={[styles.partyHeaderBg, { backgroundColor: "#111111", borderTopWidth: 1, borderTopColor: "#222222" }]}>
                <Text style={[styles.partyHeaderTitle, { color: "#D4AF37" }]}>RESPONDENTS</Text>
              </View>
              <View style={styles.verticalListContainer}>
                {allRespondents.map((res, idx) => (
                  <View key={idx} style={[styles.partyCard, { width: '100%' }]}>
                    <View style={styles.partyCardHeader}>
                      <View style={[styles.partyAvatar, { backgroundColor: "#D4AF37" }]}><Text style={styles.partyAvatarText}>{res.party_no}</Text></View>
                      <Text style={[styles.partyCardName, { color: "#D4AF37" }]}>{res.name} <Text style={styles.partyAge}>{res.age ? `${res.age}y` : ''}</Text></Text>
                    </View>
                    {/* Advocates only render if they exist (enforced to be only on first respondent) */}
                    {renderAdvocates(res.adv_name, res.adv_reg, res.extra_advs)}
                    {res.address && <Text style={styles.partyAddress}>{res.address}</Text>}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Live Data Tables */}
        
        {/* Sub-Matters Table */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="layers" size={18} color="#D4AF37" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Sub-Matters</Text>
              <Text style={styles.cardSubtitle}>{subMatters.length} application(s) filed</Text>
            </View>
          </View>
          {subMatters.length > 0 ? (
            <View style={styles.verticalListContainer}>
              {subMatters.map((sub, idx) => (
                <View key={idx} style={styles.verticalCard}>
                  <View style={styles.verticalCardHeader}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.verticalCardTitle}>{`${sub.filing_case_type?.type_name || ''} ${sub.reg_no || ''}/${sub.reg_year || ''}`}</Text>
                      <Text style={styles.verticalCardSub}>{sub.cino}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: getStatusStyles(sub.case_state).bg }]}>
                      <Text style={[styles.statusPillText, { color: getStatusStyles(sub.case_state).text }]}>{sub.case_state?.toUpperCase() || 'UNKNOWN'}</Text>
                    </View>
                  </View>
                  <View style={styles.verticalCardBody}>
                    <View style={styles.verticalCardRow}>
                      <Text style={styles.verticalCardLabel}>PETITIONER</Text>
                      <Text style={styles.verticalCardValue}>{getPartyName(sub.pet_name, sub)}</Text>
                    </View>
                    <View style={styles.verticalCardRow}>
                      <Text style={styles.verticalCardLabel}>RESPONDENT</Text>
                      <Text style={styles.verticalCardValue}>{getPartyName(sub.res_name, sub)}</Text>
                    </View>
                    <View style={styles.verticalCardRow}>
                      <Text style={styles.verticalCardLabel}>FILED ON</Text>
                      <Text style={styles.verticalCardValue}>{formatDate(sub.date_of_filing)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyDataCard}>
              <View style={styles.emptyDataIconBg}>
                <Ionicons name="layers" size={24} color="#777777" />
              </View>
              <Text style={styles.emptyDataTitle}>No Sub-Matters</Text>
              <Text style={styles.emptyDataSub}>There are no sub-matters filed for this case.</Text>
            </View>
          )}
        </View>

        {/* Linked Cases */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="link" size={18} color="#D4AF37" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Linked Cases</Text>
              <Text style={styles.cardSubtitle}>{linkedCases.length} case(s) found</Text>
            </View>
          </View>
          {linkedCases.length > 0 ? (
            <View style={styles.verticalListContainer}>
              {linkedCases.map((link, idx) => (
                <View key={idx} style={styles.verticalCard}>
                  <View style={styles.verticalCardHeader}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.verticalCardTitle}>{link.caseno}</Text>
                      <Text style={styles.verticalCardSub}>{link.cino}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: getStatusStyles(link.status).bg }]}>
                      <Text style={[styles.statusPillText, { color: getStatusStyles(link.status).text }]}>{link.status?.toUpperCase() || 'UNKNOWN'}</Text>
                    </View>
                  </View>
                  <View style={styles.verticalCardBody}>
                    <Text style={[styles.verticalCardValue, { textAlign: 'left', color: '#CCCCCC' }]}>
                      {`${getPartyName(link.pet_name, link)} VS ${getPartyName(link.res_name, link)}`}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyDataCard}>
              <View style={styles.emptyDataIconBg}>
                <Ionicons name="link" size={24} color="#777777" />
              </View>
              <Text style={styles.emptyDataTitle}>No Linked Cases</Text>
              <Text style={styles.emptyDataSub}>There are no linked cases associated with this matter.</Text>
            </View>
          )}
        </View>

        {/* Orders */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="document-text" size={18} color="#D4AF37" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Orders</Text>
              <Text style={styles.cardSubtitle}>{orders.length} order(s) loaded</Text>
            </View>
          </View>
          {orders.length > 0 ? (
            <>
              <View style={styles.verticalListContainer}>
                {orders.map((o, idx) => (
                  <View key={o.order_no || idx} style={styles.verticalCard}>
                    <View style={styles.verticalCardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={styles.orderBadge}><Text style={styles.orderBadgeText}>{o.order_no}</Text></View>
                        <Text style={[styles.verticalCardTitle, { fontSize: 15 }]}>{formatDate(o.order_dt)}</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 0.5 }}>{o.document_type?.docu_name || 'UNKNOWN'}</Text>
                      </View>
                    </View>
                    <View style={styles.verticalCardBody}>
                      <View style={styles.verticalCardRow}>
                        <Text style={styles.verticalCardLabel}>UPLOADED</Text>
                        <Text style={styles.verticalCardValue}>{formatDateTime(o.timestamp)}</Text>
                      </View>
                      <View style={styles.verticalCardRow}>
                        <Text style={styles.verticalCardLabel}>REPORTABLE</Text>
                        <Text style={styles.verticalCardValue}>{o.reportable_judgement === 'Y' ? 'Yes' : 'No'}</Text>
                      </View>
                    </View>
                    <View style={[styles.verticalCardFooter, { borderTopWidth: 1, borderTopColor: '#222222', paddingTop: 12, marginTop: 12 }]}>
                      {o.uploaded_file_exists ? (
                        shouldHideParties ? (
                          <View style={[styles.pdfBtn, { borderColor: "#EF4444" }]}>
                            <Ionicons name="lock-closed" size={12} color="#EF4444" />
                            <Text style={[styles.pdfBtnText, { color: "#EF4444" }]}>Restricted</Text>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.pdfBtn}
                            onPress={() => Linking.openURL(`https://ghcservices.assam.gov.in/case-status/order-document/${o.uploaded_file_year}/${o.uploaded_file_name}`)}
                          >
                            <Ionicons name="document" size={12} color={colors.accent} />
                            <Text style={styles.pdfBtnText}>View PDF</Text>
                          </TouchableOpacity>
                        )
                      ) : (
                        <Text style={[styles.verticalCardValue, { color: "#777777", fontSize: 12 }]}>Document Unavailable</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              {ordersPage < ordersTotalPages && (
                <View style={styles.loadMoreContainer}>
                  <TouchableOpacity 
                    style={styles.loadMoreBtn} 
                    onPress={loadMoreOrders}
                    disabled={loadingMoreOrders}
                  >
                    {loadingMoreOrders ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={styles.loadMoreText}>Load More Orders ({ordersTotalPages - ordersPage} pages left)</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyDataCard}>
              <View style={styles.emptyDataIconBg}>
                <Ionicons name="document-text" size={24} color="#777777" />
              </View>
              <Text style={styles.emptyDataTitle}>No Orders</Text>
              <Text style={styles.emptyDataSub}>There are no orders or judgements uploaded for this case yet.</Text>
            </View>
          )}
        </View>

      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  hero: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  heroRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  heroIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#222222", alignItems: "center", justifyContent: "center", marginTop: 2 },
  heroTitle: { color: "#FFFFFF", fontFamily: 'Georgia', fontSize: 18 },
  heroSub: { color: "#ADB9D8", marginTop: 4, fontSize: 13, fontFamily: 'Inter_400Regular', letterSpacing: 0.5 },
  heroPill: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  heroPillText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  scroll: { flex: 1 },
  content: { backgroundColor: "#000000", borderWidth: 1, borderColor: colors.accent || "#D4AF37", borderBottomWidth: 0, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  
  errorIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#222222", alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  errorText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  card: { backgroundColor: "#111111", borderRadius: radius.xl, borderWidth: 1, borderColor: "#222222", borderWidth: 1, borderColor: "#222222", overflow: "hidden", elevation: 0, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: spacing.lg },
  headerIconContainer: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: "#0A0A0A", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 17, fontFamily: 'Georgia', color: colors.textPrimary },
  cardSubtitle: { fontSize: 13, color: "#AAAAAA", marginTop: 2, fontFamily: 'Inter_400Regular' },

  detailsContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.md, gap: 16 },
  detailDivider: { height: 1, backgroundColor: "#222222" },
  detailLabel: { flex: 1, fontSize: 12, fontFamily: 'Inter_600SemiBold', color: "#AAAAAA", letterSpacing: 0.5, textTransform: "uppercase" },
  detailValueContainer: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  detailValue: { fontSize: 14, fontFamily: 'Inter_700Bold', color: "#FFFFFF", textAlign: "right" },
  
  upcomingBadge: { backgroundColor: "#D4AF37", paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  upcomingBadgeText: { fontSize: 9, color: "#FFFFFF", fontWeight: "800", textTransform: "uppercase" },
  cardFooter: { backgroundColor: "#111111", padding: spacing.md, flexDirection: "row", alignItems: "flex-start", gap: 6, borderTopWidth: 1, borderTopColor: "#222222" },
  footerText: { fontSize: 12, color: "#AAAAAA", flex: 1, lineHeight: 18 },

  partiesStackLayout: { marginTop: spacing.sm },
  partyStackColumn: { borderBottomWidth: 4, borderBottomColor: "#111111" },
  partyHeaderBg: { paddingVertical: 10, paddingHorizontal: spacing.lg, alignItems: "center" },
  partyHeaderTitle: { fontSize: 12, fontWeight: "800", letterSpacing: 1 },

  
  partyCard: { backgroundColor: "#111111", borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: "#333333", elevation: 0, overflow: "hidden" },
  partyCardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  partyAvatar: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", marginTop: 1 },
  partyAvatarText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  partyCardName: { flex: 1, fontSize: 15, fontFamily: 'Georgia', lineHeight: 22 },
  partyAge: { fontSize: 13, fontFamily: 'Inter_400Regular', color: "#777777" },
  
  advocateRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8, backgroundColor: "#111111", padding: 8, borderRadius: radius.sm },
  advBadge: { backgroundColor: "#EF4444", paddingHorizontal: 5, paddingVertical: 3, borderRadius: 4, marginTop: 1 },
  advBadgeText: { color: "#FFFFFF", fontSize: 9, fontFamily: 'Inter_700Bold' },
  advName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: "#CCCCCC", flex: 1, lineHeight: 18 },
  partyAddress: { fontSize: 13, color: "#AAAAAA", lineHeight: 18, fontFamily: 'Inter_400Regular' },

  statusPill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  statusPillText: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' },

  verticalListContainer: { padding: spacing.lg, gap: spacing.md },
  verticalCard: { backgroundColor: "#161616", borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: "#333333" },
  verticalCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  verticalCardTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: colors.textPrimary },
  verticalCardSub: { fontSize: 12, color: "#AAAAAA", marginTop: 4, fontFamily: 'Inter_400Regular' },
  verticalCardBody: { gap: 10 },
  verticalCardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  verticalCardLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: "#777777", letterSpacing: 0.5 },
  verticalCardValue: { fontSize: 13, color: "#E0E0E0", flex: 1, textAlign: "right" },
  verticalCardFooter: { alignItems: "stretch" },
  orderBadge: { backgroundColor: "#111111", borderWidth: 1, borderColor: "#0A0A0A", width: 28, height: 28, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  orderBadgeText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: "#D4AF37" },
  pdfBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#111111", borderWidth: 1, borderColor: "#333333", paddingHorizontal: 16, paddingVertical: 14, borderRadius: 10 },
  pdfBtnText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: "#D4AF37" },

  loadMoreContainer: { padding: spacing.md, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#222222' },
  loadMoreBtn: { backgroundColor: '#111111', paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: '#333333' },
  loadMoreText: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },

  emptyState: { padding: spacing.xl, alignItems: "center", justifyContent: "center" },
  emptyStateText: { color: "#777777", fontSize: 14, fontWeight: "500" },

  emptyDataCard: { padding: spacing.xl, alignItems: "center", justifyContent: "center", backgroundColor: "#222222", margin: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: "#222222", borderStyle: "dashed" },
  emptyDataIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#222222", alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  emptyDataTitle: { fontSize: 15, fontWeight: "700", color: "#CCCCCC", marginBottom: 4 },
  emptyDataSub: { fontSize: 13, color: "#777777", textAlign: "center" },

  errorStateCard: { backgroundColor: "#222222", borderRadius: radius.xl, padding: spacing.xl, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#552222", width: '100%', elevation: 0, overflow: "hidden" },
  errorStateIconBg: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#222222", alignItems: "center", justifyContent: "center", marginBottom: spacing.lg },
  errorStateTitle: { fontSize: 20, fontWeight: "800", color: "#FF6666", marginBottom: 8 },
  errorStateSub: { fontSize: 15, color: "#FF8888", textAlign: "center", lineHeight: 22 },
});

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
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";
import { civilCaseTypes, criminalCaseTypes } from "../data";

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
            setData(prev => ({ ...prev, ...mainData.data }));
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
    const allTypes = [...civilCaseTypes, ...criminalCaseTypes];
    const type = allTypes.find(t => t.value === String(id));
    return type ? type.label : '';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ marginTop: 16, color: colors.primary, fontWeight: '600' }}>Fetching Complete Case Profile...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: spacing.xl }]}>
        <View style={styles.errorStateCard}>
          <View style={styles.errorStateIconBg}>
            <Feather name="alert-circle" size={40} color="#EF4444" />
          </View>
          <Text style={styles.errorStateTitle}>Data Unavailable</Text>
          <Text style={styles.errorStateSub}>{error || 'We could not find the complete profile for this case. It might not be available or there might be an issue with the connection.'}</Text>
        </View>
      </View>
    );
  }

  // Safe mapping with rich field fallbacks
  const caseTypeName = data.filing_case_type?.type_name || getCaseTypeName(data.filcase_type);
  const regTypeName = data.registered_case_type?.type_name || getCaseTypeName(data.regcase_type);
  
  const caseNo = `${caseTypeName} ${data.fil_no || ''}/${data.fil_year || ''}`;
  const regNo = `${regTypeName} ${data.reg_no || ''}/${data.reg_year || ''}`;

  const renderDetailRow = (label, value, isHighlight = false) => (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, isHighlight && { color: "#D97706" }]}>{label}</Text>
      <View style={styles.detailValueContainer}>
        {isHighlight && <View style={styles.upcomingBadge}><Text style={styles.upcomingBadgeText}>Upcoming</Text></View>}
        <Text style={[styles.detailValue, isHighlight && { color: "#92400E" }]} textAlign="right">{value || '-'}</Text>
      </View>
    </View>
  );

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
      name: data.pet_name,
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
          name: p.pet_name || p.name,
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
      name: data.res_name,
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
          name: r.res_name || r.name,
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

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0F2349", colors.primary]} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="gavel" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{regTypeName} / {data.reg_no || '-'} / {data.reg_year || '-'}</Text>
            <Text style={styles.heroSub}>CINO: {data.cino || '-'}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <View style={styles.heroPill}><Text style={styles.heroPillText}>{caseTypeName}</Text></View>
              <View style={[styles.heroPill, { backgroundColor: currentStatus === 'PENDING' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)' }]}>
                <Text style={[styles.heroPillText, { color: currentStatus === 'PENDING' ? '#FCD34D' : '#6EE7B7' }]}>{currentStatus}</Text>
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
              <Feather name="file-text" size={18} color={colors.accent} />
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
            <View style={styles.detailDivider} />
            {renderDetailRow("NEXT HEARING", formatDate(data.date_next_list), true)}
            <View style={styles.detailDivider} />
            {renderDetailRow("LISTED FOR", listedFor)}
            <View style={styles.detailDivider} />
            {renderDetailRow("LAST LISTING", formatDate(data.date_last_list))}
            <View style={styles.detailDivider} />
            {renderDetailRow("EFILING REF NO", data.efilno)}
          </View>
          <View style={styles.cardFooter}>
            <Feather name="info" size={12} color="#6B7280" />
            <Text style={styles.footerText}>Hearing dates may change based on court proceedings.</Text>
          </View>
        </View>

        {/* Modern App Vibe: Additional Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.headerIconContainer, { backgroundColor: "#E0F2FE" }]}>
              <Feather name="activity" size={18} color="#0284C7" />
            </View>
            <Text style={styles.cardTitle}>Additional Information</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            {renderDetailRow("CURRENT STATUS", currentStatus)}
            <View style={styles.detailDivider} />
            {renderDetailRow("LISTED BEFORE", listedBefore)}
            <View style={styles.detailDivider} />
            {renderDetailRow("CASE AGE", caseAgeFormatted)}
            <View style={styles.detailDivider} />
            {renderDetailRow("DAYS SINCE LAST LISTED", daysSinceListed)}
            <View style={styles.detailDivider} />
            {renderDetailRow("CASE CATEGORY", data.subject?.subject_name || '-')}
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>{data.filing_case_type?.full_form || "Write Petition under Article 226 and 227 of the Constitution"}</Text>
          </View>
        </View>

        {/* Modern App Vibe: Parties Vertical Stack */}
        <View style={styles.card}>
          <View style={[styles.cardHeader, { paddingBottom: spacing.sm }]}>
            <View style={[styles.headerIconContainer, { backgroundColor: "#FEF3C7" }]}>
              <Feather name="users" size={18} color="#D97706" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Parties</Text>
              <Text style={styles.cardSubtitle}>{allPetitioners.length} Petitioners • {allRespondents.length} Respondents</Text>
            </View>
          </View>
          
          <View style={styles.partiesStackLayout}>
            {/* Petitioner Scroll */}
            <View style={styles.partyStackColumn}>
              <View style={[styles.partyHeaderBg, { backgroundColor: "#ECFDF5", borderTopWidth: 1, borderTopColor: "#F1F5F9" }]}>
                <Text style={[styles.partyHeaderTitle, { color: "#059669" }]}>PETITIONERS</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.partyStackScroll} contentContainerStyle={styles.partyScrollContent}>
                {allPetitioners.map((pet, idx) => (
                  <View key={idx} style={[styles.partyCard, { width: 260 }]}>
                    <View style={styles.partyCardHeader}>
                      <View style={[styles.partyAvatar, { backgroundColor: "#059669" }]}><Text style={styles.partyAvatarText}>{pet.party_no}</Text></View>
                      <Text style={[styles.partyCardName, { color: "#065F46" }]}>{pet.name} <Text style={styles.partyAge}>{pet.age ? `${pet.age}y` : ''}</Text></Text>
                    </View>
                    {/* Advocates only render if they exist (enforced to be only on first petitioner) */}
                    {renderAdvocates(pet.adv_name, pet.adv_reg, pet.extra_advs)}
                    {pet.address && <Text style={styles.partyAddress}>{pet.address}</Text>}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Respondent Scroll */}
            <View style={styles.partyStackColumn}>
              <View style={[styles.partyHeaderBg, { backgroundColor: "#FFF7ED", borderTopWidth: 1, borderTopColor: "#F1F5F9" }]}>
                <Text style={[styles.partyHeaderTitle, { color: "#EA580C" }]}>RESPONDENTS</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.partyStackScroll} contentContainerStyle={styles.partyScrollContent}>
                {allRespondents.map((res, idx) => (
                  <View key={idx} style={[styles.partyCard, { width: 260 }]}>
                    <View style={styles.partyCardHeader}>
                      <View style={[styles.partyAvatar, { backgroundColor: "#EA580C" }]}><Text style={styles.partyAvatarText}>{res.party_no}</Text></View>
                      <Text style={[styles.partyCardName, { color: "#9A3412" }]}>{res.name} <Text style={styles.partyAge}>{res.age ? `${res.age}y` : ''}</Text></Text>
                    </View>
                    {/* Advocates only render if they exist (enforced to be only on first respondent) */}
                    {renderAdvocates(res.adv_name, res.adv_reg, res.extra_advs)}
                    {res.address && <Text style={styles.partyAddress}>{res.address}</Text>}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Live Data Tables */}
        
        {/* Sub-Matters Table */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.headerIconContainer, { backgroundColor: "#F3E8FF" }]}>
              <Feather name="layers" size={18} color="#9333EA" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Sub-Matters</Text>
              <Text style={styles.cardSubtitle}>{subMatters.length} application(s) filed</Text>
            </View>
          </View>
          {subMatters.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { width: 140 }]}>CASE</Text>
                  <Text style={[styles.th, { width: 90 }]}>STATUS</Text>
                  <Text style={[styles.th, { width: 180 }]}>PETITIONER</Text>
                  <Text style={[styles.th, { width: 180 }]}>RESPONDENT</Text>
                  <Text style={[styles.th, { width: 100 }]}>FILED ON</Text>
                </View>
                {subMatters.map((sub, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <View style={[styles.td, { width: 140 }]}>
                      <Text style={styles.tdTextBold}>{`${sub.filing_case_type?.type_name || ''} ${sub.reg_no || ''}/${sub.reg_year || ''}`}</Text>
                      <Text style={styles.tdTextSub}>{sub.cino}</Text>
                    </View>
                    <View style={[styles.td, { width: 90 }]}>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>{sub.case_state?.toUpperCase() || 'UNKNOWN'}</Text>
                      </View>
                    </View>
                    <View style={[styles.td, { width: 180 }]}><Text style={styles.tdText}>{sub.pet_name}</Text></View>
                    <View style={[styles.td, { width: 180 }]}><Text style={styles.tdText}>{sub.res_name}</Text></View>
                    <View style={[styles.td, { width: 100 }]}><Text style={styles.tdText}>{formatDate(sub.date_of_filing)}</Text></View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyDataCard}>
              <View style={styles.emptyDataIconBg}>
                <Feather name="layers" size={24} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyDataTitle}>No Sub-Matters</Text>
              <Text style={styles.emptyDataSub}>There are no sub-matters filed for this case.</Text>
            </View>
          )}
        </View>

        {/* Linked Cases */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.headerIconContainer, { backgroundColor: "#ECFCCB" }]}>
              <Feather name="link" size={18} color="#65A30D" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Linked Cases</Text>
              <Text style={styles.cardSubtitle}>{linkedCases.length} case(s) found</Text>
            </View>
          </View>
          {linkedCases.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { width: 140 }]}>CASE</Text>
                  <Text style={[styles.th, { width: 90 }]}>STATUS</Text>
                  <Text style={[styles.th, { width: 280 }]}>PARTIES</Text>
                </View>
                {linkedCases.map((link, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <View style={[styles.td, { width: 140 }]}>
                      <Text style={styles.tdTextBold}>{link.caseno}</Text>
                      <Text style={styles.tdTextSub}>{link.cino}</Text>
                    </View>
                    <View style={[styles.td, { width: 90 }]}>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>{link.status?.toUpperCase() || 'UNKNOWN'}</Text>
                      </View>
                    </View>
                    <View style={[styles.td, { width: 280 }]}><Text style={styles.tdText}>{`${link.pet_name} VS ${link.res_name}`}</Text></View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyDataCard}>
              <View style={styles.emptyDataIconBg}>
                <Feather name="link" size={24} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyDataTitle}>No Linked Cases</Text>
              <Text style={styles.emptyDataSub}>There are no linked cases associated with this matter.</Text>
            </View>
          )}
        </View>

        {/* Orders */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.headerIconContainer, { backgroundColor: "#FFE4E6" }]}>
              <Feather name="file-text" size={18} color="#E11D48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Orders</Text>
              <Text style={styles.cardSubtitle}>{orders.length} order(s) loaded</Text>
            </View>
          </View>
          {orders.length > 0 ? (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, { width: 40 }]}>#</Text>
                    <Text style={[styles.th, { width: 100 }]}>ORDER DATE</Text>
                    <Text style={[styles.th, { width: 90 }]}>TYPE</Text>
                    <Text style={[styles.th, { width: 140 }]}>UPLOADED</Text>
                    <Text style={[styles.th, { width: 100 }]}>REPORTABLE</Text>
                    <Text style={[styles.th, { width: 110 }]}>DOCUMENT</Text>
                  </View>
                  {orders.map((o, idx, arr) => (
                    <View key={o.order_no || idx} style={[styles.tableRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                      <View style={[styles.td, { width: 40 }]}><View style={styles.orderBadge}><Text style={styles.orderBadgeText}>{o.order_no}</Text></View></View>
                      <View style={[styles.td, { width: 100 }]}><Text style={styles.tdTextBold}>{formatDate(o.order_dt)}</Text></View>
                      <View style={[styles.td, { width: 90 }]}>
                        <View style={styles.statusPill}>
                          <Text style={styles.statusPillText}>{o.document_type?.docu_name || 'UNKNOWN'}</Text>
                        </View>
                      </View>
                      <View style={[styles.td, { width: 140 }]}><Text style={styles.tdText}>{formatDateTime(o.timestamp)}</Text></View>
                      <View style={[styles.td, { width: 100 }]}><Text style={styles.tdText}>{o.reportable_judgement === 'Y' ? 'Yes' : 'No'}</Text></View>
                      <View style={[styles.td, { width: 110 }]}>
                        {o.uploaded_file_exists ? (
                          <TouchableOpacity 
                            style={styles.pdfBtn}
                            onPress={() => Linking.openURL(`https://ghcservices.assam.gov.in/case-status/order-document/${o.uploaded_file_year}/${o.uploaded_file_name}`)}
                          >
                            <Feather name="file" size={12} color={colors.primary} />
                            <Text style={styles.pdfBtnText}>View PDF</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={[styles.tdText, { color: "#9CA3AF", fontSize: 11 }]}>Unavailable</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
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
                <Feather name="file-text" size={24} color="#9CA3AF" />
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
  heroIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#1B2C52", alignItems: "center", justifyContent: "center", marginTop: 2 },
  heroTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
  heroSub: { color: "#ADB9D8", marginTop: 4, fontSize: 13, fontWeight: "500", letterSpacing: 0.5 },
  heroPill: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  heroPillText: { color: '#fff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  scroll: { flex: 1 },
  content: { backgroundColor: "#ECF1FF", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  
  errorIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  errorText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  card: { backgroundColor: "#fff", borderRadius: radius.xl, overflow: "hidden", shadowColor: "#0B1A38", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 3 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: spacing.lg },
  headerIconContainer: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 17, fontWeight: "800", color: colors.primary },
  cardSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2, fontWeight: "500" },

  detailsContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.md, gap: 16 },
  detailDivider: { height: 1, backgroundColor: "#F1F5F9" },
  detailLabel: { flex: 1, fontSize: 12, fontWeight: "700", color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase" },
  detailValueContainer: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  detailValue: { fontSize: 14, fontWeight: "700", color: "#0F172A", textAlign: "right" },
  
  upcomingBadge: { backgroundColor: "#F59E0B", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  upcomingBadgeText: { fontSize: 9, color: "#fff", fontWeight: "800", textTransform: "uppercase" },
  cardFooter: { backgroundColor: "#F8FAFC", padding: spacing.md, flexDirection: "row", alignItems: "flex-start", gap: 6, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  footerText: { fontSize: 12, color: "#64748B", flex: 1, lineHeight: 18 },

  partiesStackLayout: { marginTop: spacing.sm },
  partyStackColumn: { borderBottomWidth: 4, borderBottomColor: "#F8FAFC" },
  partyHeaderBg: { paddingVertical: 10, paddingHorizontal: spacing.lg, alignItems: "center" },
  partyHeaderTitle: { fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  partyStackScroll: { flexGrow: 0 },
  partyScrollContent: { padding: spacing.lg, gap: spacing.md },
  
  partyCard: { backgroundColor: "#fff", borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 1 },
  partyCardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  partyAvatar: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", marginTop: 1 },
  partyAvatarText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  partyCardName: { flex: 1, fontSize: 15, fontWeight: "800", lineHeight: 22 },
  partyAge: { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },
  
  advocateRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8, backgroundColor: "#F8FAFC", padding: 8, borderRadius: radius.sm },
  advBadge: { backgroundColor: "#EF4444", paddingHorizontal: 5, paddingVertical: 3, borderRadius: 4, marginTop: 1 },
  advBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  advName: { fontSize: 13, fontWeight: "700", color: "#334155", flex: 1, lineHeight: 18 },
  partyAddress: { fontSize: 13, color: "#64748B", lineHeight: 18 },

  statusPill: { alignSelf: "flex-start", backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  statusPillText: { fontSize: 10, fontWeight: "800", color: "#D97706" },

  horizontalScroll: { width: "100%" },
  table: { minWidth: "100%", paddingBottom: spacing.sm },
  tableHeader: { flexDirection: "row", backgroundColor: "#F8FAFC", paddingVertical: 10, paddingHorizontal: spacing.lg, borderTopWidth: 1, borderTopColor: "#F1F5F9", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  th: { fontSize: 10, fontWeight: "800", color: "#64748B", letterSpacing: 0.5, marginRight: 16 },
  tableRow: { flexDirection: "row", paddingVertical: 14, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", alignItems: "center" },
  td: { marginRight: 16, justifyContent: "center" },
  tdTextBold: { fontSize: 13, fontWeight: "700", color: colors.primary },
  tdTextSub: { fontSize: 11, color: "#64748B", marginTop: 2 },
  tdText: { fontSize: 13, color: "#334155" },
  orderBadge: { backgroundColor: "#EEF2FF", borderWidth: 1, borderColor: "#C7D2FE", width: 28, height: 28, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  orderBadgeText: { fontSize: 12, fontWeight: "800", color: "#4F46E5" },
  pdfBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#A7F3D0", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, alignSelf: "flex-start" },
  pdfBtnText: { fontSize: 11, fontWeight: "700", color: "#059669" },

  loadMoreContainer: { padding: spacing.md, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  loadMoreBtn: { backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: '#E2E8F0' },
  loadMoreText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  emptyState: { padding: spacing.xl, alignItems: "center", justifyContent: "center" },
  emptyStateText: { color: "#9CA3AF", fontSize: 14, fontWeight: "500" },

  emptyDataCard: { padding: spacing.xl, alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFB", margin: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: "#F3F4F6", borderStyle: "dashed" },
  emptyDataIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  emptyDataTitle: { fontSize: 15, fontWeight: "700", color: "#4B5563", marginBottom: 4 },
  emptyDataSub: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },

  errorStateCard: { backgroundColor: "#FEF2F2", borderRadius: radius.xl, padding: spacing.xl, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FCA5A5", width: '100%', shadowColor: "#EF4444", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 4 },
  errorStateIconBg: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center", marginBottom: spacing.lg },
  errorStateTitle: { fontSize: 20, fontWeight: "800", color: "#991B1B", marginBottom: 8 },
  errorStateSub: { fontSize: 15, color: "#B91C1C", textAlign: "center", lineHeight: 22 },
});

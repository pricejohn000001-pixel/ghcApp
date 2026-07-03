import { BlurView } from "expo-blur";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View, Animated, StyleSheet, Pressable } from "react-native";
import Modal from "react-native-modal";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from "react-i18next";

const BASE = "https://ghconline.gov.in/NewCList";
const DAILY_SUFFIXES = ["LokAdalat"];

const typeDefs = [
  { key: "dl", tKey: "daily", colors: ["#8B6508", "#5C4300"], icon: <Ionicons name="document-text" size={20} color="#FFFFFF" /> },
  { key: "sl", tKey: "supplementary", colors: ["#4F4F4F", "#2F2F2F"], icon: <Ionicons name="add" size={20} color="#FFFFFF" /> },
  { key: "lz", tKey: "lawazima", colors: ["#8B4513", "#5C2E00"], icon: <Ionicons name="boat" size={20} color="#FFFFFF" /> },
  { key: "no", tKey: "notices", colors: ["#4C1D95", "#2E1065"], icon: <Ionicons name="notifications" size={20} color="#FFFFFF" /> },
];

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function probe(url) {
  try {
    const r = await fetchWithTimeout(url, { method: "HEAD" });
    if (r.ok) return true;
  } catch (_) {}
  try {
    const r = await fetchWithTimeout(url, {
      method: "GET",
      headers: { Accept: "application/pdf", Range: "bytes=0-0" },
    });
    return r.ok;
  } catch (_) {
    return false;
  }
}

async function probeLinks(prefix, dateStr, labelBase, extraSuffixes = []) {
  const candidates = [];
  // 1. Base
  candidates.push({ url: `${BASE}/${prefix}-${dateStr}.pdf`, label: labelBase });

  // 2. Numeric suffixes
  for (let i = 1; i <= 5; i++) { // Reduced from 10 to 5 to be more efficient, most lists don't go that high
    candidates.push({ url: `${BASE}/${prefix}-${dateStr}-${i}.pdf`, label: `${labelBase} ${i}` });
  }

  // 3. Named suffixes
  for (const suffix of extraSuffixes) {
    candidates.push({ url: `${BASE}/${prefix}-${dateStr}-${suffix}.pdf`, label: `${labelBase} (${suffix})` });
  }

  const results = await Promise.all(
    candidates.map(async (c) => {
      const ok = await probe(c.url);
      return ok ? c : null;
    })
  );

  return results.filter(Boolean);
}

async function buildAvailability(dateStr, labels, consolidatedHtml = null) {
  const [dl, sl, lz, no] = await Promise.all([
    probeLinks("dl", dateStr, labels.daily, DAILY_SUFFIXES),
    probeLinks("sl", dateStr, labels.supplementary),
    probeLinks("lz", dateStr, labels.lawazima),
    probeLinks("no", dateStr, labels.notice),
  ]);

  if (dl.length === 0 && consolidatedHtml) {
    const re = new RegExp(`https://ghconline\\.gov\\.in/NewCList/dl-${dateStr}[^"']*\\.pdf`, "gi");
    const m = consolidatedHtml.match(re);
    if (m && m.length > 0) dl.push({ url: m[0], label: labels.daily });
  }

  return { dl, sl, lz, no };
}

async function getConsolidatedHtml() {
  try {
    const r = await fetchWithTimeout("https://ghconline.gov.in/index.php/consolidated-cause-list/", { method: "GET" });
    if (r.ok) return await r.text();
  } catch (_) {}
  return null;
}

export const CauseListModal = ({ visible, onClose, holidays }) => {
  const { t } = useTranslation();
  const [today, setToday] = useState(new Date());
  const [tomorrow, setTomorrow] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });

  const [activeDateKey, setActiveDateKey] = useState("today");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ today: null, tomorrow: null });
  const [expanded, setExpanded] = useState({});
  const anims = useRef({
    dl: new Animated.Value(0),
    sl: new Animated.Value(0),
    lz: new Animated.Value(0),
    no: new Animated.Value(0),
  }).current;

  const todayStr = useMemo(() => formatDate(today), [today]);
  const tomorrowStr = useMemo(() => formatDate(tomorrow), [tomorrow]);

  const isHoliday = (date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return true; // Sunday
    
    if (holidays) {
      const d = date.getDate();
      const m = date.getMonth();
      const y = date.getFullYear();
      const h = holidays.find(h => h.day === d && h.month === m && h.year === y);
      if (h) return h.type === 'public';
    }
    return false;
  };

  const labels = useMemo(() => ({
    daily: t("cause_list.daily"),
    supplementary: t("cause_list.supplementary"),
    lawazima: t("cause_list.lawazima"),
    notice: t("cause_list.notice"),
  }), [t]);

  useEffect(() => {
    if (!visible) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const now = new Date();
        const tStr = formatDate(now);
        
        // Fetch consolidated HTML once to reuse
        const consolidatedHtml = await getConsolidatedHtml();
        
        const todayAvail = await buildAvailability(tStr, labels, consolidatedHtml);
        
        // Find next available day for "tomorrow"
        let nextDate = new Date(now);
        nextDate.setDate(nextDate.getDate() + 1);
        
        let foundNextAvail = null;
        let foundNextDate = null;

        // Search up to 5 days instead of 7 to be faster
        for (let i = 0; i < 5; i++) {
          const isH = isHoliday(nextDate);
          const nextStr = formatDate(nextDate);
          
          // We still check one by one to avoid overwhelming server, but buildAvailability is now faster
          const nextAvail = await buildAvailability(nextStr, labels, consolidatedHtml);
          const hasList = nextAvail.dl.length > 0 || nextAvail.sl.length > 0 || nextAvail.lz.length > 0 || nextAvail.no.length > 0;
          
          if (!isH && hasList) {
            foundNextAvail = nextAvail;
            foundNextDate = new Date(nextDate);
            break;
          }
          nextDate.setDate(nextDate.getDate() + 1);
        }

        // Fallback: if no available list found, use first non-holiday tomorrow
        if (!foundNextAvail) {
          let fallbackDate = new Date(now);
          fallbackDate.setDate(fallbackDate.getDate() + 1);
          while (isHoliday(fallbackDate)) {
            fallbackDate.setDate(fallbackDate.getDate() + 1);
          }
          foundNextDate = fallbackDate;
          foundNextAvail = await buildAvailability(formatDate(fallbackDate), labels, consolidatedHtml);
        }

        if (mounted) {
          setToday(now);
          setTomorrow(foundNextDate);
          setData({ today: todayAvail, tomorrow: foundNextAvail });
          setActiveDateKey("today");
        }
      } catch (error) {
        console.error("CauseListModal Error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [visible, holidays, labels, t]);

  const isActuallyTomorrow = useMemo(() => {
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.getDate() === tomorrow.getDate() && 
           nextDay.getMonth() === tomorrow.getMonth() && 
           nextDay.getFullYear() === tomorrow.getFullYear();
  }, [today, tomorrow]);

  const active = data[activeDateKey] || { dl: [], sl: [], lz: [], no: [] };

  const openUrlSafely = async (u) => {
    try {
      if (!u) return;
      const uri = encodeURI(String(u));
      const ok = await Linking.canOpenURL(uri);
      if (ok) await Linking.openURL(uri);
    } catch (_) {}
  };

  const toggleExpand = (key) => {
    const next = !expanded[key];
    const newState = { dl: false, sl: false, lz: false, no: false };
    newState[key] = next;
    setExpanded(newState);

    Object.keys(anims).forEach((k) => {
      Animated.timing(anims[k], {
        toValue: k === key && next ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <Modal 
      customBackdrop={
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView style={StyleSheet.absoluteFill} intensity={80} tint="dark"/>
        </Pressable>
      }
      backdropOpacity={1}
      hideModalContentWhileAnimating={true} 
      useNativeDriverForBackdrop={true} 
      isVisible={visible} 
      onBackdropPress={onClose} 
      style={{ margin: 0, padding: spacing.lg, justifyContent: "center", alignItems: "center" }}
    >
      <View style={{ backgroundColor: "#000000", borderWidth: 1, borderColor: "rgba(212,175,55,0.3)", overflow: "hidden", borderRadius: radius.xl, padding: spacing.lg, width: "100%" }}>
        <View style={{ marginBottom: spacing.md, alignItems: "center" }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 18, color: "#FFFFFF" }}>{t("cause_list.title")}</Text>
          <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap", justifyContent: "center" }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setActiveDateKey("today")}
              style={{ flex: 1, minWidth: 0, alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.lg, backgroundColor: activeDateKey === "today" ? "#D4AF37" : "#111111" }}
            >
              <Text style={{ color: "#FFFFFF", fontFamily: 'Inter_700Bold', textAlign: "center" }}>{t("cause_list.today")}</Text>
              <Text style={{ color: "#FFFFFF", opacity: 0.8, fontSize: 12, textAlign: "center", fontFamily: 'Inter_400Regular' }}>{todayStr}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setActiveDateKey("tomorrow")}
              style={{ flex: 1, minWidth: 0, alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.lg, backgroundColor: activeDateKey === "tomorrow" ? "#D4AF37" : "#111111" }}
            >
              <Text style={{ color: "#FFFFFF", fontFamily: 'Inter_700Bold', textAlign: "center" }}>{isActuallyTomorrow ? t("cause_list.tomorrow") : t("cause_list.next_available")}</Text>
              <Text style={{ color: "#FFFFFF", opacity: 0.8, fontSize: 12, textAlign: "center", fontFamily: 'Inter_400Regular' }}>{tomorrowStr}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: spacing.lg }}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        ) : (
          <ScrollView>
            {typeDefs.map((tDef) => {
              const items = active[tDef.key] || [];
              const count = items.length;
              const disabled = count === 0;
              const isExpanded = expanded[tDef.key];
              
              // If we have items, we show expand/collapse arrow (or if single item, maybe direct? 
              // User asked for "like notices" which suggests expand behavior).
              // Let's stick to expand/collapse for consistency if > 0.
              
              const rightIcon = (() => {
                if (disabled) return <Ionicons name="close" size={18} color={colors.accent} />;
                return (
                  <Animated.View style={{ transform: [{ rotate: anims[tDef.key].interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }] }}>
                    <Ionicons name="chevron-down" size={20} color={colors.accent} />
                  </Animated.View>
                );
              })();

              return (
                <View key={tDef.key} style={{ marginBottom: spacing.sm, borderRadius: radius.lg, overflow: "hidden", opacity: disabled ? 0.6 : 1 }}>
                  <TouchableOpacity
                    activeOpacity={disabled ? 1 : 0.9}
                    onPress={() => !disabled && toggleExpand(tDef.key)}
                  >
                    <LinearGradient colors={tDef.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: spacing.lg }}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          {tDef.icon}
                          <Text style={{ color: "#FFFFFF", fontFamily: 'Inter_700Bold', marginLeft: spacing.sm, marginRight: 14 }}>{t(`cause_list.${tDef.tKey}`)}</Text>
                          {!disabled ? (
                            <Text style={{ color: "#FFFFFF", opacity: 0.9 }}>{`  •  ${count} ${t("cause_list.available")}`}</Text>
                          ) : null}
                          {disabled ? (
                            <Text style={{ color: "#FFFFFF", opacity: 0.8, marginLeft: spacing.sm }}>{t("cause_list.not_available")}</Text>
                          ) : null}
                        </View>
                        {rightIcon}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Expanded Content */}
                  {isExpanded && !disabled ? (
                    <Animated.View
                      style={{
                        opacity: anims[tDef.key],
                        transform: [{ translateY: anims[tDef.key].interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
                        backgroundColor: "#111111",
                      }}
                    >
                      <View style={{ padding: spacing.md }}>
                        {items.map((item, idx) => (
                          <TouchableOpacity key={idx} activeOpacity={0.85} onPress={() => openUrlSafely(item.url)} style={{ paddingVertical: 10 }}>
                            <Text style={{ color: "#FFFFFF", fontFamily: 'Inter_400Regular' }}>{item.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </Animated.View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        )}


        {/* <View style={{ marginTop: spacing.md, alignItems: "center" }}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: "#111111", borderRadius: radius.lg }}>
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Close</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    
    </Modal>
  );
};

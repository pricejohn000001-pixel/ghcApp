import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View, Animated } from "react-native";
import Modal from "react-native-modal";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Feather } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from "react-i18next";

const BASE = "https://ghconline.gov.in/NewCList";
const DAILY_SUFFIXES = ["LokAdalat"];

const typeDefs = [
  { key: "dl", tKey: "daily", colors: ["#1E63D6", "#6C40FF"], icon: <AntDesign name="filetext1" size={20} color="#fff" /> },
  { key: "sl", tKey: "supplementary", colors: ["#10B981", "#0FA3B1"], icon: <Feather name="plus" size={20} color="#fff" /> },
  { key: "lz", tKey: "lawazima", colors: ["#F97316", "#F29F3F"], icon: <Feather name="anchor" size={20} color="#fff" /> },
  { key: "no", tKey: "notices", colors: ["#7F56D9", "#6C40FF"], icon: <Feather name="bell" size={20} color="#fff" /> },
];

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

async function probe(url) {
  try {
    const r = await fetch(url, { method: "HEAD" });
    if (r.ok) return true;
  } catch (_) {}
  try {
    const r = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/pdf", Range: "bytes=0-0" },
    });
    return r.ok;
  } catch (_) {
    return false;
  }
}

async function probeLinks(prefix, dateStr, labelBase, extraSuffixes = []) {
  const items = [];
  // 1. Base
  const base = `${BASE}/${prefix}-${dateStr}.pdf`;
  if (await probe(base)) items.push({ url: base, label: labelBase });

  // 2. Numeric suffixes
  for (let i = 1; i <= 10; i++) {
    const url = `${BASE}/${prefix}-${dateStr}-${i}.pdf`;
    if (await probe(url)) items.push({ url, label: `${labelBase} ${i}` });
  }

  // 3. Named suffixes
  for (const suffix of extraSuffixes) {
    const url = `${BASE}/${prefix}-${dateStr}-${suffix}.pdf`;
    if (await probe(url)) items.push({ url, label: `${labelBase} (${suffix})` });
  }

  return items;
}

async function buildAvailability(dateStr, labels) {
  const dl = await probeLinks("dl", dateStr, labels.daily, DAILY_SUFFIXES);
  if (dl.length === 0) {
    const alt = await findDailyFromPage(dateStr);
    if (alt) dl.push({ url: alt, label: labels.daily });
  }

  const sl = await probeLinks("sl", dateStr, labels.supplementary);
  const lz = await probeLinks("lz", dateStr, labels.lawazima);
  const no = await probeLinks("no", dateStr, labels.notice);

  return { dl, sl, lz, no };
}

async function findDailyFromPage(dateStr) {
  try {
    const r = await fetch("https://ghconline.gov.in/index.php/consolidated-cause-list/", { method: "GET" });
    if (!r.ok) return null;
    const html = await r.text();
    const re = new RegExp(`https://ghconline\\.gov\\.in/NewCList/dl-${dateStr}[^"']*\\.pdf`, "gi");
    const m = html.match(re);
    if (m && m.length > 0) return m[0];
  } catch (_) {}
  return null;
}

export const CauseListModal = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    if (visible) {
      setToday(new Date());
    }
  }, [visible]);

  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);

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

  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);

  const labels = useMemo(() => ({
    daily: t("cause_list.daily"),
    supplementary: t("cause_list.supplementary"),
    lawazima: t("cause_list.lawazima"),
    notice: t("cause_list.notice"),
  }), [t]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [a, b] = await Promise.all([
          buildAvailability(todayStr, labels),
          buildAvailability(tomorrowStr, labels)
        ]);
        if (mounted) setData({ today: a, tomorrow: b });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [todayStr, tomorrowStr, labels]);

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
    <Modal isVisible={visible} onBackdropPress={onClose} style={{ margin: 0, padding: spacing.lg, justifyContent: "center", alignItems: "center" }}>
      <View style={{ backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.lg, width: "100%" }}>
        <View style={{ marginBottom: spacing.md, alignItems: "center" }}>
          <Text style={{ fontWeight: "800", fontSize: 18, color: "#fff" }}>{t("cause_list.title")}</Text>
          <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap", justifyContent: "center" }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setActiveDateKey("today")}
              style={{ flex: 1, minWidth: 0, alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.lg, backgroundColor: activeDateKey === "today" ? "#1E63D6" : "#132A52" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", textAlign: "center" }}>{t("cause_list.today")}</Text>
              <Text style={{ color: "#fff", opacity: 0.8, fontSize: 12, textAlign: "center" }}>{todayStr}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setActiveDateKey("tomorrow")}
              style={{ flex: 1, minWidth: 0, alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.lg, backgroundColor: activeDateKey === "tomorrow" ? "#1E63D6" : "#132A52" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", textAlign: "center" }}>{t("cause_list.tomorrow")}</Text>
              <Text style={{ color: "#fff", opacity: 0.8, fontSize: 12, textAlign: "center" }}>{tomorrowStr}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: spacing.lg }}>
            <ActivityIndicator color="#fff" size="large" />
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
                if (disabled) return <AntDesign name="close" size={18} color="#fff" />;
                return (
                  <Animated.View style={{ transform: [{ rotate: anims[tDef.key].interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }] }}>
                    <Feather name="chevron-down" size={20} color="#fff" />
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
                          <Text style={{ color: "#fff", fontWeight: "700", marginLeft: spacing.sm, marginRight: 14 }}>{t(`cause_list.${tDef.tKey}`)}</Text>
                          {!disabled ? (
                            <Text style={{ color: "#fff", opacity: 0.9 }}>{`  •  ${count} ${t("cause_list.available")}`}</Text>
                          ) : null}
                          {disabled ? (
                            <Text style={{ color: "#fff", opacity: 0.8, marginLeft: spacing.sm }}>{t("cause_list.not_available")}</Text>
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
                        backgroundColor: "#132A52",
                      }}
                    >
                      <View style={{ padding: spacing.md }}>
                        {items.map((item, idx) => (
                          <TouchableOpacity key={idx} activeOpacity={0.85} onPress={() => openUrlSafely(item.url)} style={{ paddingVertical: 10 }}>
                            <Text style={{ color: "#fff" }}>{item.label}</Text>
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
          <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: "#132A52", borderRadius: radius.lg }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </Modal>
  );
};

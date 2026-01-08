import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Animated, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing } from "../theme";
import app from "../api";

const normalizeYouTubeLink = (raw) => {
  let s = String(raw || "").trim();
  s = s.replace(/^"+|"+$/g, "");
  s = s.replace(/\\\//g, "/");
  s = s.replace(/\\u0026/g, "&");
  if (/youtube\.com\/watch\?/.test(s)) return s;
  let m = s.match(/youtube\.com\/embed\/([A-Za-z0-9_-]+)(.*)$/);
  if (m) {
    const id = m[1];
    const rest = m[2] || "";
    const qIndex = rest.indexOf("?");
    const extra = qIndex !== -1 ? rest.substring(qIndex).replace(/^\?/, "&") : "";
    return `https://www.youtube.com/watch?v=${id}${extra}`;
  }
  m = s.match(/youtu\.be\/([A-Za-z0-9_-]+)(\?.*)?$/);
  if (m) {
    const id = m[1];
    const qs = m[2] ? m[2].replace(/^\?/, "&") : "";
    return `https://www.youtube.com/watch?v=${id}${qs}`;
  }
  m = s.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]+)(\?.*)?$/);
  if (m) {
    const id = m[1];
    const qs = m[2] ? m[2].replace(/^\?/, "&") : "";
    return `https://www.youtube.com/watch?v=${id}${qs}`;
  }
  return s;
};

export const CourtLinks = ({ onSelect, scrollY }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const currentDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const load = async () => {
    setError(null);
    const linkRequest = {
      method: "GET",
      url: "/ghc_display/API/get_court_link.php",
      params: { api_key: 18062013, date: currentDate },
      responseType: "json",
      headers: { Accept: "application/json, text/plain, */*" },
    };
    app.invokeApi(linkRequest, (data, isError) => {
      let list = [];
      if (!isError) {
        if (Array.isArray(data)) {
          list = data;
        } else if (typeof data === "string") {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) list = parsed;
          } catch (_) {}
        } else if (data && Array.isArray(data.data)) {
          list = data.data;
        } else if (data && typeof data === "object") {
          const firstArray = Object.values(data).find((v) => Array.isArray(v));
          if (firstArray) list = firstArray;
        }
        if (Array.isArray(list)) {
          try {
            list.sort((a, b) => {
              const ax = Number(a?.c_no);
              const bx = Number(b?.c_no);
              if (isNaN(ax) && isNaN(bx)) return 0;
              if (isNaN(ax)) return 1;
              if (isNaN(bx)) return -1;
              return ax - bx;
            });
          } catch (_) {}
        }
        setItems(list);
        if (list.length === 0) setError(null);
      } else {
        setError(t("court_links.error"));
      }
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={styles.loadingText}>{t("court_links.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Animated.FlatList
        data={items}
        keyExtractor={(item, idx) => String(item?.c_no ?? idx)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            activeOpacity={0.85}
            onPress={() => onSelect && onSelect(normalizeYouTubeLink(item?.link))}
          >
            <View style={styles.badge}><Text style={styles.badgeText}>{String(item?.c_no ?? "-")}</Text></View>
            <View style={styles.itemTextBlock}>
              <Text style={styles.itemTitle}>{t("court_links.court_prefix")} {String(item?.c_no ?? "-")}</Text>
              <Text style={styles.itemSub}>{t("court_links.tap_to_open")}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !error ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}><AntDesign name="youtube" size={40} color="#ADB9D8" /></View>
              <Text style={styles.emptyTitle}>{t("court_links.no_streams")}</Text>
              <Text style={styles.emptySub}>{t("court_links.check_back")}</Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor="#fff"
          />
        }
        onScroll={
          scrollY
            ? Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )
            : undefined
        }
        scrollEventThrottle={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, paddingHorizontal: spacing.lg},
  listContent: { paddingBottom: spacing.xl, flexGrow: 1 },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, gap: spacing.sm },
  loadingText: { color: "#fff", fontSize: 14 },
  errorText: { color: "#ffb4b4", textAlign: "center", marginBottom: spacing.md },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: "#132A52", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: spacing.sm },
  emptySub: { color: colors.textSecondary, fontSize: 12 },
  item: {
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: "#0B1A38",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1F3B70",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  itemTextBlock: { flex: 1 },
  itemTitle: { color: "#0B1B3A", fontWeight: "700", fontSize: 16 },
  itemSub: { color: "#6B7280", fontSize: 12, marginTop: 2 },
});

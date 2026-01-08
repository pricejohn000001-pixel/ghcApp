import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, AppState, useWindowDimensions, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, Feather } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from "react-i18next";

const logo = require("../assets/logo.png");

export const Header = ({ onMenu, onSearch, scrollY }) => {
  const { t } = useTranslation();
  const monthNames = t("months", { returnObjects: true });
  const { width } = useWindowDimensions();

  const [now, setNow] = useState(new Date());
  const [welcomeHeight, setWelcomeHeight] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setNow(new Date());
      }
    });
    return () => subscription.remove();
  }, []);

  const dateText = `${String(now.getDate()).padStart(2, "0")} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  return (
    <LinearGradient colors={["#0F2349", colors.primary]} style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <View style={styles.brandTextBlock}>
            <Text style={styles.brand}>{t("header.title")}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={onMenu} activeOpacity={0.8} style={styles.menuButton}>
                <Entypo name="menu" size={22} color="#fff" />
            </TouchableOpacity>
        </View>
      </View>
      <Animated.View
        style={[
          styles.welcomeCard,
          {
            overflow: 'hidden',
            marginTop: scrollY
              ? scrollY.interpolate({ inputRange: [0, 100], outputRange: [spacing.md, 0], extrapolate: 'clamp' })
              : spacing.md,
            height:
              scrollY && welcomeHeight
                ? scrollY.interpolate({ inputRange: [0, 200], outputRange: [welcomeHeight, 0], extrapolate: 'clamp' })
                : undefined,
            opacity: scrollY
              ? scrollY.interpolate({ inputRange: [0, 60], outputRange: [1, 0], extrapolate: 'clamp' })
              : 1,
          },
        ]}
        onLayout={(e) => {
          if (!welcomeHeight) {
            setWelcomeHeight(e.nativeEvent.layout.height);
          }
        }}
      >
        <View>
          <Text style={styles.welcomeLabel}>{t("header.welcome")}</Text>
          <Text style={styles.dateText}>{dateText}</Text>
        </View>
      </Animated.View>
      <Animated.View
        style={{
          marginTop: scrollY
            ? scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [spacing.md, -12],
                extrapolate: 'clamp',
              })
            : spacing.md,
        }}
      >
        <TouchableOpacity 
          style={styles.searchTrigger}
          activeOpacity={0.85} 
          onPress={onSearch}>
          <Feather name="search" size={18} color={colors.textSecondary} />
          <Text style={styles.searchText}>{t("search.trigger", "Search cases, orders, cause list...")}</Text>
        </TouchableOpacity>
      </Animated.View>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: 12,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logo: {
    width: 56,
    height: 56,
  },
  brandTextBlock: { marginLeft: 12 },
  brand: { color: "#fff", fontSize: 18, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 9 },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: "#112951",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#264172",
    borderWidth: 1,
  },
  welcomeCard: {
    marginTop: spacing.md,
    backgroundColor: "#0F2B57",
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchTrigger: {
    backgroundColor: "#0F2B57",
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
  welcomeLabel: { color: colors.textSecondary, fontSize: 14 },
  dateText: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 2 },
  
});

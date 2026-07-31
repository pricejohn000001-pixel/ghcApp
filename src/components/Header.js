import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, AppState, useWindowDimensions, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme";
import { useTranslation } from "react-i18next";
import { formatLocalizedNumber } from "../utils/localization";

const logo = require("../assets/logo.png");
const japi = require("../assets/japi.png");

export const Header = ({ onMenu, onSearch, scrollY, isHome }) => {
  const { theme, colors, radius, spacing, fonts } = useAppTheme();
  const { t, i18n } = useTranslation();
  const monthNames = t("months", { returnObjects: true });
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = useEffectStyles(colors, radius, spacing, fonts);

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

  const dateText = `${formatLocalizedNumber(String(now.getDate()).padStart(2, "0"), i18n.language)} ${monthNames[now.getMonth()]} ${formatLocalizedNumber(now.getFullYear(), i18n.language)}`;
  return (
    <LinearGradient colors={theme.gradients.header} style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 12 }]}>
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <View style={styles.brandTextBlock}>
            <Text style={styles.brand}>{t("header.title")}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={onMenu} activeOpacity={0.8} style={styles.menuButton}>
                <Ionicons name="menu" size={22} color={colors.accent} />
            </TouchableOpacity>
        </View>
      </View>
      {isHome && (
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
          <View style={styles.japiContainer}>
            <Image source={japi} style={styles.japiIcon} resizeMode="contain" />
          </View>
        </Animated.View>
      )}
      <Animated.View
        style={{
          marginTop: isHome 
            ? (scrollY
                ? scrollY.interpolate({
                    inputRange: [0, 100],
                    outputRange: [spacing.md, -12],
                    extrapolate: 'clamp',
                  })
                : spacing.md)
            : spacing.xs, // Use smaller margin when welcome card is hidden
        }}
      >
        <TouchableOpacity 
          style={styles.searchTrigger}
          activeOpacity={0.85} 
          onPress={onSearch}>
          <Ionicons name="search" size={18} color={colors.accent} />
          <Text style={styles.searchText}>{t("search.trigger", "Search cases, orders, cause list...")}</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const useEffectStyles = (colors, radius, spacing, fonts) =>
  React.useMemo(
    () =>
      StyleSheet.create({
        header: {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
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
        brand: { color: colors.textPrimary, fontSize: 18, fontFamily: fonts.heading },
        subtitle: { color: colors.textSecondary, fontSize: 9, fontFamily: fonts.body },
        menuButton: {
          width: 40,
          height: 40,
          borderRadius: radius.lg,
          backgroundColor: colors.card,
          alignItems: "center",
          justifyContent: "center",
          borderColor: colors.border,
          borderWidth: 1,
        },
        welcomeCard: {
          marginTop: spacing.md,
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: 14,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        searchTrigger: {
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          paddingVertical: 10,
          paddingHorizontal: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
        },
        searchText: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.bodySemiBold },
        welcomeLabel: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.body },
        dateText: { color: colors.textPrimary, fontSize: 16, fontFamily: fonts.bodyBold, marginTop: 2 },
        japiContainer: {
          position: "absolute",
          right: -40,
          top: -10,
          bottom: -10,
          justifyContent: "center",
        },
        japiIcon: {
          width: 100,
          height: 100,
          opacity: 0.5,
        },
      }),
    [colors, fonts, radius, spacing]
  );

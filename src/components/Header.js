import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, AppState, useWindowDimensions, Animated, Modal, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from "react-i18next";

const logo = require("../assets/logo.png");
const japi = require("../assets/japi.png");

export const Header = ({ onMenu, onSearch, scrollY, isHome }) => {
  const { t } = useTranslation();
  const monthNames = t("months", { returnObjects: true });
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [now, setNow] = useState(new Date());
  const [welcomeHeight, setWelcomeHeight] = useState(0);
  const [buildInfoVisible, setBuildInfoVisible] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const lastTapRef = React.useRef(0);

  const handleDatePress = () => {
    const nowTs = Date.now();
    if (nowTs - lastTapRef.current < 500) {
      const newCount = tapCount + 1;
      if (newCount >= 7) {
        setBuildInfoVisible(true);
        setTapCount(0);
      } else {
        setTapCount(newCount);
      }
    } else {
      setTapCount(1);
    }
    lastTapRef.current = nowTs;
  };

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
    <LinearGradient colors={["#000000", "#000000"]} style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 12 }]}>
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <View style={styles.brandTextBlock}>
            <Text style={styles.brand}>{t("header.title")}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={onMenu} activeOpacity={0.8} style={styles.menuButton}>
                <Entypo name="menu" size={22} color={colors.accent} />
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
          <Pressable onPress={handleDatePress}>
            <Text style={styles.welcomeLabel}>{t("header.welcome")}</Text>
            <Text style={styles.dateText}>{dateText}</Text>
          </Pressable>
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
          <Feather name="search" size={18} color={colors.accent} />
          <Text style={styles.searchText}>{t("search.trigger", "Search cases, orders, cause list...")}</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={buildInfoVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBuildInfoVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setBuildInfoVisible(false)}
        >
          <View style={styles.buildInfoCard}>
            <View style={styles.buildInfoHeader}>
              <Feather name="info" size={20} color={colors.accent} />
              <Text style={styles.buildInfoTitle}>System Information</Text>
            </View>
            <View style={styles.buildInfoBody}>
              <View style={styles.buildInfoRow}>
                <Text style={styles.buildInfoLabel}>Build:</Text>
                <Text style={styles.buildInfoValue}>GHC-APP</Text>
              </View>
              <View style={styles.buildInfoRow}>
                <Text style={styles.buildInfoLabel}>Developed by:</Text>
                <Text style={styles.buildInfoValue}>Sahil Amin</Text>
              </View>
              <View style={styles.buildInfoRow}>
                <Text style={styles.buildInfoLabel}>Email:</Text>
                <Text style={styles.buildInfoValue}>sahilamin68@gmail.com</Text>
              </View>
              <View style={styles.buildInfoRow}>
                <Text style={styles.buildInfoLabel}>Build Date:</Text>
                <Text style={styles.buildInfoValue}>May 2026</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.buildInfoClose} 
              onPress={() => setBuildInfoVisible(false)}
            >
              <Text style={styles.buildInfoCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
  brand: { color: "#FFFFFF", fontSize: 18, fontFamily: 'Georgia' },
  subtitle: { color: colors.textSecondary, fontSize: 9, fontFamily: 'Inter_400Regular' },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#333333",
    borderWidth: 1,
  },
  welcomeCard: {
    marginTop: spacing.md,
    backgroundColor: "#111111",
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchTrigger: {
    backgroundColor: "#111111",
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchText: { color: colors.textSecondary, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  welcomeLabel: { color: colors.textSecondary, fontSize: 14, fontFamily: 'Inter_400Regular' },
  dateText: { color: "#FFFFFF", fontSize: 16, fontFamily: 'Inter_700Bold', marginTop: 2 },
  japiContainer: {
    position: 'absolute',
    right: -40,
    top: -10,
    bottom: -10,
    justifyContent: 'center',
  },
  japiIcon: {
    width: 100,
    height: 100,
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  buildInfoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333333',
  },
  buildInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: spacing.md,
  },
  buildInfoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  buildInfoBody: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  buildInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buildInfoLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  buildInfoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  buildInfoClose: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buildInfoCloseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});

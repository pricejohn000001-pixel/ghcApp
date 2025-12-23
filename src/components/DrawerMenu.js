import React, { useMemo, useRef, useState, useEffect } from "react";
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logo = require("../assets/logo.png");

const importantLinks = [
  "link_sci",
  "link_sclsc",
  "link_ghclsc",
  "link_lri",
  "link_jjc",
  "link_bar",
  "link_med",
  "link_ja",
  "link_lawmin",
];

const judgesItems = [
  "judges_sc_sitting",
  "judges_sc_former",
  "judges_ghc_former_cj",
  "judges_ghc_former",
  "judges_transferred",
];

const benchesItems = [
  "bench_kohima",
  "bench_aizawl",
  "bench_itanagar",
];

const registryItems = [
  "reg_former_gen",
  "reg_former_vig",
  "reg_former_sec",
  "reg_former_jud",
  "reg_former_admin",
  "reg_former_est",
];

const recruitmentItems = [
  "recruitment_judicial",
  "recruitment_principal",
  "recruitment_district",
  "recruitment_other",
  "recruitment_papers",
];

const ebookItems = [
  "ebook_history",
  "ebook_platinum",
];

export const DrawerMenu = ({ visible, onClose, onItemPress, activeItemLabel, expandSection }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = async (lang) => {
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };

  const sections = useMemo(
    () => [
      { key: "judges", title: t("drawer.judges"), items: judgesItems, icon: <AntDesign name="team" size={18} color="#fff" /> },
      { key: "benches", title: t("drawer.benches"), items: benchesItems, icon: <AntDesign name="bank" size={18} color="#fff" /> },
      { key: "reg_present", title: t("drawer.items.reg_present"), type: "single", icon: <AntDesign name="profile" size={18} color="#fff" /> },
      { key: "registry", title: t("drawer.registry"), items: registryItems, icon: <AntDesign name="profile" size={18} color="#fff" /> },
      { key: "district_courts", title: t("drawer.district_courts"), type: "single", icon: <AntDesign name="home" size={18} color="#fff" /> },
      { key: "recruitments", title: t("drawer.recruitments"), items: recruitmentItems, icon: <AntDesign name="addusergroup" size={18} color="#fff" /> },
      { key: "ebooks", title: t("drawer.ebooks"), items: ebookItems, icon: <Feather name="book" size={18} color="#fff" /> },
      { key: "links", title: t("drawer.links"), items: importantLinks, icon: <AntDesign name="link" size={18} color="#fff" /> },
    ],
    [t]
  );

  const [expanded, setExpanded] = useState({ judges: false, benches: false, registry: false, links: false, recruitments: false, ebooks: false });
  const [shown, setShown] = useState({ judges: false, benches: false, registry: false, links: false, recruitments: false, ebooks: false });
  const animsRef = useRef(
    sections.reduce((acc, s) => {
      if (s.type === "single") return acc;
      acc[s.key] = new Animated.Value(expanded[s.key] ? 1 : 0);
      return acc;
    }, {})
  );

  const toggle = (key) => {
    const v = animsRef.current[key];
    if (!v) return;
    if (expanded[key]) {
      Animated.timing(v, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setShown((s) => ({ ...s, [key]: false }));
      });
      setExpanded((e) => ({ ...e, [key]: false }));
    } else {
      setShown((s) => ({ ...s, [key]: true }));
      v.setValue(0);
      Animated.timing(v, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      setExpanded((e) => ({ ...e, [key]: true }));
    }
  };

  useEffect(() => {
    if (visible && expandSection && !expanded[expandSection]) {
      // Direct expansion without toggle logic to avoid closure issues if needed, 
      // but toggle is fine if expanded is fresh. 
      // Actually toggle checks 'expanded' from closure.
      // So we should manually set it.
      const v = animsRef.current[expandSection];
      if (v) {
         setShown((s) => ({ ...s, [expandSection]: true }));
         v.setValue(0);
         Animated.timing(v, { toValue: 1, duration: 200, useNativeDriver: true }).start();
         setExpanded((e) => ({ ...e, [expandSection]: true }));
      }
    }
  }, [visible, expandSection]);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      style={styles.drawerModal}
    >
      <View style={styles.drawer}>
        <View style={styles.drawerHeader}>
          <Image source={logo} style={styles.drawerAvatar} />
          <View style={styles.drawerText}>
            <Text style={styles.drawerTitle}>{t("drawer.title")}</Text>
          </View>
          <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
            <AntDesign name="close" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Language Switcher */}
          <View style={styles.langContainer}>
            <Text style={styles.langLabel}>{t("drawer.language")}</Text>
            <View style={styles.langButtons}>
              <TouchableOpacity
                style={[styles.langButton, i18n.language === 'en' && styles.langButtonActive]}
                onPress={() => changeLanguage('en')}
              >
                <Text style={[styles.langButtonText, i18n.language === 'en' && styles.langButtonTextActive]}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langButton, i18n.language === 'as' && styles.langButtonActive]}
                onPress={() => changeLanguage('as')}
              >
                <Text style={[styles.langButtonText, i18n.language === 'as' && styles.langButtonTextActive]}>অসমীয়া</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {sections.map((section) => {
            if (section.type === "single") {
              return (
                <TouchableOpacity
                  key={section.key}
                  style={styles.drawerItem}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (onItemPress) onItemPress(section.key);
                    if (onClose) onClose();
                  }}
                >
                  <View style={styles.drawerIcon}>{section.icon}</View>
                  <Text style={styles.drawerItemLabel}>{section.title}</Text>
                </TouchableOpacity>
              );
            }

            const v = animsRef.current[section.key];
            const animatedStyle = {
              opacity: v,
              transform: [
                {
                  translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }),
                },
              ],
            };

            return (
              <View key={section.key}>
                <TouchableOpacity style={styles.drawerItem} activeOpacity={0.85} onPress={() => toggle(section.key)}>
                  <View style={styles.drawerIcon}>{section.icon}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.drawerItemLabel}>{section.title}</Text>
                  </View>
                  <AntDesign name={expanded[section.key] ? "up" : "down"} size={16} color="#ADB9D8" />
                </TouchableOpacity>
                {shown[section.key] ? (
                  <Animated.View style={[styles.submenuWrap, animatedStyle]}>
                    <View style={styles.submenuList}>
                      {section.items.map((itemKey) => (
                        <TouchableOpacity
                          key={itemKey}
                          style={[styles.submenuCard, activeItemLabel === itemKey && styles.submenuCardActive]}
                          activeOpacity={0.9}
                          onPress={() => {
                            if (onItemPress) onItemPress(itemKey);
                            if (onClose) onClose();
                          }}
                        >
                          <View style={styles.submenuIcon}><AntDesign name="right" size={14} color="#ADB9D8" /></View>
                          <Text style={[styles.submenuLabel, activeItemLabel === itemKey && styles.submenuLabelActive]}>
                            {t(`drawer.items.${itemKey}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Animated.View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        <Text style={styles.drawerFooter}>{t("home.hero_subtitle")}</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  drawerModal: { margin: 0, justifyContent: "flex-start", alignItems: "flex-end" },
  drawer: {
    width: "72%",
    backgroundColor: "#0D1B38",
    height: "100%",
    padding: spacing.lg,
    paddingTop: 48,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },
  drawerHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  drawerAvatar: { width: 44, height: 44, resizeMode: "contain" },
  drawerText: { flex: 1, marginLeft: spacing.md },
  drawerTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  drawerSubtitle: { color: colors.textSecondary, fontSize: 12 },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 10,
  },
  drawerIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: "#13274C",
    alignItems: "center",
    justifyContent: "center",
  },
  drawerItemLabel: { color: "#fff", fontWeight: "700" },
  drawerHint: { color: colors.textSecondary, fontSize: 12 },
  submenuWrap: { overflow: "hidden" },
  submenuList: { paddingLeft: 44, paddingRight: 4, gap: 8 },
  submenuCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#13274C",
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  submenuCardActive: {
    backgroundColor: "#1B3A6B",
    borderWidth: 1,
    borderColor: "#335C9D",
  },
  submenuIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#0E2043", alignItems: "center", justifyContent: "center" },
  submenuLabel: { color: "#E7ECF6", fontSize: 13, flex: 1 },
  submenuLabelActive: { color: "#FFFFFF" },
  drawerFooter: { color: colors.textSecondary, fontSize: 12, marginTop: spacing.md },
  langContainer: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: "#13274C",
    borderRadius: radius.md,
  },
  langLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  langButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  langButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: radius.sm,
    backgroundColor: "#0E2043",
  },
  langButtonActive: {
    backgroundColor: colors.primary,
  },
  langButtonText: {
    color: "#ADB9D8",
    fontSize: 12,
    fontWeight: "600",
  },
  langButtonTextActive: {
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: "#1E3A63",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
});

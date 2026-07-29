import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Pressable } from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { themes, useAppTheme, withAlpha } from "../theme";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logo = require("../assets/logo.png");

const importantLinks = [
  "link_sci",
  "link_sclsc",
  "link_ghclsc",
  "link_med",
  "link_ja",
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

const noticeItems = [
  "notice_joleave",
  "notice_general",
  {
    id: "notice_promo_transfer",
    children: ["notice_promo_transfer_judicial"],
  },
  "notice_training",
  "notice_ict",
];

const promotionTransferItems = [
  "notice_promo_transfer_judicial",
];

export const DrawerMenu = ({ visible, onClose, onItemPress, activeItemLabel, expandSection }) => {
  const { theme, colors, radius, spacing, fonts, availableThemes, themeName, setThemeName } = useAppTheme();
  const { t, i18n } = useTranslation();
  const styles = useMemo(() => createStyles(colors, radius, spacing, fonts), [colors, radius, spacing, fonts]);

  const changeLanguage = async (lang) => {
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };

  const sections = useMemo(
    () => [
      { key: "judges", title: t("drawer.judges"), items: judgesItems, icon: <Ionicons name="people" size={18} color={colors.accent} /> },
      { key: "reg_present", title: t("drawer.items.reg_present"), type: "single", icon: <Ionicons name="person" size={18} color={colors.accent} /> },
      { key: "benches", title: t("drawer.benches"), items: benchesItems, icon: <Ionicons name="business" size={18} color={colors.accent} /> },
      { key: "notice_board", title: t("drawer.notice_board"), items: noticeItems, icon: <Ionicons name="notifications" size={18} color={colors.accent} /> },
      { key: "district_courts", title: t("drawer.district_courts"), type: "single", icon: <Ionicons name="home" size={18} color={colors.accent} /> },
      { key: "recruitments", title: t("drawer.recruitments"), items: recruitmentItems, icon: <Ionicons name="person-add" size={18} color={colors.accent} /> },
      { key: "ebooks", title: t("drawer.ebooks"), items: ebookItems, icon: <Ionicons name="book" size={18} color={colors.accent} /> },
      { key: "links", title: t("drawer.links"), items: importantLinks, icon: <Ionicons name="link" size={18} color={colors.accent} /> },
    ],
    [colors.accent, t]
  );

  const [expanded, setExpanded] = useState({ judges: false, benches: false, links: false, recruitments: false, ebooks: false, notice_board: false });
  const [shown, setShown] = useState({ judges: false, benches: false, links: false, recruitments: false, ebooks: false, notice_board: false });
  const [prefsExpanded, setPrefsExpanded] = useState(false);
  const [prefsShown, setPrefsShown] = useState(false);
  const prefsAnim = useRef(new Animated.Value(0)).current;
  const [nestedExpanded, setNestedExpanded] = useState({});
  const [nestedShown, setNestedShown] = useState({});
  const scrollRef = useRef(null);
  const sectionTopsRef = useRef({});
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
      const top = sectionTopsRef.current[key] ?? 0;
      if (scrollRef.current) scrollRef.current.scrollTo({ y: Math.max(top - 8, 0), animated: true });
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
         const top = sectionTopsRef.current[expandSection] ?? 0;
         if (scrollRef.current) scrollRef.current.scrollTo({ y: Math.max(top - 8, 0), animated: true });
      }
    }
  }, [visible, expandSection]);

  return (
    <Modal backdropColor={colors.primaryDark} backdropOpacity={0.7} hideModalContentWhileAnimating={true} useNativeDriverForBackdrop={true}
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      style={styles.drawerModal}
    >
      <BlurView intensity={70} tint={theme.blurTint} style={styles.drawer}>
        <View style={styles.drawerHeader}>
          <Image source={logo} style={styles.drawerAvatar} />
          <View style={styles.drawerText}>
            <Text style={styles.drawerTitle}>{t("drawer.title")}</Text>
          </View>
          <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.preferencesSection}>
            <TouchableOpacity
              style={[styles.drawerItem, styles.preferencesHeader]}
              activeOpacity={0.85}
              onPress={() => {
                if (prefsExpanded) {
                  Animated.timing(prefsAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                  }).start(({ finished }) => {
                    if (finished) setPrefsShown(false);
                  });
                  setPrefsExpanded(false);
                } else {
                  setPrefsShown(true);
                  prefsAnim.setValue(0);
                  Animated.timing(prefsAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                  }).start();
                  setPrefsExpanded(true);
                }
              }}
            >
              <View style={styles.drawerIcon}>
                <Ionicons name="settings" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.drawerItemLabel}>{t("drawer.preferences", "Preferences")}</Text>
              </View>
            </TouchableOpacity>

            {prefsShown ? (
              <Animated.View
                style={[
                  styles.preferencesContent,
                  {
                    opacity: prefsAnim,
                    transform: [
                      {
                        translateY: prefsAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }),
                      },
                    ],
                  },
                ]}
              >
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

                <View style={styles.themeSection}>
                  <Text style={styles.langLabel}>{t("drawer.theme")}</Text>
                  <View style={styles.themeGroup}>
                    {availableThemes.map((themeOpt) => {
                      const palette = themes[themeOpt.name];
                      const isActive = themeName === themeOpt.name;

                      return (
                        <TouchableOpacity
                          key={themeOpt.name}
                          activeOpacity={0.9}
                          style={[styles.themeOption, isActive && styles.themeOptionActive]}
                          onPress={() => setThemeName(themeOpt.name)}
                        >
                          <View style={styles.themeOptionLeft}>
                            <View style={[styles.themeSwatch, { backgroundColor: palette.colors.accent }]} />
                            <Text style={styles.themeOptionTitle}>{t(`drawer.themes.${themeOpt.name}`, themeOpt.label)}</Text>
                          </View>

                          <View style={styles.themeOptionRight}>
                            {isActive ? <View style={styles.selectedDot} /> : <View style={styles.unselectedDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </Animated.View>
            ) : null}
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
              <View key={section.key} onLayout={(e) => { sectionTopsRef.current[section.key] = e.nativeEvent.layout.y; }}>
                <TouchableOpacity style={styles.drawerItem} activeOpacity={0.85} onPress={() => toggle(section.key)}>
                  <View style={styles.drawerIcon}>{section.icon}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.drawerItemLabel}>{section.title}</Text>
                  </View>
                  <Ionicons name={expanded[section.key] ? "chevron-up" : "chevron-down"} size={16} color={colors.accent} />
                </TouchableOpacity>
                {shown[section.key] ? (
                  <Animated.View style={[styles.submenuWrap, animatedStyle]}>
                    <View style={styles.submenuList}>
                      {section.items.map((item) => {
                        // Check if item has nested children
                        if (typeof item === 'object' && item.children) {
                          const nestedKey = `${section.key}_${item.id}`;
                          const nestedV = animsRef.current[nestedKey] || new Animated.Value(nestedExpanded[nestedKey] ? 1 : 0);
                          animsRef.current[nestedKey] = nestedV;
                          
                          const nestedAnimStyle = {
                            opacity: nestedV,
                            transform: [
                              {
                                translateY: nestedV.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }),
                              },
                            ],
                          };
                          
                          const nestedArrowRotation = new Animated.Value(nestedExpanded[nestedKey] ? 1 : 0);
                          
                          const toggleNested = () => {
                            const currentExpanded = nestedExpanded[nestedKey];
                            if (currentExpanded) {
                              Animated.timing(nestedV, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
                                if (finished) setNestedShown((s) => ({ ...s, [nestedKey]: false }));
                              });
                              Animated.timing(nestedArrowRotation, { toValue: 0, duration: 200, useNativeDriver: true }).start();
                              setNestedExpanded((e) => ({ ...e, [nestedKey]: false }));
                            } else {
                              setNestedShown((s) => ({ ...s, [nestedKey]: true }));
                              nestedV.setValue(0);
                              Animated.timing(nestedV, { toValue: 1, duration: 200, useNativeDriver: true }).start();
                              Animated.timing(nestedArrowRotation, { toValue: 1, duration: 200, useNativeDriver: true }).start();
                              setNestedExpanded((e) => ({ ...e, [nestedKey]: true }));
                            }
                          };
                          
                          const arrowRotationStyle = {
                            transform: [
                              {
                                rotate: nestedArrowRotation.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '90deg'],
                                }),
                              },
                            ],
                          };
                          
                          return (
                            <View key={item.id}>
                              <TouchableOpacity
                                style={styles.submenuCard}
                                activeOpacity={0.9}
                                onPress={toggleNested}
                              >
                                <Animated.View style={[styles.submenuIcon, arrowRotationStyle]}><Ionicons name="chevron-forward" size={14} color={colors.accent} /></Animated.View>
                                <Text style={styles.submenuLabel}>
                                  {t(`drawer.items.${item.id}`, item.id)}
                                </Text>
                              </TouchableOpacity>
                              {nestedShown[nestedKey] ? (
                                <Animated.View style={[styles.nestedSubmenuWrap, nestedAnimStyle]}>
                                  <View style={styles.nestedSubmenuList}>
                                    {item.children.map((childKey) => (
                                      <TouchableOpacity
                                        key={childKey}
                                        style={[styles.nestedSubmenuCard, activeItemLabel === childKey && styles.nestedSubmenuCardActive]}
                                        activeOpacity={0.9}
                                        onPress={() => {
                                          if (onItemPress) onItemPress(childKey);
                                          if (onClose) onClose();
                                        }}
                                      >
                                        <View style={styles.nestedSubmenuIcon}><Ionicons name="checkmark" size={12} color={colors.accent} /></View>
                                        <Text style={[styles.nestedSubmenuLabel, activeItemLabel === childKey && styles.nestedSubmenuLabelActive]}>
                                          {t(`drawer.items.${childKey}`, childKey)}
                                        </Text>
                                      </TouchableOpacity>
                                    ))}
                                  </View>
                                </Animated.View>
                              ) : null}
                            </View>
                          );
                        }
                        
                        // Regular string item
                        const itemKey = item;
                        return (
                          <TouchableOpacity
                            key={itemKey}
                            style={[styles.submenuCard, activeItemLabel === itemKey && styles.submenuCardActive]}
                            activeOpacity={0.9}
                            onPress={() => {
                              if (onItemPress) onItemPress(itemKey);
                              if (onClose) onClose();
                            }}
                          >
                            <View style={styles.submenuIcon}><Ionicons name="chevron-forward" size={14} color={colors.accent} /></View>
                            <Text style={[styles.submenuLabel, activeItemLabel === itemKey && styles.submenuLabelActive]}>
                              {t(`drawer.items.${itemKey}`)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </Animated.View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        <Text style={styles.drawerFooter}>{t("home.hero_subtitle")}</Text>
      </BlurView>
    
    </Modal>
  );
};

const createStyles = (colors, radius, spacing, fonts) =>
  StyleSheet.create({
    drawerModal: { margin: 0, justifyContent: "flex-start", alignItems: "flex-end" },
    drawer: {
      width: "84%",
      maxWidth: 360,
      backgroundColor: colors.cardSubtle,
      height: "100%",
      padding: spacing.md,
      paddingTop: 40,
    },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: spacing.xl },
    drawerHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
    drawerAvatar: { width: 40, height: 40, resizeMode: "contain" },
    drawerText: { flex: 1, marginLeft: spacing.sm },
    drawerTitle: { color: colors.textPrimary, fontFamily: fonts.heading, fontSize: 16 },
    drawerSubtitle: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.body },
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
      backgroundColor: colors.cardAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    drawerItemLabel: { color: colors.textPrimary, fontFamily: fonts.bodySemiBold },
    drawerHint: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.body },
    submenuWrap: { overflow: "hidden", marginBottom: 0 },
    submenuList: { paddingLeft: 44, paddingRight: 4, gap: 8, marginBottom: 8 },
    submenuCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.cardAlt,
      borderRadius: radius.lg,
      paddingVertical: 10,
      paddingHorizontal: spacing.md,
    },
    submenuCardActive: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    submenuIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.cardSubtle, alignItems: "center", justifyContent: "center" },
    submenuLabel: { color: colors.textSecondary, fontSize: 13, flex: 1, fontFamily: fonts.body },
    submenuLabelActive: { color: colors.accent, fontFamily: fonts.bodySemiBold },
    nestedSubmenuWrap: { overflow: "hidden", marginTop: 8, marginBottom: 8, marginLeft: 44 },
    nestedSubmenuList: { gap: 6, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: colors.border, paddingVertical: 6 },
    nestedSubmenuCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.cardSubtle,
      borderRadius: radius.md,
      paddingVertical: 8,
      paddingHorizontal: spacing.md,
    },
    nestedSubmenuCardActive: {
      backgroundColor: colors.cardAlt,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    nestedSubmenuIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.cardSubtle, alignItems: "center", justifyContent: "center" },
    nestedSubmenuLabel: { color: colors.textSecondary, fontSize: 12, flex: 1, fontFamily: fonts.body },
    nestedSubmenuLabelActive: { color: colors.accent, fontFamily: fonts.bodySemiBold },
    drawerFooter: { color: colors.textSecondary, fontSize: 12, marginTop: spacing.md, fontFamily: fonts.body },
    preferencesSection: {
      marginBottom: spacing.sm,
      backgroundColor: colors.cardAlt,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      overflow: "hidden",
    },
    preferencesHeader: {
      height: 56,
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
    },
    preferencesContent: {
      padding: spacing.sm,
      gap: spacing.sm,
      backgroundColor: colors.cardAlt,
    },
    langContainer: {
      padding: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: radius.md,
    },
    themeSection: {
      marginBottom: spacing.sm,
      padding: spacing.sm,
      backgroundColor: colors.cardAlt,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      overflow: "hidden",
    },
    themeGroup: {
      gap: spacing.xs,
    },
    themeOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    themeOptionActive: {
      borderColor: colors.accent,
      backgroundColor: withAlpha(colors.accent, 0.1),
    },
    themeOptionLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      flex: 1,
    },
    themeSwatch: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeOptionTitle: {
      color: colors.textPrimary,
      fontSize: 12.5,
      fontFamily: fonts.bodyBold,
    },
    themeOptionRight: {
      marginLeft: spacing.sm,
    },
    selectedDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.accent,
    },
    unselectedDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardSubtle,
    },
    langLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: spacing.xs,
      fontFamily: fonts.body,
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
      backgroundColor: colors.cardSubtle,
    },
    langButtonActive: {
      backgroundColor: colors.primary,
    },
    langButtonText: {
      color: colors.textTertiary,
      fontSize: 12,
      fontFamily: fonts.bodySemiBold,
    },
    langButtonTextActive: {
      color: colors.accent,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderSoft,
      marginBottom: spacing.md,
      marginTop: spacing.sm,
    },
  });

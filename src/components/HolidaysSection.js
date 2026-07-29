import React, { useMemo, useRef, useState } from "react";
import { Linking, Animated, Dimensions, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { CalendarGrid } from "./CalendarGrid";
import { useAppTheme, withAlpha } from "../theme";

export const HolidaysSection = ({ tags, holidays, calendarConfig, parentScrollRef, sectionY = 0 }) => {
  const { colors, radius, spacing, fonts } = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, radius, spacing, fonts), [colors, radius, spacing, fonts]);
  const statusColors = useMemo(() => getHolidayStatusColors(colors), [colors]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [highlightedDays, setHighlightedDays] = useState([]);
  const [activeTag, setActiveTag] = useState("All");
  const { width } = Dimensions.get("window");
  const translateX = useRef(new Animated.Value(0)).current;
  const calendarRef = useRef(null);
  const [calendarY, setCalendarY] = useState(0);

  const animateTransition = (dir) => {
    translateX.setValue(dir > 0 ? width : -width);
    Animated.timing(translateX, { toValue: 0, duration: 250, useNativeDriver: true }).start();
  };

  const monthLabel = useMemo(() => {
    const names = t("months", { returnObjects: true });
    return `${names[month]} ${year}`;
  }, [month, year, t]);

  const goPrev = () => {
    animateTransition(-1);
    setMonth((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goNext = () => {
    animateTransition(1);
    setMonth((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const filteredHolidays = useMemo(() => {
    const monthAbbr = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const byMonth = holidays.filter((h) => {
      // Use explicit month/year if available, else parse label
      if (h.month !== undefined && h.year !== undefined) {
        return h.year === year && h.month === month;
      }
      const m = h.label.match(/([A-Za-z]{3,9})\s+(\d{4})$/);
      if (!m) return true;
      const monStr = m[1].slice(0, 3).toLowerCase();
      const yr = parseInt(m[2], 10);
      const monIdx = monthAbbr.findIndex((a) => a.toLowerCase() === monStr);
      return yr === year && monIdx === month;
    });

    // Remove Working Saturday entries if a Public/Restricted holiday exists on the same day
    const getDayNum = (label) => {
      const firstToken = String(label).trim().split(/\s+/)[0] || "";
      return parseInt(firstToken.split(/[–—-]/)[0], 10);
    };
    const realHolidayDays = new Set(
      byMonth
        .filter(h => h.badge !== "Working Saturday")
        .map(h => getDayNum(h.label))
        .filter(d => !isNaN(d))
    );
    const deduped = byMonth.filter(h => {
      if (h.badge !== "Working Saturday") return true;
      const day = getDayNum(h.label);
      return !realHolidayDays.has(day);
    });

    const byTag = activeTag === "All" ? deduped : deduped.filter((h) => h.badge === activeTag);
    const dayOf = (label) => {
      const firstToken = String(label).trim().split(/\s+/)[0] || "";
      const firstPart = firstToken.split(/[–—-]/)[0];
      const n = parseInt(firstPart, 10);
      return Number.isNaN(n) ? 0 : n;
    };
    return byTag.slice().sort((a, b) => dayOf(a.label) - dayOf(b.label));
  }, [holidays, activeTag, month, year]);

  const renderHolidayItem = (h, index) => {
    const dateMatch = h.label.match(/^(\d+(?:st|nd|rd|th)?(?:\s*[-–—]\s*\d+(?:st|nd|rd|th)?)?)\s+(.*)$/i);
    let dateStr = "";
    let name = "";
    if (dateMatch) {
      dateStr = dateMatch[1];
      name = dateMatch[2];
    } else {
      const parts = h.label.trim().split(/\s+/);
      dateStr = parts[0];
      name = parts.slice(1).join(" ");
    }

    const rangeParts = dateStr.split(/[-–—]/);
    const startDayNum = parseInt(rangeParts[0], 10);
    let endDayNum = startDayNum;
    if (rangeParts.length > 1) {
      const parsedEnd = parseInt(rangeParts[1].trim(), 10);
      if (!isNaN(parsedEnd)) endDayNum = parsedEnd;
    }

    const today = new Date();
    const isCurrentMonthYear = today.getFullYear() === year && today.getMonth() === month;
    const todayDay = today.getDate();
    const isCurrentHoliday = isCurrentMonthYear && !isNaN(startDayNum) && todayDay >= startDayNum && todayDay <= endDayNum;

    const handlePress = () => {
      if (parentScrollRef && parentScrollRef.current) {
        parentScrollRef.current.scrollToOffset({ offset: sectionY + calendarY, animated: true });
      }
      const days = [];
      if (!isNaN(startDayNum)) {
        for (let i = startDayNum; i <= endDayNum; i++) days.push(i);
      }
      setHighlightedDays(days);
      setTimeout(() => setHighlightedDays([]), 3000);
    };

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const currentMonthName = monthNames[month];
    const cleanDateStr = dateStr.replace(/(st|nd|rd|th)/g, "");
    const badgeColor = getBadgeColor(h, statusColors);
    const activeBorderColor = isCurrentHoliday ? colors.accent : "transparent";
    const badgeGradient = [withAlpha(badgeColor, 0.92), badgeColor];

    return (
      <TouchableOpacity
        key={`holiday-${index}`}
        activeOpacity={0.9}
        onPress={handlePress}
      >
        <View style={[
          styles.holidayCard,
          isCurrentHoliday && styles.holidayCardActive,
          { borderColor: activeBorderColor },
        ]}>
          <LinearGradient
            colors={badgeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dateBadge}
          >
            <Text style={styles.dateNum}>{cleanDateStr}</Text>
            <Text style={styles.dateMonth}>{currentMonthName}</Text>
          </LinearGradient>

          <View style={styles.cardContent}>
            <Text style={styles.holidayLabel}>{name}</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{h.badge === "Working Saturday" ? "Sat" : h.badge}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{t("home.holidays_title")}</Text>
          <Text style={styles.sectionSub}>{t("home.holidays_subtitle")}</Text>
        </View>
      </View>
      <Animated.View
        ref={calendarRef}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          setCalendarY(layout.y);
        }}
        style={{ transform: [{ translateX }] }}
        {...useRef(
          PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20,
            onPanResponderRelease: (_, g) => {
              if (g.dx > 50) {
                goPrev();
              } else if (g.dx < -50) {
                goNext();
              }
            },
          })
        ).current.panHandlers}
      >
        <CalendarGrid 
          month={month} 
          year={year} 
          onPrev={goPrev} 
          onNext={goNext} 
          highlightedDays={highlightedDays} 
          config={calendarConfig?.[month]}
        />
      </Animated.View>
      <View style={styles.tagsRow}>
        {tags.map((tag) => {
          const isActive = activeTag === tag.label;
          return (
            <TouchableOpacity
              key={tag.label}
              activeOpacity={0.8}
              onPress={() => setActiveTag(tag.label)}
              style={[styles.tag, isActive && { backgroundColor: getTagColor(tag.label, statusColors, colors) }]}
            >
              <Text style={[styles.tagText, isActive && styles.tagTextActive]}>{t(`holiday_tags.${tag.label}`)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <ScrollView
        style={styles.holidayListFlat}
        contentContainerStyle={styles.holidayListContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {filteredHolidays.map((h, index) => renderHolidayItem(h, index))}
      </ScrollView>
      <TouchableOpacity
        style={styles.pdfButton}
        activeOpacity={0.9}
        onPress={() => {
          const year = new Date().getFullYear();
          const url = `https://ghconline.gov.in/Document/2ASJudlCal${year}.pdf`;
          Linking.openURL(url);
        }}
      >
        <Text style={styles.pdfText}>{t("home.download_holiday_list")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const getHolidayStatusColors = (colors) => ({
  all: colors.badgeAll,
  holiday: colors.danger,
  restricted: colors.info,
  working: colors.success,
});

const getTagColor = (label, statusColors, colors) => {
  if (label === "All") return statusColors.all || colors.cardSubtle;
  if (label === "Holiday") return statusColors.holiday;
  if (label === "Working Saturday") return statusColors.working;
  return colors.cardSubtle;
};

const getBadgeColor = (holiday, statusColors) => {
  if (holiday.type === "working" || holiday.badge === "Working Saturday") return statusColors.working;
  if (holiday.type === "restricted" || holiday.badge === "Restricted") return statusColors.restricted;
  return statusColors.holiday;
};

const createStyles = (colors, radius, spacing, fonts) =>
  StyleSheet.create({
    section: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
      gap: spacing.sm,
    },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    sectionTitle: { color: colors.textPrimary, fontSize: 18, fontFamily: fonts.heading },
    sectionSub: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.body },
    tagsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
    tag: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    tagText: { color: colors.textSecondary, fontFamily: fonts.bodySemiBold, fontSize: 12 },
    tagTextActive: { color: colors.textInverse },
    holidayListContent: { gap: 10, paddingBottom: spacing.sm },
    holidayListFlat: { maxHeight: 300, marginTop: spacing.sm },
    holidayCard: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    holidayCardActive: {
      borderWidth: 2,
    },
    dateBadge: {
      width: 80,
      height: 60,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "space-evenly",
      marginRight: spacing.md,
      paddingVertical: 4,
    },
    dateNum: {
      color: colors.textInverse,
      fontSize: 18,
      fontFamily: fonts.bodyBold,
    },
    dateMonth: {
      color: withAlpha(colors.textInverse, 0.82),
      fontSize: 10,
      fontFamily: fonts.bodySemiBold,
      marginTop: -2,
    },
    cardContent: {
      flex: 1,
      marginRight: spacing.sm,
    },
    holidayLabel: {
      color: colors.textPrimary,
      fontFamily: fonts.bodySemiBold,
      fontSize: 14,
      lineHeight: 20,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      minWidth: 60,
      alignItems: "center",
    },
    badgeText: {
      color: colors.textInverse,
      fontFamily: fonts.bodyBold,
      fontSize: 10,
    },
    pdfButton: {
      backgroundColor: colors.accent,
      borderRadius: radius.lg,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
    pdfText: { color: colors.textInverse, fontFamily: fonts.bodyBold },
  });


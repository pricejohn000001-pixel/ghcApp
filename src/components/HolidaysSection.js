import React, { useMemo, useRef, useState } from "react";
import { Linking, Animated, Dimensions, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { CalendarGrid } from "./CalendarGrid";
import { colors, radius, spacing } from "../theme";

export const HolidaysSection = ({ tags, holidays }) => {
  const { t } = useTranslation();
  const [month, setMonth] = useState(11); // December as starting month
  const [year, setYear] = useState(2025);
  const [activeTag, setActiveTag] = useState("All");
  const { width } = Dimensions.get("window");
  const translateX = useRef(new Animated.Value(0)).current;

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
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
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
    const byTag = activeTag === "All" ? byMonth : byMonth.filter((h) => h.badge === activeTag);
    const dayOf = (label) => {
      const firstToken = String(label).trim().split(/\s+/)[0] || "";
      const firstPart = firstToken.split(/[–—-]/)[0];
      const n = parseInt(firstPart, 10);
      return Number.isNaN(n) ? 0 : n;
    };
    return byTag.slice().sort((a, b) => dayOf(a.label) - dayOf(b.label));
  }, [holidays, activeTag, month, year]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{t("home.holidays_title")}</Text>
          <Text style={styles.sectionSub}>{t("home.holidays_subtitle")}</Text>
        </View>
      </View>
      <Animated.View
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
        <CalendarGrid month={month} year={year} onPrev={goPrev} onNext={goNext} />
      </Animated.View>
      <View style={styles.tagsRow}>
        {tags.map((tag) => {
          const isActive = activeTag === tag.label;
          return (
            <TouchableOpacity
              key={tag.label}
              activeOpacity={0.8}
              onPress={() => setActiveTag(tag.label)}
              style={[styles.tag, isActive && { backgroundColor: tag.color }]}
            >
              <Text style={[styles.tagText, isActive && { color: "#fff" }]}>{t(`holiday_tags.${tag.label}`)}</Text>
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
        {filteredHolidays.map((h, index) => {
          // Robust date parsing
          // Matches: "25", "25th", "25-27", "25 - 27", "25th-27th" followed by space
          const dateMatch = h.label.match(/^(\d+(?:st|nd|rd|th)?(?:\s*[-–—]\s*\d+(?:st|nd|rd|th)?)?)\s+(.*)$/i);

          let dateStr = "";
          let name = "";

          if (dateMatch) {
            dateStr = dateMatch[1];
            name = dateMatch[2];
          } else {
            // Fallback: split by first space
            const parts = h.label.trim().split(/\s+/);
            dateStr = parts[0];
            name = parts.slice(1).join(" ");
          }

          // Calculate Day(s)
          let dayDisplay = "";
          const rangeParts = dateStr.split(/[-–—]/);
          const startDayNum = parseInt(rangeParts[0], 10);

          if (!isNaN(startDayNum)) {
            const getDayName = (d) => {
              const dateObj = new Date(year, month, d);
              const dayIndex = dateObj.getDay();
              const days = t("days_short", { returnObjects: true });
              return days && days.length === 7 ? days[dayIndex] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
            };

            const startDayName = getDayName(startDayNum);
            dayDisplay = startDayName;

            if (rangeParts.length > 1) {
              // Try to parse end day
              const endDayNum = parseInt(rangeParts[1].trim(), 10);
              if (!isNaN(endDayNum)) {
                const endDayName = getDayName(endDayNum);
                if (startDayName !== endDayName) {
                  dayDisplay = `${startDayName}-${endDayName}`;
                }
              }
            }
          }

          const today = new Date();
          const isCurrentMonthYear = today.getFullYear() === year && today.getMonth() === month;
          const todayDay = today.getDate();
          let isCurrentHoliday = false;
          if (isCurrentMonthYear && !isNaN(startDayNum)) {
            const endDayParsed = rangeParts.length > 1 ? parseInt(rangeParts[1].trim(), 10) : NaN;
            const endDayNum = !isNaN(endDayParsed) ? endDayParsed : startDayNum;
            isCurrentHoliday = todayDay >= startDayNum && todayDay <= endDayNum;
          }

          return (
            <View key={index} style={[styles.holidayCard, { backgroundColor: h.badgeColor }, isCurrentHoliday && styles.holidayCardActive]}>
              <View style={styles.cardHeader}>
                <Text style={styles.dateText}>
                  {dateStr} <Text style={styles.dayText}>{dayDisplay}</Text>
                </Text>
              </View>
              <Text style={styles.holidayLabel}>{name}</Text>
            </View>
          );
        })}
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

const styles = StyleSheet.create({
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, gap: spacing.sm },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: "#0F2347",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  sectionSub: { color: colors.textSecondary, fontSize: 12 },
  infoRows: { gap: spacing.xs, marginTop: spacing.xs },
  infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#22345E",
    backgroundColor: "#0C1E3E",
  },
  infoLabel: { color: "#E7ECF6", fontWeight: "700" },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  chevrons: { flexDirection: "row" },
  monthText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  tagsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: "#0F2347",
  },
  tagText: { color: colors.textSecondary, fontWeight: "700", fontSize: 12 },
  holidayListContent: { gap: 10, paddingBottom: spacing.sm },
  holidayListFlat: { maxHeight: 300, marginTop: spacing.sm },
  holidayCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  holidayCardActive: {
    borderWidth: 2,
    borderColor: "#f99e16ff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  holidayLabel: { color: "#fff", fontWeight: "600", fontSize: 14 },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  pdfButton: {
    backgroundColor: "#0D4199",
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.md,
  },
  pdfText: { color: "#fff", fontWeight: "700" },
});


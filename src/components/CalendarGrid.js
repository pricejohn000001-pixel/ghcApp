import React, { useMemo } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme";

export const CalendarGrid = ({ month, year, onPrev, onNext, highlightedDays = [], config }) => {
  const { colors, radius, spacing, fonts } = useAppTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, radius, spacing, fonts), [colors, radius, spacing, fonts]);
  const statusColors = useMemo(() => getStatusColors(colors), [colors]);
  const gradientColors = useMemo(() => [colors.card, colors.cardAlt], [colors.card, colors.cardAlt]);
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [month, year]);
  const firstWeekday = useMemo(() => new Date(year, month, 1).getDay(), [month, year]);
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const todayDate = isCurrentMonth ? today.getDate() : null;
  const saturdays = useMemo(() => {
    const list = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(year, month, d).getDay();
      if (dow === 6) list.push(d);
    }
    return list;
  }, [daysInMonth, month, year]);

  const monthLabel = useMemo(() => {
    const names = t("months", { returnObjects: true });
    return `${names[month]} ${year}`;
  }, [month, year, t]);

  const monthConfig = useMemo(() => {
    if (config) return config;
    
    // Fallback or empty config if none provided
    return { singles: [], satPolicy: "2nd_4th_holiday" };
  }, [config]);

  const cells = useMemo(() => {
    const total = 42; // 6 rows x 7 cols
    return Array.from({ length: total }, (_, idx) => {
      const day = idx - firstWeekday + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    });
  }, [daysInMonth, firstWeekday]);

  return (
    <LinearGradient colors={gradientColors} style={styles.calendar}>
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={onPrev} activeOpacity={0.8} style={styles.navButton}>
          <Ionicons name="chevron-back" size={16} color={colors.accent} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthLabel}</Text>
        <TouchableOpacity onPress={onNext} activeOpacity={0.8} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </TouchableOpacity>
      </View>
      <View style={styles.calendarHeaderRow}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <Text key={d} style={styles.calendarHeaderText}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.calendarDays}>
        {Array.from({ length: 6 }).map((_, row) => (
          <View style={styles.calendarRow} key={`row-${row}`}>
            {cells.slice(row * 7, row * 7 + 7).map((day, colIdx) => {
              const isToday = day && todayDate === day;
              const isHighlighted = day && highlightedDays.includes(day);
              let bubbleStyle = styles.dayBubble;
              let textStyle = styles.dayText;
              let single = undefined;
              let dow = undefined;
              let idx = undefined;

              if (day) {
                single = monthConfig.singles.find((s) => s.day === day);
                dow = new Date(year, month, day).getDay();

                if (isHighlighted) {
                  bubbleStyle = [styles.dayBubble, styles.highlightedDayBubble];
                  textStyle = [styles.dayText, styles.highlightedDayText];
                } else if (single) {
                  const color = statusColors[single.type];
                  bubbleStyle = [styles.dayBubble, { backgroundColor: color }];
                  textStyle = [styles.dayText, styles.statusDayText];
                } else {
                  if (monthConfig.satPolicy === "2nd_4th_holiday" && dow === 6) {
                    idx = saturdays.indexOf(day) + 1; // 1-based
                    const isHolidaySat = idx === 2 || idx === 4;
                    const color = isHolidaySat ? statusColors.public : statusColors.working;
                    bubbleStyle = [styles.dayBubble, { backgroundColor: color }];
                    textStyle = [styles.dayText, styles.statusDayText];
                  } else if (dow === 0) {
                    const color = statusColors.public;
                    bubbleStyle = [styles.dayBubble, { backgroundColor: color }];
                    textStyle = [styles.dayText, styles.statusDayText];
                  }
                }
              }

              return (
                <View style={styles.calendarCell} key={`${row}-${colIdx}`}>
                  {day ? (
                    <>
                      {isHighlighted ? (
                        <View style={[bubbleStyle, { transform: [{ scale: 1.1 }] }]}>
                          <Text style={textStyle}>{day}</Text>
                        </View>
                      ) : (
                        <View style={bubbleStyle}>
                          <Text style={textStyle}>{day}</Text>
                        </View>
                      )}

                      {isToday && (
                        <View
                          pointerEvents="none"
                          style={styles.todayRing}
                        />
                      )}
                    </>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </LinearGradient>
  );
};

const getStatusColors = (colors) => ({
  public: colors.danger,
  restricted: colors.info,
  working: colors.success,
});

const createStyles = (colors, radius, spacing, fonts) =>
  StyleSheet.create({
    calendar: {
      borderRadius: radius.xl,
      padding: spacing.md,
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    monthRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },
    navButton: {
      width: 32,
      height: 32,
      borderRadius: radius.pill,
      backgroundColor: colors.cardSubtle,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    monthText: { color: colors.textPrimary, fontSize: 16, fontFamily: fonts.bodyBold, textAlign: "center", flex: 1 },
    calendarHeaderRow: { flexDirection: "row" },
    calendarHeaderText: { color: colors.textSecondary, fontSize: 12, flex: 1, textAlign: "center", fontFamily: fonts.bodySemiBold },
    calendarDays: { marginTop: spacing.xs },
    calendarRow: { flexDirection: "row" },
    calendarCell: {
      flex: 1,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
    },
    dayBubble: {
      width: 28,
      height: 28,
      borderRadius: 8,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    highlightedDayBubble: {
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: colors.accent,
    },
    dayText: { color: colors.textPrimary, fontSize: 12, fontFamily: fonts.body },
    statusDayText: { color: colors.textInverse, fontFamily: fonts.bodySemiBold },
    highlightedDayText: { color: colors.textInverse, fontFamily: fonts.bodyBold },
    todayRing: {
      position: "absolute",
      width: 28,
      height: 28,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.accent,
    },
  });


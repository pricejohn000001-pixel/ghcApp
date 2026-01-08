import React, { useMemo } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from "react-i18next";

export const CalendarGrid = ({ month, year, onPrev, onNext, highlightedDays = [] }) => {
  const { t } = useTranslation();
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [month, year]);
  const firstWeekday = useMemo(() => new Date(year, month, 1).getDay(), [month, year]);
  const colorsMap = {
    public: "#E53935",
    restricted: "#1E63D6",
    working: "#10B981",
  };
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
    if (month === 11 && year === 2025) {
      return {
        singles: [
          { day: 2, type: "restricted" },
          { day: 5, type: "restricted" },
          { day: 10, type: "restricted" },
          { day: 13, type: "public" },
          { day: 27, type: "public" },
          { day: 6, type: "working" },
          { day: 20, type: "working" },
          { day: 21, type: "public" },
          { day: 22, type: "public" },
          { day: 23, type: "public" },
          { day: 24, type: "public" },
          { day: 25, type: "public" },
          { day: 26, type: "public" },
          { day: 28, type: "public" },
          { day: 29, type: "public" },
          { day: 30, type: "public" },
          { day: 31, type: "public" },
        ],
        satPolicy: "2nd_4th_holiday",
      };
    }
    if (month === 0 && year === 2026) {
      return {
        singles: [
          { day: 1, type: "public" },
          { day: 13, type: "public" },
          { day: 14, type: "public" },
          { day: 15, type: "public" },
          { day: 23, type: "public" },
          { day: 26, type: "public" },
          { day: 10, type: "public" },
          { day: 24, type: "public" },
          { day: 3, type: "working" },
          { day: 17, type: "working" },
          { day: 31, type: "working" },
        ],
        satPolicy: "2nd_4th_holiday",
      };
    }
    return { singles: [] };
  }, [month, year]);

  const cells = useMemo(() => {
    const total = 42; // 6 rows x 7 cols
    return Array.from({ length: total }, (_, idx) => {
      const day = idx - firstWeekday + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    });
  }, [daysInMonth, firstWeekday]);

  return (
    <LinearGradient colors={["#FFFFFF", "#ECF1FF"]} style={styles.calendar}>
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={onPrev} activeOpacity={0.8} style={styles.navButton}>
          <Ionicons name="chevron-back" size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthLabel}</Text>
        <TouchableOpacity onPress={onNext} activeOpacity={0.8} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
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
              if (day) {
                const single = monthConfig.singles.find((s) => s.day === day);
                if (isHighlighted) {
                   bubbleStyle = [styles.dayBubble, { backgroundColor: "#8B5CF6", borderWidth: 2, borderColor: "#7C3AED" }];
                   textStyle = [styles.dayText, { color: "#fff", fontWeight: "bold" }];
                } else if (single) {
                  const color = colorsMap[single.type];
                  bubbleStyle = [styles.dayBubble, { backgroundColor: color}];
                  textStyle = [styles.dayText, { color: "#fff" }];
                } else {
                  const dow = new Date(year, month, day).getDay();
                  if (monthConfig.satPolicy === "2nd_4th_holiday" && dow === 6) {
                    const idx = saturdays.indexOf(day) + 1; // 1-based
                    const isHolidaySat = idx === 2 || idx === 4;
                    const color = isHolidaySat ? colorsMap.public : colorsMap.working;
                    bubbleStyle = [styles.dayBubble, { backgroundColor: color}];
                    textStyle = [styles.dayText, { color: "#fff" }];
                  } else if (dow === 0) {
                    const color = colorsMap.public;
                    bubbleStyle = [styles.dayBubble, { backgroundColor: color}];
                    textStyle = [styles.dayText, { color: "#fff" }];
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
                          style={{
                            position: 'absolute',
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor: '#f99e16ff'
                          }} 
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

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: "#0F2347",
    alignItems: "center",
    justifyContent: "center",
  },
  monthText: { color: "#0F2347", fontSize: 16, fontWeight: "700", textAlign: "center", flex: 1 },
  calendarHeaderRow: { flexDirection: "row" },
  calendarHeaderText: { color: "#6B7280", fontSize: 12, flex: 1, textAlign: "center" },
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
    overflow: 'hidden',
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { color: "#111827", fontSize: 12 },
});


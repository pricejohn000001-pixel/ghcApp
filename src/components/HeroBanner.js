import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, StyleSheet, View, Animated, Text, Image, PanResponder } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "../theme";

const { width } = Dimensions.get("window");
const slideHeight = 200;
const slides = [
  { src: require("../assets/court.jpg"), subtitle: "Principal Seat at Guwahati" },
  { src: require("../assets/principalSeatNewBlock.jpg"), subtitle: "Principal Seat at Guwahati (New Block)" },
  { src: require("../assets/kohimabenchNagaland.jpg"), subtitle: "Kohima Bench, Nagaland" },
  { src: require("../assets/aizawlbench.jpg"), subtitle: "Aizawl Bench, Mizoram" },
  { src: require("../assets/itanagarbench.jpg"), subtitle: "Itanagar Permanent Bench, Arunachal Pradesh" },
  { src: require("../assets/platinum.jpg"), subtitle: null },
];

export const HeroBanner = () => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const panX = useRef(new Animated.Value(0)).current;
  const total = slides.length;
  const indexRef = useRef(0);
  const fade = useRef(new Animated.Value(1)).current;
  const [paused, setPaused] = useState(false);
  const intervalMs = 4000;
  const resumeDelayMs = 2500;
  const resumeTimerRef = useRef(null);

  const currentSlide = useMemo(() => slides[index % Math.max(total, 1)], [index, total]);
  const isLast = index % Math.max(total, 1) === total - 1;
  const titleText = isLast ? "Celebrating Platinum Jubilee of the Gauhati High Court" : "The Gauhati High Court";
  const subtitleText = isLast ? "" : currentSlide.subtitle || "";

  const goTo = (nextIndex) => {
    Animated.timing(fade, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setIndex(nextIndex);
      Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 6,
      onMoveShouldSetPanResponderCapture: (_, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 6,
      onPanResponderGrant: () => {
        if (resumeTimerRef.current) {
          clearTimeout(resumeTimerRef.current);
          resumeTimerRef.current = null;
        }
        setPaused(true);
        panX.stopAnimation();
      },
      onPanResponderMove: (_, g) => {
        panX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        const threshold = 40;
        const curr = indexRef.current;
        let next = curr;
        if (g.dx > threshold) {
          next = (curr - 1 + Math.max(total, 1)) % Math.max(total, 1);
        } else if (g.dx < -threshold) {
          next = (curr + 1) % Math.max(total, 1);
        }
        Animated.timing(panX, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
          if (next !== curr) goTo(next);
          if (resumeTimerRef.current) {
            clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = null;
          }
          resumeTimerRef.current = setTimeout(() => {
            setPaused(false);
          }, resumeDelayMs);
        });
      },
      onPanResponderTerminate: () => {
        Animated.timing(panX, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
          if (resumeTimerRef.current) {
            clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = null;
          }
          resumeTimerRef.current = setTimeout(() => {
            setPaused(false);
          }, resumeDelayMs);
        });
      },
    })
  ).current;

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % Math.max(total, 1);
      goTo(next);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [paused, intervalMs, total]);

  return (
    <View style={styles.wrapper} {...panResponder.panHandlers}>
      <Animated.View style={{ transform: [{ translateX: panX }] }}>
        <Animated.Image source={currentSlide.src} style={[styles.hero, { opacity: fade }]} />
        <LinearGradient
          colors={["transparent", "rgba(9,22,48,0.9)"]}
          style={styles.overlay}
          pointerEvents="none"
        />
        <View style={styles.heroText}>
          <Animated.Text style={[styles.heroTitle, { opacity: fade }]}>{titleText}</Animated.Text>
          {!isLast ? <Animated.Text style={[styles.heroSub, { opacity: fade }]}>{subtitleText}</Animated.Text> : null}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: "relative", height: slideHeight },
  hero: { width, height: slideHeight, resizeMode: "cover" },
  overlay: { position: "absolute", left: 0, right: 0, bottom: 0, height: 120 },
  heroText: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  heroTitle: { color: "#fff", fontWeight: "700", fontSize: 16, lineHeight: 22 },
  heroSub: { color: colors.textSecondary, marginTop: 4, fontSize: 12 },
});

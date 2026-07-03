import React, { useCallback, useMemo, useRef } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

const { width } = Dimensions.get("window");
const cardWidth = width - spacing.lg * 2;

const JudgeCard = React.memo(({ item, onPortfolio, t }) => {
  const [imageLoading, setImageLoading] = React.useState(true);
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    if (imageLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.stopAnimation();
    }
  }, [imageLoading, fadeAnim]);

  return (
    <TouchableOpacity style={styles.judgeCard} onPress={onPortfolio} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.avatar }}
          style={styles.judgeImage}
          progressiveRenderingEnabled
          loadingIndicatorSource={{ uri: item.avatar }}
          loading="lazy"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        {imageLoading && (
          <Animated.View style={[StyleSheet.absoluteFill, styles.skeletonLoader, { opacity: fadeAnim }]} />
        )}
      </View>
      <View style={styles.judgeInfo}>
        <Text style={styles.judgeName}>{item.name?.replace(", Chief Justice", "")}</Text>
        <Text style={styles.judgeRole}>{item.title}</Text>
        <View style={styles.portfolioButton}>
          <Ionicons name="briefcase" size={16} color="#D4AF37" />
          <Text style={styles.portfolioLabel}>{t("home.portfolio")}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export const JudgesSection = ({ judges, selectedIndex, onSelect, onPortfolio }) => {
  const { t } = useTranslation();
  const listRef = useRef(null);
  const horizontalPadding = useMemo(() => spacing.lg, []);
  const renderItem = useCallback(
    ({ item }) => <JudgeCard item={item} onPortfolio={onPortfolio} t={t} />,
    [onPortfolio, t]
  );
  const total = judges?.length || 0;
  const si = typeof selectedIndex === "number" ? selectedIndex : 0;
  const trackW = Math.min(Math.round(width * 0.45), 160);
  const fillW = Math.max(22, Math.round(trackW / Math.max(total, 1)));
  const leftMax = trackW - fillW;
  const sliderTranslate = useRef(new Animated.Value(0)).current;

  const animateSliderToIndex = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(idx, Math.max(total - 1, 0)));
    const to = leftMax * (Math.max(total - 1, 1) === 0 ? 0 : clamped / Math.max(total - 1, 1));
    Animated.timing(sliderTranslate, { toValue: to, duration: 160, useNativeDriver: true }).start();
  }, [leftMax, sliderTranslate, total]);

  React.useEffect(() => {
    animateSliderToIndex(si);
  }, [si, animateSliderToIndex]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("home.judges_title")}</Text>
        <Text style={styles.sectionSub}>{t("home.judges_subtitle")}</Text>
      </View>

      <Animated.FlatList
        data={judges}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id || item.name}
        renderItem={renderItem}
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={cardWidth + spacing.lg}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
        ItemSeparatorComponent={() => <View style={{ width: spacing.lg }} />}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (cardWidth + spacing.lg));
          onSelect(idx);
          animateSliderToIndex(idx);
        }}
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: horizontalPadding },
        ]}
        getItemLayout={(_, index) => ({
          length: cardWidth + spacing.lg,
          offset: (cardWidth + spacing.lg) * index,
          index,
        })}
        ref={listRef}
      />
      <View style={styles.sliderWrap}>
        <View style={[styles.sliderTrack, { width: trackW }]}>
          <Animated.View style={[styles.sliderFill, { width: fillW, transform: [{ translateX: sliderTranslate }] }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: 'Georgia' },
  sectionSub: { color: colors.textSecondary, fontSize: 12, fontFamily: 'Inter_400Regular' },
  listContent: { paddingTop: spacing.sm },
  judgeCard: {
    backgroundColor: "#111111",
    borderRadius: radius.xl,
    padding: spacing.md + 2,
    flexDirection: "row",
    gap: spacing.md,
    position: "relative",
    borderWidth: 1,
    borderColor: "#222222",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 6,
    width: cardWidth,
  },
  imageContainer: {
    width: 112,
    height: 146,
    borderRadius: radius.lg,
    backgroundColor: "#222222",
    overflow: "hidden",
  },
  judgeImage: { width: "100%", height: "100%", resizeMode: "cover" },
  skeletonLoader: {
    backgroundColor: "#333333",
  },
  judgeInfo: { flex: 1 },
  judgeName: { color: "#FFFFFF", fontSize: 17, lineHeight: 22, fontFamily: 'Georgia' },
  judgeRole: { color: "#AAAAAA", marginTop: 4, fontSize: 12, fontFamily: 'Inter_400Regular' },
  portfolioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#222222",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    alignSelf: "flex-start",
    gap: 6,
  },
  portfolioLabel: { color: "#D4AF37", fontFamily: 'Inter_700Bold' },
  sliderWrap: { paddingTop: spacing.sm, alignItems: "center" },
  sliderTrack: { height: 6, borderRadius: 999, backgroundColor: "#333333", opacity: 0.6, position: "relative" },
  sliderFill: { position: "absolute", height: 6, borderRadius: 999, backgroundColor: colors.accent },
});

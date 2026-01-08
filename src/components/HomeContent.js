import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors } from "../theme";
import { HeroBanner } from "./HeroBanner";
import { JudgesSection } from "./JudgesSection";
import { ServicesGrid } from "./ServicesGrid";
import { HolidaysSection } from "./HolidaysSection";
import { Footer } from "./Footer";

export const HomeContent = ({
  judges,
  selectedJudgeIndex,
  onSelectJudge,
  onOpenPortfolio,
  services,
  onServicePress,
  holidayTags,
  holidays,
  refreshing,
  onRefresh,
  onAbout,
  onContact,
  onPrivacy,
  scrollY,
}) => {
  const scrollRef = React.useRef(null);
  const [holidaysY, setHolidaysY] = React.useState(0);

  return (
    <Animated.FlatList
      ref={scrollRef}
      data={[]}
      keyExtractor={(_, idx) => String(idx)}
      ListHeaderComponent={
        <>
          <HeroBanner />
          <JudgesSection
            judges={judges}
            selectedIndex={selectedJudgeIndex}
            onSelect={onSelectJudge}
            onPortfolio={onOpenPortfolio}
          />
          <ServicesGrid services={services} onServicePress={onServicePress} />
          <View onLayout={(e) => setHolidaysY(e.nativeEvent.layout.y)}>
             <HolidaysSection 
                tags={holidayTags} 
                holidays={holidays} 
                parentScrollRef={scrollRef} 
                sectionY={holidaysY}
             />
          </View>
          <Footer onAbout={onAbout} onContact={onContact} onPrivacy={onPrivacy} />
        </>
      }
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onScroll={
        scrollY
          ? Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )
          : undefined
      }
      scrollEventThrottle={16}
    />
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0 },
});

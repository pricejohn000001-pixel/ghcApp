import React from "react";
import { FlatList, StyleSheet } from "react-native";
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
}) => {
  return (
    <FlatList
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
          <HolidaysSection tags={holidayTags} holidays={holidays} />
          <Footer onAbout={onAbout} onContact={onContact} onPrivacy={onPrivacy} />
        </>
      }
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0 },
});

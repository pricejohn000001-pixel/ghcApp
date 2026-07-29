import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { StatusBar, StyleSheet, View, BackHandler, Animated, Linking } from "react-native";
import { useFonts } from "expo-font";
import { AntDesign, Entypo, Feather, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Header } from "./src/components/Header";
import { BottomNav } from "./src/components/BottomNav";
import { DrawerMenu } from "./src/components/DrawerMenu";
import { PortfolioModal } from "./src/components/PortfolioModal";
import { LiveWebView } from "./src/components/LiveWebView";
import { holidays, holidayTags, judge, judges, serviceCards, menuUrls } from "./src/data";
import { CauseListModal } from "./src/components/CauseListModal";
import { AboutScreen } from "./src/components/AboutScreen";
import { ContactScreen } from "./src/components/ContactScreen";
import { HomeContent } from "./src/components/HomeContent";
import { CourtLinks } from "./src/components/CourtLinks";
import { SplashScreen } from "./src/components/SplashScreen";
import { SearchModal } from "./src/components/SearchModal";
import { CaseHistoryScreen } from "./src/components/CaseHistoryScreen";
import { CaseDetailsScreen } from "./src/components/CaseDetailsScreen";
import { ThemeProvider, useAppTheme } from "./src/theme";
import "./src/i18n";

import { initializeJudgesData } from "./src/services/judgesDataService";
import { fetchHolidaysData } from "./src/services/holidaysService";

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme, colors, isThemeReady } = useAppTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerExpandSection, setDrawerExpandSection] = useState(null);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [causeOpen, setCauseOpen] = useState(false);
  const [selectedJudgeIndex, setSelectedJudgeIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Data State
  const [judgesData, setJudgesData] = useState(judges);
  const [holidaysData, setHolidaysData] = useState(holidays);
  const [calendarConfig, setCalendarConfig] = useState({});

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Judges
        const jData = await initializeJudgesData();
        if (jData && jData.length > 0) {
          setJudgesData(jData);
        }

        // Load Holidays
        const hData = await fetchHolidaysData(new Date().getFullYear());
        if (hData) {
          setHolidaysData(hData.holidays);
          setCalendarConfig(hData.calendarConfig);
        }
      } catch (e) {
        console.log("Failed to load dynamic data", e);
      }
    };
    loadData();
  }, []);

  // Navigation State
  const [history, setHistory] = useState([{ type: 'home' }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Derived State
  const currentState = history[historyIndex] || { type: 'home' };
  const showWebView = currentState.type === 'webview';
  const showCourtLinks = currentState.type === 'court_links';
  const showAbout = currentState.type === 'about';
  const showContact = currentState.type === 'contact';
  const showCaseHistory = currentState.type === 'case_history';
  const showCaseDetails = currentState.type === 'case_details';
  const currentUrl = currentState.url;

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = useRef(null);

  const displayBoardUrl = "https://ghcservices.assam.gov.in/ghc_display/index.php";
  const registryUrl = "https://ghconline.gov.in/index.php/registry/";

  const [fontsLoaded] = useFonts({
    'Georgia-Bold': require('./src/assets/fonts/georgiab.ttf'),
    'Georgia-Italic': require('./src/assets/fonts/georgiai.ttf'),
    'Georgia-BoldItalic': require('./src/assets/fonts/georgiaz.ttf'),
    'Inter_400Regular': require('./src/assets/fonts/Inter-Regular.otf'),
    'Inter_600SemiBold': require('./src/assets/fonts/Inter-Bold.otf'),
    'Inter_700Bold': require('./src/assets/fonts/Inter-SemiBold.otf'),
    Georgia: require('./src/assets/fonts/georgia.ttf'),
    ...AntDesign.font,
    ...Entypo.font,
    ...Feather.font,
    ...FontAwesome.font,
    ...Ionicons.font,
    ...MaterialIcons.font,
  });

  const scrollYRef = useRef(new Animated.Value(0));

  useEffect(() => {
    if (scrollYRef.current) {
      scrollYRef.current.setValue(0);
    }
  }, [currentState.type]);

  const addToHistory = (state) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    // Reset webview navigation state when navigating to a new webview or other screen
    setCanGoBack(false);
    setCanGoForward(false);
  };

  const handleBack = () => {
    if (showWebView && webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
      return true;
    }
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      return true;
    }
    // Handle modals closing on back press
    if (searchOpen) { setSearchOpen(false); return true; }
    if (portfolioOpen) { setPortfolioOpen(false); return true; }
    if (causeOpen) { setCauseOpen(false); return true; }
    if (drawerOpen) { setDrawerOpen(false); return true; }

    return false;
  };

  const handleForward = () => {
    if (showWebView && webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
      return;
    }
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleHome = () => {
    setHistory([{ type: 'home' }]);
    setHistoryIndex(0);
    setCanGoBack(false);
    setCanGoForward(false);
  };

  useEffect(() => {
    const handler = () => {
      return handleBack();
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => sub.remove();
  }, [historyIndex, showWebView, canGoBack, searchOpen, portfolioOpen, causeOpen, drawerOpen]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const [splashVisible, setSplashVisible] = useState(true);
  
  // Return null or SplashScreen while fonts are loading to ensure they are available
  if (!isThemeReady || !fontsLoaded) {
    return null; 
  }

  if (splashVisible) {
    return <SplashScreen ready={fontsLoaded} onDone={() => setSplashVisible(false)} />;
  }

  const handleServicePress = (id) => {
    if (id === "live_streaming") {
      addToHistory({ type: 'court_links' });
      return;
    }
    if (id === "cause_list") {
      setCauseOpen(true);
      return;
    }
    if (id === "case_status") {
      addToHistory({ type: 'case_history' });
      return;
    }
    if (id === "registry") {
      addToHistory({ type: 'webview', url: registryUrl });
      return;
    }
    if (id === "district_courts") {
      addToHistory({ type: 'webview', url: menuUrls.district_courts });
      return;
    }
    if (id === "recruitments") {
      setDrawerExpandSection("recruitments");
      setDrawerOpen(true);
      return;
    }
    if (id === "justice_clock") {
      addToHistory({ type: 'webview', url: "https://justiceclock.ecourts.gov.in/justiceClock/?p=home/state&fstate_code=6" });
      return;
    }
    if (id === "virtual_justice_clock_principal") {
      addToHistory({ type: 'webview', url: "https://ghcservices.assam.gov.in/jclock/" });
      return;
    }
    if (id === "statistics") {
      addToHistory({ type: 'webview', url: "https://ghconline.gov.in/index.php/statistics/" });
      return;
    }
    if (id === "ebooks") {
      setDrawerExpandSection("ebooks");
      setDrawerOpen(true);
      return;
    }
    addToHistory({ type: 'webview', url: "https://ghconline.gov.in/" });
  };

  return (
    <SafeAreaProvider style={[styles.root, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={colors.primary} translucent={false} />
      <Header onMenu={() => setDrawerOpen(true)} onSearch={() => setSearchOpen(true)} scrollY={scrollYRef.current} isHome={currentState.type === 'home'} />
      {showWebView && currentUrl ? (
        <LiveWebView
          url={currentUrl}
          webViewRef={webViewRef}
          scrollY={scrollYRef.current}
          onNavStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
            setCanGoForward(navState.canGoForward);
          }}
        />
      ) : showCourtLinks ? (
        <CourtLinks
          scrollY={scrollYRef.current}
          onSelect={(link) => {
            addToHistory({ type: 'webview', url: link });
          }}
        />
      ) : showAbout ? (
        <AboutScreen scrollY={scrollYRef.current} judges={judgesData} />
      ) : showContact ? (
        <ContactScreen scrollY={scrollYRef.current} />
      ) : showCaseHistory ? (
        <CaseHistoryScreen 
          scrollY={scrollYRef.current} 
          onViewDetails={(item) => addToHistory({ type: 'case_details', caseItem: item })} 
        />
      ) : showCaseDetails ? (
        <CaseDetailsScreen 
          caseItem={currentState.caseItem} 
          scrollY={scrollYRef.current}
        />
      ) : (
        <HomeContent
              judges={judgesData}
              selectedJudgeIndex={selectedJudgeIndex}
              onSelectJudge={setSelectedJudgeIndex}
              onOpenPortfolio={() => setPortfolioOpen(true)}
              services={serviceCards}
              onServicePress={handleServicePress}
              holidayTags={holidayTags}
              holidays={holidaysData}
              calendarConfig={calendarConfig}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onAbout={() => addToHistory({ type: 'about' })}
              onContact={() => addToHistory({ type: 'contact' })}
              scrollY={scrollYRef.current}
            />
      )}

      <BottomNav
        onHome={handleHome}
        onMactCal={() => addToHistory({ type: 'webview', url: "https://ghcservices.assam.gov.in/mact/mact_cal.php" })}
        onCaseDisplay={() => Linking.openURL("https://play.google.com/store/apps/details?id=com.case_display_app&pcampaignid=web_share")}
        onBack={handleBack}
        onForward={handleForward}
        disableBack={historyIndex === 0 && (!showWebView || !canGoBack)}
        disableForward={historyIndex === history.length - 1 && (!showWebView || !canGoForward)}
        activeTab={currentState.type === 'home' ? 'home' : (showWebView && currentUrl === "https://ghcservices.assam.gov.in/mact/mact_cal.php") ? 'mactCal' : (showCaseHistory || showCaseDetails) ? 'caseHistory' : null}
      />
      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItemLabel={showWebView ? (function () {
          if (!currentUrl) return null;
          const normalize = (s) => (s || "").replace(/\/+$/, "");
          const cur = normalize(currentUrl);
          let bestLabel = null;
          let bestLen = 0;
          for (const [label, url] of Object.entries(menuUrls)) {
            const u = normalize(url);
            if (cur === u || cur.startsWith(u)) {
              if (u.length > bestLen) { bestLabel = label; bestLen = u.length; }
            }
          }
          return bestLabel;
        })() : null}
        onItemPress={(label) => {
          if (label === "search") {
            setDrawerOpen(false);
            setSearchOpen(true);
            return;
          }
          if (label === "Home") {
            setDrawerOpen(false);
            handleHome();
            return;
          }
          const nextUrl = menuUrls[label];
          addToHistory({ type: 'webview', url: nextUrl || "https://ghconline.gov.in/" });
        }}
      />
      <PortfolioModal
        visible={portfolioOpen}
        onClose={() => setPortfolioOpen(false)}
        judge={judgesData[selectedJudgeIndex]}
      />
      <CauseListModal visible={causeOpen} onClose={() => setCauseOpen(false)} holidays={holidaysData} />

      <SearchModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        judges={judgesData}
        onNavigate={(item) => {
          if (item.type === "judge") {
            const idx = judgesData.findIndex((j) => j.id === item.id);
            if (idx !== -1) {
              setSelectedJudgeIndex(idx);
              setPortfolioOpen(true);
            }
          } else if (item.type === "service") {
            handleServicePress(item.id);
          } else if (item.type === "holiday") {
            // No specific navigation for holiday
          } else if (item.type === "link") {
            addToHistory({ type: 'webview', url: item.data });
          }
        }}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0 },
});

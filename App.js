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
import { colors } from "./src/theme";
import { CauseListModal } from "./src/components/CauseListModal";
import { AboutScreen } from "./src/components/AboutScreen";
import { ContactScreen } from "./src/components/ContactScreen";
import { PrivacyPolicyScreen } from "./src/components/PrivacyPolicyScreen";
import { HomeContent } from "./src/components/HomeContent";
import { CourtLinks } from "./src/components/CourtLinks";
import { SplashScreen } from "./src/components/SplashScreen";
import { SearchModal } from "./src/components/SearchModal";
import "./src/i18n";

import { initializeJudgesData } from "./src/services/judgesDataService";

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerExpandSection, setDrawerExpandSection] = useState(null);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [causeOpen, setCauseOpen] = useState(false);
  const [selectedJudgeIndex, setSelectedJudgeIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Judges Data State
  const [judgesData, setJudgesData] = useState(judges); // Start with static data

  // Initialize judges data
  useEffect(() => {
    const loadJudges = async () => {
      try {
        const data = await initializeJudgesData();
        if (data && data.length > 0) {
          setJudgesData(data);
        }
      } catch (e) {
        console.log("Failed to load dynamic judges data", e);
      }
    };
    loadJudges();
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
  const showPrivacy = currentState.type === 'privacy';
  const currentUrl = currentState.url;

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = useRef(null);

  const displayBoardUrl = "https://ghcservices.assam.gov.in/ghc_display/index.php";
  const registryUrl = "https://ghconline.gov.in/index.php/registry/";

  const [fontsLoaded] = useFonts({
    ...AntDesign.font,
    ...Entypo.font,
    ...Feather.font,
    ...FontAwesome.font,
    ...Ionicons.font,
    ...MaterialIcons.font,
  });

  const scrollYRef = useRef(new Animated.Value(0));

  useEffect(() => {
    const inHome = currentState.type === 'home';
    if (!inHome && scrollYRef.current) {
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
  if (!fontsLoaded || splashVisible) {
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
    if (id === "display_board") {
      const playStoreUrl = "https://play.google.com/store/apps/details?id=com.case_display_app&pcampaignid=web_share";
      Linking.openURL(playStoreUrl).catch(() =>
        addToHistory({ type: 'webview', url: displayBoardUrl })
      );
      return;
    }
    if (id === "judgment_search") {
      addToHistory({ type: 'webview', url: "https://judgments.ecourts.gov.in/pdfsearch/index.php" });
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
    if (id === "ebooks") {
      setDrawerExpandSection("ebooks");
      setDrawerOpen(true);
      return;
    }
    addToHistory({ type: 'webview', url: "https://ghconline.gov.in/" });
  };

  return (
    <SafeAreaProvider style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
      <Header onMenu={() => setDrawerOpen(true)} onSearch={() => setSearchOpen(true)} scrollY={scrollYRef.current} />
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
        <AboutScreen scrollY={scrollYRef.current} />
      ) : showContact ? (
        <ContactScreen scrollY={scrollYRef.current} />
      ) : showPrivacy ? (
        <PrivacyPolicyScreen scrollY={scrollYRef.current} />
      ) : (
        <HomeContent
          judges={judgesData}
          selectedJudgeIndex={selectedJudgeIndex}
          onSelectJudge={(idx) => setSelectedJudgeIndex(idx)}
          onOpenPortfolio={() => setPortfolioOpen(true)}
          services={serviceCards}
          onServicePress={handleServicePress}
          holidayTags={holidayTags}
          holidays={holidays}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onAbout={() => addToHistory({ type: 'about' })}
          onContact={() => addToHistory({ type: 'contact' })}
          onPrivacy={() => addToHistory({ type: 'privacy' })}
          scrollY={scrollYRef.current}
        />
      )}

      <BottomNav
        onHome={handleHome}
        onBack={handleBack}
        onForward={handleForward}
        disableBack={historyIndex === 0 && (!showWebView || !canGoBack)}
        disableForward={historyIndex === history.length - 1 && (!showWebView || !canGoForward)}
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
      <CauseListModal visible={causeOpen} onClose={() => setCauseOpen(false)} />

      <SearchModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
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
  root: { flex: 1, backgroundColor: colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0 },
});

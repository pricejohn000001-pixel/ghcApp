import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { StatusBar, StyleSheet, View, BackHandler } from "react-native";
import { useFonts } from "expo-font";
import { AntDesign, Entypo, Feather, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Header } from "./src/components/Header";
import { BottomNav } from "./src/components/BottomNav";
import { DrawerMenu } from "./src/components/DrawerMenu";
import { PortfolioModal } from "./src/components/PortfolioModal";
import { LiveWebView } from "./src/components/LiveWebView";
import { holidays, holidayTags, judge, judges, serviceCards } from "./src/data";
import { colors } from "./src/theme";
import { CauseListModal } from "./src/components/CauseListModal";
import { AboutScreen } from "./src/components/AboutScreen";
import { ContactScreen } from "./src/components/ContactScreen";
import { PrivacyPolicyScreen } from "./src/components/PrivacyPolicyScreen";
import { HomeContent } from "./src/components/HomeContent";
import { CourtLinks } from "./src/components/CourtLinks";
import { SplashScreen } from "./src/components/SplashScreen";
import "./src/i18n";

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerExpandSection, setDrawerExpandSection] = useState(null);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [causeOpen, setCauseOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [selectedJudgeIndex, setSelectedJudgeIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [showCourtLinks, setShowCourtLinks] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [lastWebViewUrl, setLastWebViewUrl] = useState(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = useRef(null);
  const displayBoardUrl = "https://ghcservices.assam.gov.in/ghc_display/index.php";
  const registryUrl = "https://ghconline.gov.in/index.php/registry/";
  const [cameFromCourtLinks, setCameFromCourtLinks] = useState(false);
  const [cameFromMenu, setCameFromMenu] = useState(false);
  const [fontsLoaded] = useFonts({
    ...AntDesign.font,
    ...Entypo.font,
    ...Feather.font,
    ...FontAwesome.font,
    ...Ionicons.font,
    ...MaterialIcons.font,
  });

  const menuUrls = {
    "judges_sc_sitting": "https://ghconline.gov.in/index.php/honourable-sitting-judges-of-the-supreme-court-of-india/",
    "judges_sc_former": "https://ghconline.gov.in/index.php/former-honble-judges-of-the-supreme-court-of-india-chief-justice-of-india-who-served-as-chief-justice-honble-judge-of-this-high-court/",
    "judges_ghc_former_cj": "https://ghconline.gov.in/index.php/former-honourable-chief-justices-of-gauhati-high-court/",
    "judges_ghc_former": "https://ghconline.gov.in/index.php/former-honourable-judges-of-the-gauhati-high-court/",
    "judges_transferred": "https://ghconline.gov.in/index.php/honourable-chief-justices-and-judges-of-the-gauhati-high-court-appointed-or-transferred-as-chief-justices-of-other-high-court/",
    "bench_kohima": "https://kohimahighcourt.gov.in",
    "bench_aizawl": "http://ghcazlbench.nic.in",
    "bench_itanagar": "http://ghcitanagar.gov.in",
    "reg_present": "https://ghconline.gov.in/index.php/registry/",
    "reg_former_gen": "https://ghconline.gov.in/index.php/former-registrar-general/",
    "reg_former_vig": "https://ghconline.gov.in/index.php/former-registrar-i-e-vigilance/",
    "reg_former_sec": "https://ghconline.gov.in/index.php/former-registrar-cum-principal-secretary-to-honble-the-chief-justice/",
    "reg_former_jud": "https://ghconline.gov.in/index.php/former-registrar-judicial/",
    "reg_former_admin": "https://ghconline.gov.in/index.php/former-registrar-administration/",
    "reg_former_est": "https://ghconline.gov.in/index.php/former-registrar-establishment/",
    "link_sci": "https://www.sci.gov.in/",
    "link_sclsc": "https://sclsc.gov.in/",
    "link_ghclsc": "https://ghconline.gov.in/ghclsc",
    "link_lri": "https://ghcservices.assam.gov.in/lri/",
    "link_jjc": "http://ghcjjmc.assam.gov.in",
    "link_bar": "https://ghconline.gov.in/index.php/bar-under-construction/",
    "link_med": "https://ghconline.gov.in/Mediation/index.html",
    "link_ja": "https://jaa.assam.gov.in/",
    "link_lawmin": "http://lawmin.gov.in/",
    "recruitment_judicial": "https://ghconline.gov.in/index.php/recruitment-judicial-officer/",
    "recruitment_principal": "https://ghconline.gov.in/index.php/recruitment-notices/",
    "recruitment_district": "https://ghconline.gov.in/index.php/recruitment-subordinate-courts/",
    "recruitment_other": "https://ghconline.gov.in/index.php/recruitment-other-organisations/",
    "recruitment_papers": "https://ghconline.gov.in/index.php/previous-year-question-papers/",
    "ebook_history": "https://ghconline.gov.in/index.php/gauhati-high-court-history-heritage-assamese-version/",
    "ebook_platinum": "https://ghconline.gov.in/index.php/platinum-jubilee-souvenir-of-the-gauhati-high-court-2023-2/",
    "district_courts": "https://ghconline.gov.in/index.php/district-courts/",
  };

  useEffect(() => {
    const handler = () => {
      const inHome = !showWebView && !showCourtLinks && !showAbout && !showContact && !showPrivacy;
      if (inHome) return false;
      if (showWebView) {
        if (cameFromMenu) {
          setLastWebViewUrl(currentUrl);
          setShowWebView(false);
          setCurrentUrl(null);
          setCameFromMenu(false);
        } else if (webViewRef.current && canGoBack) {
          webViewRef.current.goBack();
        } else if (cameFromCourtLinks) {
          setShowWebView(false);
          setCurrentUrl(null);
          setShowCourtLinks(true);
          setCameFromCourtLinks(false);
        } else {
          setLastWebViewUrl(currentUrl);
          setShowWebView(false);
          setCurrentUrl(null);
        }
      } else if (showCourtLinks) {
        setShowCourtLinks(false);
      } else if (showAbout) {
        setShowAbout(false);
      } else if (showContact) {
        setShowContact(false);
      } else if (showPrivacy) {
        setShowPrivacy(false);
      }
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => sub.remove();
  }, [showWebView, showCourtLinks, showAbout, showContact, showPrivacy, cameFromCourtLinks, cameFromMenu, canGoBack, currentUrl]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const [splashVisible, setSplashVisible] = useState(true);
  if (!fontsLoaded || splashVisible) {
    return <SplashScreen ready={fontsLoaded} onDone={() => setSplashVisible(false)} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
      <Header onMenu={() => setDrawerOpen(true)} />
      {showWebView && currentUrl ? (
        <LiveWebView
          url={currentUrl}
          webViewRef={webViewRef}
          onNavStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
            setCanGoForward(navState.canGoForward);
            if (navState?.url) setCurrentUrl(navState.url);
          }}
        />
      ) : showCourtLinks ? (
        <CourtLinks
          onSelect={(link) => {
            setCurrentUrl(link);
            setShowWebView(true);
            setShowCourtLinks(false);
            setCameFromCourtLinks(true);
            setCameFromMenu(false);
            setCanGoBack(false);
            setCanGoForward(false);
          }}
        />
      ) : showAbout ? (
        <AboutScreen />
      ) : showContact ? (
        <ContactScreen />
      ) : showPrivacy ? (
        <PrivacyPolicyScreen />
      ) : (
        <HomeContent
          judges={judges}
          selectedJudgeIndex={selectedJudgeIndex}
          onSelectJudge={(idx) => setSelectedJudgeIndex(idx)}
          onOpenPortfolio={() => setPortfolioOpen(true)}
          services={serviceCards}
          onServicePress={(id) => {
            if (id === "live_streaming") {
              setShowCourtLinks(true);
              setShowWebView(false);
              setCurrentUrl(null);
              return;
            }
            if (id === "cause_list") {
              setCauseOpen(true);
              return;
            }
            if (id === "display_board") {
              setCurrentUrl(displayBoardUrl);
              setShowWebView(true);
              setCameFromMenu(false);
              setCanGoBack(false);
              setCanGoForward(false);
              return;
            }
            if (id === "judgment_search") {
              setCurrentUrl("https://judgments.ecourts.gov.in/pdfsearch/index.php");
              setShowWebView(true);
              setCameFromMenu(false);
              setCanGoBack(false);
              setCanGoForward(false);
              return;
            }
            if (id === "registry") {
              setCurrentUrl(registryUrl);
              setShowWebView(true);
              setCameFromMenu(false);
              setCanGoBack(false);
              setCanGoForward(false);
              return;
            }
            if (id === "district_courts") {
              setCurrentUrl(menuUrls.district_courts);
              setShowWebView(true);
              setCameFromMenu(false);
              setCanGoBack(false);
              setCanGoForward(false);
              return;
            }
            if (id === "recruitments") {
              setDrawerExpandSection("recruitments");
              setDrawerOpen(true);
              return;
            }
            if (id === "justice_clock") {
              setCurrentUrl("https://justiceclock.ecourts.gov.in/justiceClock/?p=home/state&fstate_code=6");
              setShowWebView(true);
              setCameFromMenu(false);
              setCanGoBack(false);
              setCanGoForward(false);
              return;
            }
            if (id === "ebooks") {
              setDrawerExpandSection("ebooks");
              setDrawerOpen(true);
              return;
            }
            setCurrentUrl("https://ghconline.gov.in/");
            setShowWebView(true);
            setCameFromMenu(false);
            setCanGoBack(false);
            setCanGoForward(false);
          }}
          holidayTags={holidayTags}
          holidays={holidays}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onAbout={() => {
            setShowAbout(true);
            setShowWebView(false);
            setShowCourtLinks(false);
            setCurrentUrl(null);
          }}
          onContact={() => {
            setShowContact(true);
            setShowWebView(false);
            setShowCourtLinks(false);
            setCurrentUrl(null);
          }}
          onPrivacy={() => {
            setShowPrivacy(true);
            setShowWebView(false);
            setShowCourtLinks(false);
            setCurrentUrl(null);
          }}
        />
      )}

      <BottomNav
        onHome={() => {
          setShowWebView(false);
          setCurrentUrl(null);
          setShowCourtLinks(false);
          setCameFromCourtLinks(false);
          setShowAbout(false);
          setShowContact(false);
          setShowPrivacy(false);
        }}
        onBack={() => {
          if (showWebView) {
            if (cameFromMenu) {
              setLastWebViewUrl(currentUrl);
              setShowWebView(false);
              setCurrentUrl(null);
              setCameFromMenu(false);
            } else if (webViewRef.current && canGoBack) {
              webViewRef.current.goBack();
            } else {
              if (cameFromCourtLinks) {
                setShowWebView(false);
                setCurrentUrl(null);
                setShowCourtLinks(true);
                setCameFromCourtLinks(false);
              } else {
                setLastWebViewUrl(currentUrl);
                setShowWebView(false);
                setCurrentUrl(null);
              }
            }
          }
        }}
        onForward={() => {
          if (showWebView) {
            if (webViewRef.current && canGoForward) {
              webViewRef.current.goForward();
            }
          } else if (lastWebViewUrl) {
            setCurrentUrl(lastWebViewUrl);
            setShowWebView(true);
            setCanGoBack(false);
            setCanGoForward(false);
          }
        }}
        disableBack={!showWebView ? true : false}
        disableForward={showWebView ? !canGoForward : !lastWebViewUrl}
      />
      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItemLabel={showWebView ? (function(){
          if(!currentUrl) return null;
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
          if (label === "Home") {
            setDrawerOpen(false);
            setShowWebView(false);
            setCurrentUrl(null);
            setShowCourtLinks(false);
            setCameFromCourtLinks(false);
            setCameFromMenu(false);
            setShowAbout(false);
            setShowContact(false);
            setShowPrivacy(false);
            return;
          }
          const nextUrl = menuUrls[label];
          setCurrentUrl(nextUrl || "https://ghconline.gov.in/");
          setShowWebView(true);
          setCameFromMenu(true);
          setCanGoBack(false);
          setCanGoForward(false);
          setShowCourtLinks(false);
          setCameFromCourtLinks(false);
          setShowAbout(false);
          setShowContact(false);
          setShowPrivacy(false);
        }}
      />
      <PortfolioModal
        visible={portfolioOpen}
        onClose={() => setPortfolioOpen(false)}
        judge={judges[selectedJudgeIndex]}
      />
      <CauseListModal visible={causeOpen} onClose={() => setCauseOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0 },
});

import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View, Platform, ScrollView, RefreshControl } from "react-native";
import { colors } from "../theme";
import { WebView } from "react-native-webview";

export const LiveWebView = ({ url, webViewRef, onNavStateChange, scrollY }) => {
  const isYouTube = useMemo(
    () => /youtube\.com|youtu\.be/.test(url || ""),
    [url]
  );
  const isRegistry = useMemo(
    () => /ghconline\.gov\.in\/index\.php\/registry\/?/.test(url || ""),
    [url]
  );
  const isDistrictCourts = useMemo(
    () => /ghconline\.gov\.in\/index\.php\/district-courts\/?/.test(url || ""),
    [url]
  );
  const isRecruitment = useMemo(
    () => /ghconline\.gov\.in\/index\.php\/(recruitment-[^\/]+|previous-year-question-papers)\/?/.test(url || ""),
    [url]
  );
  const isGhcEbook = useMemo(
    () => /ghconline\.gov\.in\/index\.php\/(gauhati-high-court-history-heritage-assamese-version|platinum-jubilee-souvenir-of-the-gauhati-high-court-2023-2)\/?/.test(url || ""),
    [url]
  );
  const isJudgmentSearch = useMemo(
    () => /judgments\.ecourts\.gov\.in\/pdfsearch\/index\.php\/?/.test(url || ""),
    [url]
  );
  const isRegistrySection = useMemo(
    () => /ghconline\.gov\.in\/index\.php\/(former-registrar-general|former-registrar-i-e-vigilance|former-registrar-cum-principal-secretary-to-honble-the-chief-justice|former-registrar-judicial|former-registrar-administration|former-registrar-establishment)\/?$/.test(url || ""),
    [url]
  );
  const isGhcJudgesPages = useMemo(
    () => /ghconline\.gov\.in\/index\.php\/(honourable-sitting-judges-of-the-supreme-court-of-india|former-honble-judges-of-the-supreme-court-of-india-chief-justice-of-india-who-served-as-chief-justice-honble-judge-of-this-high-court|former-honourable-chief-justices-of-gauhati-high-court|former-honourable-judges-of-the-gauhati-high-court|honourable-chief-justices-and-judges-of-the-gauhati-high-court-appointed-or-transferred-as-chief-justices-of-other-high-court)\/?$/.test(url || ""),
    [url]
  );

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const POST_LOAD_DELAY_MS = 400;

  const injectScript = useMemo(() => {
    const commonScript = `
      (function(){
        function send(){
          try {
            var top = 0;
            try {
              top = (document.scrollingElement ? document.scrollingElement.scrollTop : (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0));
            } catch(e) {}
            var atTop = top <= 0;
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SCROLL_TOP', atTop: atTop })); } catch(e) {}
              try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SCROLL_Y', y: top })); } catch(e) {}
            }
          } catch(e) {}
        }
        try { window.addEventListener('scroll', send, { passive: true }); } catch(e) {}
        try { window.addEventListener('touchmove', send, { passive: true }); } catch(e) {}
        try { setInterval(send, 500); } catch(e) {}
        try { send(); } catch(e) {}
      })();
      true;
    `;
    if (isYouTube) {
      const css = `
        #masthead-container, ytd-masthead, .ytd-masthead,
        ytm-masthead, ytm-search-box, #search, #search-input, #chips,
        #footer, ytm-pivot-bar-renderer, .pivot-shown, .pivot-tabs, #pivot-tabs,
        ytd-guide-renderer, #guide, #guide-button, ytm-mobile-topbar-renderer,
        ytd-topbar-logo-renderer, #buttons, #center, #logo {
          display: none !important;
        }
        ytd-app { --ytd-masthead-height: 0px !important; }

        #secondary,
        ytd-comments,
        #comments,
        ytd-video-primary-info-renderer,
        ytd-video-owner-renderer,
        ytd-subscribe-button-renderer,
        ytd-channel-name,
        #owner,
        #info,
        #title,
        ytd-watch-next-secondary-results-renderer,
        ytd-merch-shelf-renderer,
        ytd-reel-shelf-renderer,
        ytd-shelf-renderer,
        ytd-video-secondary-info-renderer,
        ytd-watch-metadata,
        #below {
          display: none !important;
        }

        ytm-related-results,
        ytm-comments-entry-point-header,
        ytm-slim-video-metadata,
        ytm-slim-owner-renderer,
        ytm-slim-video-information-renderer,
        ytm-subscribe-button-renderer,
        ytm-item-section-renderer,
        ytm-merch-shelf-renderer,
        ytm-reel-shelf-renderer,
        ytm-browse {
          display: none !important;
        }

        .ytp-pause-overlay,
        .ytp-endscreen-content,
        .ytp-endscreen {
          display: none !important;
        }

        ytd-watch-flexy #primary { max-width: 100% !important; width: 100% !important; }
        ytd-watch-flexy #primary #player, ytd-player {
          max-width: 820px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          display: block !important;
        }
        html, body, ytd-app { background: #000 !important; }
      `;
      return `
        (function(){
          function apply(){
            var style = document.getElementById('rn-youtube-hide-style');
            if(!style){
              style = document.createElement('style');
              style.id = 'rn-youtube-hide-style';
              style.type = 'text/css';
              style.appendChild(document.createTextNode(${JSON.stringify(css)}));
              (document.head || document.documentElement).appendChild(style);
            }
            try {
              ['#secondary','ytd-comments','#comments','ytd-video-primary-info-renderer','ytd-video-owner-renderer','ytd-subscribe-button-renderer','ytd-channel-name','#owner','#info','#title','ytd-watch-next-secondary-results-renderer','ytd-merch-shelf-renderer','ytd-reel-shelf-renderer','ytd-shelf-renderer','ytd-video-secondary-info-renderer','ytd-watch-metadata','#below','ytm-related-results','ytm-comments-entry-point-header','ytm-slim-video-metadata','ytm-slim-owner-renderer','ytm-slim-video-information-renderer','ytm-subscribe-button-renderer','ytm-item-section-renderer','ytm-merch-shelf-renderer','ytm-reel-shelf-renderer','ytm-browse'].forEach(function(sel){
                document.querySelectorAll(sel).forEach(function(el){ el.style.display='none'; });
              });
              try {
                var player = document.querySelector('ytd-watch-flexy #primary #player, ytd-player');
                if (player) {
                  player.style.maxWidth = '820px';
                  player.style.marginLeft = 'auto';
                  player.style.marginRight = 'auto';
                  player.style.display = 'block';
                }
              } catch(e){}
            } catch(e){}
          }
          apply();
          setInterval(apply, 1000);
        })();
        true;
      ` + "\n" + commonScript;
    }
    if (isRegistry) {
      const css = `
        header, footer, nav, #sp-header, #sp-footer, .t3-header, .t3-footer,
        .breadcrumb, .breadcrumbs, .uk-breadcrumb, .page-breadcrumb,
        #sp-title, .sp-page-title, .tm-page-title, .banner, .hero, .page-cover {
          display: none !important;
        }
      `;
      return `
        (function(){
          function apply(){
            var style = document.getElementById('rn-ghc-hide-style');
            if(!style){
              style = document.createElement('style');
              style.id = 'rn-ghc-hide-style';
              style.type = 'text/css';
              style.appendChild(document.createTextNode(${JSON.stringify(css)}));
              (document.head || document.documentElement).appendChild(style);
            }
            try {
              document.querySelectorAll('.page-cover,.page-breadcrumb').forEach(function(el){ el.style.display='none'; });
              Array.from(document.querySelectorAll('h4')).forEach(function(h){
                var t = (h.textContent||'').trim().toLowerCase();
                if(t.indexOf('contact addresses') !== -1){
                  var prev = h.previousElementSibling;
                  if(prev && prev.tagName==='HR') prev.style.display='none';
                  h.style.display='none';
                  var next = h.nextElementSibling;
                  if(next && next.tagName==='HR'){ next.style.display='none'; next = next.nextElementSibling; }
                  while(next && next.tagName==='P'){
                    next.style.display='none';
                    next = next.nextElementSibling;
                  }
                }
              });
            } catch(e){}
          }
          var ih = document.getElementById('rn-initial-hide');
          if(!ih){
            ih = document.createElement('style');
            ih.id = 'rn-initial-hide';
            ih.type = 'text/css';
            ih.appendChild(document.createTextNode('html,body{opacity:0 !important;background:#0D1B38 !important}'));
            (document.head || document.documentElement).appendChild(ih);
          }
          apply();
          try{
            var rem = document.getElementById('rn-initial-hide');
            if(rem){
              setTimeout(function(){
                var r = document.getElementById('rn-initial-hide');
                if(r && r.parentNode){ r.parentNode.removeChild(r); }
              }, 1000);
            }
          }catch(e){}
          setInterval(apply, 1000);
        })();
        true;
      ` + "\n" + commonScript;
    }
    if (isDistrictCourts) {
      const css = `
        header, footer, nav, #sp-header, #sp-footer, .t3-header, .t3-footer,
        .site-header, .site-footer, .page-breadcrumb, .breadcrumbs, .breadcrumb,
        #sp-title, .sp-page-title, .tm-page-title, .banner, .hero, .page-cover,
        .top-bar, .navbar, .navigation, .menu, .masthead {
          display: none !important;
        }
        .sidebar, .sidebar-primary, #secondary, .widget-area, .t3-sidebar, .tm-sidebar {
          display: none !important;
        }
        html, body {
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
          overscroll-behavior-x: none !important;
          height: auto !important;
          min-height: 100% !important;
          overscroll-behavior: none !important;
        }
        #primary, .content-area, #content, #sp-component, .t3-content, .tm-content, main,
        .container, .container-fluid, .site-wrapper, .wrapper, article, .item-page, .entry-content,
        .elementor-section, .elementor-container, .elementor-widget-container {
          background: #ffffff !important;
          margin-left: auto !important;
          margin-right: auto !important;
          max-width: 820px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        img, iframe, object, embed { max-width: 100% !important; height: auto !important; }
        table { width: 100% !important; max-width: 100% !important; }
      `;
      return `
        (function(){
          function apply(){
            var style = document.getElementById('rn-ghc-district-style');
            if(!style){
              style = document.createElement('style');
              style.id = 'rn-ghc-district-style';
              style.type = 'text/css';
              style.appendChild(document.createTextNode(${JSON.stringify(css)}));
              (document.head || document.documentElement).appendChild(style);
            }
            try {
              document.querySelectorAll('.page-cover,.page-breadcrumb,.t3-sidebar,.tm-sidebar,.sidebar,.sidebar-primary,#secondary,.widget-area').forEach(function(el){ el.style.display='none'; });
              var containers = document.querySelectorAll('#primary,.content-area,#content,#sp-component,.t3-content,.tm-content,main,.container,.container-fluid,.site-wrapper,.wrapper,article,.item-page,.entry-content');
              containers.forEach(function(c){
                c.style.maxWidth='820px';
                c.style.marginLeft='auto';
                c.style.marginRight='auto';
                c.style.background='#fff';
                c.style.width='100%';
                c.style.boxSizing='border-box';
              });
              document.documentElement.style.overflowX='hidden';
              document.body.style.overflowX='hidden';
            } catch(e){}
          }
          apply();
          setInterval(apply, 1000);
        })();
        true;
      ` + "\n" + commonScript;
    }
    if (isRecruitment) {
      const css = `
        header, footer, nav, #sp-header, #sp-footer, .t3-header, .t3-footer,
        .site-header, .site-footer, .page-breadcrumb, .breadcrumbs, .breadcrumb,
        #sp-title, .sp-page-title, .tm-page-title, .banner, .hero, .page-cover,
        .top-bar, .navbar, .navigation, .menu, .masthead {
          display: none !important;
        }
        .sidebar, .sidebar-primary, #secondary, .widget-area, .t3-sidebar, .tm-sidebar {
          display: none !important;
        }
        html, body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden !important; }
        #primary, .content-area, #content, #sp-component, .t3-content, .tm-content, main,
        .container, .container-fluid, .site-wrapper, .wrapper, article, .item-page, .entry-content,
        .elementor-section, .elementor-container, .elementor-widget-container {
          background: #ffffff !important; margin-left: auto !important; margin-right: auto !important; max-width: 820px !important; width: 100% !important; box-sizing: border-box !important;
        }
        img, iframe, object, embed { max-width: 100% !important; height: auto !important; }
        table { width: 100% !important; max-width: 100% !important; }
      `;
      return `
        (function(){
          function apply(){
            var style = document.getElementById('rn-ghc-recruit-style');
            if(!style){
              style = document.createElement('style');
              style.id = 'rn-ghc-recruit-style';
              style.type = 'text/css';
              style.appendChild(document.createTextNode(${JSON.stringify(css)}));
              (document.head || document.documentElement).appendChild(style);
            }
            try {
              document.documentElement.style.overflowX='hidden';
              document.body.style.overflowX='hidden';
              document.querySelectorAll('.page-cover,.page-breadcrumb,.t3-sidebar,.tm-sidebar,.sidebar,.sidebar-primary,#secondary,.widget-area').forEach(function(el){ el.style.display='none'; });
            } catch(e){}
          }
          apply();
          setInterval(apply, 1000);
        })();
        true;
      ` + "\n" + commonScript;
    }
    if (isGhcEbook) {
      const css = `
        header, footer, nav, #sp-header, #sp-footer, .t3-header, .t3-footer,
        .breadcrumb, .breadcrumbs, .uk-breadcrumb, .page-breadcrumb,
        #sp-title, .sp-page-title, .tm-page-title, .banner, .hero, .page-cover,
        .sidebar, .t3-sidebar, .tm-sidebar {
          display: none !important;
        }
        html, body {
          background: #0D1B38 !important;
          margin: 0 !important;
          padding: 0 !important;
          height: 100% !important;
          min-height: 100% !important;
          overscroll-behavior: none !important;
        }
        #sp-component, .t3-content, .tm-content, main,
        .container, .container-fluid, .site-wrapper, .wrapper,
        article, .item-page, .entry-content,
        .elementor-section, .elementor-container, .elementor-widget-container {
          margin: 0 !important;
          padding: 0 !important;
          height: 100vh !important;
          min-height: 100vh !important;
        }
        iframe, object, embed {
          display: block !important;
          width: 100% !important;
          height: 100vh !important;
          max-width: 100% !important;
          border: 0 !important;
        }
      `;
      return `
        (function(){
          function apply(){
            var style = document.getElementById('rn-ghc-hide-style');
            if(!style){
              style = document.createElement('style');
              style.id = 'rn-ghc-hide-style';
              style.type = 'text/css';
              style.appendChild(document.createTextNode(${JSON.stringify(css)}));
              (document.head || document.documentElement).appendChild(style);
            }
            try {
              document.body.style.margin='0';
              document.body.style.padding='0';
              document.querySelectorAll('.page-cover,.page-breadcrumb,.t3-sidebar,.tm-sidebar,.sidebar').forEach(function(el){ el.style.display='none'; });
              var comp = document.querySelector('#sp-component, .t3-content, .tm-content, main');
              if(comp){ comp.style.padding='0'; comp.style.margin='0'; comp.style.minHeight='100vh'; }
              var ifr = document.querySelector('iframe, object, embed');
              if(ifr){
                ifr.style.width='100%';
                ifr.style.height= window.innerHeight + 'px';
                ifr.style.border='0';
                ifr.style.maxWidth='100%';
              }
            } catch(e){}
          }
          apply();
          setInterval(apply, 1000);
        })();
        true;
      ` + "\n" + commonScript;
    }
    if (isJudgmentSearch) {
      const css = `
        header, footer, nav, .navbar, .topbar, .breadcrumb,
        #header, #footer, .site-header, .site-footer,
        .page-title, .banner, .masthead {
          display: none !important;
        }
        html, body {
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
        }
        .container, .container-fluid, .wrapper, .content, main {
          max-width: 900px !important;
          width: 100% !important;
          margin-left: auto !important;
          margin-right: auto !important;
          box-sizing: border-box !important;
        }
      `;
      return `
        (function(){
          function apply(){
            var style = document.getElementById('rn-ecourts-judgment-style');
            if(!style){
              style = document.createElement('style');
              style.id = 'rn-ecourts-judgment-style';
              style.type = 'text/css';
              style.appendChild(document.createTextNode(${JSON.stringify(css)}));
              (document.head || document.documentElement).appendChild(style);
            }
            try {
              document.documentElement.style.overflowX='hidden';
              document.body.style.overflowX='hidden';
            } catch(e){}
          }
          apply();
          setInterval(apply, 1000);
        })();
        true;
      ` + "\n" + commonScript;
    }
    if (isGhcJudgesPages) {
      const css = `
        header, footer, nav, #sp-header, #sp-footer, .t3-header, .t3-footer,
        .breadcrumb, .breadcrumbs, .uk-breadcrumb, .page-breadcrumb,
        #sp-title, .sp-page-title, .tm-page-title, .banner, .hero, .page-cover,
        .site-header, .site-footer, .top-bar, .navbar, .navigation, .menu, .masthead,
        .sidebar, .sidebar-primary, #secondary, .widget-area,
        .calendar, .widget_calendar, .calendar_wrap {
          display: none !important;
        }
        html, body {
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
          height: auto !important;
          min-height: 100% !important;
        }
        #primary, .content-area, #content, #sp-component, .t3-content, .tm-content, main,
        .container, .container-fluid, .site-wrapper, .wrapper, article, .item-page, .entry-content,
        .elementor-section, .elementor-container, .elementor-widget-container {
          background: #ffffff !important;
          margin-left: auto !important;
          margin-right: auto !important;
          max-width: 820px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        img, iframe, object, embed { max-width: 100% !important; height: auto !important; }
        table { width: 100% !important; max-width: 100% !important; }
      `;
      return `
        (function(){
          function apply(){
            var style = document.getElementById('rn-ghc-judges-style');
            if(!style){
              style = document.createElement('style');
              style.id = 'rn-ghc-judges-style';
              style.type = 'text/css';
              style.appendChild(document.createTextNode(${JSON.stringify(css)}));
              (document.head || document.documentElement).appendChild(style);
            }
            try {
              document.documentElement.style.overflowX='hidden';
              document.body.style.overflowX='hidden';
              document.querySelectorAll('.page-cover,.page-breadcrumb,.t3-sidebar,.tm-sidebar,.sidebar,.sidebar-primary,#secondary,.widget-area,.calendar,.widget_calendar,.calendar_wrap').forEach(function(el){ el.style.display='none'; });
            } catch(e){}
          }
          apply();
          setInterval(apply, 1000);
        })();
        true;
      ` + "\n" + commonScript;
    }
    if (isRegistrySection) {
      const css = `
        header, footer, nav, #sp-header, #sp-footer, .t3-header, .t3-footer,
        .breadcrumb, .breadcrumbs, .uk-breadcrumb, .page-breadcrumb,
        #sp-title, .sp-page-title, .tm-page-title, .banner, .hero, .page-cover,
        .site-header, .site-footer, .top-bar, .navbar, .navigation, .menu, .masthead,
        .sidebar, .sidebar-primary, #secondary, .widget-area,
        .calendar, .widget_calendar, .calendar_wrap {
          display: none !important;
        }
        html, body {
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
          height: auto !important;
          min-height: 100% !important;
        }
        #primary, .content-area, #content, #sp-component, .t3-content, .tm-content, main,
        .container, .container-fluid, .site-wrapper, .wrapper, article, .item-page, .entry-content,
        .elementor-section, .elementor-container, .elementor-widget-container {
          background: #ffffff !important;
          margin-left: auto !important;
          margin-right: auto !important;
          max-width: 820px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        img, iframe, object, embed { max-width: 100% !important; height: auto !important; }
        table { width: 100% !important; max-width: 100% !important; }
      `;
      return `
        (function(){
          function apply(){
            var style = document.getElementById('rn-ghc-registry-style');
            if(!style){
              style = document.createElement('style');
              style.id = 'rn-ghc-registry-style';
              style.type = 'text/css';
              style.appendChild(document.createTextNode(${JSON.stringify(css)}));
              (document.head || document.documentElement).appendChild(style);
            }
            try {
              document.documentElement.style.overflowX='hidden';
              document.body.style.overflowX='hidden';
              document.querySelectorAll('.page-cover,.page-breadcrumb,.t3-sidebar,.tm-sidebar,.sidebar,.sidebar-primary,#secondary,.widget-area,.calendar,.widget_calendar,.calendar_wrap').forEach(function(el){ el.style.display='none'; });
            } catch(e){}
          }
          apply();
          setInterval(apply, 1000);
        })();
        true;
      ` + "\n" + commonScript;
    }
    return commonScript;
  }, [isYouTube, isRegistry, isDistrictCourts, isRecruitment, isGhcEbook, isJudgmentSearch, isGhcJudgesPages, isRegistrySection]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              enabled={canRefresh}
              onRefresh={() => {
                setRefreshing(true);
                try {
                  webViewRef?.current?.reload();
                } finally {
                  setTimeout(() => setRefreshing(false), 500);
                }
              }}
              tintColor="#fff"
            />
          }
        >
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            javaScriptEnabled
            domStorageEnabled
            allowsFullscreenVideo
            originWhitelist={["*"]}
            onNavigationStateChange={onNavStateChange}
            setSupportMultipleWindows={false}
            onShouldStartLoadWithRequest={(request) => true}
            onLoadStart={() => {
              if (isRegistry) setOverlayVisible(true);
            }}
            onLoadEnd={() => {
              if (isRegistry) {
                setTimeout(() => setOverlayVisible(false), 1000);
              } else {
                setOverlayVisible(false);
              }
              setRefreshing(false);
            }}
            renderLoading={() => (
              <View style={styles.overlay} pointerEvents="none">
                <ActivityIndicator color="#fff" size="large" />
              </View>
            )}
            injectedJavaScript={injectScript}
            injectedJavaScriptBeforeContentLoaded={injectScript}
            startInLoadingState
            bounces
            onMessage={(e) => {
              try {
                const data = JSON.parse(e?.nativeEvent?.data || '{}');
                if (data && data.type === 'SCROLL_TOP') {
                  setCanRefresh(!!data.atTop);
                } else if (data && data.type === 'SCROLL_Y') {
                  try {
                    const y = Number(data.y) || 0;
                    if (scrollY && typeof scrollY.setValue === 'function') {
                      scrollY.setValue(y);
                    }
                  } catch (_) {}
                }
              } catch (err) {}
            }}
          />
          {overlayVisible && (
            <View style={styles.overlay} pointerEvents="none">
              <ActivityIndicator color="#fff" size="large" />
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            javaScriptEnabled
            domStorageEnabled
            allowsFullscreenVideo
            originWhitelist={["*"]}
            onNavigationStateChange={onNavStateChange}
            setSupportMultipleWindows={false}
            onShouldStartLoadWithRequest={(request) => true}
            onLoadStart={() => {
              setOverlayVisible(true);
            }}
            onLoadEnd={() => {
              if (isRegistry) {
                setTimeout(() => setOverlayVisible(false), 1000);
              } else {
                setTimeout(() => setOverlayVisible(false), POST_LOAD_DELAY_MS);
              }
              setRefreshing(false);
            }}
            renderLoading={() => (
              <View style={styles.overlay} pointerEvents="none">
                <ActivityIndicator color="#fff" size="large" />
              </View>
            )}
            injectedJavaScript={injectScript}
            injectedJavaScriptBeforeContentLoaded={injectScript}
            startInLoadingState
            bounces={false}
            overScrollMode={'auto'}
            pullToRefreshEnabled
            onRefresh={() => {
              setRefreshing(true);
              try {
                webViewRef?.current?.reload();
              } finally {
                setTimeout(() => setRefreshing(false), 500);
              }
            }}
            onMessage={(e) => {
              try {
                const data = JSON.parse(e?.nativeEvent?.data || '{}');
                if (data && data.type === 'SCROLL_Y') {
                  try {
                    const y = Number(data.y) || 0;
                    if (scrollY && typeof scrollY.setValue === 'function') {
                      scrollY.setValue(y);
                    }
                  } catch (_) {}
                } else if (data && data.type === 'SCROLL_TOP') {
                  setCanRefresh(!!data.atTop);
                }
              } catch (err) {}
            }}
          />
          {overlayVisible && (
            <View style={styles.overlay} pointerEvents="none">
              <ActivityIndicator color="#fff" size="large" />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
});

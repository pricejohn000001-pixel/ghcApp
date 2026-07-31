import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, FlatList, Modal, Platform, Animated, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme";
import { serviceCards, holidays, menuUrls } from "../data";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  speechRecognitionAvailable,
} from "../utils/speechRecognition";

export const SearchModal = ({ visible, onClose, onNavigate, judges = [] }) => {
  const { colors, radius, spacing, fonts } = useAppTheme();
  const { t } = useTranslation();
  const styles = React.useMemo(() => createStyles(colors, radius, spacing, fonts), [colors, radius, spacing, fonts]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);
  const waveAnims = useRef(Array.from({ length: 5 }, () => new Animated.Value(0.6))).current;
  const waveLoops = useRef([]);
  const overlayColor = colors.overlay;

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setError(null);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript;
    if (transcript) {
      setQuery(transcript);
      setHasAttempted(true);
      handleSearch(transcript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);
    const msg = event.message || event.error || "";
    if (/no match|no-speech|nomatch/i.test(msg)) {
      setHasAttempted(true);
      setError(null);
      return;
    }
    setError(msg);
  });

  useEffect(() => {
    if (isListening) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1.0, duration: 700, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
      waveLoops.current = waveAnims.map((a, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(a, { toValue: 1.2, duration: 450, useNativeDriver: true }),
            Animated.timing(a, { toValue: 0.6, duration: 450, useNativeDriver: true }),
          ])
        )
      );
      waveLoops.current.forEach((l, i) => setTimeout(() => l.start(), i * 120));
    } else {
      if (pulseLoop.current && typeof pulseLoop.current.stop === "function") {
        pulseLoop.current.stop();
      }
      pulse.setValue(1);
      waveLoops.current.forEach((l) => {
        if (l && typeof l.stop === "function") l.stop();
      });
      waveAnims.forEach((a) => a.setValue(0.6));
    }
  }, [isListening]);

  const startListening = async () => {
    setError(null);
    if (!speechRecognitionAvailable) {
      setError("Voice search is not available in this environment.");
      return;
    }

    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        setError("Microphone permission required");
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
        androidIntentOptions: {
          EXTRA_LANGUAGE_MODEL: "web_search",
        },
      });
    } catch (e) {
      console.error(e);
      setError("Failed to start voice recognition");
    }
  };

  const stopListening = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = (text) => {
    setQuery(text);
    const trimmed = text.trim();
    if (!trimmed) {
      setResults([]);
      setHasAttempted(false);
      return;
    }
    setHasAttempted(true);

    const lowerQuery = text.toLowerCase();
    const searchResults = [];

    // Search Judges
    judges.forEach((judge) => {
      if (judge.name.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          type: "judge",
          id: judge.id,
          title: judge.name,
          subtitle: judge.title || "Judge",
          data: judge,
        });
      }
    });

    // Search Services
    serviceCards.forEach((service) => {
      const title = t(`services.${service.id}.title`);
      const subtitle = t(`services.${service.id}.subtitle`);
      if (
        title.toLowerCase().includes(lowerQuery) ||
        subtitle.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: "service",
          id: service.id,
          title: title,
          subtitle: subtitle,
          data: service,
        });
      }
    });

    // Search Holidays
    holidays.forEach((holiday) => {
      if (holiday.label.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          type: "holiday",
          title: holiday.label,
          subtitle: `${holiday.month}/${holiday.year} - ${holiday.badge}`,
          data: holiday
        })
      }
    });

    // Search Sub-menus (Links)
    Object.keys(menuUrls).forEach((key) => {
      const title = t(`drawer.items.${key}`, key);
      if (title.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          type: "link",
          id: key,
          title: title,
          subtitle: "Quick Link",
          data: menuUrls[key],
        });
      }
    });

    setResults(searchResults);
  };

  const handleItemPress = (item) => {
    onNavigate(item);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: overlayColor }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={colors.accent} />
              <TextInput
                style={[styles.input, { color: colors.accent }]}
                placeholder={t("search.placeholder", "Search...")}
                placeholderTextColor={colors.textSecondary}
                value={query}
                onChangeText={handleSearch}
                autoFocus
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch("")}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              <View style={styles.micWrap}>
                <TouchableOpacity
                  onPress={isListening ? stopListening : startListening}
                  style={[
                    styles.voiceButton,
                    !speechRecognitionAvailable && styles.voiceButtonDisabled,
                  ]}
                  disabled={!speechRecognitionAvailable}
                >
                  <Ionicons
                    name={isListening ? "mic" : "mic-outline"}
                    size={20}
                    color={colors.accent}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>{t("nav.back", "Cancel")}</Text>
            </TouchableOpacity>
          </View>

          {isListening && (
            <View style={styles.listeningOverlay}>
              <Text style={styles.listeningText}>Listening...</Text>
              <View style={styles.waveWrap}>
                {waveAnims.map((a, idx) => (
                  <Animated.View key={idx} style={[styles.waveBar, { transform: [{ scaleY: a }] }]} />
                ))}
              </View>
            </View>
          )}

          {error && (!String(error).toLowerCase().includes('no match')) && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <FlatList
            data={results}
            keyExtractor={(item, index) => index.toString()}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.iconContainer}>
                  {item.type === "judge" && (
                    <Ionicons name="person" size={20} color={colors.accent} />
                  )}
                  {item.type === "service" && (
                    <Ionicons name="grid" size={20} color={colors.accent} />
                  )}
                  {item.type === "holiday" && (
                    <Ionicons name="calendar" size={20} color={colors.accent} />
                  )}
                  {item.type === "link" && (
                    <Ionicons name="link" size={20} color={colors.accent} />
                  )}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward"
                  size={20}
                  color={colors.accent}
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={() =>
              !error && hasAttempted && results.length === 0 && !isListening ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search" size={36} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>No result found</Text>
                  <Text style={styles.emptySubtitle}>We can't find any item matching your search</Text>
                </View>
              ) : null
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors, radius, spacing, fonts) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-start",
    },
    content: {
      flex: 1,
      marginTop: Platform.OS === "android" ? (StatusBar.currentHeight || 40) : 40,
      backgroundColor: colors.primary,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
      gap: spacing.sm,
    },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardAlt,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.sm,
      height: 44,
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    micWrap: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    input: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 8,
      fontFamily: fonts.body,
    },
    voiceButton: {
      padding: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    voiceButtonDisabled: {
      opacity: 0.5,
    },
    closeButton: {
      padding: spacing.sm,
    },
    closeText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: fonts.bodySemiBold,
    },
    resultItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: 2,
      fontFamily: fonts.bodySemiBold,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: fonts.body,
    },
    errorText: {
      color: colors.danger,
      padding: spacing.md,
      textAlign: "center",
      fontFamily: fonts.body,
    },
    emptyContainer: {
      padding: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      flex: 1,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontFamily: fonts.bodySemiBold,
    },
    emptySubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: "center",
      fontFamily: fonts.body,
    },
    listeningOverlay: {
      alignItems: "center",
      justifyContent: "center",
      height: 220,
      gap: spacing.md,
    },
    listeningText: {
      color: colors.textSecondary,
      fontSize: 24,
      fontFamily: fonts.bodyBold,
    },
    waveWrap: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 6,
      height: 40,
    },
    waveBar: {
      width: 6,
      height: 28,
      backgroundColor: colors.accent,
      borderRadius: 3,
    },
  });

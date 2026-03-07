import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  Platform,
  Animated,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import Voice from "@react-native-voice/voice";
import { useTranslation } from "react-i18next";
import { colors, radius, spacing } from "../theme";
import { judges, serviceCards, holidays, menuUrls } from "../data";

export const SearchModal = ({ visible, onClose, onNavigate }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);
  const waveAnims = useRef(Array.from({ length: 5 }, () => new Animated.Value(0.6))).current;
  const waveLoops = useRef([]);

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value[0]) {
        setQuery(e.value[0]);
        setHasAttempted(true);
        handleSearch(e.value[0]);
      }
    };
    Voice.onSpeechError = (e) => {
      setIsListening(false);
      const msg = (e && e.error && e.error.message) ? String(e.error.message) : "";
      if (/no match/i.test(msg)) {
        setHasAttempted(true);
        setError(null);
        return;
      }
      setError(msg);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

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
    try {
      await Voice.destroy();
      await Voice.start("en-US");
    } catch (e) {
      console.error(e);
      setError("Failed to start voice recognition");
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
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
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.searchBar}>
              <Feather name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={t("search.placeholder", "Search...")}
                value={query}
                onChangeText={handleSearch}
                autoFocus
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch("")}>
                  <Feather name="x" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              <View style={styles.micWrap}>
                <TouchableOpacity
                  onPress={isListening ? stopListening : startListening}
                  style={styles.voiceButton}
                >
                  <Ionicons
                    name={isListening ? "mic" : "mic-outline"}
                    size={20}
                    color={colors.primary}
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
                    <Feather name="user" size={20} color={colors.primary} />
                  )}
                  {item.type === "service" && (
                    <Feather name="grid" size={20} color={colors.primary} />
                  )}
                  {item.type === "holiday" && (
                    <Feather name="calendar" size={20} color={colors.primary} />
                  )}
                  {item.type === "link" && (
                    <Feather name="link" size={20} color={colors.primary} />
                  )}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={() =>
              !error && hasAttempted && results.length === 0 && !isListening ? (
                <View style={styles.emptyContainer}>
                  <Feather name="search" size={36} color={colors.textSecondary} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
  },
  content: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 40 : 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    height: 44,
    gap: spacing.xs,
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
    color: "#000",
    paddingVertical: 8,
  },
  voiceButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#444",
  },
  errorText: {
    color: "red",
    padding: spacing.md,
    textAlign: "center",
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
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
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
    fontWeight: "700",
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
    backgroundColor: "#1E63D6",
    borderRadius: 3,
  },
});

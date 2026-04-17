import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAIAnalysis, AIReport } from '../services/aiAnalysisService';

type Status = 'idle' | 'loading' | 'error';

export const AIAnalysisScreen = () => {
  const insets = useSafeAreaInsets();

  const [data, setData]         = useState<AIReport | null>(null);
  const [status, setStatus]     = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;
  const errorFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const cached = await getAIAnalysis(false);
        if (cached.timestamp && cached.timestamp > 0) {
          setData(cached);
          animateIn();
        }
      } catch {}
    })();
  }, []);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(18);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    errorFade.setValue(0);
    Animated.timing(errorFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const fetchReport = useCallback(async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const result = await getAIAnalysis(true);
      if (result.timestamp === 0) throw new Error('Service temporarily unavailable');
      setData(result);
      setStatus('idle');
      animateIn();
    } catch (err: any) {
      setStatus('error');
      const raw: string = err?.message ?? '';
      if (raw.includes('503') || raw.toLowerCase().includes('high demand')) {
        showError('AI is overloaded right now. Try again in a moment.');
      } else if (raw.includes('429')) {
        showError('Rate limit reached. Please wait a few minutes.');
      } else if (raw.toLowerCase().includes('unavailable')) {
        showError('Service temporarily unavailable.');
      } else {
        showError('Something went wrong. Please try again.');
      }
    }
  }, []);

  const hasData = data !== null && data.timestamp !== 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 90,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>WEEKLY OVERVIEW</Text>
          <Text style={styles.header}>AI Advisor</Text>
        </View>
        <View style={styles.brainBadge}>
          <Text style={styles.brainEmoji}>🧠</Text>
        </View>
      </View>

      {/* Error banner */}
      {status === 'error' && errorMsg !== '' && (
        <Animated.View style={[styles.errorBanner, { opacity: errorFade }]}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity onPress={fetchReport} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Report card */}
      {hasData ? (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.reportCard}>
            <View style={styles.reportCardHeader}>
              <Text style={styles.cardLabel}>REPORT</Text>
              <View style={styles.liveDot} />
            </View>
            <Text style={styles.reportText}>{data!.report}</Text>
          </View>

          <Text style={styles.sectionTitle}>💡 Recommendations</Text>
          {data!.advice.map((item, i) => (
            <View key={i} style={[styles.adviceCard, i === 0 && styles.adviceCardFirst]}>
              <View style={styles.adviceIndex}>
                <Text style={styles.adviceIndexText}>{i + 1}</Text>
              </View>
              <View style={styles.adviceBody}>
                <Text style={styles.adviceTitle}>{item.title}</Text>
                <Text style={styles.adviceAction}>{item.action}</Text>
              </View>
            </View>
          ))}

          {data!.timestamp && data!.timestamp > 0 && (
            <Text style={styles.timestamp}>
              Updated {new Date(data!.timestamp).toLocaleString()}
            </Text>
          )}
        </Animated.View>
      ) : (
        !hasData && status !== 'loading' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>No report yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the button below to generate your first weekly analysis.
            </Text>
          </View>
        )
      )}

      {/* CTA */}
      <TouchableOpacity
        style={[styles.cta, status === 'loading' && styles.ctaDisabled]}
        onPress={fetchReport}
        activeOpacity={0.8}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <View style={styles.ctaInner}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.ctaText}>Analyzing…</Text>
          </View>
        ) : (
          <Text style={styles.ctaText}>
            {hasData ? '↻  Get a New Report' : '✦  Generate Report'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const PURPLE  = '#6C4DFF';
const PURPLE2 = '#8A6FFF';
const BG      = '#0D0E15';
const CARD    = '#13141F';
const CARD2   = '#181A28';
const BORDER  = '#1F2133';
const TEXT    = '#E8E9F3';
const MUTED   = '#6B6E8A';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingHorizontal: 24,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 10,
    color: PURPLE2,
    letterSpacing: 2.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT,
    letterSpacing: -0.5,
  },
  brainBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: CARD2,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brainEmoji: {
    fontSize: 22,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1020',
    borderWidth: 1,
    borderColor: '#3D1F4A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  errorIcon: {
    fontSize: 16,
    color: '#C97FE8',
  },
  errorText: {
    flex: 1,
    color: '#C097D4',
    fontSize: 13,
    lineHeight: 18,
  },
  retryBtn: {
    backgroundColor: '#2A1535',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryBtnText: {
    color: '#C097D4',
    fontSize: 12,
    fontWeight: '600',
  },

  reportCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    marginBottom: 28,
  },
  reportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardLabel: {
    fontSize: 10,
    color: MUTED,
    letterSpacing: 2,
    fontWeight: '600',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  reportText: {
    fontSize: 15,
    color: '#B0B3CC',
    lineHeight: 24,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 14,
  },

  adviceCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  adviceCardFirst: {
    borderColor: '#2A234A',
    backgroundColor: '#14112A',
  },
  adviceIndex: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  adviceIndexText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  adviceBody: {
    flex: 1,
  },
  adviceTitle: {
    color: TEXT,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 5,
  },
  adviceAction: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
  },

  timestamp: {
    fontSize: 11,
    color: '#3A3D58',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    letterSpacing: 0.3,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 21,
  },

  cta: {
    backgroundColor: PURPLE,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaDisabled: {
    backgroundColor: '#2E2650',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
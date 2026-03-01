import { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, getHealthFactorColor, getHealthFactorLevel } from '../../theme';
import { formatHealthFactor } from '../../lib/utils/format';

interface HealthFactorDisplayProps {
  healthFactor: number;
  previousHealthFactor?: number;
}

export function HealthFactorDisplay({
  healthFactor,
  previousHealthFactor,
}: HealthFactorDisplayProps) {
  const color = getHealthFactorColor(healthFactor);
  const level = getHealthFactorLevel(healthFactor);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (previousHealthFactor === undefined) return;

    const prevLevel = getHealthFactorLevel(previousHealthFactor);
    if (prevLevel !== level) {
      // Haptic feedback on threshold crossing
      if (level === 'critical') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (level === 'risky') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Scale animation
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [healthFactor, previousHealthFactor, level, scale]);

  const labelText =
    level === 'safe'
      ? 'Safe'
      : level === 'moderate'
        ? 'Moderate'
        : level === 'risky'
          ? 'At Risk'
          : 'Danger';

  // Gauge bar: map health factor 1.0-3.0 to 0-100%
  const gaugePercent = Math.min(Math.max((healthFactor - 1) / 2, 0), 1) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Health Factor</Text>
      <Animated.Text
        style={[styles.value, { color, transform: [{ scale }] }]}
      >
        {formatHealthFactor(healthFactor)}
      </Animated.Text>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.statusText, { color }]}>{labelText}</Text>
      </View>
      <View style={styles.gaugeTrack}>
        <View
          style={[
            styles.gaugeFill,
            {
              width: `${healthFactor === Infinity ? 100 : gaugePercent}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <View style={styles.gaugeLabels}>
        <Text style={styles.gaugeLabel}>1.0</Text>
        <Text style={styles.gaugeLabel}>2.0</Text>
        <Text style={styles.gaugeLabel}>3.0+</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gaugeTrack: {
    width: '80%',
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 3,
  },
  gaugeLabels: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gaugeLabel: {
    fontSize: 10,
    color: colors.textTertiary,
  },
});

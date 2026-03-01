import { StyleSheet, View, Text } from 'react-native';
import { colors, spacing } from '../../theme';

interface StatRowProps {
  label: string;
  value: string;
  valueColor?: string;
  suffix?: string;
}

export function StatRow({ label, value, valueColor, suffix }: StatRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, valueColor ? { color: valueColor } : undefined]}>
          {value}
        </Text>
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  suffix: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});

import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { TokenIcon } from '../ui/TokenIcon';
import { colors, spacing } from '../../theme';
import { formatUsd, formatPercent } from '../../lib/utils/format';
import { type ReserveData } from '../../types/market';

interface ReserveRowProps {
  reserve: ReserveData;
  onPress: () => void;
}

export function ReserveRow({ reserve, onPress }: ReserveRowProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <TokenIcon symbol={reserve.symbol} size={36} />
      <View style={styles.info}>
        <Text style={styles.symbol}>{reserve.symbol}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {reserve.name}
        </Text>
      </View>
      <View style={styles.apyColumn}>
        <Text style={styles.apyLabel}>Supply</Text>
        <Text style={[styles.apyValue, { color: colors.supplyGreen }]}>
          {formatPercent(reserve.supplyAPY)}
        </Text>
      </View>
      <View style={styles.apyColumn}>
        <Text style={styles.apyLabel}>Borrow</Text>
        <Text style={[styles.apyValue, { color: colors.borrowAmber }]}>
          {formatPercent(reserve.variableBorrowAPY)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  name: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  apyColumn: {
    alignItems: 'flex-end',
    minWidth: 60,
    gap: 2,
  },
  apyLabel: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  apyValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

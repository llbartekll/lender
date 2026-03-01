import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../ui/Card';
import { TokenIcon } from '../ui/TokenIcon';
import { colors, spacing } from '../../theme';
import { formatUsd, formatPercent, formatTokenAmount } from '../../lib/utils/format';
import { tokenAmountToNumber } from '../../lib/utils/aave-math';
import { type UserPosition } from '../../types/position';

interface BorrowPositionsListProps {
  positions: UserPosition[];
}

export function BorrowPositionsList({ positions }: BorrowPositionsListProps) {
  const router = useRouter();

  if (positions.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Borrowed</Text>
      <Card>
        {positions.map((position, index) => {
          const borrowBalance = position.variableBorrowBalance;
          const borrowUsd = position.variableBorrowBalanceUsd;
          const borrowAPY = position.variableBorrowAPY;

          return (
            <TouchableOpacity
              key={position.underlyingAsset}
              style={[styles.row, index > 0 && styles.rowBorder]}
              onPress={() => router.push(`/position/${position.underlyingAsset}`)}
              activeOpacity={0.7}
            >
              <TokenIcon symbol={position.symbol} size={36} />
              <View style={styles.info}>
                <Text style={styles.symbol}>{position.symbol}</Text>
                <Text style={styles.balance}>
                  {formatTokenAmount(
                    tokenAmountToNumber(borrowBalance, position.decimals),
                  )}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.usdValue}>{formatUsd(borrowUsd)}</Text>
                <Text style={[styles.apy, { color: colors.borrowAmber }]}>
                  {formatPercent(borrowAPY)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  balance: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  usdValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  apy: {
    fontSize: 12,
    fontWeight: '500',
  },
});

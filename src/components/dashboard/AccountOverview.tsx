import { StyleSheet, View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { colors, spacing } from '../../theme';
import { formatUsd } from '../../lib/utils/format';
import { type AccountSummary } from '../../types/position';

interface AccountOverviewProps {
  summary: AccountSummary;
}

export function AccountOverview({ summary }: AccountOverviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <SummaryCard
          label="Net Worth"
          value={formatUsd(summary.netWorthUsd)}
          color={colors.textPrimary}
        />
        <SummaryCard
          label="Total Supplied"
          value={formatUsd(summary.totalCollateralUsd)}
          color={colors.supplyGreen}
        />
      </View>
      <View style={styles.row}>
        <SummaryCard
          label="Total Borrowed"
          value={formatUsd(summary.totalDebtUsd)}
          color={colors.borrowAmber}
        />
        <SummaryCard
          label="Available to Borrow"
          value={formatUsd(summary.availableBorrowsUsd)}
          color={colors.textSecondary}
        />
      </View>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    flex: 1,
    padding: spacing.md,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});

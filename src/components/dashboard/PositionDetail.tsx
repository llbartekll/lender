import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { type Address } from 'viem';
import { Card } from '../ui/Card';
import { TokenIcon } from '../ui/TokenIcon';
import { StatRow } from '../ui/StatRow';
import { ErrorState } from '../ui/ErrorState';
import { SkeletonCard } from '../ui/LoadingSkeleton';
import { TransactionModal } from '../transactions/TransactionModal';
import { colors, spacing, borderRadius, getHealthFactorColor } from '../../theme';
import {
  formatUsd,
  formatPercent,
  formatTokenAmount,
  formatHealthFactor,
} from '../../lib/utils/format';
import { tokenAmountToNumber } from '../../lib/utils/aave-math';
import { parseTokenAmount } from '../../lib/utils/parse-amount';
import { useUserPositions } from '../../hooks/queries/use-user-positions';
import { useAccountSummary } from '../../hooks/queries/use-account-summary';
import { useReserves } from '../../hooks/queries/use-reserves';
import { useTokenBalance } from '../../hooks/queries/use-token-balance';
import { useWalletStore } from '../../store/wallet-store';
import { type TxType } from '../../hooks/use-transaction';

export function PositionDetail() {
  const { asset } = useLocalSearchParams<{ asset: string }>();
  const { data: positions, isLoading: positionsLoading } = useUserPositions();
  const { data: summary } = useAccountSummary();
  const { data: reservesData, isLoading: reservesLoading } = useReserves();
  const connectionMethod = useWalletStore((s) => s.connectionMethod);
  const { data: walletBalance } = useTokenBalance(asset as Address | undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<TxType>('supply');
  const canTransact = connectionMethod === 'privateKey';

  const position = positions?.find(
    (p) => p.underlyingAsset.toLowerCase() === asset?.toLowerCase(),
  );
  const reserve = reservesData?.reserves.find(
    (r) => r.underlyingAsset.toLowerCase() === asset?.toLowerCase(),
  );

  if (positionsLoading || reservesLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.padding}>
          <SkeletonCard />
        </View>
      </View>
    );
  }

  // If no position but we have reserve data, show reserve info
  if (!position && !reserve) {
    return (
      <View style={styles.container}>
        <ErrorState message="Position not found" />
      </View>
    );
  }

  const decimals = position?.decimals ?? reserve?.decimals ?? 18;
  const symbol = position?.symbol ?? reserve?.symbol ?? '';
  const name = position?.name ?? reserve?.name ?? '';
  const priceUsd = position?.priceUsd ?? reserve?.priceUsd ?? 0;
  const hasSupply = position && position.supplyBalance > 0n;
  const hasBorrow =
    position &&
    position.variableBorrowBalance > 0n;
  const canBorrow = reserve?.borrowingEnabled ?? false;

  // Max borrow: min(availableBorrowsUsd / priceUsd, availableLiquidity)
  const borrowMaxFromPower = summary && priceUsd > 0
    ? parseTokenAmount(
        (summary.availableBorrowsUsd / priceUsd).toFixed(decimals),
        decimals,
      )
    : 0n;
  const borrowMaxFromLiquidity = reserve?.availableLiquidity ?? 0n;
  const maxBorrow = borrowMaxFromPower < borrowMaxFromLiquidity
    ? borrowMaxFromPower
    : borrowMaxFromLiquidity;

  // LTV bar calculation
  const ltv = reserve?.baseLTVasCollateral ?? 0;
  const liqThreshold = reserve?.reserveLiquidationThreshold ?? 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TokenIcon symbol={symbol} size={48} />
          <View style={styles.headerInfo}>
            <Text style={styles.symbol}>{symbol}</Text>
            <Text style={styles.name}>{name}</Text>
          </View>
          <Text style={styles.price}>{formatUsd(priceUsd)}</Text>
        </View>

        {/* Supply Position */}
        {hasSupply && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Supply Position</Text>
            <StatRow
              label="Balance"
              value={formatTokenAmount(
                tokenAmountToNumber(position.supplyBalance, position.decimals),
              )}
              suffix={symbol}
            />
            <StatRow
              label="USD Value"
              value={formatUsd(position.supplyBalanceUsd)}
            />
            <StatRow
              label="Supply APY"
              value={formatPercent(position.supplyAPY)}
              valueColor={colors.supplyGreen}
            />
            <StatRow
              label="Used as Collateral"
              value={position.usageAsCollateralEnabled ? 'Yes' : 'No'}
              valueColor={
                position.usageAsCollateralEnabled ? colors.supplyGreen : colors.textTertiary
              }
            />
          </Card>
        )}

        {/* Borrow Position */}
        {hasBorrow && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Borrow Position</Text>
            {position.variableBorrowBalance > 0n && (
              <>
                <StatRow
                  label="Variable Borrow"
                  value={formatTokenAmount(
                    tokenAmountToNumber(
                      position.variableBorrowBalance,
                      position.decimals,
                    ),
                  )}
                  suffix={symbol}
                />
                <StatRow
                  label="USD Value"
                  value={formatUsd(position.variableBorrowBalanceUsd)}
                />
                <StatRow
                  label="Borrow APY"
                  value={formatPercent(position.variableBorrowAPY)}
                  valueColor={colors.borrowAmber}
                />
              </>
            )}
          </Card>
        )}

        {/* Risk Parameters */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Parameters</Text>
          <StatRow label="Max LTV" value={formatPercent(ltv)} />
          <StatRow
            label="Liquidation Threshold"
            value={formatPercent(liqThreshold)}
            valueColor={colors.danger}
          />
          {reserve && (
            <StatRow
              label="Liquidation Bonus"
              value={formatPercent(reserve.reserveLiquidationBonus)}
            />
          )}

          {/* LTV vs Liquidation Threshold Bar */}
          <View style={styles.ltvBarContainer}>
            <View style={styles.ltvBar}>
              <View
                style={[styles.ltvFill, { width: `${ltv}%` }]}
              />
              <View
                style={[
                  styles.liqThresholdMarker,
                  { left: `${liqThreshold}%` },
                ]}
              />
            </View>
            <View style={styles.ltvLabels}>
              <Text style={styles.ltvLabel}>0%</Text>
              <Text style={[styles.ltvLabel, { color: colors.supplyGreen }]}>
                LTV {ltv.toFixed(0)}%
              </Text>
              <Text style={[styles.ltvLabel, { color: colors.danger }]}>
                Liq {liqThreshold.toFixed(0)}%
              </Text>
              <Text style={styles.ltvLabel}>100%</Text>
            </View>
          </View>

          {summary && (
            <StatRow
              label="Account Health Factor"
              value={formatHealthFactor(summary.healthFactor)}
              valueColor={getHealthFactorColor(summary.healthFactor)}
            />
          )}
        </Card>

        {/* Actions — 2x2 grid */}
        <View style={styles.actionsContainer}>
          {/* Supply row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                canTransact && styles.supplyButton,
              ]}
              disabled={!canTransact}
              onPress={() => {
                setModalType('supply');
                setModalVisible(true);
              }}
            >
              <Text style={[
                styles.actionButtonText,
                canTransact && styles.activeButtonText,
              ]}>
                Supply
              </Text>
              {!canTransact && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>
                    {connectionMethod === 'watch' ? 'Watch Only' : 'Coming Soon'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                canTransact && hasSupply && styles.withdrawButton,
              ]}
              disabled={!canTransact || !hasSupply}
              onPress={() => {
                setModalType('withdraw');
                setModalVisible(true);
              }}
            >
              <Text style={[
                styles.actionButtonText,
                canTransact && hasSupply && styles.activeButtonText,
              ]}>
                Withdraw
              </Text>
              {!canTransact && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>
                    {connectionMethod === 'watch' ? 'Watch Only' : 'Coming Soon'}
                  </Text>
                </View>
              )}
              {canTransact && !hasSupply && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>No Supply</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          {/* Borrow row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                canTransact && canBorrow && styles.borrowButton,
              ]}
              disabled={!canTransact || !canBorrow}
              onPress={() => {
                setModalType('borrow');
                setModalVisible(true);
              }}
            >
              <Text style={[
                styles.actionButtonText,
                canTransact && canBorrow && styles.activeButtonText,
              ]}>
                Borrow
              </Text>
              {!canTransact && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>
                    {connectionMethod === 'watch' ? 'Watch Only' : 'Coming Soon'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                canTransact && hasBorrow && styles.repayButton,
              ]}
              disabled={!canTransact || !hasBorrow}
              onPress={() => {
                setModalType('repay');
                setModalVisible(true);
              }}
            >
              <Text style={[
                styles.actionButtonText,
                canTransact && hasBorrow && styles.activeButtonText,
              ]}>
                Repay
              </Text>
              {!canTransact && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>
                    {connectionMethod === 'watch' ? 'Watch Only' : 'Coming Soon'}
                  </Text>
                </View>
              )}
              {canTransact && !hasBorrow && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>No Borrow</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {(asset as Address) && (
        <TransactionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          type={modalType}
          asset={asset as Address}
          symbol={symbol}
          decimals={decimals}
          priceUsd={priceUsd}
          maxAmount={
            modalType === 'supply'
              ? (walletBalance ?? 0n)
              : modalType === 'borrow'
                ? maxBorrow
                : modalType === 'withdraw'
                  ? (position?.supplyBalance ?? 0n)
                  : (position?.variableBorrowBalance ?? 0n)
          }
          maxLabel={
            modalType === 'supply'
              ? 'Wallet'
              : modalType === 'borrow'
                ? 'Available'
                : modalType === 'withdraw'
                  ? 'Supplied'
                  : 'Debt'
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padding: {
    padding: spacing.lg,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  symbol: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  name: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  ltvBarContainer: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  ltvBar: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
  },
  ltvFill: {
    height: '100%',
    backgroundColor: colors.supplyGreen,
    borderRadius: 4,
  },
  liqThresholdMarker: {
    position: 'absolute',
    top: -2,
    width: 3,
    height: 12,
    backgroundColor: colors.danger,
    borderRadius: 1,
  },
  ltvLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ltvLabel: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  actionsContainer: {
    gap: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    opacity: 0.5,
    gap: spacing.xs,
  },
  supplyButton: {
    backgroundColor: colors.accent,
    opacity: 1,
  },
  withdrawButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
    opacity: 1,
  },
  repayButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borrowAmber,
    opacity: 1,
  },
  borrowButton: {
    backgroundColor: colors.borrowAmber,
    opacity: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  activeButtonText: {
    color: colors.textPrimary,
  },
  comingSoonBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
  },
  comingSoonText: {
    fontSize: 10,
    color: colors.textTertiary,
  },
});

import { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useIsConnected, useActiveAddress } from '../../store/wallet-store';
import { useAccountSummary } from '../../hooks/queries/use-account-summary';
import { useSupplyPositions, useBorrowPositions } from '../../hooks/queries/use-user-positions';
import { HealthFactorDisplay } from './HealthFactorDisplay';
import { AccountOverview } from './AccountOverview';
import { SupplyPositionsList } from './SupplyPositionsList';
import { BorrowPositionsList } from './BorrowPositionsList';
import { ConnectPrompt } from './ConnectPrompt';
import { ConnectWalletSheet } from '../common/ConnectWalletSheet';
import { ErrorState } from '../ui/ErrorState';
import { SkeletonCard, SkeletonRow } from '../ui/LoadingSkeleton';
import { colors, spacing } from '../../theme';

export function DashboardScreen() {
  const isConnected = useIsConnected();
  const address = useActiveAddress();
  const [showConnect, setShowConnect] = useState(false);

  const queryClient = useQueryClient();
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useAccountSummary();
  const { data: supplyPositions, isLoading: supplyLoading } = useSupplyPositions();
  const { data: borrowPositions, isLoading: borrowLoading } = useBorrowPositions();

  console.log('[DashboardScreen] isConnected:', isConnected, 'address:', address);
  console.log('[DashboardScreen] summary:', summary ? 'loaded' : 'null', 'supply:', supplyPositions?.length ?? 'null', 'borrow:', borrowPositions?.length ?? 'null');
  console.log('[DashboardScreen] loading - summary:', summaryLoading, 'supply:', supplyLoading, 'borrow:', borrowLoading);
  if (summaryError) console.log('[DashboardScreen] summaryError:', summaryError);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <ConnectPrompt onConnect={() => setShowConnect(true)} />
        <ConnectWalletSheet
          visible={showConnect}
          onClose={() => setShowConnect(false)}
        />
      </View>
    );
  }

  const isLoading = summaryLoading || supplyLoading || borrowLoading;

  if (summaryError) {
    return (
      <View style={styles.container}>
        <ErrorState
          message="Failed to load account data"
          onRetry={() => queryClient.invalidateQueries()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <SkeletonCard />
            <View style={{ height: spacing.lg }} />
            <SkeletonCard />
            <View style={{ height: spacing.lg }} />
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </View>
        ) : (
          <>
            {summary && (
              <>
                <HealthFactorDisplay healthFactor={summary.healthFactor} />
                <AccountOverview summary={summary} />
              </>
            )}
            <View style={styles.positionsSection}>
              {supplyPositions && supplyPositions.length > 0 && (
                <SupplyPositionsList positions={supplyPositions} />
              )}
              {borrowPositions && borrowPositions.length > 0 && (
                <BorrowPositionsList positions={borrowPositions} />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
  positionsSection: {
    marginTop: spacing.xl,
    gap: spacing.xl,
  },
});

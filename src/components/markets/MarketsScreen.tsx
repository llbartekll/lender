import { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useReserves } from '../../hooks/queries/use-reserves';
import { ReserveRow } from './ReserveRow';
import { ErrorState } from '../ui/ErrorState';
import { SkeletonRow } from '../ui/LoadingSkeleton';
import { colors, spacing, borderRadius } from '../../theme';
import { type ReserveData } from '../../types/market';

type SortField = 'supplyAPY' | 'variableBorrowAPY' | 'totalSuppliedUsd';

export function MarketsScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useReserves();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('totalSuppliedUsd');

  const filteredReserves = useMemo(() => {
    if (!data?.reserves) return [];
    let filtered = data.reserves;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.symbol.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q),
      );
    }

    return [...filtered].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data?.reserves, search, sortBy]);

  const handlePress = useCallback(
    (reserve: ReserveData) => {
      router.push(`/position/${reserve.underlyingAsset}`);
    },
    [router],
  );

  if (error) {
    return <ErrorState message="Failed to load markets" onRetry={refetch} />;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search assets..."
        placeholderTextColor={colors.textTertiary}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {(['totalSuppliedUsd', 'supplyAPY', 'variableBorrowAPY'] as const).map(
          (field) => (
            <TouchableOpacity
              key={field}
              style={[styles.sortChip, sortBy === field && styles.sortChipActive]}
              onPress={() => setSortBy(field)}
            >
              <Text
                style={[
                  styles.sortChipText,
                  sortBy === field && styles.sortChipTextActive,
                ]}
              >
                {field === 'totalSuppliedUsd'
                  ? 'TVL'
                  : field === 'supplyAPY'
                    ? 'Supply APY'
                    : 'Borrow APY'}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </View>

      {isLoading ? (
        <View style={styles.skeletonList}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredReserves}
          keyExtractor={(item) => item.underlyingAsset}
          renderItem={({ item }) => (
            <ReserveRow reserve={item} onPress={() => handlePress(item)} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
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
  searchInput: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 16,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  sortLabel: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  sortChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sortChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sortChipTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  skeletonList: {
    paddingTop: spacing.sm,
  },
});

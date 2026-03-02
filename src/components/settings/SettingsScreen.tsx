import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { Card } from '../ui/Card';
import { StatRow } from '../ui/StatRow';
import { colors, spacing, borderRadius } from '../../theme';
import { shortenAddress } from '../../lib/utils/format';
import { useWalletStore, useActiveAddress, useIsConnected } from '../../store/wallet-store';
import { useSettingsStore, SUPPORTED_CHAINS } from '../../store/settings-store';
import { deletePrivateKey } from '../../lib/utils/secure-wallet';
import { ConnectWalletSheet } from '../common/ConnectWalletSheet';

const REFRESH_OPTIONS = [15, 30, 60];

export function SettingsScreen() {
  const address = useActiveAddress();
  const isConnected = useIsConnected();
  const storeDisconnect = useWalletStore((s) => s.disconnect);
  const connectionMethod = useWalletStore((s) => s.connectionMethod);

  const disconnect = () => {
    deletePrivateKey().catch(() => {});
    storeDisconnect();
  };

  const refreshInterval = useSettingsStore((s) => s.refreshInterval);
  const setRefreshInterval = useSettingsStore((s) => s.setRefreshInterval);
  const rpcUrl = useSettingsStore((s) => s.rpcUrl);
  const setRpcUrl = useSettingsStore((s) => s.setRpcUrl);
  const chainId = useSettingsStore((s) => s.chainId);
  const setChainId = useSettingsStore((s) => s.setChainId);

  const [showConnect, setShowConnect] = useState(false);
  const [rpcInput, setRpcInput] = useState(rpcUrl ?? '');
  const [showRpcInput, setShowRpcInput] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Wallet Section */}
        <Text style={styles.sectionHeader}>Wallet</Text>
        <Card>
          {isConnected ? (
            <View style={styles.walletInfo}>
              <View style={styles.walletRow}>
                <View>
                  <Text style={styles.walletLabel}>
                    {connectionMethod === 'privateKey'
                      ? 'Imported'
                      : connectionMethod === 'watch'
                        ? 'Watching'
                        : 'Connected'}
                  </Text>
                  <Text style={styles.walletAddress}>
                    {address ? shortenAddress(address) : '—'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
                  <Text style={styles.disconnectText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => setShowConnect(true)}
            >
              <Text style={styles.connectText}>Connect Wallet</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Network Section */}
        <Text style={styles.sectionHeader}>Network</Text>
        <Card>
          <Text style={styles.prefLabel}>Chain</Text>
          <View style={styles.intervalRow}>
            {SUPPORTED_CHAINS.map((chain) => (
              <TouchableOpacity
                key={chain.id}
                style={[
                  styles.intervalChip,
                  chainId === chain.id && styles.intervalChipActive,
                ]}
                onPress={() => setChainId(chain.id)}
              >
                <Text
                  style={[
                    styles.intervalText,
                    chainId === chain.id && styles.intervalTextActive,
                  ]}
                >
                  {chain.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.divider} />
          <View style={styles.rpcSection}>
            <View style={styles.rpcHeader}>
              <Text style={styles.rpcLabel}>Custom RPC</Text>
              {!showRpcInput && (
                <TouchableOpacity onPress={() => setShowRpcInput(true)}>
                  <Text style={styles.editText}>
                    {rpcUrl ? 'Edit' : 'Set'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {rpcUrl && !showRpcInput && (
              <Text style={styles.rpcUrl} numberOfLines={1}>
                {rpcUrl}
              </Text>
            )}
            {showRpcInput && (
              <View style={styles.rpcInputContainer}>
                <TextInput
                  style={styles.rpcInput}
                  placeholder="https://..."
                  placeholderTextColor={colors.textTertiary}
                  value={rpcInput}
                  onChangeText={setRpcInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.rpcActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowRpcInput(false);
                      setRpcInput(rpcUrl ?? '');
                    }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setRpcUrl(rpcInput || null);
                      setShowRpcInput(false);
                    }}
                  >
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                  {rpcUrl && (
                    <TouchableOpacity
                      onPress={() => {
                        setRpcUrl(null);
                        setRpcInput('');
                        setShowRpcInput(false);
                      }}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            <Text style={styles.rpcHint}>
              iOS simulator: http://127.0.0.1:8545{'\n'}
              Android emulator: http://10.0.2.2:8545
            </Text>
          </View>
        </Card>

        {/* Preferences */}
        <Text style={styles.sectionHeader}>Preferences</Text>
        <Card>
          <Text style={styles.prefLabel}>Refresh Interval</Text>
          <View style={styles.intervalRow}>
            {REFRESH_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.intervalChip,
                  refreshInterval === opt && styles.intervalChipActive,
                ]}
                onPress={() => setRefreshInterval(opt)}
              >
                <Text
                  style={[
                    styles.intervalText,
                    refreshInterval === opt && styles.intervalTextActive,
                  ]}
                >
                  {opt}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* About */}
        <Text style={styles.sectionHeader}>About</Text>
        <Card>
          <StatRow label="Version" value="1.0.0" />
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => Linking.openURL('https://docs.aave.com/developers/getting-started/readme')}
          >
            <Text style={styles.linkText}>Aave V3 Documentation</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <ConnectWalletSheet visible={showConnect} onClose={() => setShowConnect(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  walletInfo: {
    gap: spacing.md,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  walletAddress: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
    color: colors.textPrimary,
    marginTop: 2,
  },
  disconnectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  disconnectText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
  },
  connectButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
  },
  connectText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  rpcSection: {
    gap: spacing.sm,
  },
  rpcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rpcLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  rpcUrl: {
    fontSize: 12,
    fontFamily: 'SpaceMono',
    color: colors.textTertiary,
  },
  rpcInputContainer: {
    gap: spacing.sm,
  },
  rpcInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  rpcActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  removeText: {
    fontSize: 14,
    color: colors.danger,
  },
  rpcHint: {
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 16,
  },
  prefLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  intervalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  intervalChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  intervalChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  intervalText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  intervalTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  linkText: {
    fontSize: 14,
    color: colors.accent,
    paddingVertical: spacing.sm,
  },
});

import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';
import { useWalletStore } from '../../store/wallet-store';
import { AddressInput } from './AddressInput';

interface ConnectWalletSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ConnectWalletSheet({ visible, onClose }: ConnectWalletSheetProps) {
  const [showAddressInput, setShowAddressInput] = useState(false);
  const setWatchAddress = useWalletStore((s) => s.setWatchAddress);

  const handleWatchAddress = (address: string) => {
    setWatchAddress(address);
    setShowAddressInput(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {showAddressInput ? (
            <AddressInput
              onSubmit={handleWatchAddress}
              onCancel={() => setShowAddressInput(false)}
            />
          ) : (
            <View style={styles.content}>
              <Text style={styles.title}>Connect to Aave</Text>
              <Text style={styles.description}>
                Choose how to view your lending positions
              </Text>

              <TouchableOpacity
                style={styles.option}
                onPress={() => setShowAddressInput(true)}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>@</Text>
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Watch Address</Text>
                  <Text style={styles.optionDescription}>
                    Enter any address to view its positions (read-only)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.option, styles.optionDisabled]}>
                <View style={[styles.optionIcon, styles.optionIconDisabled]}>
                  <Text style={styles.optionIconText}>W</Text>
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Connect Wallet</Text>
                  <Text style={styles.optionDescription}>
                    WalletConnect — requires development build
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Dev Build Only</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xxl + 16,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  option: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    alignItems: 'center',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  optionIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  optionInfo: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
  },
});

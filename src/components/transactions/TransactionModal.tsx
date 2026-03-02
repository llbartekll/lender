import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { type Address } from 'viem';
import { colors, spacing, borderRadius } from '../../theme';
import { tokenAmountToNumber } from '../../lib/utils/aave-math';
import { parseTokenAmount } from '../../lib/utils/parse-amount';
import { formatUsd, formatTokenAmount, shortenAddress } from '../../lib/utils/format';
import { useTransaction, type TxType, type TxStep } from '../../hooks/use-transaction';

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  type: TxType;
  asset: Address;
  symbol: string;
  decimals: number;
  priceUsd: number;
  maxAmount: bigint;
  maxLabel: string;
}

const STEP_MESSAGES: Record<TxStep, string> = {
  idle: '',
  checking: 'Checking allowance...',
  approving: 'Sending approval...',
  waitingApproval: 'Waiting for approval confirmation...',
  sending: 'Sending transaction...',
  waitingConfirmation: 'Waiting for confirmation...',
  success: 'Transaction confirmed!',
  error: 'Transaction failed',
};

export function TransactionModal({
  visible,
  onClose,
  type,
  asset,
  symbol,
  decimals,
  priceUsd,
  maxAmount,
  maxLabel,
}: TransactionModalProps) {
  const [inputAmount, setInputAmount] = useState('');
  const { step, txHash, error, execute, reset } = useTransaction();

  const isProcessing = step !== 'idle' && step !== 'success' && step !== 'error';
  const typeLabel = type === 'supply' ? 'Supply' : type === 'borrow' ? 'Borrow' : type === 'withdraw' ? 'Withdraw' : 'Repay';
  const accentColor = type === 'supply' || type === 'withdraw' ? colors.accent : colors.borrowAmber;

  const parsedAmount = inputAmount ? parseTokenAmount(inputAmount, decimals) : 0n;
  const usdValue = inputAmount
    ? parseFloat(inputAmount) * priceUsd
    : 0;
  const isMax = parsedAmount >= maxAmount && maxAmount > 0n;
  const isValidAmount = parsedAmount > 0n && parsedAmount <= maxAmount;

  useEffect(() => {
    if (!visible) {
      setInputAmount('');
      reset();
    }
  }, [visible, reset]);

  const handleMax = () => {
    const num = tokenAmountToNumber(maxAmount, decimals);
    setInputAmount(num.toString());
  };

  const handleSubmit = () => {
    if (!isValidAmount) return;
    execute({
      type,
      asset,
      amount: parsedAmount,
      isMax: (type === 'repay' || type === 'withdraw') && isMax,
    });
  };

  const handleClose = () => {
    if (isProcessing) return;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={handleClose}
          disabled={isProcessing}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.content}>
            <Text style={styles.title}>
              {typeLabel} {symbol}
            </Text>

            {step === 'success' ? (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Text style={styles.successIconText}>✓</Text>
                </View>
                <Text style={styles.successText}>Transaction Confirmed</Text>
                {txHash && (
                  <Text style={styles.txHash}>
                    {shortenAddress(txHash)}
                  </Text>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.surface }]}
                  onPress={handleClose}
                >
                  <Text style={styles.actionButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : step === 'error' ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: accentColor }]}
                  onPress={reset}
                >
                  <Text style={styles.actionButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Amount Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      value={inputAmount}
                      onChangeText={setInputAmount}
                      placeholder="0.00"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="decimal-pad"
                      editable={!isProcessing}
                    />
                    <TouchableOpacity
                      style={styles.maxButton}
                      onPress={handleMax}
                      disabled={isProcessing}
                    >
                      <Text style={styles.maxButtonText}>MAX</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputMeta}>
                    <Text style={styles.usdValue}>
                      {usdValue > 0 ? formatUsd(usdValue) : '$0.00'}
                    </Text>
                    <Text style={styles.balanceText}>
                      {maxLabel}: {formatTokenAmount(tokenAmountToNumber(maxAmount, decimals))} {symbol}
                    </Text>
                  </View>
                </View>

                {/* Step Indicator */}
                {isProcessing && (
                  <View style={styles.stepContainer}>
                    <ActivityIndicator size="small" color={accentColor} />
                    <Text style={styles.stepText}>
                      {STEP_MESSAGES[step]}
                    </Text>
                  </View>
                )}

                {/* Action Button */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: accentColor },
                    (!isValidAmount || isProcessing) && styles.actionButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!isValidAmount || isProcessing}
                >
                  <Text style={styles.actionButtonText}>
                    {isProcessing
                      ? 'Processing...'
                      : `${typeLabel} ${symbol}`}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
  inputContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 0,
  },
  maxButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  inputMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  usdValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
  },
  stepText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  successContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.success,
  },
  txHash: {
    fontSize: 14,
    color: colors.textTertiary,
    fontFamily: 'monospace',
  },
  errorContainer: {
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
});

import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { type Address } from 'viem';
import { borderRadius, colors, spacing } from '../../theme';
import { formatTokenAmount, formatUsd, shortenAddress } from '../../lib/utils/format';
import { parseTokenAmount } from '../../lib/utils/parse-amount';
import { tokenAmountToNumber } from '../../lib/utils/aave-math';
import {
  type LeverageTxStep,
  type LeverageTxType,
  useLeverageTransaction,
} from '../../hooks/use-leverage-transaction';

interface DebtOption {
  asset: Address;
  symbol: string;
  decimals: number;
  priceUsd: number;
  availableLiquidity: bigint;
  variableDebtTokenAddress: Address;
}

interface LeverageModalProps {
  visible: boolean;
  onClose: () => void;
  type: LeverageTxType;
  collateralAsset: Address;
  collateralATokenAddress: Address;
  collateralSymbol: string;
  collateralDecimals: number;
  maxCollateralWithdraw: bigint;
  debtOptions: DebtOption[];
}

const FEE_OPTIONS = [100, 500, 3000];
const DEFAULT_SLIPPAGE_BPS = '100';

const STEP_MESSAGES: Record<LeverageTxStep, string> = {
  idle: '',
  checkingDelegation: 'Checking credit delegation...',
  approvingDelegation: 'Sending delegation approval...',
  waitingDelegation: 'Waiting for delegation confirmation...',
  checkingATokenAllowance: 'Checking aToken allowance...',
  approvingAToken: 'Sending aToken approval...',
  waitingATokenApproval: 'Waiting for aToken approval confirmation...',
  sending: 'Sending transaction...',
  waitingConfirmation: 'Waiting for confirmation...',
  success: 'Transaction confirmed!',
  error: 'Transaction failed',
};

export function LeverageModal({
  visible,
  onClose,
  type,
  collateralAsset,
  collateralATokenAddress,
  collateralSymbol,
  collateralDecimals,
  maxCollateralWithdraw,
  debtOptions,
}: LeverageModalProps) {
  const { step, error, txHash, execute, reset } = useLeverageTransaction();
  const [selectedDebtAsset, setSelectedDebtAsset] = useState<Address | null>(null);
  const [flashLoanInput, setFlashLoanInput] = useState('');
  const [collateralWithdrawInput, setCollateralWithdrawInput] = useState('');
  const [slippageInput, setSlippageInput] = useState(DEFAULT_SLIPPAGE_BPS);
  const [selectedFee, setSelectedFee] = useState<number>(3000);

  const isProcessing = step !== 'idle' && step !== 'success' && step !== 'error';
  const typeLabel = type === 'leverageUp' ? 'Leverage' : 'Deleverage';
  const accentColor = type === 'leverageUp' ? colors.accent : colors.warning;

  const selectedDebt = useMemo(
    () => debtOptions.find((option) => option.asset === selectedDebtAsset) ?? null,
    [debtOptions, selectedDebtAsset],
  );

  const flashLoanAmount = selectedDebt && flashLoanInput
    ? parseTokenAmount(flashLoanInput, selectedDebt.decimals)
    : 0n;
  const collateralToWithdraw = collateralWithdrawInput
    ? parseTokenAmount(collateralWithdrawInput, collateralDecimals)
    : 0n;
  const slippageBps = Number.parseInt(slippageInput, 10);
  const flashLoanUsd = selectedDebt && flashLoanInput
    ? Number.parseFloat(flashLoanInput || '0') * selectedDebt.priceUsd
    : 0;

  const validSlippage = Number.isFinite(slippageBps) && slippageBps >= 0 && slippageBps <= 10_000;
  const validFlashLoan = !!selectedDebt
    && flashLoanAmount > 0n
    && flashLoanAmount <= selectedDebt.availableLiquidity;
  const validCollateralWithdraw = type === 'leverageUp'
    ? true
    : collateralToWithdraw > 0n && collateralToWithdraw <= maxCollateralWithdraw;
  const canSubmit = validSlippage && validFlashLoan && validCollateralWithdraw && !isProcessing;

  useEffect(() => {
    if (!visible) {
      setFlashLoanInput('');
      setCollateralWithdrawInput('');
      setSlippageInput(DEFAULT_SLIPPAGE_BPS);
      setSelectedFee(3000);
      setSelectedDebtAsset(null);
      reset();
      return;
    }

    if (!selectedDebtAsset && debtOptions.length > 0) {
      setSelectedDebtAsset(debtOptions[0].asset);
    }
  }, [debtOptions, reset, selectedDebtAsset, visible]);

  const handleSubmit = () => {
    if (!selectedDebt || !canSubmit) return;

    if (type === 'leverageUp') {
      execute({
        type: 'leverageUp',
        collateralAsset,
        debtAsset: selectedDebt.asset,
        variableDebtToken: selectedDebt.variableDebtTokenAddress,
        flashLoanAmount,
        swapPoolFee: selectedFee,
        slippageBps,
        swapPath: '0x',
      });
      return;
    }

    execute({
      type: 'deleverage',
      collateralAsset,
      debtAsset: selectedDebt.asset,
      aTokenAddress: collateralATokenAddress,
      flashLoanAmount,
      collateralToWithdraw,
      swapPoolFee: selectedFee,
      slippageBps,
      swapPath: '0x',
    });
  };

  const onMaxCollateral = () => {
    const amount = tokenAmountToNumber(maxCollateralWithdraw, collateralDecimals);
    setCollateralWithdrawInput(amount.toString());
  };

  const handleClose = () => {
    if (isProcessing) return;
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} disabled={isProcessing} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.content}>
            <Text style={styles.title}>{typeLabel} {collateralSymbol}</Text>

            {step === 'success' ? (
              <View style={styles.statusContainer}>
                <Text style={styles.successText}>Transaction Confirmed</Text>
                {txHash ? <Text style={styles.hashText}>{shortenAddress(txHash)}</Text> : null}
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleClose}
                >
                  <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : step === 'error' ? (
              <View style={styles.statusContainer}>
                <ScrollView style={styles.errorScroll} contentContainerStyle={styles.errorScrollContent}>
                  <Text style={styles.errorText} numberOfLines={8}>
                    {error && error.length > 300 ? error.slice(0, 300) + '…' : error}
                  </Text>
                </ScrollView>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: accentColor }]}
                  onPress={reset}
                >
                  <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleClose}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Debt Asset</Text>
                  <View style={styles.chipsRow}>
                    {debtOptions.map((option) => (
                      <TouchableOpacity
                        key={option.asset}
                        style={[
                          styles.chip,
                          selectedDebtAsset === option.asset && styles.chipActive,
                        ]}
                        onPress={() => setSelectedDebtAsset(option.asset)}
                        disabled={isProcessing}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedDebtAsset === option.asset && styles.chipTextActive,
                          ]}
                        >
                          {option.symbol}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Flashloan Amount</Text>
                  <TextInput
                    style={styles.input}
                    value={flashLoanInput}
                    onChangeText={setFlashLoanInput}
                    placeholder="0.00"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    editable={!isProcessing}
                  />
                  <Text style={styles.metaText}>
                    {flashLoanUsd > 0 ? formatUsd(flashLoanUsd) : '$0.00'}
                    {selectedDebt ? ` • Max: ${formatTokenAmount(tokenAmountToNumber(selectedDebt.availableLiquidity, selectedDebt.decimals))} ${selectedDebt.symbol}` : ''}
                  </Text>
                </View>

                {type === 'deleverage' ? (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Collateral To Withdraw</Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={[styles.input, styles.inputFlexible]}
                        value={collateralWithdrawInput}
                        onChangeText={setCollateralWithdrawInput}
                        placeholder="0.00"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="decimal-pad"
                        editable={!isProcessing}
                      />
                      <TouchableOpacity
                        style={styles.maxButton}
                        onPress={onMaxCollateral}
                        disabled={isProcessing}
                      >
                        <Text style={styles.maxText}>MAX</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.metaText}>
                      Max: {formatTokenAmount(tokenAmountToNumber(maxCollateralWithdraw, collateralDecimals))} {collateralSymbol}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Slippage (bps)</Text>
                  <TextInput
                    style={styles.input}
                    value={slippageInput}
                    onChangeText={setSlippageInput}
                    placeholder="100"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    editable={!isProcessing}
                  />
                  {!validSlippage ? (
                    <Text style={styles.validationText}>Slippage must be between 0 and 10000 bps.</Text>
                  ) : null}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Uniswap Pool Fee</Text>
                  <View style={styles.chipsRow}>
                    {FEE_OPTIONS.map((fee) => (
                      <TouchableOpacity
                        key={fee}
                        style={[styles.chip, selectedFee === fee && styles.chipActive]}
                        onPress={() => setSelectedFee(fee)}
                        disabled={isProcessing}
                      >
                        <Text style={[styles.chipText, selectedFee === fee && styles.chipTextActive]}>
                          {fee}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {isProcessing ? (
                  <View style={styles.progressRow}>
                    <ActivityIndicator size="small" color={accentColor} />
                    <Text style={styles.progressText}>{STEP_MESSAGES[step]}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: accentColor },
                    !canSubmit && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  <Text style={styles.buttonText}>{typeLabel} {collateralSymbol}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    borderRadius: 2,
    backgroundColor: colors.surfaceLight,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceLight,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 18,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputFlexible: {
    flex: 1,
  },
  maxButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  maxText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  metaText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  validationText: {
    fontSize: 12,
    color: colors.dangerLight,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  button: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  statusContainer: {
    gap: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  successText: {
    color: colors.successLight,
    fontSize: 17,
    fontWeight: '700',
  },
  errorScroll: {
    maxHeight: 200,
  },
  errorScrollContent: {
    alignItems: 'center',
  },
  errorText: {
    color: colors.dangerLight,
    fontSize: 14,
    textAlign: 'center',
  },
  hashText: {
    color: colors.textTertiary,
    fontFamily: 'SpaceMono',
  },
});

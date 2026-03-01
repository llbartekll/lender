import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { isAddress } from 'viem';
import { colors, spacing, borderRadius } from '../../theme';

interface AddressInputProps {
  onSubmit: (address: string) => void;
  onCancel?: () => void;
}

export function AddressInput({ onSubmit, onCancel }: AddressInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please enter an address');
      return;
    }
    if (!isAddress(trimmed)) {
      setError('Invalid Ethereum address');
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setInput(text.trim());
        setError(null);
      }
    } catch {
      // Clipboard access denied
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Watch Address</Text>
      <Text style={styles.description}>
        Enter an Ethereum address to view its Aave positions
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="0x..."
          placeholderTextColor={colors.textTertiary}
          value={input}
          onChangeText={(text) => {
            setInput(text);
            setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
        <TouchableOpacity style={styles.pasteButton} onPress={handlePaste}>
          <Text style={styles.pasteText}>Paste</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Watch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  pasteButton: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
  },
  pasteText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

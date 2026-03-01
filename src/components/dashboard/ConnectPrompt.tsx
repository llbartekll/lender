import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

interface ConnectPromptProps {
  onConnect: () => void;
}

export function ConnectPrompt({ onConnect }: ConnectPromptProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>$</Text>
      </View>
      <Text style={styles.title}>Monitor Your Positions</Text>
      <Text style={styles.description}>
        Connect your wallet or enter an address to view Aave V3 lending positions, health factor, and more.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onConnect}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.lg,
    flex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

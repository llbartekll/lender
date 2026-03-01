import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'highlighted';
}

export function Card({ style, variant = 'default', children, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'highlighted' && styles.highlighted,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  highlighted: {
    borderColor: colors.accent,
    borderWidth: 1,
  },
});

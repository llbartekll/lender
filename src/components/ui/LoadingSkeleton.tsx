import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, borderRadius } from '../../theme';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  borderRadiusSize?: number;
}

export function LoadingSkeleton({
  width = '100%',
  height = 16,
  style,
  borderRadiusSize = borderRadius.sm,
}: LoadingSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius: borderRadiusSize,
          backgroundColor: colors.surfaceLight,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <LoadingSkeleton width="40%" height={14} />
      <LoadingSkeleton width="60%" height={20} style={{ marginTop: 8 }} />
    </View>
  );
}

export function SkeletonRow() {
  return (
    <View style={styles.row}>
      <LoadingSkeleton
        width={36}
        height={36}
        borderRadiusSize={18}
      />
      <View style={styles.rowContent}>
        <LoadingSkeleton width="30%" height={14} />
        <LoadingSkeleton width="50%" height={12} style={{ marginTop: 4 }} />
      </View>
      <View style={styles.rowRight}>
        <LoadingSkeleton width={60} height={14} />
        <LoadingSkeleton width={40} height={12} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
});

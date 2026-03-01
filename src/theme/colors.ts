export const colors = {
  background: '#0A0E17',
  surface: '#111827',
  surfaceLight: '#1F2937',
  border: '#374151',

  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',

  accent: '#3B82F6',
  accentLight: '#60A5FA',

  success: '#10B981',
  successLight: '#34D399',

  warning: '#F59E0B',
  warningLight: '#FBBF24',

  danger: '#EF4444',
  dangerLight: '#F87171',

  supplyGreen: '#10B981',
  borrowAmber: '#F59E0B',
};

export type HealthFactorLevel = 'safe' | 'moderate' | 'risky' | 'critical';

export function getHealthFactorColor(hf: number): string {
  if (hf === Infinity || hf >= 3) return colors.success;
  if (hf >= 2) return colors.successLight;
  if (hf >= 1.5) return colors.warning;
  if (hf >= 1.1) return colors.warningLight;
  return colors.danger;
}

export function getHealthFactorLevel(hf: number): HealthFactorLevel {
  if (hf === Infinity || hf >= 2) return 'safe';
  if (hf >= 1.5) return 'moderate';
  if (hf >= 1.1) return 'risky';
  return 'critical';
}

import { StyleSheet, View, Text } from 'react-native';
import { colors, borderRadius } from '../../theme';

const TOKEN_COLORS: Record<string, string> = {
  WETH: '#627EEA',
  ETH: '#627EEA',
  USDC: '#2775CA',
  USDT: '#26A17B',
  DAI: '#F5AC37',
  WBTC: '#F7931A',
  wstETH: '#00A3FF',
  cbETH: '#0052FF',
  LINK: '#2A5ADA',
  AAVE: '#B6509E',
  UNI: '#FF007A',
  MKR: '#1AAB9B',
  SNX: '#00D1FF',
  CRV: '#FF4C4C',
  LDO: '#F69988',
  rETH: '#CC9B6D',
  RPL: '#FF6347',
  BAL: '#1E1E1E',
  GHO: '#B6509E',
};

interface TokenIconProps {
  symbol: string;
  size?: number;
}

export function TokenIcon({ symbol, size = 36 }: TokenIconProps) {
  const bgColor = TOKEN_COLORS[symbol] ?? colors.surfaceLight;
  const displaySymbol = symbol.length > 4 ? symbol.slice(0, 4) : symbol;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: size * 0.3 },
        ]}
        numberOfLines={1}
      >
        {displaySymbol}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

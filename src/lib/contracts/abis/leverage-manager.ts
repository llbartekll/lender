export const leverageManagerAbi = [
  {
    inputs: [
      {
        components: [
          { name: 'collateralAsset', type: 'address' },
          { name: 'debtAsset', type: 'address' },
          { name: 'flashLoanAmount', type: 'uint256' },
          { name: 'swapPoolFee', type: 'uint24' },
          { name: 'slippageBps', type: 'uint16' },
          { name: 'swapPath', type: 'bytes' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'leverageUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { name: 'collateralAsset', type: 'address' },
          { name: 'debtAsset', type: 'address' },
          { name: 'flashLoanAmount', type: 'uint256' },
          { name: 'collateralToWithdraw', type: 'uint256' },
          { name: 'swapPoolFee', type: 'uint24' },
          { name: 'slippageBps', type: 'uint16' },
          { name: 'swapPath', type: 'bytes' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'deleverage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

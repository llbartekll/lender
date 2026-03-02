export const creditDelegationAbi = [
  {
    inputs: [
      { name: 'fromUser', type: 'address' },
      { name: 'toUser', type: 'address' },
    ],
    name: 'borrowAllowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'delegatee', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approveDelegation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

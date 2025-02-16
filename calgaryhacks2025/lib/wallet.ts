import { createConfig } from 'wagmi';
import { sepolia } from 'viem/chains';
import { http, createTransport } from 'viem';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http()
  },
});

export const wagmiConfig = config; 
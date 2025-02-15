import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { createConfig, configureChains } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { publicProvider } from 'wagmi/providers/public';

// Configure chains and providers
const { chains, publicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

// Create wagmi config
export const config = createConfig({
  autoConnect: true, // This enables auto-reconnection
  connectors: [
    new MetaMaskConnector({ chains }),
  ],
  publicClient,
}); 
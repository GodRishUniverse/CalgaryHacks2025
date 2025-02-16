import { http } from "viem";
import { mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
});

"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { WagmiProvider } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia
} from "wagmi/chains";
import { custom } from "viem";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const config = useMemo(() => {
    const provider =
      typeof window !== "undefined" ? (window as { ethereum?: unknown }).ethereum : undefined;
    const walletTransport = custom(
      provider ?? {
        request: async () => {
          throw new Error("Wallet provider unavailable");
        }
      }
    );

    return getDefaultConfig({
      appName: "Hackathon UI",
      projectId,
      chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
      batch: { multicall: false },
      transports: {
        [mainnet.id]: walletTransport,
        [polygon.id]: walletTransport,
        [optimism.id]: walletTransport,
        [arbitrum.id]: walletTransport,
        [base.id]: walletTransport,
        [sepolia.id]: walletTransport
      },
      ssr: false
    });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

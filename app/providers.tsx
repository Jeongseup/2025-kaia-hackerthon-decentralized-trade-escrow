"use client";

import * as React from "react";
import { RainbowKitProvider, getDefaultWallets, getDefaultConfig } from "@rainbow-me/rainbowkit";
import {trustWallet, ledgerWallet,kaiaWallet} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { foundry, kaia, kairos } from "wagmi/chains";

// Get projectId from WalletConnect Cloud (https://cloud.walletconnect.com/)
// It's recommended to store this in an environment variable
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  // In a real app, you might want to throw an error or handle this case more gracefully
  console.error("Error: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set.");
  // Using a placeholder to allow the app to run, but WalletConnect will likely fail.
  // throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set.");
}

const { wallets } = getDefaultWallets();
// initialize and destructure wallets object

// WalletConnect Project ID is no longer required as WalletConnect is not being used.
// This configuration will work with wallets that directly connect to Kaia chains.
const config = getDefaultConfig({
  appName: "Decentralized Trade Escrow",
    projectId: projectId || "YOUR_PROJECT_ID", // Fallback, but should be set via env var
  chains: [kaia, kairos, foundry],
  wallets: [
    ...wallets,
    {
      groupName: 'Other',
      wallets: [trustWallet, ledgerWallet, kaiaWallet],
    },
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
{/* 3. RainbowKitProvider에 생성한 커스텀 테마를 전달합니다. */}
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}






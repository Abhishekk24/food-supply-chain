"use client";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sepolia } from "@reown/appkit/networks";

// Replace with your project ID from Reown Cloud
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "YOUR_PROJECT_ID";

const metadata = {
  name: "Food Supply Chain",
  description: "Blockchain-based food supply chain management",
  url: "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/14985020?s=200&v=4"],
};

// Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [sepolia], // Using Sepolia testnet
  projectId,
  features: {
    analytics: true,
  },
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
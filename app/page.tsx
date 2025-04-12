// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import ConnectButton from "@/components/ConnectButton";
import ProductForm from "@/components/ProductForm";
import ProductTracker from "@/components/ProductTracker";
import BatchManagement from "@/components/BatchManagement";
import CarbonFootprintForm from "@/components/CarbonFootprintForm";
import RoleManagement from "@/components/RoleManagement";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";

type TabType = "register" | "track" | "batch" | "footprint" | "roles";

export default function Home() {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [activeTab, setActiveTab] = useState<TabType>("register");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if connected wallet is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isConnected || !walletProvider || !address) {
        setIsAdmin(false);
        return;
      }

      try {
        const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
        const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, ethersProvider);
        const adminRole = await contract.ADMIN_ROLE();
        const hasAdminRole = await contract.hasRole(adminRole, address);
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [isConnected, walletProvider, address]);

  const tabs: { id: TabType; label: string; adminOnly?: boolean }[] = [
    { id: "register", label: "Register Product" },
    { id: "track", label: "Track Product" },
    { id: "batch", label: "Batch Management" },
    { id: "footprint", label: "Carbon Footprint" },
    { id: "roles", label: "Role Management", adminOnly: true },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "register":
        return <ProductForm />;
      case "track":
        return <ProductTracker />;
      case "batch":
        return <BatchManagement />;
      case "footprint":
        return <CarbonFootprintForm />;
      case "roles":
        return isAdmin ? <RoleManagement /> : (
          <div className="text-center py-8">
            <p className="text-red-500">You must be an admin to access this page</p>
          </div>
        );
      default:
        return <ProductForm />;
    }
  };

  return (
    <main className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 p-4 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800">Food Supply Chain</h1>
          <ConnectButton />
        </header>
        
        {isConnected ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex border-b">
              {tabs.map((tab) => {
                if (tab.adminOnly && !isAdmin) return null;
                return (
                  <button
                    key={tab.id}
                    className={`px-4 py-2 font-medium ${
                      activeTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Connect your wallet to get started</h2>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
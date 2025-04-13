"use client";

import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import RoleManagement from "@/components/RoleManagement";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";

export default function RolesPage() {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
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
        const contract = new Contract(
          FOOD_SUPPLY_CHAIN_ADDRESS, 
          FOOD_SUPPLY_CHAIN_ABI, 
          ethersProvider
        );
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

  return (
    <PageTransition>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Role Management</h2>
        {isAdmin ? (
          <RoleManagement />
        ) : (
          <div className="text-center py-8">
            <p className="text-red-500">You must be an admin to access this page</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
// hooks/useRoleRequests.ts
import { useState, useEffect, useCallback } from 'react';
import { useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";

interface RoleRequest {
  id: string;
  requester: string;
  requestedRole: string;
  description: string;
  timestamp: number;
  processed: boolean;
  approved: boolean;
}

export function useRoleRequests() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { walletProvider } = useAppKitProvider("eip155");

  const refreshRequests = useCallback(async () => {
    if (!walletProvider) return;
    
    setLoading(true);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const contract = new Contract(
        FOOD_SUPPLY_CHAIN_ADDRESS, 
        FOOD_SUPPLY_CHAIN_ABI,
        ethersProvider
      );

      // First get the array of pending request IDs
      const pendingIds: BigInt[] = await contract.getPendingRoleRequests();

      // Then fetch each request's details
      const pendingRequests = await Promise.all(
        pendingIds.map(async (id) => {
          const request = await contract.roleRequests(id);
          return {
            id: id.toString(),
            requester: request.requester,
            requestedRole: request.requestedRole,
            description: request.description,
            timestamp: Number(request.timestamp),
            processed: request.processed,
            approved: request.approved
          };
        })
      );

      // Similarly for processed requests if needed
      const allRequests = [...pendingRequests]; // You might want to fetch processed requests too
      setRequests(allRequests);
    } catch (error) {
      console.error("Error fetching role requests:", error);
    } finally {
      setLoading(false);
    }
  }, [walletProvider]);

  useEffect(() => {
    if (walletProvider) {
      refreshRequests();
      
      // Set up event listeners
      const setupListeners = async () => {
        const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
        const contract = new Contract(
          FOOD_SUPPLY_CHAIN_ADDRESS, 
          FOOD_SUPPLY_CHAIN_ABI,
          ethersProvider
        );

        contract.on("RoleRequested", refreshRequests);
        contract.on("RoleRequestProcessed", refreshRequests);
      };

      setupListeners();
      
      return () => {
        if (walletProvider) {
          const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
          const contract = new Contract(
            FOOD_SUPPLY_CHAIN_ADDRESS, 
            FOOD_SUPPLY_CHAIN_ABI,
            ethersProvider
          );
          contract.off("RoleRequested", refreshRequests);
          contract.off("RoleRequestProcessed", refreshRequests);
        }
      };
    }
  }, [walletProvider, refreshRequests]);

  return { 
    requests,
    pendingRequests: requests.filter(r => !r.processed),
    processedRequests: requests.filter(r => r.processed),
    refreshRequests,
    loading
  };
}
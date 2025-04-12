// components/BatchManagement.tsx
"use client";

import { useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";

export default function BatchManagement() {
  const [productIds, setProductIds] = useState("");
  const [batchId, setBatchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletProvider) return;
    
    setLoading(true);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, signer);
      
      // Convert comma-separated string to array of numbers
      const ids = productIds.split(',').map(id => parseInt(id.trim()));
      
      const tx = await contract.createBatch(ids, batchId);
      await tx.wait();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Batch creation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">Create New Batch</h2>
      <form onSubmit={handleCreateBatch}>
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="productIds">
            Product IDs (comma separated)
          </label>
          <input
            id="productIds"
            type="text"
            className="w-full p-2 border rounded"
            value={productIds}
            onChange={(e) => setProductIds(e.target.value)}
            placeholder="e.g., 1, 2, 3"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="batchId">
            Batch ID
          </label>
          <input
            id="batchId"
            type="text"
            className="w-full p-2 border rounded"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Enter unique batch ID"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-black"
          disabled={!isConnected || loading}
        >
          {loading ? "Processing..." : "Create Batch"}
        </button>
      </form>
      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          Batch created successfully!
        </div>
      )}
    </div>
  );
}
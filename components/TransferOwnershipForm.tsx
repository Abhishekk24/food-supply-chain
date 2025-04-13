// components/TransferOwnershipForm.tsx
"use client";

import { useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";
import { motion } from "framer-motion";

export default function TransferOwnershipForm() {
  const [productId, setProductId] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletProvider) return;
    
    setLoading(true);
    setError(null);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, signer);
      
      const tx = await contract.transferOwnership(productId, newOwner);
      await tx.wait();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reset form
      setProductId("");
      setNewOwner("");
    } catch (error: any) {
      console.error("Ownership transfer failed:", error);
      setError(error.message || "Failed to transfer ownership");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">Transfer Product Ownership</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="productId">
            Product ID
          </label>
          <input
            id="productId"
            type="number"
            className="w-full p-2 border rounded"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="newOwner">
            New Owner Address
          </label>
          <input
            id="newOwner"
            type="text"
            className="w-full p-2 border rounded font-mono text-sm"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!isConnected || loading}
        >
          {loading ? "Processing..." : "Transfer Ownership"}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-100 text-green-800 rounded"
        >
          Ownership transferred successfully!
        </motion.div>
      )}
      
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="text-sm font-medium mb-2">Note:</h3>
        <p className="text-sm text-gray-600">
          Transferring ownership will record the current owner in the product's history. Only the current owner can transfer ownership.
        </p>
      </div>
    </div>
  );
}
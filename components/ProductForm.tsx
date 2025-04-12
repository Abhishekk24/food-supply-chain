// ProductForm.tsx
"use client";

import { useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";

export default function ProductForm() {
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
  
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletProvider) return;
  
    setLoading(true);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(
        FOOD_SUPPLY_CHAIN_ADDRESS,
        FOOD_SUPPLY_CHAIN_ABI,
        signer
      );

      const currentCount = await contract.productCount();
      const tx = await contract.registerProduct(
        name,
        origin,
        Math.floor(new Date(harvestDate).getTime() / 1000)
      );
      await tx.wait();
  
      const newProductId = Number(currentCount) + 1;
      setProductId(newProductId);
  
      console.log("New Product ID:", newProductId);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">Register New Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="name">
            Product Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="origin">
            Origin
          </label>
          <input
            id="origin"
            type="text"
            className="w-full p-2 border rounded"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="harvestDate">
            Harvest Date
          </label>
          <input
            id="harvestDate"
            type="date"
            className="w-full p-2 border rounded"
            value={harvestDate}
            onChange={(e) => setHarvestDate(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-black"
          disabled={!isConnected || loading}
        >
          {loading ? "Processing..." : "Register Product"}
        </button>
      </form>
      {productId && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          Product registered successfully! ID: {productId}
        </div>
      )}
    </div>
  );
}
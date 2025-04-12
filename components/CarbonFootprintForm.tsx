// components/CarbonFootprintForm.tsx
"use client";

import { useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";

export default function CarbonFootprintForm() {
  const [productId, setProductId] = useState("");
  const [transportEmissions, setTransportEmissions] = useState("");
  const [productionEmissions, setProductionEmissions] = useState("");
  const [packagingEmissions, setPackagingEmissions] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletProvider) return;
    
    setLoading(true);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, signer);
      
      const tx = await contract.setCarbonFootprint(
        productId,
        transportEmissions,
        productionEmissions,
        packagingEmissions
      );
      await tx.wait();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to set carbon footprint:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">Set Carbon Footprint</h2>
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
          <label className="block text-black mb-2" htmlFor="transportEmissions">
            Transport Emissions (kg CO2)
          </label>
          <input
            id="transportEmissions"
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
            value={transportEmissions}
            onChange={(e) => setTransportEmissions(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="productionEmissions">
            Production Emissions (kg CO2)
          </label>
          <input
            id="productionEmissions"
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
            value={productionEmissions}
            onChange={(e) => setProductionEmissions(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="packagingEmissions">
            Packaging Emissions (kg CO2)
          </label>
          <input
            id="packagingEmissions"
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
            value={packagingEmissions}
            onChange={(e) => setPackagingEmissions(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-black"
          disabled={!isConnected || loading}
        >
          {loading ? "Processing..." : "Set Carbon Footprint"}
        </button>
      </form>
      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          Carbon footprint set successfully!
        </div>
      )}
    </div>
  );
}
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
    <div className="max-w-md mx-auto p-8  rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Carbon Footprint Tracker</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product ID Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="productId">
            Product Identifier
          </label>
          <div className="relative">
            <input
              id="productId"
              type="number"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 placeholder-gray-400 placeholder:italic transition-all duration-200"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter product ID or scan code"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>
  
        {/* Emissions Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="transportEmissions">
              Transport
            </label>
            <input
              id="transportEmissions"
              type="number"
              step="0.01"
              className="w-full px-4 py-3 rounded-lg border-2 border-blue-100 bg-blue-50 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder-blue-300 placeholder:font-light transition-all duration-200"
              value={transportEmissions}
              onChange={(e) => setTransportEmissions(e.target.value)}
              placeholder="0.00 kg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="productionEmissions">
              Production
            </label>
            <input
              id="productionEmissions"
              type="number"
              step="0.01"
              className="w-full px-4 py-3 rounded-lg border-2 border-green-100 bg-green-50 focus:border-green-400 focus:ring-1 focus:ring-green-100 placeholder-green-300 placeholder:font-light transition-all duration-200"
              value={productionEmissions}
              onChange={(e) => setProductionEmissions(e.target.value)}
              placeholder="0.00 kg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="packagingEmissions">
              Packaging
            </label>
            <input
              id="packagingEmissions"
              type="number"
              step="0.01"
              className="w-full px-4 py-3 rounded-lg border-2 border-amber-100 bg-amber-50 focus:border-amber-400 focus:ring-1 focus:ring-amber-100 placeholder-amber-300 placeholder:font-light transition-all duration-200"
              value={packagingEmissions}
              onChange={(e) => setPackagingEmissions(e.target.value)}
              placeholder="0.00 kg"
              required
            />
          </div>
        </div>
  
        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white py-2 px-4  rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={!isConnected || loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating Impact...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                Set Carbon Footprint
              </>
            )}
          </button>
        </div>
      </form>
  
      {success && (
        <div className="mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-emerald-700 font-medium">
                Carbon footprint recorded successfully!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
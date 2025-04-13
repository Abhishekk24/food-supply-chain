"use client";

import { useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";
import QRCodeGenerator from "./QRCodeGenerator";

export default function ProductForm() {
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
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
    } catch (error: any) {
      console.error("Registration failed:", error);
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setOrigin("");
    setHarvestDate("");
    setProductId(null);
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Product Name
        </label>
        <input
          id="name"
          type="text"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
          required
        />
      </div>
      
      <div>
        <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
          Origin
        </label>
        <input
          id="origin"
          type="text"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Enter origin location"
          required
        />
      </div>
      
      <div>
        <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 mb-1">
          Harvest Date
        </label>
        <input
          id="harvestDate"
          type="date"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
          value={harvestDate}
          onChange={(e) => setHarvestDate(e.target.value)}
          required
        />
      </div>
      
      <div className="flex items-center">
        <input 
          id="terms" 
          type="checkbox" 
          className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
          required
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
          I agree to the Terms & Privacy
        </label>
      </div>
      
      <div className="flex space-x-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isConnected || loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : "Register Product"}
        </button>
        
        <button
          type="button"
          onClick={resetForm}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Reset
        </button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="flex items-center text-sm">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}
      
      {productId && (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            <div className="flex items-center text-sm">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>Product registered successfully! ID: <span className="font-medium">{productId}</span></p>
            </div>
          </div>
          
          <div className="flex justify-center p-4 border border-gray-200 rounded-lg">
            <QRCodeGenerator text={`${window.location.origin}/track?id=${productId}`} />
          </div>
        </div>
      )}
      
      {!isConnected && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
          <p>Please connect your wallet to register a product.</p>
        </div>
      )}
    </form>
  );
}
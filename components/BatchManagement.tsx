// components/BatchManagement.tsx
"use client";

import { useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";
import QRCodeGenerator from "./QRCodeGenerator";

export default function BatchManagement() {
  const [productIds, setProductIds] = useState("");
  const [batchId, setBatchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);
  
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletProvider) return;
    
    setLoading(true);
    setError(null);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, signer);
      
      // Convert comma-separated string to array of numbers
      const ids = productIds.split(',').map(id => parseInt(id.trim()));
      
      // Validate that all IDs are valid numbers
      if (ids.some(isNaN)) {
        throw new Error("Invalid product ID format. Please enter comma-separated numbers.");
      }
      
      const tx = await contract.createBatch(ids, batchId);
      await tx.wait();
      
      setSuccess(true);
      setCreatedBatchId(batchId);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error("Batch creation failed:", error);
      setError(error.message || "Failed to create batch. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProductIds("");
    setBatchId("");
    setError(null);
    setCreatedBatchId(null);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Create New Batch
        </h2>
      </div>
      
      <form onSubmit={handleCreateBatch} className="p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="productIds">
            Product IDs (comma separated)
          </label>
          <input
            id="productIds"
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={productIds}
            onChange={(e) => setProductIds(e.target.value)}
            placeholder="e.g., 1, 2, 3"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Enter the IDs of products to include in this batch</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="batchId">
            Batch ID
          </label>
          <input
            id="batchId"
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Enter unique batch ID"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Create a unique identifier for this batch</p>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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
            ) : "Create Batch"}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mx-6 mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}
      
      {success && createdBatchId && (
        <div className="mx-6 mb-6">
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded mb-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">Batch created successfully!</p>
            </div>
            <p className="mt-2">Batch ID: <span className="font-bold">{createdBatchId}</span></p>
          </div>
          
          <div className="flex justify-center mb-4">
            <QRCodeGenerator text={`${window.location.origin}/track?batch=${createdBatchId}`} />
          </div>
        </div>
      )}
      
      {!isConnected && (
        <div className="mx-6 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm">Please connect your wallet to create a batch.</p>
        </div>
      )}
      
      <div className="mx-6 mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Batch Management Tips:</h3>
        <ul className="text-sm text-gray-600 list-disc list-inside">
          <li>Group related products together for easier tracking</li>
          <li>Choose descriptive batch IDs (e.g., "Farm123-May2025")</li>
          <li>Include 2-10 products in a batch for optimal efficiency</li>
        </ul>
      </div>
    </div>
  );
}
// components/QualityCheckForm.tsx
"use client";

import { useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";
import { motion } from "framer-motion";

export default function QualityCheckForm() {
  const [productId, setProductId] = useState("");
  const [checkResult, setCheckResult] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasRole, setHasRole] = useState(true); // Assume user has role initially
  
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const checkUserRole = async () => {
    if (!isConnected || !walletProvider || !address) return false;
    
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, ethersProvider);
      const qualityCheckerRole = await contract.QUALITY_CHECKER_ROLE();
      const hasQualityCheckerRole = await contract.hasRole(qualityCheckerRole, address);
      
      setHasRole(hasQualityCheckerRole);
      return hasQualityCheckerRole;
    } catch (error) {
      console.error("Error checking user role:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletProvider) return;
    
    // First check if user has the right role
    const canAddCheck = await checkUserRole();
    if (!canAddCheck) {
      alert("You need Quality Checker role to perform this action");
      return;
    }
    
    setLoading(true);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, signer);
      
      // Format the check result string with additional data
      const formattedResult = `${checkResult} (Temp: ${temperature}°C, Humidity: ${humidity}%)`;
      
      const tx = await contract.addQualityCheck(productId, formattedResult);
      await tx.wait();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reset form
      setCheckResult("");
      setTemperature("");
      setHumidity("");
    } catch (error) {
      console.error("Failed to add quality check:", error);
      alert("Failed to add quality check. Make sure you have the right permissions and the product exists.");
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-semibold mb-4 text-black">Role Required</h2>
        <p className="text-gray-600 mb-4">You need Quality Checker role to perform quality checks.</p>
        <a href="/roles" className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Go to Role Management
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">Add Quality Check</h2>
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
          <label className="block text-black mb-2" htmlFor="checkResult">
            Check Result
          </label>
          <select
            id="checkResult"
            className="w-full p-2 border rounded"
            value={checkResult}
            onChange={(e) => setCheckResult(e.target.value)}
            required
          >
            <option value="">Select result</option>
            <option value="Passed">Passed</option>
            <option value="Passed with minor issues">Passed with minor issues</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-black mb-2" htmlFor="temperature">
              Temperature (°C)
            </label>
            <input
              id="temperature"
              type="number"
              step="0.1"
              className="w-full p-2 border rounded"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              required
              placeholder="e.g., 4.5"
            />
          </div>
          
          <div>
            <label className="block text-black mb-2" htmlFor="humidity">
              Humidity (%)
            </label>
            <input
              id="humidity"
              type="number"
              step="0.1"
              className="w-full p-2 border rounded"
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
              required
              placeholder="e.g., 75"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white py-2 px-4  rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            
          disabled={!isConnected || loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : "Add Quality Check"}
        </button>
      </form>
      
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-100 text-green-800 rounded"
        >
          Quality check added successfully!
        </motion.div>
      )}
    </div>
  );
}
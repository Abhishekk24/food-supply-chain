// components/LocationUpdateForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";
import { motion } from "framer-motion";

export default function LocationUpdateForm() {
  const [productId, setProductId] = useState("");
  const [location, setLocation] = useState("");
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  // Get current geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Get human-readable address from coordinates
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
              setLocation(data.display_name);
            } else {
              // Fallback to coordinates if address lookup fails
              setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`);
            }
          } else {
            // Fallback to coordinates
            setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`);
          }
        } catch (err) {
          // Fallback to coordinates on any error
          setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`);
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
        setLoadingLocation(false);
      }
    );
  };

  // Toggle geolocation usage
  useEffect(() => {
    if (useGeolocation) {
      getCurrentLocation();
    }
  }, [useGeolocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletProvider || !productId || !location) return;
    
    setLoading(true);
    setError(null);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, signer);
      
      const tx = await contract.updateProductLocation(productId, location);
      await tx.wait();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reset form
      setProductId("");
      if (!useGeolocation) {
        setLocation("");
      }
    } catch (error: any) {
      console.error("Failed to update location:", error);
      setError(error.message || "Failed to update location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">Update Product Location</h2>
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
          <div className="flex items-center mb-2">
            <label className="text-black mr-auto" htmlFor="location">
              Location
            </label>
            <div className="flex items-center">
              <input
                id="useGeolocation"
                type="checkbox"
                className="mr-2"
                checked={useGeolocation}
                onChange={(e) => setUseGeolocation(e.target.checked)}
              />
              <label htmlFor="useGeolocation" className="text-sm text-gray-600">
                Use my location
              </label>
            </div>
          </div>
          
          <div className="relative">
            <input
              id="location"
              type="text"
              className="w-full p-2 border rounded"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={useGeolocation || loadingLocation}
              required
              placeholder={loadingLocation ? "Getting your location..." : "Enter location"}
            />
            {useGeolocation && (
              <button
                type="button"
                onClick={getCurrentLocation}
                className="absolute right-2 top-2 text-blue-500 hover:text-blue-700"
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!isConnected || loading || loadingLocation || !location}
        >
          {loading ? "Processing..." : "Update Location"}
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
          Location updated successfully!
        </motion.div>
      )}
    </div>
  );
}
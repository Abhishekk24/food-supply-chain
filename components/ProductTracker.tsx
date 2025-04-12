// ProductTracker.tsx
"use client";

import { useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";

interface ProductHistory {
  name: string;
  origin: string;
  harvestDate: number;
  currentOwner: string;
  qualityChecks: string[];
  previousOwners: string[];
  locations: string[];
  carbonFootprint?: {
    transportEmissions: number;
    productionEmissions: number;
    packagingEmissions: number;
  };
  certifications?: Array<{
    standard: string;
    issuer: string;
    issueDate: number;
    expiryDate: number;
  }>;
}

export default function ProductTracker() {
  const [productId, setProductId] = useState("");
  const [productHistory, setProductHistory] = useState<ProductHistory | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const fetchProductHistory = async () => {
    if (!isConnected || !productId) return;
    
    setLoading(true);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, ethersProvider);
      
      // Fetch basic product info
      const history = await contract.getProductHistory(productId);
      
      // Fetch additional info
      const footprint = await contract.getProductFootprint(productId);
      const certifications = await contract.getProductCertifications(productId);
      
      setProductHistory({
        name: history[0],
        origin: history[1],
        harvestDate: Number(history[2]),
        currentOwner: history[3],
        qualityChecks: history[4],
        previousOwners: history[5],
        locations: history[6],
        carbonFootprint: {
          transportEmissions: Number(footprint.transportEmissions),
          productionEmissions: Number(footprint.productionEmissions),
          packagingEmissions: Number(footprint.packagingEmissions)
        },
        certifications: certifications.map((cert: any) => ({
          standard: cert.standard,
          issuer: cert.issuer,
          issueDate: Number(cert.issueDate),
          expiryDate: Number(cert.expiryDate)
        }))
      });
    } catch (error) {
      console.error(error);
      setProductHistory(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-black">
      <h2 className="text-xl font-semibold mb-4 text-black">Track Product</h2>
      <div className="mb-4">
        <label className="block text-black mb-2 text-black" htmlFor="productId">
          Product ID
        </label>
        <div className="flex">
          <input
            id="productId"
            type="number"
            className="flex-1 p-2 border rounded-l"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter product ID"
          />
          <button
            onClick={fetchProductHistory}
            className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 disabled:bg-black"
            disabled={!isConnected || loading}
          >
            {loading ? "Loading..." : "Track"}
          </button>
        </div>
      </div>
      
      {productHistory && (
        <div className="mt-4 p-4 bg-black-50 rounded">
          <h3 className="font-medium text-lg text-black">{productHistory.name}</h3>
          <p className="text-black">Origin: {productHistory.origin}</p>
          <p className="text-black">
            Harvest Date: {new Date(productHistory.harvestDate * 1000).toLocaleDateString()}
          </p>
          <p className="text-black">
            Current Owner: {productHistory.currentOwner}
          </p>
          
          {productHistory.carbonFootprint && (
            <div className="mt-3">
              <h4 className="font-medium text-black">Carbon Footprint:</h4>
              <ul className="list-disc pl-5">
                <li>Transport Emissions: {productHistory.carbonFootprint.transportEmissions} kg CO2</li>
                <li>Production Emissions: {productHistory.carbonFootprint.productionEmissions} kg CO2</li>
                <li>Packaging Emissions: {productHistory.carbonFootprint.packagingEmissions} kg CO2</li>
              </ul>
            </div>
          )}
          
          {productHistory.certifications && productHistory.certifications.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-black">Certifications:</h4>
              <ul className="list-disc pl-5">
                {productHistory.certifications.map((cert, i) => (
                  <li key={i}>
                    {cert.standard} by {cert.issuer} (Issued: {new Date(cert.issueDate * 1000).toLocaleDateString()}, 
                    Expires: {new Date(cert.expiryDate * 1000).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-3">
            <h4 className="font-medium text-black">Quality Checks:</h4>
            <ul className="list-disc pl-5">
              {productHistory.qualityChecks.map((check, i) => (
                <li key={i}>{check}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-3">
            <h4 className="font-medium text-black">Previous Owners:</h4>
            <ul className="list-disc pl-5">
              {productHistory.previousOwners.map((owner, i) => (
                <li key={i}>{owner}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-3">
            <h4 className="font-medium text-black">Locations:</h4>
            <ul className="list-disc pl-5">
              {productHistory.locations.map((location, i) => (
                <li key={i}>{location}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
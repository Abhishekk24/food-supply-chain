// ProductTracker.tsx
"use client";

import { useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";
import { motion } from "framer-motion";

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
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const fetchProductHistory = async () => {
    if (!isConnected || !productId) return;
    
    setLoading(true);
    setError(null);
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
      setError("Product not found or error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Timeline for product journey
  const ProductTimeline = ({ locations, previousOwners }: { locations: string[], previousOwners: string[] }) => {
    if (!locations.length && !previousOwners.length) return null;
    
    // Combine locations and owners into timeline events
    const timelineEvents = [];
    const maxEvents = Math.max(locations.length, previousOwners.length);
    
    for (let i = 0; i < maxEvents; i++) {
      timelineEvents.push({
        location: locations[i] || "",
        owner: previousOwners[i] || ""
      });
    }
    
    return (
      <div className="mt-6">
        <h4 className="font-medium text-lg mb-3 text-black">Product Journey</h4>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute h-full w-0.5 bg-blue-200 left-2 top-0"></div>
          
          {timelineEvents.map((event, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="ml-6 mb-4 relative"
            >
              {/* Timeline dot */}
              <div className="absolute w-4 h-4 rounded-full bg-blue-500 -left-10 top-1"></div>
              
              <div className="p-3 bg-white rounded shadow-sm">
                {event.location && <p className="font-medium text-black">Location: {event.location}</p>}
                {event.owner && <p className="text-black">Handler: {event.owner}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Quality check component with status indicators
  const QualityChecks = ({ checks }: { checks: string[] }) => {
    if (!checks.length) return (
      <div className="mt-3">
        <h4 className="font-medium text-black">Quality Checks:</h4>
        <p className="text-gray-500 italic">No quality checks recorded</p>
      </div>
    );
    
    return (
      <div className="mt-3">
        <h4 className="font-medium text-black">Quality Checks:</h4>
        <div className="grid grid-cols-1 gap-2 mt-2">
          {checks.map((check, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center p-2 bg-green-50 rounded border-l-4 border-green-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{check}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Carbon footprint visualization
  // Carbon footprint visualization with black theme
const CarbonFootprint = ({ footprint }: { footprint: { transportEmissions: number, productionEmissions: number, packagingEmissions: number } }) => {
  if (!footprint) return null;
  
  const total = footprint.transportEmissions + footprint.productionEmissions + footprint.packagingEmissions;
  
  const transportPercent = (footprint.transportEmissions / total) * 100;
  const productionPercent = (footprint.productionEmissions / total) * 100;
  const packagingPercent = (footprint.packagingEmissions / total) * 100;
  
  return (
    <div className="mt-4">
      <h4 className="font-medium text-black mb-3">Carbon Footprint:</h4>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Total Emissions</span>
          <span className="text-lg font-bold text-black">{total.toFixed(2)} kg CO₂</span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Transport</span>
              <span className="text-sm text-gray-600">{footprint.transportEmissions.toFixed(2)} kg ({transportPercent.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-black h-2 rounded-full" 
                style={{ width: `${transportPercent}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Production</span>
              <span className="text-sm text-gray-600">{footprint.productionEmissions.toFixed(2)} kg ({productionPercent.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-800 h-2 rounded-full" 
                style={{ width: `${productionPercent}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Packaging</span>
              <span className="text-sm text-gray-600">{footprint.packagingEmissions.toFixed(2)} kg ({packagingPercent.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-600 h-2 rounded-full" 
                style={{ width: `${packagingPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-black mr-2"></div>
              <span className="text-xs text-gray-600">Transport</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-800 mr-2"></div>
              <span className="text-xs text-gray-600">Production</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-600 mr-2"></div>
              <span className="text-xs text-gray-600">Packaging</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md text-black">
      <h2 className="text-xl font-semibold mb-4 text-black">Track Product</h2>
      <div className="mb-4">
        <label className="block text-black mb-2 text-black" htmlFor="productId">
          Product ID
        </label>
        <div className="flex gap-2">
          <input
            id="productId"
            type="number"
            className="flex-1 p-2 border rounded-l"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter product ID"
            onKeyPress={(e) => e.key === 'Enter' && fetchProductHistory()}
          />
          <button
            onClick={fetchProductHistory}
            className=" bg-gray-900 hover:bg-gray-800 text-white py-2 px-4  rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          
            disabled={!isConnected || loading || !productId}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading
              </span>
            ) : "Track"}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
      )}
      
      {productHistory && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gray-50 rounded shadow-sm"
        >
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-lg text-black">{productHistory.name}</h3>
              <p className="text-sm text-gray-500">ID: {productId}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-600">Origin</p>
              <p className="font-medium">{productHistory.origin}</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm text-gray-600">Harvest Date</p>
              <p className="font-medium">
                {new Date(productHistory.harvestDate * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-3 mb-3">
            <p className="text-black flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Current Owner: <span className="ml-1 font-mono text-sm bg-gray-100 p-1 rounded">{productHistory.currentOwner}</span>
            </p>
          </div>
          
          {productHistory.carbonFootprint && (
            <CarbonFootprint footprint={productHistory.carbonFootprint} />
          )}
          
          {productHistory.certifications && productHistory.certifications.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-3">
              <h4 className="font-medium text-black mb-2">Certifications:</h4>
              <div className="space-y-2">
                {productHistory.certifications.map((cert, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-2 bg-indigo-50 rounded border-l-4 border-indigo-400"
                  >
                    <p className="font-medium">{cert.standard}</p>
                    <p className="text-sm">Issued by: {cert.issuer}</p>
                    <div className="flex text-xs text-gray-500 mt-1 justify-between">
                      <span>Issued: {new Date(cert.issueDate * 1000).toLocaleDateString()}</span>
                      <span>Expires: {new Date(cert.expiryDate * 1000).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          <QualityChecks checks={productHistory.qualityChecks} />
          
          <ProductTimeline 
            locations={productHistory.locations} 
            previousOwners={productHistory.previousOwners} 
          />
        </motion.div>
      )}
      
      {!productHistory && !loading && !error && isConnected && (
        <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">Enter a product ID and click Track to view product details</p>
        </div>
      )}
    </div>
  );
}
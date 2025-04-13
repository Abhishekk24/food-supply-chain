// page.tsx (home page)
"use client";

import { motion } from "framer-motion";
import ConnectButton from "@/components/ConnectButton";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";
import Link from "next/link";

interface DashboardStats {
  productCount: number;
  // batchCount: number;
  userCount: number;
}

export default function Home() {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isConnected || !walletProvider) return;
      
      setLoading(true);
      try {
        const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
        const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, ethersProvider);
        
        // Fetch stats from contract
        const productCount = await contract.productCount();
        // const batchCount = await contract.batchCount();
        const userCount = await contract.userCount();
        
        setStats({
          productCount: Number(productCount),
          // batchCount: Number(batchCount),
          userCount: Number(userCount)
        });
        
        // Check user role
        if (address) {
          const adminRole = await contract.ADMIN_ROLE();
          const farmerRole = await contract.FARMER_ROLE();
          const distributorRole = await contract.DISTRIBUTOR_ROLE();
          const retailerRole = await contract.RETAILER_ROLE();
          
          if (await contract.hasRole(adminRole, address)) {
            setUserRole("Admin");
          } else if (await contract.hasRole(farmerRole, address)) {
            setUserRole("Farmer");
          } else if (await contract.hasRole(distributorRole, address)) {
            setUserRole("Distributor");
          } else if (await contract.hasRole(retailerRole, address)) {
            setUserRole("Retailer");
          } else {
            setUserRole("User");
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isConnected, walletProvider, address]);

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-[70vh] flex items-center justify-center"
      >
        <div className="text-center p-8 bg-white rounded-lg shadow max-w-lg">
          <h1 className="text-2xl font-bold mb-2">Food Supply Chain Management</h1>
          <p className="text-gray-600 mb-6">Track food products from farm to table with blockchain verification</p>
          <div className="mb-8">
            <img src="/api/placeholder/400/320" alt="Food tracking illustration" className="mx-auto rounded-lg" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Connect your wallet to get started</h2>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Welcome section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Welcome to Food Supply Chain Management</h1>
        <p className="text-gray-600">
          {userRole ? `You're logged in as: ${userRole}` : "Connected to blockchain"}
        </p>
      </div>
      
      {/* Stats */}
      {loading ? (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500"
          >
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-3xl font-bold">{stats.productCount}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500"
          >
            <p className="text-sm text-gray-500">Total Batches</p>
            {/* <p className="text-3xl font-bold">{stats.batchCount}</p> */}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500"
          >
            <p className="text-sm text-gray-500">Network Users</p>
            <p className="text-3xl font-bold">{stats.userCount}</p>
          </motion.div>
        </div>
      ) : null}
      
      {/* Quick action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/register" className="block">
          <motion.div 
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col"
          >
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Register Product</h3>
            <p className="text-gray-600 text-sm flex-grow">Add new products to the blockchain with detailed information.</p>
          </motion.div>
        </Link>
        
        <Link href="/track" className="block">
          <motion.div 
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col"
          >
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Track Product</h3>
            <p className="text-gray-600 text-sm flex-grow">View complete history and carbon footprint of products.</p>
          </motion.div>
        </Link>
        
        <Link href="/batch" className="block">
          <motion.div 
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col"
          >
            <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Batch Management</h3>
            <p className="text-gray-600 text-sm flex-grow">Create and manage batches of products for bulk operations.</p>
          </motion.div>
        </Link>
        
        <Link href="/footprint" className="block">
          <motion.div 
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col"
            >
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Carbon Footprint</h3>
              <p className="text-gray-600 text-sm flex-grow">Monitor and update environmental impact data for products.</p>
            </motion.div>
          </Link>
        </div>
        
        {/* Latest Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Latest Activity</h2>
          
          <div className="border-l-2 border-gray-200 pl-4 space-y-6">
            <div className="relative">
              <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm text-gray-500">Today, 10:45 AM</p>
                <p className="font-medium">New product registered: Orange Batch #1422</p>
                <p className="text-sm text-gray-600">Origin: Valencia, Spain</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm text-gray-500">Yesterday, 4:30 PM</p>
                <p className="font-medium">Carbon footprint updated for Avocado #87</p>
                <p className="text-sm text-gray-600">Total emission: 2.4 kg CO2</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-yellow-500"></div>
              <div>
                <p className="text-sm text-gray-500">Apr 11, 2025</p>
                <p className="font-medium">New batch created: Mixed Vegetables #28</p>
                <p className="text-sm text-gray-600">Contains 6 products</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
              View All Activity
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
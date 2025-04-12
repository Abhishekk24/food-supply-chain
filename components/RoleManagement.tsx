// components/RoleManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";

const ROLES = [
  { id: "FARMER_ROLE", label: "Farmer" },
  { id: "DISTRIBUTOR_ROLE", label: "Distributor" },
  { id: "RETAILER_ROLE", label: "Retailer" },
  { id: "QUALITY_CHECKER_ROLE", label: "Quality Checker" },
];

export default function RoleManagement() {
  const [address, setAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState("FARMER_ROLE");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { isConnected, address: connectedAddress } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isConnected || !walletProvider || !connectedAddress) {
        setIsAdmin(false);
        return;
      }

      try {
        const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
        const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, ethersProvider);
        const adminRole = await contract.ADMIN_ROLE();
        const hasAdminRole = await contract.hasRole(adminRole, connectedAddress);
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [isConnected, walletProvider, connectedAddress]);

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletProvider || !isAdmin) return;
    
    setLoading(true);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, signer);
      
      let tx;
      switch (selectedRole) {
        case "FARMER_ROLE":
          tx = await contract.grantFarmerRole(address);
          break;
        case "DISTRIBUTOR_ROLE":
          tx = await contract.grantDistributorRole(address);
          break;
        case "RETAILER_ROLE":
          tx = await contract.grantRetailerRole(address);
          break;
        case "QUALITY_CHECKER_ROLE":
          tx = await contract.grantQualityCheckerRole(address);
          break;
        default:
          throw new Error("Invalid role selected");
      }
      
      await tx.wait();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to grant role:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4 text-black">Role Management</h2>
        <p className="text-red-500">You must be an admin to access this page</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">Grant Role</h2>
      <form onSubmit={handleGrantRole}>
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="address">
            Ethereum Address
          </label>
          <input
            id="address"
            type="text"
            className="w-full p-2 border rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            className="w-full p-2 border rounded"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {ROLES.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-black"
          disabled={!isConnected || loading}
        >
          {loading ? "Processing..." : "Grant Role"}
        </button>
      </form>
      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          Role granted successfully!
        </div>
      )}
    </div>
  );
}
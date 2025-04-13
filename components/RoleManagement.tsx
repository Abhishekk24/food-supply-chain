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

interface RoleRequest {
  address: string;
  role: string;
  description: string;
  timestamp: string;
  status: string;
}

export default function RoleManagement() {
  const [address, setAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState("FARMER_ROLE");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  
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

        // Load pending requests if admin
        if (hasAdminRole) {
          const storedRequests = JSON.parse(localStorage.getItem('roleRequests') || '[]');
          setRequests(storedRequests.filter((r: RoleRequest) => r.status === 'pending'));
        }
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
      
      // Update request status
      const updatedRequests = requests.map(req => 
        req.address === address && req.role === selectedRole 
          ? { ...req, status: 'approved' } 
          : req
      );
      
      localStorage.setItem('roleRequests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests.filter(r => r.status === 'pending'));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to grant role:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantRequestedRole = async (request: RoleRequest) => {
    if (!isConnected || !walletProvider || !isAdmin) return;
    
    setLoading(true);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, signer);
      
      let tx;
      switch (request.role) {
        case "FARMER_ROLE":
          tx = await contract.grantFarmerRole(request.address);
          break;
        case "DISTRIBUTOR_ROLE":
          tx = await contract.grantDistributorRole(request.address);
          break;
        case "RETAILER_ROLE":
          tx = await contract.grantRetailerRole(request.address);
          break;
        case "QUALITY_CHECKER_ROLE":
          tx = await contract.grantQualityCheckerRole(request.address);
          break;
        default:
          throw new Error("Invalid role selected");
      }
      
      await tx.wait();
      
      // Update request status
      const updatedRequests = requests.map(req => 
        req.address === request.address && req.role === request.role 
          ? { ...req, status: 'approved' } 
          : req
      );
      
      localStorage.setItem('roleRequests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests.filter(r => r.status === 'pending'));
      
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">Role Management</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-3 text-black">Grant Role</h3>
          <form onSubmit={handleGrantRole} className="mb-6">
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
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              disabled={!isConnected || loading}
            >
              {loading ? "Processing..." : "Grant Role"}
            </button>
          </form>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3 text-black">Pending Requests</h3>
          {requests.length === 0 ? (
            <p className="text-gray-500">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{request.address}</p>
                      <p className="text-sm text-gray-600">
                        Requested: {ROLES.find(r => r.id === request.role)?.label}
                      </p>
                      <p className="text-sm mt-2">{request.description}</p>
                    </div>
                    <button
                      onClick={() => handleGrantRequestedRole(request)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      disabled={loading}
                    >
                      Approve
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(request.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          Role granted successfully!
        </div>
      )}
    </div>
  );
}
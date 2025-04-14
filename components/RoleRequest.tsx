// components/RoleRequest.tsx
"use client";

import { useState, useEffect } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";
import { useRoleRequests } from "@/hooks/useRoleRequests";


const ROLES = [
  { id: "ADMIN_ROLE", label: "Admin" },
  { id: "FARMER_ROLE", label: "Farmer" },
  { id: "DISTRIBUTOR_ROLE", label: "Distributor" },
  { id: "RETAILER_ROLE", label: "Retailer" },
  { id: "QUALITY_CHECKER_ROLE", label: "Quality Checker" },
];

export default function RoleRequest() {
  const [selectedRole, setSelectedRole] = useState("FARMER_ROLE");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [description, setDescription] = useState("");
  const [currentRoles, setCurrentRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const { refreshRequests } = useRoleRequests();
  
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  useEffect(() => {
    const checkCurrentRoles = async () => {
      if (!isConnected || !walletProvider || !address) {
        setCurrentRoles([]);
        setRolesLoading(false);
        return;
      }
    
      try {
        setRolesLoading(true);
        const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
        const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, ethersProvider);
        
        const userRoles = [];
        
        // First check for admin role
        const adminRole = await contract.ADMIN_ROLE();
        const isAdmin = await contract.hasRole(adminRole, address);
        if (isAdmin) {
          userRoles.push("Admin");
        }
    
        // Then check other roles
        for (const role of ROLES) {
          const roleBytes = await contract[role.id]();
          const hasRole = await contract.hasRole(roleBytes, address);
          if (hasRole) {
            userRoles.push(role.label);
          }
        }
    
        setCurrentRoles(userRoles);
      } catch (error) {
        console.error("Error checking roles:", error);
        setCurrentRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    checkCurrentRoles();
  }, [isConnected, walletProvider, address]);

  const handleRequestRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) return;
    
    setLoading(true);
    try {
      const existingRequests = JSON.parse(localStorage.getItem('foodChainRoleRequests') || '[]');
      const newRequest = {
        id: `request-${Date.now()}`,
        requesterAddress: address,
        requestedRole: selectedRole,
        roleLabel: ROLES.find(r => r.id === selectedRole)?.label || selectedRole,
        description,
        timestamp: new Date().toISOString(),
        status: 'pending',
        approved: false,
        adminActionTaken: false
      };
      
      const updatedRequests = [...existingRequests, newRequest];
      localStorage.setItem('foodChainRoleRequests', JSON.stringify(updatedRequests));
      
      // Manually trigger storage event
      window.dispatchEvent(new Event('storage'));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setDescription("");
    } catch (error) {
      console.error("Failed to request role:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-black">Request Role</h2>
      
      {/* Current Roles Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2 text-black">Your Current Roles</h3>
        {rolesLoading ? (
          <p className="text-gray-500">Loading roles...</p>
        ) : currentRoles.length > 0 ? (
          <ul className="list-disc pl-5">
            {currentRoles.map((role, index) => (
              <li key={index} className="text-gray-700">{role}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">You don't have any roles assigned yet</p>
        )}
      </div>

      {/* Role Request Form */}
      <form onSubmit={handleRequestRole}>
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="role">
            Request New Role
          </label>
          <select
            id="role"
            className="w-full p-2 border rounded"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={!isConnected}
          >
            {ROLES.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-black mb-2" htmlFor="description">
            Why do you need this role?
          </label>
          <textarea
            id="description"
            className="w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain your request..."
            required
            rows={4}
            disabled={!isConnected}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!isConnected || loading}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
      
      {/* Status Messages */}
      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          Role request submitted successfully! An admin will review your request.
        </div>
      )}
      {!isConnected && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">
          Please connect your wallet to submit a role request.
        </div>
      )}
    </div>
  );
}
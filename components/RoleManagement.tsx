"use client";

import { useState, useEffect } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";
import { useRoleRequests } from "@/hooks/useRoleRequests";

const ROLES = [
  { id: "FARMER_ROLE", label: "Farmer" },
  { id: "DISTRIBUTOR_ROLE", label: "Distributor" },
  { id: "RETAILER_ROLE", label: "Retailer" },
  { id: "QUALITY_CHECKER_ROLE", label: "Quality Checker" },
  { id: "ADMIN_ROLE", label: "Admin" },
];

interface RoleRequest {
  id: string;
  requesterAddress: string;
  requestedRole: string;
  roleLabel: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  approved: boolean;
  adminActionTaken: boolean;
}

interface AddressRoles {
  [key: string]: boolean;
}

export default function RoleManagement() {
  const [address, setAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState("FARMER_ROLE");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  const [addressRoles, setAddressRoles] = useState<AddressRoles>({});
  const [checkingRoles, setCheckingRoles] = useState(false);
  
  const { isConnected, address: connectedAddress } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { requests: allRequests, refreshRequests } = useRoleRequests();

  // Filter requests based on current filter
  const filteredRequests = filter === 'pending' 
    ? allRequests.filter((r: RoleRequest) => r.status === 'pending')
    : allRequests;

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

        if (hasAdminRole) {
          refreshRequests(); // Load requests immediately when admin is detected
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [isConnected, walletProvider, connectedAddress, refreshRequests]);

  const fetchRolesForAddress = async (address: string) => {
    if (!isConnected || !walletProvider) return;
    
    setCheckingRoles(true);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, ethersProvider);
      
      const roles: AddressRoles = {};
      
      // Check each role
      for (const role of ROLES) {
        const roleBytes = await contract[role.id]();
        roles[role.id] = await contract.hasRole(roleBytes, address);
      }
      
      setAddressRoles(roles);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setSuccess("Failed to fetch roles for address");
      setTimeout(() => setSuccess(""), 3000);
    } finally {
      setCheckingRoles(false);
    }
  };

  const handleCheckRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    await fetchRolesForAddress(address);
  };

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletProvider || !isAdmin || !address) return;
    
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
        case "ADMIN_ROLE":
          const adminRole = await contract.ADMIN_ROLE();
          tx = await contract.grantRole(adminRole, address);
          break;
        default:
          throw new Error("Invalid role selected");
      }
      
      await tx.wait();
      setSuccess(`Successfully granted ${ROLES.find(r => r.id === selectedRole)?.label} role`);
      setTimeout(() => setSuccess(""), 3000);
      
      // Refresh the roles for the address
      await fetchRolesForAddress(address);
    } catch (error) {
      console.error("Failed to grant role:", error);
      setSuccess("Failed to grant role");
      setTimeout(() => setSuccess(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeRole = async (roleId: string) => {
    if (!isConnected || !walletProvider || !isAdmin || !address) return;
    
    setLoading(true);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, signer);
      
      // Get the role bytes for the role ID
      const roleBytes = await contract[roleId]();
      
      // Use the generic revokeRole function
      const tx = await contract.revokeRole(roleBytes, address);
      
      await tx.wait();
      setSuccess(`Successfully revoked ${ROLES.find(r => r.id === roleId)?.label} role`);
      setTimeout(() => setSuccess(""), 3000);
      
      // Refresh the roles for the address
      await fetchRolesForAddress(address);
    } catch (error) {
      console.error("Failed to revoke role:", error);
      setSuccess("Failed to revoke role");
      setTimeout(() => setSuccess(""), 3000);
    } finally {
      setLoading(false);
    }
  };
  const handleRequestAction = async (request: RoleRequest, action: 'approve' | 'reject') => {
    if (!isConnected || !walletProvider || !isAdmin) return;
    
    setLoading(true);
    try {
      if (action === 'approve') {
        const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, signer);
        
        let tx;
        switch (request.requestedRole) {
          case "FARMER_ROLE":
            tx = await contract.grantFarmerRole(request.requesterAddress);
            break;
          case "DISTRIBUTOR_ROLE":
            tx = await contract.grantDistributorRole(request.requesterAddress);
            break;
          case "RETAILER_ROLE":
            tx = await contract.grantRetailerRole(request.requesterAddress);
            break;
          case "QUALITY_CHECKER_ROLE":
            tx = await contract.grantQualityCheckerRole(request.requesterAddress);
            break;
          default:
            throw new Error("Invalid role selected");
        }
        await tx.wait();
      }

      // Update request status in localStorage
      const storedRequests = JSON.parse(localStorage.getItem('foodChainRoleRequests') || '[]');
      const updatedRequests = storedRequests.map((r: RoleRequest) => 
        r.id === request.id 
          ? { 
              ...r, 
              status: action === 'approve' ? 'approved' : 'rejected',
              approved: action === 'approve',
              adminActionTaken: true
            } 
          : r
      );
      
      localStorage.setItem('foodChainRoleRequests', JSON.stringify(updatedRequests));
      
      // Trigger refresh of requests
      refreshRequests();
      
      setSuccess(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error(`Failed to ${action} role request:`, error);
      setSuccess(`Failed to ${action} request`);
      setTimeout(() => setSuccess(""), 3000);
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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-black">Role Management</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Address Roles Section */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-black">Manage Address Roles</h3>
          <form onSubmit={handleCheckRoles} className="mb-4">
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
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              disabled={!isConnected || checkingRoles}
            >
              {checkingRoles ? "Checking..." : "Check Roles"}
            </button>
          </form>

          {Object.keys(addressRoles).length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-black mb-2">Current Roles for {address}</h4>
              <div className="space-y-2">
                {ROLES.map((role) => (
                  <div key={role.id} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-black">{role.label}</span>
                    <div className="flex items-center">
                      <span className={`mr-3 ${addressRoles[role.id] ? 'text-green-500' : 'text-red-500'}`}>
                        {addressRoles[role.id] ? 'Yes' : 'No'}
                      </span>
                      {addressRoles[role.id] ? (
                        <button
                          onClick={() => handleRevokeRole(role.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRole(role.id);
                            handleGrantRole({ preventDefault: () => {} } as React.FormEvent);
                          }}
                          className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          Grant
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium text-black mb-2">Grant Specific Role</h4>
            <form onSubmit={handleGrantRole} className="mb-4">
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
                disabled={!isConnected || loading || !address}
              >
                {loading ? "Processing..." : "Grant Selected Role"}
              </button>
            </form>
          </div>
        </div>
        
        {/* Role Requests Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-black">Role Requests</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 text-sm rounded ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All
              </button>
            </div>
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500">No {filter === 'pending' ? 'pending' : ''} requests found</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredRequests.map((request) => (
                <div key={request.id} className={`p-4 border rounded-lg ${request.status === 'approved' ? 'border-green-200 bg-green-50' : request.status === 'rejected' ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{request.requesterAddress}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        Requested: <span className="font-medium">{request.roleLabel}</span>
                      </p>
                      <p className="text-sm text-gray-700 mb-3">{request.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.timestamp).toLocaleString()}
                        {request.status !== 'pending' && (
                          <span className={`ml-2 px-2 py-1 rounded ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {request.status}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRequestAction(request, 'approve')}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequestAction(request, 'reject')}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded text-center">
          {success}
        </div>
      )}
    </div>
  );
}
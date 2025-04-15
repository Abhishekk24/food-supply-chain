// components/RoleManagement.tsx
"use client";
import { useEffect, useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";
import { useRoleRequests } from "@/hooks/useRoleRequests";

const ROLE_MAP = {
  "ADMIN_ROLE": "Admin",
  "FARMER_ROLE": "Farmer",
  "DISTRIBUTOR_ROLE": "Distributor",
  "RETAILER_ROLE": "Retailer",
  "QUALITY_CHECKER_ROLE": "Quality Checker"
};

export default function RoleManagement() {
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { 
    pendingRequests,
    processedRequests,
    refreshRequests,
    loading 
  } = useRoleRequests();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "processed" | "assign">("pending");
  const [assignAddress, setAssignAddress] = useState("");
  const [assignRole, setAssignRole] = useState("FARMER_ROLE");
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  const checkAdminStatus = async () => {
    if (!isConnected || !walletProvider || !address) return;

    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const contract = new Contract(
        FOOD_SUPPLY_CHAIN_ADDRESS,
        FOOD_SUPPLY_CHAIN_ABI,
        ethersProvider
      );

      const adminRole = await contract.ADMIN_ROLE();
      const hasAdminRole = await contract.hasRole(adminRole, address);
      setIsAdmin(hasAdminRole);

      if (hasAdminRole) {
        refreshRequests();
      }
    } catch (err) {
      console.error("Error checking admin status:", err);
    }
  };

  const processRequest = async (requestId: string, approve: boolean) => {
    if (!isConnected || !walletProvider || !isAdmin) return;

    setIsProcessing(true);
    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(
        FOOD_SUPPLY_CHAIN_ADDRESS,
        FOOD_SUPPLY_CHAIN_ABI,
        signer
      );

      const tx = await contract.processRoleRequest(
        parseInt(requestId),
        approve
      );
      await tx.wait();
      refreshRequests();
    } catch (err) {
      console.error("Error processing request:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const assignRoleToAddress = async () => {
    if (!isConnected || !walletProvider || !isAdmin) return;

    setIsProcessing(true);
    setAssignError("");
    setAssignSuccess("");

    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(
        FOOD_SUPPLY_CHAIN_ADDRESS,
        FOOD_SUPPLY_CHAIN_ABI,
        signer
      );

      let tx;
      if (assignRole === "ADMIN_ROLE") {
        tx = await contract.grantRole(await contract.ADMIN_ROLE(), assignAddress);
      } else if (assignRole === "FARMER_ROLE") {
        tx = await contract.grantRole(await contract.FARMER_ROLE(), assignAddress);
      } else if (assignRole === "DISTRIBUTOR_ROLE") {
        tx = await contract.grantRole(await contract.DISTRIBUTOR_ROLE(), assignAddress);
      } else if (assignRole === "RETAILER_ROLE") {
        tx = await contract.grantRole(await contract.RETAILER_ROLE(), assignAddress);
      } else if (assignRole === "QUALITY_CHECKER_ROLE") {
        tx = await contract.grantRole(await contract.QUALITY_CHECKER_ROLE(), assignAddress);
      }

      await tx.wait();
      setAssignSuccess(`Successfully assigned ${ROLE_MAP[assignRole as keyof typeof ROLE_MAP]} role to ${assignAddress}`);
      setAssignAddress("");
    } catch (err: any) {
      setAssignError(err.message || "Failed to assign role");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [isConnected, walletProvider, address]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow text-center">
        <h2 className="text-xl font-semibold mb-4">Role Management</h2>
        <p className="text-red-500">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Role Management</h2>

      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === "pending" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending ({pendingRequests.length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "processed" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("processed")}
        >
          Processed ({processedRequests.length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "assign" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("assign")}
        >
          Assign Roles
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : activeTab === "pending" ? (
        pendingRequests.length === 0 ? (
          <div className="text-center py-8">No pending requests</div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {request.requester} - {ROLE_MAP[request.requestedRole as keyof typeof ROLE_MAP] || request.requestedRole}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(request.timestamp * 1000).toLocaleString()}
                    </p>
                    <p className="mt-2">{request.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => processRequest(request.id, true)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                      disabled={isProcessing}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => processRequest(request.id, false)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                      disabled={isProcessing}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === "processed" ? (
        <div className="space-y-4">
          {processedRequests.map((request) => (
            <div 
              key={request.id} 
              className={`p-4 border rounded-lg ${request.approved ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <div>
                <h3 className="font-medium">
                  {request.requester} - {ROLE_MAP[request.requestedRole as keyof typeof ROLE_MAP] || request.requestedRole}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(request.timestamp * 1000).toLocaleString()} • 
                  <span className={`ml-2 ${request.approved ? "text-green-600" : "text-red-600"}`}>
                    {request.approved ? "Approved" : "Rejected"}
                  </span>
                </p>
                <p className="mt-2">{request.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-4">Assign Role Directly</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Wallet Address</label>
                <input
                  type="text"
                  value={assignAddress}
                  onChange={(e) => setAssignAddress(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Role</label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {Object.entries(ROLE_MAP).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={assignRoleToAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={isProcessing || !assignAddress}
              >
                {isProcessing ? "Assigning..." : "Assign Role"}
              </button>
              {assignError && <p className="text-red-500">{assignError}</p>}
              {assignSuccess && <p className="text-green-600">{assignSuccess}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
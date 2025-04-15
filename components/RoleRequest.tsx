// components/RoleRequest.tsx
"use client";
import { useState, useEffect } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";
import { useRoleRequests } from "@/hooks/useRoleRequests";

const ROLE_OPTIONS = [
  { value: "ADMIN_ROLE", label: "Admin" },
  { value: "FARMER_ROLE", label: "Farmer" },
  { value: "DISTRIBUTOR_ROLE", label: "Distributor" },
  { value: "RETAILER_ROLE", label: "Retailer" },
  { value: "QUALITY_CHECKER_ROLE", label: "Quality Checker" }
];

export default function RoleRequest() {
  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0].value);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentRoles, setCurrentRoles] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { refreshRequests } = useRoleRequests();

  const checkCurrentRoles = async () => {
    if (!isConnected || !walletProvider || !address) return;

    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const contract = new Contract(
        FOOD_SUPPLY_CHAIN_ADDRESS,
        FOOD_SUPPLY_CHAIN_ABI,
        ethersProvider
      );

      const roles = [];
      for (const role of ROLE_OPTIONS) {
        const hasRole = await contract.hasRole(
          await contract[role.value](),
          address
        );
        if (hasRole) roles.push(role.label);
      }

      // Check admin status
      const adminRole = await contract.ADMIN_ROLE();
      const hasAdminRole = await contract.hasRole(adminRole, address);
      setIsAdmin(hasAdminRole);

      setCurrentRoles(roles);
    } catch (err) {
      console.error("Error checking roles:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletProvider || !address) return;

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(
        FOOD_SUPPLY_CHAIN_ADDRESS,
        FOOD_SUPPLY_CHAIN_ABI,
        signer
      );

      const roleBytes = await contract[selectedRole]();
      const tx = await contract.requestRole(roleBytes, description);
      await tx.wait();

      setSuccess(true);
      setDescription("");
      refreshRequests();
      checkCurrentRoles();
    } catch (err: any) {
      setError(err.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    checkCurrentRoles();
  }, [isConnected, walletProvider, address]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Request Role</h2>
      
      {currentRoles.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h3 className="font-medium mb-1">Your Current Roles:</h3>
          <ul className="list-disc pl-5">
            {currentRoles.map((role, i) => (
              <li key={i}>{role}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Explain why you need this role..."
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting || !isConnected}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>

        {!isConnected && (
          <p className="mt-2 text-red-500">Please connect your wallet first</p>
        )}
        {error && <p className="mt-2 text-red-500">{error}</p>}
        {success && (
          <p className="mt-2 text-green-600">
            Request submitted successfully!
          </p>
        )}
      </form>
    </div>
  );
}
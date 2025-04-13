"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI } from "@/constants";
import { useState, useEffect } from "react";
import ConnectButton from "@/components/ConnectButton";

export default function Navbar() {
  const pathname = usePathname();
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRoles, setUserRoles] = useState<Record<string, boolean>>({
    FARMER_ROLE: false,
    DISTRIBUTOR_ROLE: false,
    RETAILER_ROLE: false,
    QUALITY_CHECKER_ROLE: false,
  });

  // Check user roles
  useEffect(() => {
    const checkRoles = async () => {
      if (!isConnected || !walletProvider || !address) {
        setIsAdmin(false);
        setUserRoles({
          FARMER_ROLE: false,
          DISTRIBUTOR_ROLE: false,
          RETAILER_ROLE: false,
          QUALITY_CHECKER_ROLE: false,
        });
        return;
      }

      try {
        const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
        const contract = new Contract(FOOD_SUPPLY_CHAIN_ADDRESS, FOOD_SUPPLY_CHAIN_ABI, ethersProvider);
        
        // Check admin status
        const adminRole = await contract.ADMIN_ROLE();
        const hasAdminRole = await contract.hasRole(adminRole, address);
        setIsAdmin(hasAdminRole);

        // Check other roles
        const roles = {
          FARMER_ROLE: await contract.hasRole(await contract.FARMER_ROLE(), address),
          DISTRIBUTOR_ROLE: await contract.hasRole(await contract.DISTRIBUTOR_ROLE(), address),
          RETAILER_ROLE: await contract.hasRole(await contract.RETAILER_ROLE(), address),
          QUALITY_CHECKER_ROLE: await contract.hasRole(await contract.QUALITY_CHECKER_ROLE(), address),
        };
        
        setUserRoles(roles);
      } catch (error) {
        console.error("Error checking roles:", error);
        setIsAdmin(false);
        setUserRoles({
          FARMER_ROLE: false,
          DISTRIBUTOR_ROLE: false,
          RETAILER_ROLE: false,
          QUALITY_CHECKER_ROLE: false,
        });
      }
    };

    checkRoles();
  }, [isConnected, walletProvider, address]);

  const links = [
    { href: "/register", label: "Register Product", roles: ["FARMER_ROLE", "ADMIN"] },
    { href: "/track", label: "Track Product", roles: ["FARMER_ROLE", "DISTRIBUTOR_ROLE", "RETAILER_ROLE", "QUALITY_CHECKER_ROLE", "ADMIN"] },
    { href: "/batch", label: "Batch Management", roles: ["FARMER_ROLE", "ADMIN"] },
    { href: "/footprint", label: "Carbon Footprint", roles: ["DISTRIBUTOR_ROLE", "RETAILER_ROLE", "ADMIN"] },
    { href: "/quality", label: "Quality Check", roles: ["QUALITY_CHECKER_ROLE", "ADMIN"] },
    //{ href: "/location", label: "Update Location", roles: ["DISTRIBUTOR_ROLE", "ADMIN"] },
    { href: "/transfer", label: "Transfer Ownership", roles: ["ADMIN"] },
    { href: "/roles", label: "Role Management", roles: ["ADMIN"] },
    { href: "/rolerequest", label: "Request Role", roles: ["FARMER_ROLE", "DISTRIBUTOR_ROLE", "RETAILER_ROLE", "QUALITY_CHECKER_ROLE", "ADMIN"] },

  ];

  const canAccessLink = (linkRoles: string[]) => {
    if (isAdmin) return true;
    return linkRoles.some(role => 
      role === "ADMIN" ? false : userRoles[role as keyof typeof userRoles]
    );
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Food Supply Chain
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            {links.map((link) => {
              if (!canAccessLink(link.roles)) return null;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-2 py-2 text-sm font-medium rounded ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute left-0 bottom-0 w-full h-0.5 bg-blue-600"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
            <ConnectButton />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="mobile-menu-button p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <ConnectButton />
          </div>
        </div>
      </div>
      
      {/* Mobile menu (hidden by default) */}
      <div className="md:hidden mobile-menu hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {links.map((link) => {
            if (!canAccessLink(link.roles)) return null;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? "text-white bg-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-blue-500"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
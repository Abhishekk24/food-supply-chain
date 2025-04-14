"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import type { Eip1193Provider } from "ethers";
import { useState, useEffect } from "react";
import {
  FOOD_SUPPLY_CHAIN_ABI,
  FOOD_SUPPLY_CHAIN_ADDRESS,
} from "@/constants";
import ConnectButton from "@/components/ConnectButton";
import { Utensils } from "lucide-react";


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
        const provider = new BrowserProvider(walletProvider as Eip1193Provider);
        const contract = new Contract(
          FOOD_SUPPLY_CHAIN_ADDRESS,
          FOOD_SUPPLY_CHAIN_ABI,
          provider
        );

        const adminRole = await contract.ADMIN_ROLE();
        const hasAdmin = await contract.hasRole(adminRole, address);
        setIsAdmin(hasAdmin);

        const roles = {
          FARMER_ROLE: await contract.hasRole(await contract.FARMER_ROLE(), address),
          DISTRIBUTOR_ROLE: await contract.hasRole(await contract.DISTRIBUTOR_ROLE(), address),
          RETAILER_ROLE: await contract.hasRole(await contract.RETAILER_ROLE(), address),
          QUALITY_CHECKER_ROLE: await contract.hasRole(await contract.QUALITY_CHECKER_ROLE(), address),
        };

        setUserRoles(roles);
      } catch (err) {
        console.error("Error checking roles:", err);
      }
    };

    checkRoles();
  }, [isConnected, walletProvider, address]);

  const links = [
    { href: "/register", label: "Register Product", roles: ["FARMER_ROLE", "ADMIN"] },
    { href: "/track", label: "Track Product", roles: ["FARMER_ROLE", "DISTRIBUTOR_ROLE", "RETAILER_ROLE", "QUALITY_CHECKER_ROLE", "ADMIN"] },
    //{ href: "/batch", label: "Batch Management", roles: ["FARMER_ROLE", "ADMIN"] },
    { href: "/footprint", label: "Carbon Footprint", roles: ["DISTRIBUTOR_ROLE", "RETAILER_ROLE", "ADMIN"] },
    { href: "/quality", label: "Quality Check", roles: ["QUALITY_CHECKER_ROLE", "ADMIN"] },
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
    <nav className="fixed top-3 z-[10] w-[calc(100vw_-_6%)] right-[50%] translate-x-[50%] flex flex-row items-center justify-between rounded-lg py-2 px-4 backdrop-blur-xl transition-all bg-zinc-900 border border-zinc-800 shadow-lg">
  <div className="text-white flex flex-col">
    <div className="flex items-center space-x-2 hidden md:flex">
      <Utensils className="w-4 h-4 text-white" />
      <span className="text-xs font-light tracking-widest uppercase">
        Supply Chain Management
      </span>
    </div>
    <Link
      href="/"
      className="text-lg md:text-2xl font-bold capitalize text-white hover:underline"
    >
      FoodChain
    </Link>
  </div>


      <div className="flex items-center space-x-3 md:space-x-4">
        {links.map(
          (link) =>
            canAccessLink(link.roles) && (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm md:text-base text-white px-3 py-1 rounded-md hover:bg-white/10 transition ${
                  pathname === link.href ? "bg-white/20 font-semibold" : ""
                }`}
              >
                {link.label}
              </Link>
            )
        )}

        <ConnectButton />

        
      </div>
    </nav>
  );
}

import "./globals.css";
import { AppKitProvider } from "../context/appkit";
import Navbar from "@/components/Navbar";
import { AnimatePresence } from "framer-motion";

export const metadata = {
  title: "Food Supply Chain",
  description: "Track your food products on blockchain",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <AppKitProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto p-4 mt-18">
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </main>
        </AppKitProvider>
      </body>
    </html>
  );
}
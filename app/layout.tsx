import "./globals.css";
import { AppKitProvider } from "../context/appkit";

export const metadata = {
  title: "Food Supply Chain",
  description: "Track your food products on blockchain",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppKitProvider>{children}</AppKitProvider>
      </body>
    </html>
  );
}
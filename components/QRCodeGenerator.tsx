// components/QRCodeGenerator.tsx
"use client";

import { useState, useEffect } from "react";

// Simple QR code display component without external dependencies
export default function QRCodeGenerator({ text }: { text: string }) {
  const [url, setUrl] = useState("");
  
  useEffect(() => {
    // Using Google Charts API to generate QR code
    const encodedText = encodeURIComponent(text);
    setUrl(`https://chart.googleapis.com/chart?cht=qr&chl=${encodedText}&chs=200x200&choe=UTF-8&chld=L|2`);
  }, [text]);
  
  if (!text) return null;
  
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-2">Quick Track</h3>
      <div className="border rounded p-2 bg-white">
        <img src={url} alt="QR Code" className="w-32 h-32" />
      </div>
      <p className="text-sm text-gray-500 mt-2">Scan to track this product</p>
    </div>
  );
}
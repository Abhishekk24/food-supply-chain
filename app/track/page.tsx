"use client";

import { useState } from "react";
import PageTransition from "@/components/PageTransition";
import ProductTracker from "@/components/ProductTracker";

export default function TrackPage() {
  const [searchPerformed, setSearchPerformed] = useState(false);
  

  return (
    <PageTransition>
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6 border-b border-gray-200 pb-4">
          <div className="bg-cyan-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Track Product</h2>
        </div>
        
        <div className={`transition-all duration-300 ${searchPerformed ? 'mb-6' : 'mb-12'}`}>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className={`transition-all duration-300 ${searchPerformed ? 'max-w-full' : 'max-w-xl mx-auto'}`}>
              <ProductTracker />
            </div>
          </div>
        </div>

        {!searchPerformed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="bg-blue-50 p-3 rounded-full inline-flex mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800">Verified Origin</h3>
              <p className="text-sm text-gray-600 mt-1">Confirm product authenticity and provenance</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="bg-green-50 p-3 rounded-full inline-flex mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800">Complete Journey</h3>
              <p className="text-sm text-gray-600 mt-1">View the entire supply chain history</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="bg-purple-50 p-3 rounded-full inline-flex mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800">Carbon Impact</h3>
              <p className="text-sm text-gray-600 mt-1">Understand the environmental footprint</p>
            </div>
          </div>
        )}
        
        <div className="text-center text-gray-500 text-sm">
          <p className="mb-1">Enter a product ID, batch number, or scan QR code to track</p>
          <p className="text-xs">All data verified through secure blockchain technology</p>
        </div>
      </div>
    </PageTransition>
  );
}
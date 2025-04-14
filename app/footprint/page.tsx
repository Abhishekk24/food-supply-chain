"use client";

import PageTransition from "@/components/PageTransition";
import CarbonFootprintForm from "@/components/CarbonFootprintForm";

export default function FootprintPage() {
  return (
    <PageTransition>
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6 border-b border-gray-200 pb-4">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Carbon Footprint Calculator</h2>
        </div>
        
        <div className="mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <CarbonFootprintForm />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="bg-blue-50 p-3 rounded-full inline-flex mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800">Accurate Measurement</h3>
            <p className="text-sm text-gray-600 mt-1">Calculate precise carbon emissions for your products</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="bg-green-50 p-3 rounded-full inline-flex mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800">Real-time Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">Get instant carbon footprint calculations</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="bg-purple-50 p-3 rounded-full inline-flex mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800">Impact Breakdown</h3>
            <p className="text-sm text-gray-600 mt-1">Detailed view of emission sources</p>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p className="mb-1">Calculate and track your product's environmental impact</p>
          <p className="text-xs">All calculations verified through industry-standard methodologies</p>
        </div>
      </div>
    </PageTransition>
  );
}
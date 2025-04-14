"use client";

import PageTransition from "@/components/PageTransition";
import QualityCheckForm from "@/components/QualityCheckForm";

export default function QualityPage() {
  return (
    <PageTransition>
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6 border-b border-gray-200 pb-4">
          <div className="bg-cyan-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Quality Check</h2>
        </div>

        <div className="transition-all duration-300 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="max-w-xl mx-auto">
              <QualityCheckForm />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="bg-yellow-50 p-3 rounded-full inline-flex mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 11-0.001 20.001A10 10 0 0112 2z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800">Verified Components</h3>
            <p className="text-sm text-gray-600 mt-1">Ensure all parts meet quality standards</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="bg-green-50 p-3 rounded-full inline-flex mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 4a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800">Tested Performance</h3>
            <p className="text-sm text-gray-600 mt-1">Document functional test results</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="bg-blue-50 p-3 rounded-full inline-flex mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2-2 2 2 4-4M2 12a10 10 0 1020 0 10 10 0 00-20 0z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-800">Compliance Records</h3>
            <p className="text-sm text-gray-600 mt-1">Track compliance with industry standards</p>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p className="mb-1">Fill the form to upload quality check details</p>
          <p className="text-xs">All submissions are securely logged and verified</p>
        </div>
      </div>
    </PageTransition>
  );
}

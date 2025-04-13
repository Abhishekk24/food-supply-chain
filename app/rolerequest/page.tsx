"use client";

import { useState } from "react";
import PageTransition from "@/components/PageTransition";
import RoleRequest from "@/components/RoleRequest";

export default function RoleRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  
  const handleRequestSubmit = () => {
    setSubmitted(true);
    // Reset after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <PageTransition>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 max-w-8xl mx-auto">
        <div className="flex items-center mb-6 border-b border-gray-200 pb-4">
          <div className="bg-purple-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Request Access Role</h2>
        </div>
        
        {!submitted ? (
          <>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-400">
                <h3 className="font-semibold text-purple-700 mb-1">Producer</h3>
                <p className="text-sm text-gray-600">Register and trace products from source</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-400">
                <h3 className="font-semibold text-blue-700 mb-1">Distributor</h3>
                <p className="text-sm text-gray-600">Manage logistics and distribution chain</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-400">
                <h3 className="font-semibold text-green-700 mb-1">Retailer</h3>
                <p className="text-sm text-gray-600">Verify and sell products to consumers</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <RoleRequest/>
            </div>
          </>
        ) : (
          <div className="bg-green-50 p-8 rounded-lg border border-green-100 flex flex-col items-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">Request Submitted Successfully</h3>
            <p className="text-green-700 text-center mb-4">
              Your role request has been submitted for approval. You will be notified once an administrator reviews your request.
            </p>
            <div className="text-sm text-gray-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Typically reviewed within 24-48 hours
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>All role requests are verified by network administrators</p>
          <p className="mt-1">Questions? Contact support@supplychain.com</p>
        </div>
      </div>
    </PageTransition>
  );
}
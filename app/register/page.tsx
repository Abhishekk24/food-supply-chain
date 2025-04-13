"use client";

import PageTransition from "@/components/PageTransition";
import ProductForm from "@/components/ProductForm";

export default function RegisterPage() {
  return (
    <PageTransition>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Register Product</h1>
        
        <div className="space-y-6">
          {/*  */}

          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold mb-4">Product Information</h2>
            <ProductForm />
          </div>

         

          
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} AJMart, All rights reserved
        </p>
      </div>
    </PageTransition>
  );
}
"use client";

import PageTransition from "@/components/PageTransition";
import CarbonFootprintForm from "@/components/CarbonFootprintForm";
import BatchManagement from "@/components/BatchManagement";

export default function FootprintPage() {
  return (
    <PageTransition>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Carbon Footprint</h2>
        <BatchManagement />
      </div>
    </PageTransition>
  );
}
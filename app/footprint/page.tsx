"use client";

import PageTransition from "@/components/PageTransition";
import CarbonFootprintForm from "@/components/CarbonFootprintForm";

export default function FootprintPage() {
  return (
    <PageTransition>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Carbon Footprint</h2>
        <CarbonFootprintForm />
      </div>
    </PageTransition>
  );
}
"use client";

import { diseases } from "@/data/diseases";
import { Card } from "@/components/ui/card";

export default function KnowledgeList() {
  return (
    <div className="w-full max-w-3xl">
      <h1 className="text-3xl font-bold text-green-700 mb-4 text-center">
        Disease Knowledgebase 🌿
      </h1>

      {/* Search bar will be added later */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {diseases.map((item, index) => (
          <Card
            key={index}
            className="p-4 bg-white shadow-md hover:scale-[1.02] transition rounded-xl cursor-pointer"
          >
            {/* Image */}
            <div className="h-32 bg-green-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="object-cover h-full w-full"
              />
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-green-700 mt-3">
              {item.name}
            </h2>

            {/* Summary */}
            <p className="text-green-800 text-sm mt-1">{item.summary}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

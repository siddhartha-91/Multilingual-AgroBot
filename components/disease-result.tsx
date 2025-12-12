"use client";

import { useDiagnosisStore } from "@/store/diagnosis-store";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function DiseaseResult() {
  const router = useRouter();
  const { result } = useDiagnosisStore();

  if (!result) {
    return (
      <p className="text-green-700 font-semibold mt-10">
        No diagnosis available. Upload an image first.
      </p>
    );
  }

  const data = result;

  return (
    <div className="w-full max-w-2xl fade-in">
      <Button
        variant="outline"
        className="mb-4 border-green-600 text-green-600"
        onClick={() => router.push("/")}
      >
        ← Back
      </Button>

      {/* Main Summary */}
      <Card className="p-5 mb-6 shadow-md bg-white">
        <h2 className="text-2xl font-bold text-green-700">{data.disease}</h2>

        <p className="text-green-800 mt-2">
          <strong>Severity:</strong> {data.severity}%
        </p>

        <div className="mt-4">
          {Object.entries(data.confidence).map(([name, value]) => (
            <div key={name} className="flex justify-between text-green-700">
              <span>{name}</span>
              <span>{Math.round(value * 100)}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Description */}
      <Card className="p-4 mb-4 bg-white shadow-md">
        <h3 className="text-lg font-semibold text-green-700">📘 Description</h3>
        <p className="text-green-800 mt-1">{data.description}</p>
      </Card>

      {/* Treatment */}
      <Card className="p-4 mb-4 bg-white shadow-md">
        <h3 className="text-lg font-semibold text-green-700">💊 Treatment</h3>
        <ul className="list-disc ml-5 text-green-800 mt-1">
          {data.treatment.map((t: string, i: number) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </Card>

      {/* Prevention */}
      <Card className="p-4 mb-6 bg-white shadow-md">
        <h3 className="text-lg font-semibold text-green-700">🛡 Prevention</h3>
        <ul className="list-disc ml-5 text-green-800 mt-1">
          {data.prevention.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </Card>

      <Button className="bg-green-600 w-full" onClick={() => router.push("/chat")}>
        Ask KissanAI →
      </Button>
    </div>
  );
}

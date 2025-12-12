"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useDiagnosisStore } from "@/store/diagnosis-store";
import Loader from "./loader";


export default function UploadBox() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImage(url);
  }
const [loading, setLoading] = useState(false);
  async function handleScan() {
  if (!image) return alert("Please upload an image first!");

  setLoading(true);

  const res = await fetch("/api/mock/diagnose", { method: "POST" });
  const data = await res.json();

  useDiagnosisStore.getState().setResult(data);
  router.push("/diagnosis");
}


  return (
    <Card className="p-6 border-green-300 shadow-lg bg-white rounded-xl fade-in">
      <p className="font-semibold text-green-700 text-center mb-3">
        Upload Crop Image
      </p>

      <label className="w-full h-40 flex items-center justify-center
        border-2 border-dashed border-green-500 rounded-md cursor-pointer bg-green-100">
        
        <input type="file" hidden onChange={handleFile} />

        {image ? (
          <img src={image} className="h-32 object-contain" />
        ) : (
          <span className="text-green-600">Drag & Drop or Click</span>
        )}
      </label>

      {loading ? (
  <div className="mt-5">
    <Loader />
  </div>
) : (
  <Button className="mt-5 w-full bg-green-600" onClick={handleScan}>
    Scan Disease
  </Button>
)}

    </Card>
  );
}

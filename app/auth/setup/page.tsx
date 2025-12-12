"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function SetupPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");

  async function saveProfile() {
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(doc(db, "users", user.uid), {
      name,
      age,
      country,
      createdAt: new Date(),
    });

    window.location.href = "/permissions";
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-green-50 px-6 pt-20">
      <h1 className="text-3xl font-bold text-green-700">Welcome Farmer 🌿</h1>
      <p className="text-green-700">Tell us about yourself</p>

      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md mt-6">
        <label className="block mb-2 font-medium text-green-700">Name</label>
        <input className="w-full p-2 border rounded mb-4" onChange={(e) => setName(e.target.value)} />

        <label className="block mb-2 font-medium text-green-700">Age</label>
        <input className="w-full p-2 border rounded mb-4" onChange={(e) => setAge(e.target.value)} />

        <label className="block mb-2 font-medium text-green-700">Country</label>
        <input className="w-full p-2 border rounded mb-4" onChange={(e) => setCountry(e.target.value)} />

        <button
          onClick={saveProfile}
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Continue →
        </button>
      </div>
    </main>
  );
}

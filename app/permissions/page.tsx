"use client";

import { auth, db } from "@/lib/firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";

export default function PermissionsPage() {
  const [done, setDone] = useState(false);

  async function allowPermissions() {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      camera: true,
      location: true,
    });

    window.location.href = "/";
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-6">
      <h1 className="text-3xl font-bold text-green-700">Permissions Needed</h1>

      <p className="text-green-700 mt-2 max-w-sm text-center">
        KissanAI needs Camera for scanning leaves and Location for disease prediction.
      </p>

      <button
        onClick={allowPermissions}
        className="mt-6 w-full max-w-md bg-green-600 text-white p-3 rounded"
      >
        Allow Permissions →
      </button>
    </main>
  );
}

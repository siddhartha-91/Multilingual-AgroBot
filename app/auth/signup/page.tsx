"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState(""); // email OR phone
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function isPhone(input: string) {
    return /^[0-9+\s-]{7,15}$/.test(input);
  }

  function isEmail(input: string) {
    return /\S+@\S+\.\S+/.test(input);
  }

  async function handleSignup(e: any) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Please enter your name.");

    if (!identifier.trim())
      return setError("Enter email or phone number.");

    if (password !== confirm)
      return setError("Passwords do not match.");

    // Determine login method
    let emailToUse = "";
    let realEmail: string | null = null;
    let realPhone: string | null = null;

    if (isEmail(identifier)) {
      emailToUse = identifier;
      realEmail = identifier;
    } else if (isPhone(identifier)) {
      // Convert phone to synthetic email
      const clean = identifier.replace(/\D/g, "");
      emailToUse = `phone_${clean}@kissanai-users.com`;
      realPhone = identifier;
    } else {
      return setError("Invalid email or phone number.");
    }

    try {
      setLoading(true);

      // Create Firebase user
      const result = await createUserWithEmailAndPassword(
        auth,
        emailToUse,
        password
      );

      // Save user details in Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        name,
        email: realEmail,
        phone: realPhone,
        createdAt: Date.now(),
      });

      // Set auth cookie
      const token = await result.user.getIdToken();
      document.cookie = `firebase-token=${token}; path=/; max-age=604800`;

      window.location.href = "/home";
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative font-[Inter]"
      style={{ backgroundImage: "url('/agro-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />

      <div className="relative z-10 w-[95%] max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex border border-green-300">

        {/* LEFT PANEL */}
        <div
          className="w-1/2 p-14 relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/leftpanel-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" />

          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-green-900 text-center">Create Account</h1>
            <p className="text-lg text-gray-700 text-center mt-1 mb-10">
              Join <b>KissanAI</b>
            </p>

            <form onSubmit={handleSignup} className="space-y-5">

              <div>
                <label className="text-green-700 font-semibold">Full Name</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-xl mt-1"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-green-700 font-semibold">Email or Phone</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-xl mt-1"
                  placeholder="Enter email or phone number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>

              <div>
                <label className="text-green-700 font-semibold">Password</label>
                <input
                  type="password"
                  className="w-full p-3 border rounded-xl mt-1"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="text-green-700 font-semibold">Confirm Password</label>
                <input
                  type="password"
                  className="w-full p-3 border rounded-xl mt-1"
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold transition"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <p className="text-center mt-6 text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-green-700 font-semibold hover:underline">
                Log In
              </Link>
            </p>

          </div>
        </div>

        {/* Right panel */}
        <div className="w-1/2 relative hidden md:block">
          <img src="/farmers.jpg" className="absolute inset-0 w-full h-full object-cover" />

          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white px-10">
            <h2 className="text-3xl font-bold text-center">Grow with AI-Powered Farming</h2>
            <p className="text-lg text-center max-w-md mt-4 opacity-90">
              KissanAI helps farmers diagnose plant diseases and improve crop yield.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

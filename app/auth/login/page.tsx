"use client";

import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // email OR phone
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ------------------------------------------------------------
  // detect whether user entered email or phone
  // ------------------------------------------------------------
  function detectIdentifier(input: string) {
    if (input.includes("@")) return "email";
    return "phone";
  }

  // ------------------------------------------------------------
  // convert phone into a firebase email
  // ------------------------------------------------------------
  function phoneToEmail(phone: string) {
    const cleaned = phone.replace(/[^0-9]/g, ""); 
    return `phone_${cleaned}@kissanai-users.com`;
  }

  // ------------------------------------------------------------
  // Main Login Function
  // ------------------------------------------------------------
  async function handleLogin(e: any) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let emailToUse = identifier;

      const type = detectIdentifier(identifier);

      if (type === "phone") {
        emailToUse = phoneToEmail(identifier);
      }

      const result = await signInWithEmailAndPassword(auth, emailToUse, password);

      const token = await result.user.getIdToken();
      document.cookie = `firebase-token=${token}; path=/; max-age=604800`;

      window.location.href = "/home";
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }

  // ------------------------------------------------------------
  // Google Login
  // ------------------------------------------------------------
  async function handleGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      document.cookie = `firebase-token=${token}; path=/; max-age=604800`;
      window.location.href = "/home";
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative font-[Inter]"
      style={{ backgroundImage: "url('/agro-bg.jpg')" }}
    >
      {/* MAIN LOGIN CARD */}
      <div className="relative z-10 w-[95%] max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex border border-green-300">

        {/* LEFT PANEL */}
        <div
          className="w-1/2 p-14 relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/leftpanel-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" />

          <div className="relative z-10">

            <h1 className="text-4xl font-bold text-green-900 text-center">Welcome Back</h1>
            <p className="text-lg text-gray-700 text-center mt-1 mb-10">
              Login to continue to <span className="font-bold">KissanAI</span>
            </p>

            {/* LOGIN FORM */}
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email or Phone */}
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

              {/* Password */}
              <div>
                <label className="text-green-700 font-semibold">Password</label>
                <input
                  type="password"
                  className="w-full p-3 border rounded-xl mt-1"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold transition"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            {/* Google Login */}
            <button
              onClick={handleGoogle}
              className="w-full border border-gray-300 py-3 rounded-xl mt-6 flex items-center justify-center gap-3 hover:bg-gray-100 transition"
            >
              Continue with Google
            </button>

            <p className="text-center mt-6 text-sm">
              Don’t have an account?{" "}
              <Link href="/auth/signup" className="text-green-700 font-semibold hover:underline">
                Sign Up
              </Link>
            </p>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-1/2 relative hidden md:block">
          <img
            src="/farmers.jpg"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white px-10">
            <h2 className="text-3xl font-bold leading-tight text-center">
              Smart AI Assistance for Farmers
            </h2>
            <p className="text-lg text-center max-w-md mt-4 opacity-90">
              Diagnose plant diseases and improve crop outcomes  
              using KissanAI’s intelligent tools.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validatePassword(password: string) {
    const pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/;
    return pattern.test(password);
  }

  async function handleSignup(e: any) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must include letters, numbers and a special symbol."
      );
      return;
    }

    try {
      setLoading(true);

      await createUserWithEmailAndPassword(auth, email, password);

      window.location.href = "/auth/setup";
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
      {/* Readability overlay */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />

      {/* MAIN CARD */}
      <div className="relative z-10 w-[95%] max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex border border-green-300">

        {/* LEFT PANEL — leftpanel-bg.jpg */}
        <div
          className="w-1/2 p-14 relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/leftpanel-bg.jpg')" }}
        >
          {/* Soft overlay */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" />

          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-green-900 text-center">Create Account</h1>
            <p className="text-lg text-gray-700 text-center mt-1 mb-10">
              Join <span className="font-bold">KissanAI</span>
            </p>

            {/* SIGNUP FORM */}
            <form onSubmit={handleSignup} className="space-y-5">

              <div>
                <label className="text-green-700 font-semibold">Email Address</label>
                <input
                  type="email"
                  className="w-full p-3 border rounded-xl mt-1"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-green-700 font-semibold">Password</label>
                <input
                  type="password"
                  className="w-full p-3 border rounded-xl mt-1"
                  placeholder="Create a password"
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
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT PANEL — FARMER IMAGE */}
        <div className="w-1/2 relative hidden md:block">
          <img
            src="/farmers.jpg"
            alt="farmer"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white px-10">
            <h2 className="text-3xl font-bold leading-tight text-center">
              Join the Future of Smart Farming
            </h2>

            <p className="text-lg text-center max-w-md mt-4 opacity-90">
              Create your account and explore AI-powered crop insights,
              disease detection and farming assistance.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import Link from "next/link";

// Country Code List
const countryCodes = [
  { code: "+91", country: "India 🇮🇳" },
  { code: "+1", country: "United States 🇺🇸" },
  { code: "+44", country: "United Kingdom 🇬🇧" },
  { code: "+61", country: "Australia 🇦🇺" },
  { code: "+971", country: "UAE 🇦🇪" },
  { code: "+974", country: "Qatar 🇶🇦" },
  { code: "+966", country: "Saudi Arabia 🇸🇦" },
  { code: "+92", country: "Pakistan 🇵🇰" },
  { code: "+880", country: "Bangladesh 🇧🇩" },
  { code: "+977", country: "Nepal 🇳🇵" },
  { code: "+94", country: "Sri Lanka 🇱🇰" },
  { code: "+81", country: "Japan 🇯🇵" },
  { code: "+82", country: "South Korea 🇰🇷" },
  { code: "+86", country: "China 🇨🇳" },
  { code: "+33", country: "France 🇫🇷" },
  { code: "+49", country: "Germany 🇩🇪" },
  { code: "+39", country: "Italy 🇮🇹" },
];

export default function PhoneSignupPage() {
  const [countryCode, setCountryCode] = useState("+91");
  const [number, setNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Setup reCAPTCHA once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  }, []);

  // Send OTP
  async function sendOtp(e: any) {
    e.preventDefault();
    setError("");

    if (number.length < 5) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      const fullNumber = `${countryCode}${number}`;

      const result = await signInWithPhoneNumber(auth, fullNumber, appVerifier);
      setConfirmationResult(result);
      setStep(2);
    } catch (err) {
      console.log(err);
      setError("Failed to send OTP. Try again later.");
    }
  }

  // Verify OTP
  async function verifyOtp(e: any) {
    e.preventDefault();
    setError("");

    try {
      const result = await confirmationResult.confirm(otp);
      const token = await result.user.getIdToken();

      document.cookie = `firebase-token=${token}; path=/; max-age=604800`;

      window.location.href = "/auth/setup";
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative font-[Inter]"
      style={{ backgroundImage: "url('/agro-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />

      <div className="relative z-10 w-[95%] max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex border border-green-300">

        {/* LEFT PANEL */}
        <div
          className="w-1/2 p-14 relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/leftpanel-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" />

          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-green-900 text-center">
              {step === 1 ? "Phone Signup" : "Verify OTP"}
            </h1>

            <p className="text-lg text-gray-700 text-center mt-1 mb-10">
              {step === 1
                ? "Create your KissanAI account using your phone"
                : "Enter the OTP sent to your number"}
            </p>

            {/* STEP 1 FORM */}
            {step === 1 && (
              <form onSubmit={sendOtp} className="space-y-6">

                {/* COMBINED INPUT BOX */}
                <div>
                  <label className="text-green-700 font-semibold">Phone Number</label>

                  <div className="flex items-center border rounded-xl mt-1 overflow-hidden bg-white">

                    {/* Country Code */}
                    <select
                      className="px-3 py-3 bg-white border-r outline-none"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      {countryCodes.map((c, i) => (
                        <option key={i} value={c.code}>
                          {c.country} ({c.code})
                        </option>
                      ))}
                    </select>

                    {/* Phone Input */}
                    <input
                      type="text"
                      className="w-full p-3 outline-none"
                      placeholder="Enter phone number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                    />
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold transition"
                >
                  Send OTP
                </button>

                <div id="recaptcha-container"></div>
              </form>
            )}

            {/* STEP 2 FORM */}
            {step === 2 && (
              <form onSubmit={verifyOtp} className="space-y-6">

                <div>
                  <label className="text-green-700 font-semibold">OTP</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-xl mt-1"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold transition"
                >
                  Verify OTP
                </button>
              </form>
            )}

            <p className="text-center mt-6 text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-green-700 font-semibold hover:underline">
                Login →
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-1/2 relative hidden md:block">
          <img
            src="/farmers.jpg"
            alt="farmer"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white px-10">
            <h2 className="text-3xl font-bold text-center">Signup using your phone number</h2>

            <p className="text-lg text-center max-w-md mt-4 opacity-90">
              Select your country, enter your number, receive OTP and verify. Simple, fast and secure.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

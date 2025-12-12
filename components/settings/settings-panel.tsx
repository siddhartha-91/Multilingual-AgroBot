"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Switch } from "@/components/ui/switch"; // If switch missing, I will add it
import { Button } from "@/components/ui/button";

export default function SettingsPanel() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("english");

  return (
    <Card className="w-full max-w-xl p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
        Settings ⚙️
      </h2>

      {/* THEME SECTION */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-green-700 mb-2">
          Theme
        </h3>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
          <span className="text-green-800">
            {darkMode ? "Dark Mode" : "Light Mode"}
          </span>
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
        </div>
      </div>

      {/* LANGUAGE SECTION */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-green-700 mb-2">
          Language
        </h3>

        <select
          className="w-full p-3 border border-green-400 rounded-md bg-green-50 text-green-800"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="telugu">Telugu</option>
        </select>
      </div>

      {/* ABOUT SECTION */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-green-700 mb-2">
          About KissanAI
        </h3>

        <p className="text-green-800">
          KissanAI is an AI-powered crop disease detection system that helps farmers 
          diagnose plant issues using image analysis. This is the PWA version of the app.
        </p>
      </div>

      {/* VERSION */}
      <div className="text-green-700 text-center font-medium">
        Version 1.0.0
      </div>
    </Card>
  );
}

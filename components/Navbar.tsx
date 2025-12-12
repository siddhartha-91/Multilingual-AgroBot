"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-green-700 text-white py-4 px-6 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold">KissanAI</h1>

      <div className="flex gap-6">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/about" className="hover:underline">
          About
        </Link>
        <Link href="/contact" className="hover:underline">
          Contact
        </Link>
      </div>
    </nav>
  );
}

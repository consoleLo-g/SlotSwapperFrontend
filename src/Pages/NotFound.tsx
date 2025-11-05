// src/pages/NotFound.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-pink-200 to-yellow-200">
      <div className="bg-white/90 p-8 rounded-xl shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">404 — Not Found</h1>
        <Link to="/" className="px-4 py-2 rounded bg-indigo-600 text-white">Go Home</Link>
      </div>
    </div>
  );
}

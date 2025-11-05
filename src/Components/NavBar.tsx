// src/components/NavBar.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { logout } from "../Store/authSlice";

export default function NavBar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return (
    <nav className="w-full bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 text-white p-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-extrabold text-lg">SlotSwapper</Link>
          <Link to="/marketplace" className="hover:underline">Marketplace</Link>
          <Link to="/notifications" className="hover:underline">Requests</Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-3 py-1 bg-white/20 rounded"
            onClick={() => { dispatch(logout()); navigate("/login"); }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

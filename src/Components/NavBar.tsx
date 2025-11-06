import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchMe, logout } from "../Store/authSlice";

export default function NavBar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  // Fetch user info if not loaded
  useEffect(() => {
    if (!user) dispatch(fetchMe());
  }, [user, dispatch]);

  return (
    <nav className="w-full bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Logo & Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="font-extrabold text-xl hover:opacity-90 transition-opacity">
            SlotSwapper
          </Link>
          <Link to="/marketplace" className="hover:underline hover:opacity-90 transition-opacity">
            Marketplace
          </Link>
          <Link to="/notifications" className="hover:underline hover:opacity-90 transition-opacity">
            Requests
          </Link>
        </div>

        {/* Right side - User info & Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full font-medium shadow-sm">
              <span className="text-white">Hello, {user.name} 👋</span>
            </div>
          )}
          <button
            onClick={() => {
              dispatch(logout());
              navigate("/login");
            }}
            className="px-4 py-1 bg-white/30 hover:bg-white/50 transition-colors text-white rounded-full shadow hover:scale-105 transform duration-200 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

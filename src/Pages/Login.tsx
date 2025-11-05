// src/pages/Login.tsx
import React, { useState } from "react";
import { useAppDispatch } from "../hooks";
import { login } from "../Store/authSlice";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handle() {
    const res = await dispatch(login({ email, password }));
    // @ts-ignore
    if (res.meta.requestStatus === "fulfilled") {
      navigate("/");
    } else {
      alert("Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-pink-200 to-yellow-200">
      <div className="bg-white/90 p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Sign in</h2>
        <input className="w-full p-2 border rounded mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 border rounded mb-4" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={handle} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold">Login</button>
          <Link to="/register" className="flex-1 py-2 rounded-lg border text-center">Register</Link>
        </div>
      </div>
    </div>
  );
}

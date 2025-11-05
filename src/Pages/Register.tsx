// src/pages/Register.tsx
import React, { useState } from "react";
import { useAppDispatch } from "../hooks";
import { register } from "../Store/authSlice";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handle() {
    const res = await dispatch(register({ name, email, password }));
    // @ts-ignore
    if (res.meta.requestStatus === "fulfilled") {
      alert("Registered. Please login.");
      navigate("/login");
    } else {
      alert("Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-pink-200 to-yellow-200">
      <div className="bg-white/90 p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Create account</h2>
        <input className="w-full p-2 border rounded mb-3" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full p-2 border rounded mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 border rounded mb-4" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={handle} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold">Register</button>
        </div>
      </div>
    </div>
  );
}

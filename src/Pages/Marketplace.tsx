// src/pages/Marketplace.tsx
import React, { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchMarketplace } from "../Store/swapSlice";
import SwapModal from "../Components/SwapModal";

export default function Marketplace() {
  const dispatch = useAppDispatch();
  const marketplace = useAppSelector((s) => s.swap.marketplace);
  const loading = useAppSelector((s) => s.swap.loading);
  const [opened, setOpened] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  useEffect(() => { dispatch(fetchMarketplace()); }, [dispatch]);

  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
        {loading ? <div>Loading...</div> : (
          <div className="grid gap-4">
            {marketplace.map((slot: any) => (
              <div key={slot.id} className="p-4 bg-white/90 rounded shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold">{slot.title}</div>
                  <div className="text-sm text-gray-600">{new Date(slot.start).toLocaleString()}</div>
                </div>
                <div>
                  <button className="px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded"
                    onClick={() => { setSelectedSlot(slot); setOpened(true); }}>
                    Request Swap
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SwapModal open={opened} onClose={() => setOpened(false)} marketplaceSlot={selectedSlot} mySwappables={[]} onRequest={() => { alert("Request sent (stub)"); }} />
    </div>
  );
}

// src/Components/SwapModal.tsx
import React, { useState } from "react";

interface SwapModalProps {
  open: boolean;
  onClose: () => void;
  marketplaceSlot: any;
  mySwappables: any[];
  onRequest: (toSlotId: string, fromSlotId: string) => void;
}

export default function SwapModal({ open, onClose, marketplaceSlot, mySwappables, onRequest }: SwapModalProps) {
  const [selectedMySlot, setSelectedMySlot] = useState<any | null>(null);

  if (!open || !marketplaceSlot) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-3">Request Swap</h2>
        <p className="mb-3">Marketplace Slot: {marketplaceSlot.title}</p>

        <select
          className="w-full border p-2 mb-4"
          value={selectedMySlot?.id ?? ""}
          onChange={(e) =>
            setSelectedMySlot(mySwappables.find(s => s.id === e.target.value))
          }
        >
          <option value="">Select your slot</option>
          {mySwappables.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({new Date(s.start).toLocaleString()})
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 border rounded" onClick={onClose}>Cancel</button>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded"
            disabled={!selectedMySlot}
            onClick={() => onRequest(marketplaceSlot.id, selectedMySlot!.id)}
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}

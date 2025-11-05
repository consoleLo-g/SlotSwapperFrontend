// src/components/SwapModal.tsx
import React from "react";

export default function SwapModal({
  open,
  onClose,
  marketplaceSlot,
  mySwappables,
  onRequest,
}: {
  open: boolean;
  onClose: () => void;
  marketplaceSlot?: any;
  mySwappables?: any[];
  onRequest?: (offeredEventId: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-xl p-6 z-10 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-3">Request Swap</h3>
        <div className="mb-3">
          <div className="font-semibold">Requested slot:</div>
          <div>{marketplaceSlot?.title ?? "—"}</div>
        </div>

        <div className="mb-3">
          <div className="font-semibold">Choose one of your swappable slots to offer</div>
          <div className="space-y-2 mt-2">
            {mySwappables?.length ? mySwappables.map((s) => (
              <div key={s.id} className="p-2 border rounded flex justify-between items-center">
                <div>{s.title}</div>
                <button className="px-2 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded" onClick={() => onRequest?.(s.id)}>Offer</button>
              </div>
            )) : <div className="text-gray-500 italic">No swappable slots available</div>}
          </div>
        </div>

        <div className="text-right"><button className="px-3 py-2 border rounded" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

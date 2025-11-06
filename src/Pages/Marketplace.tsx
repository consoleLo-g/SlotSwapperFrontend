import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import EventCard from "../Components/EventCard";
import SwapModal from "../Components/SwapModal";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchMarketplace, createSwapRequest } from "../Store/swapSlice";

export default function Marketplace() {
  const dispatch = useAppDispatch();
  const marketplace = useAppSelector((s) => s.swap.marketplace);
  const loading = useAppSelector((s) => s.swap.loading);
  const myEvents = useAppSelector((s) => s.swap.myEvents);
  
  const [opened, setOpened] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  const currentUserId = "690b22675a37bdaa9ae7bc5d"; // Replace with actual logged-in user

  useEffect(() => {
    dispatch(fetchMarketplace(currentUserId));
  }, [dispatch]);

  const handleRequestSwap = (toSlotId: string, fromSlotId: string) => {
    dispatch(createSwapRequest({
      requesterId: currentUserId,
      eventId: toSlotId,
      requestedSlot: toSlotId,
      offeredSlot: fromSlotId
    })).then(() => {
      setOpened(false);
      alert("Swap request sent!");
    });
  };

  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
        {loading ? <div>Loading...</div> :
          <div className="grid gap-4">
            {marketplace.map((slot) => (
              <EventCard
  key={slot.id}
  ev={slot}
  statusColor="#e0f7fa"
  showTitle={false} // hide task/title
>
  <div className="font-bold">{slot.userName}</div>
  <button
    className="mt-2 px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded"
    onClick={() => { setSelectedSlot(slot); setOpened(true); }}
  >
    Request Swap
  </button>
</EventCard>
            ))}
          </div>
        }
      </div>

      <SwapModal
        open={opened}
        onClose={() => setOpened(false)}
        marketplaceSlot={selectedSlot}
        mySwappables={myEvents.filter(ev => ev.swappable)}
        onRequest={handleRequestSwap}
      />
    </div>
  );
}

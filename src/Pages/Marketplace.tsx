import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import EventCard from "../Components/EventCard";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchMarketplace, createSwapRequest, fetchMyEvents, fetchSwapRequests } from "../Store/swapSlice";
import { fetchUserById } from "../api/userApi";

export default function Marketplace() {
  const dispatch = useAppDispatch();
  const marketplace = useAppSelector((s) => s.swap.marketplace);
  const loading = useAppSelector((s) => s.swap.loading);
  const myEvents = useAppSelector((s) => s.swap.myEvents);
  const currentUserId = useAppSelector((s) => s.auth.user?.id);

  const [loadingSwap, setLoadingSwap] = useState(false);
  const [eventsWithNames, setEventsWithNames] = useState<any[]>([]);
  const [userCache, setUserCache] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!currentUserId) return;

    const loadMarketplace = async () => {
      // Fetch my events first
      await dispatch(fetchMyEvents(currentUserId));
      const allEvents: any[] = await dispatch(fetchMarketplace(currentUserId)).unwrap();

      // Map usernames using cache
      const namesCache = { ...userCache };
      const eventsMapped = await Promise.all(
        allEvents.map(async (ev) => {
          if (!namesCache[ev.userId]) {
            try {
              const userRes = await fetchUserById(ev.userId);
              namesCache[ev.userId] = userRes.data?.name || "Unknown User";
            } catch {
              namesCache[ev.userId] = "Unknown User";
            }
          }
          return { ...ev, userName: namesCache[ev.userId] };
        })
      );

      setUserCache(namesCache);
      setEventsWithNames(eventsMapped);
      await dispatch(fetchSwapRequests(currentUserId)); // refresh requests
    };

    loadMarketplace();
  }, [dispatch, currentUserId]);

  const handleRequestSwap = (toSlotId: string) => {
    if (!currentUserId) return;

    const mySlot = myEvents.find(ev => ev.swappable);
    if (!mySlot) {
      alert("You have no swappable slots!");
      return;
    }

    setLoadingSwap(true);
    dispatch(createSwapRequest({
      requesterId: currentUserId,
      eventId: toSlotId,
      requestedSlot: toSlotId,
      offeredSlot: mySlot.id
    }))
      .then(() => {
        alert("Swap request sent to the owner!");
        // Refresh marketplace & my events after sending request
        dispatch(fetchMyEvents(currentUserId));
        dispatch(fetchMarketplace(currentUserId));
        dispatch(fetchSwapRequests(currentUserId));
      })
      .finally(() => setLoadingSwap(false));
  };

  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
        {loading || !currentUserId ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-4">
            {eventsWithNames.map(slot => (
              <EventCard key={slot.id} ev={slot} statusColor="#e0f7fa" showTitle={false}>
                <div className="font-bold">{slot.userName}</div>
                <div className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</div>
                <button
                  disabled={loadingSwap}
                  className="mt-2 px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded disabled:opacity-50"
                  onClick={() => handleRequestSwap(slot.id)}
                >
                  Request Swap
                </button>
              </EventCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

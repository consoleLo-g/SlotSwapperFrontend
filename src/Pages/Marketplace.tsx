import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import EventCard from "../Components/EventCard";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchMarketplace,
  createSwapRequest,
  fetchMyEvents,
  fetchSwapRequests,
} from "../Store/swapSlice";
import { fetchUserById } from "../api/userApi";

export default function Marketplace() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.swap.loading);
  const myEvents = useAppSelector((s) => s.swap.myEvents);
  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const outgoing = useAppSelector((s) => s.swap.outgoing);

  const [eventsWithNames, setEventsWithNames] = useState<any[]>([]);
  const [userCache, setUserCache] = useState<Record<string, string>>({});
  const [loadingSwap, setLoadingSwap] = useState(false);

  // Format date/time
  const formatTime = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return "N/A";
    const d = new Date(`${dateStr}T${timeStr}`);
    return isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Load marketplace events
  const loadMarketplace = async () => {
    if (!currentUserId) return;

    // 1. Fetch my events
    await dispatch(fetchMyEvents(currentUserId));

    // 2. Fetch swap requests
    await dispatch(fetchSwapRequests(currentUserId));

    // 3. Fetch all marketplace events
    const allEvents: any[] = await dispatch(fetchMarketplace(currentUserId)).unwrap();

    // 4. Filter:
    // - swappable slots only
    // - not owned by current user
    // - not already requested
    const filteredEvents = allEvents.filter(
      (ev) =>
        ev.swappable &&
        ev.userId !== currentUserId &&
        !outgoing.some((req: { requestedSlot: string }) => req.requestedSlot === ev.id)
    );

    // 5. Map usernames
    const namesCache = { ...userCache };
    const eventsMapped = await Promise.all(
      filteredEvents.map(async (ev) => {
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
  };

  useEffect(() => {
    loadMarketplace();
  }, [dispatch, currentUserId]);

  // Handle swap request
  const handleRequestSwap = async (requestedSlotId: string) => {
    if (!currentUserId) return;

    // Find swappable slot owned by current user
    const mySwappableSlot = myEvents.find(
      (ev) => ev.swappable && ev.userId === currentUserId
    );
    if (!mySwappableSlot) {
      alert("You have no swappable slots to offer!");
      return;
    }

    const payload = {
      requesterId: currentUserId,
      requestedSlot: requestedSlotId,
      offeredSlot: mySwappableSlot.id,
      eventId: requestedSlotId,
    };

    setLoadingSwap(true);
    try {
      await dispatch(createSwapRequest(payload)).unwrap();
      alert("Swap request sent!");
      await loadMarketplace();
    } catch (err: any) {
      console.error("Swap request failed:", err);
      alert(
        err.response?.data?.message ||
          "Swap request failed. Make sure you have a swappable slot and valid token."
      );
    } finally {
      setLoadingSwap(false);
    }
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
            {eventsWithNames.length === 0 && (
              <div className="text-gray-500">No available swaps</div>
            )}
            {eventsWithNames.map((slot) => (
              <EventCard key={slot.id} ev={slot} statusColor="#e0f7fa" showTitle={false}>
                <div className="font-bold">{slot.userName}</div>
                <div className="text-sm text-gray-600">
                  {formatTime(slot.date, slot.startTime)} -{" "}
                  {formatTime(slot.date, slot.endTime)}
                </div>
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

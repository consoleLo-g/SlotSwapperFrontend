import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import { useAppDispatch, useAppSelector } from "../hooks";
import { getAllEventsApi } from "../api/swapApi";
import {
  fetchSwapRequests,
  respondSwapRequest,
  fetchMarketplace,
  fetchMyEvents,
} from "../Store/swapSlice";
import { fetchUserById } from "../api/userApi";

export default function Notifications() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [incomingWithNames, setIncomingWithNames] = useState<any[]>([]);
  const [outgoingWithNames, setOutgoingWithNames] = useState<any[]>([]);
  const [userCache, setUserCache] = useState<Record<string, string>>({});

  // ----------------- Enrich requests with user names -----------------
  const enrichRequestsWithNames = async (requests: any[]) => {
    if (!requests.length) return [];

    const namesCache = { ...userCache };

    // 1️⃣ Fetch all events once
    const events = await getAllEventsApi();
    const eventsMap = Object.fromEntries(events.map((e: any) => [e.id, e]));

    // 2️⃣ Enrich each request
    const enriched = await Promise.all(
      requests.map(async (r) => {
        // a) requester name
        if (!namesCache[r.requesterId]) {
          try {
            const res = await fetchUserById(r.requesterId);
            namesCache[r.requesterId] = res.data?.name || "Unknown User";
          } catch {
            namesCache[r.requesterId] = "Unknown User";
          }
        }

        // b) owner of requested slot
        const requestedEvent = eventsMap[r.requestedSlot];
        if (requestedEvent) {
          const ownerId = requestedEvent.userId;
          if (!namesCache[ownerId]) {
            try {
              const res = await fetchUserById(ownerId);
              namesCache[ownerId] = res.data?.name || "Unknown User";
            } catch {
              namesCache[ownerId] = "Unknown User";
            }
          }
          namesCache[r.requestedSlot] = namesCache[ownerId];
        } else {
          namesCache[r.requestedSlot] = "Unknown User";
        }

        return {
          ...r,
          fromUserName: namesCache[r.requesterId],
          toUserName: namesCache[r.requestedSlot],
        };
      })
    );

    setUserCache(namesCache);
    return enriched;
  };

  // ----------------- Load requests -----------------
  const loadRequests = async () => {
    if (!currentUser?.id) return;

    try {
      const { incoming, outgoing } = await dispatch(fetchSwapRequests(currentUser.id)).unwrap();
      setIncomingWithNames(await enrichRequestsWithNames(incoming));
      setOutgoingWithNames(await enrichRequestsWithNames(outgoing));
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [dispatch, currentUser]);

  // ----------------- Respond to swap -----------------
  const handleRespond = async (id: string, accept: boolean) => {
    if (!currentUser?.id) return;

    try {
      await dispatch(respondSwapRequest({ id, accept })).unwrap();
      // Refresh notifications & marketplace
      await loadRequests();
      await dispatch(fetchMyEvents(currentUser.id));
      await dispatch(fetchMarketplace(currentUser.id));
    } catch (err) {
      console.error("Failed to respond:", err);
    }
  };

  // ----------------- Render -----------------
  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-2 gap-6">
        {/* Incoming Requests */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Incoming Requests</h2>
          <div className="space-y-3">
            {incomingWithNames.length === 0 ? (
              <div className="text-gray-500">No incoming requests</div>
            ) : (
              incomingWithNames.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-white/90 rounded shadow flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold">{r.fromUserName} offers swap</div>
                    <div className="text-sm text-gray-600">
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 bg-green-600 text-white rounded"
                      onClick={() => handleRespond(r.id, true)}
                    >
                      Accept
                    </button>
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() => handleRespond(r.id, false)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Outgoing Requests */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Outgoing Requests</h2>
          <div className="space-y-3">
            {outgoingWithNames.length === 0 ? (
              <div className="text-gray-500">No outgoing requests</div>
            ) : (
              outgoingWithNames.map((r) => (
                <div key={r.id} className="p-3 bg-white/90 rounded shadow">
                  <div className="font-bold">To: {r.toUserName}</div>
                  <div className="text-sm text-gray-600">{r.status}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

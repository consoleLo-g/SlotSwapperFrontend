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
import type { SwapRequest } from "../Types/Swap";

export default function Notifications() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);

  const [incomingWithNames, setIncomingWithNames] = useState<any[]>([]);
  const [outgoingWithNames, setOutgoingWithNames] = useState<any[]>([]);
  const [userCache, setUserCache] = useState<Record<string, string>>({});

  // ----------------- Enrich swap requests with user names -----------------
  const enrichRequestsWithNames = async (requests: SwapRequest[]) => {
    if (!requests.length) return [];

    const namesCache = { ...userCache };
    const events = await getAllEventsApi();
    const eventsMap = Object.fromEntries(events.map((e: any) => [e.id, e]));

    const enriched = await Promise.all(
      requests.map(async (r) => {
        // Use backend id directly
        const backendId = r.id;
        const reactKey = backendId || Math.random().toString();

        const createdAt = r.createdAt || new Date().toISOString();

        // requester name
        const fromUserId = r.fromUserId;
        if (!namesCache[fromUserId]) {
          try {
            const res = await fetchUserById(fromUserId);
            namesCache[fromUserId] = res.data?.name || "Unknown User";
          } catch {
            namesCache[fromUserId] = "Unknown User";
          }
        }

        // target event owner
        const requestedEvent = eventsMap[r.requestedEventId];
        let toUserId = "";
        if (requestedEvent) {
          toUserId = requestedEvent.userId;
          if (!namesCache[toUserId]) {
            try {
              const res = await fetchUserById(toUserId);
              namesCache[toUserId] = res.data?.name || "Unknown User";
            } catch {
              namesCache[toUserId] = "Unknown User";
            }
          }
        }

        return {
          ...r,
          _backendId: backendId,
          _reactKey: reactKey,
          createdAt,
          fromUserName: namesCache[fromUserId],
          toUserName: namesCache[toUserId] || "Unknown User",
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
  const handleRespond = async (backendId: string, accept: boolean) => {
    if (!currentUser?.id || !backendId) return;

    try {
      await dispatch(respondSwapRequest({ id: backendId, accept })).unwrap();

      // Refresh requests & events
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
                  key={r._reactKey}
                  className="p-3 bg-white/90 rounded shadow flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold">
                      {r.fromUserName} offers swap
                    </div>
                    <div className="text-sm text-gray-600">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "Unknown Date"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 rounded bg-green-600 text-white"
                      onClick={() => handleRespond(r.id, true)}
                    >
                      Accept
                    </button>
                    <button
                      className="px-2 py-1 rounded border"
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
                <div
                  key={r._reactKey}
                  className="p-3 bg-white/90 rounded shadow flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold">To: {r.toUserName}</div>
                    <div className="text-sm text-gray-600">{r.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

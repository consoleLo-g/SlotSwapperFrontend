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
  const myEvents = useAppSelector((s) => s.swap.myEvents);

  const [incomingWithNames, setIncomingWithNames] = useState<any[]>([]);
  const [outgoingWithNames, setOutgoingWithNames] = useState<any[]>([]);
  const [userCache, setUserCache] = useState<Record<string, string>>({});

  const enrichRequestsWithNames = async (requests: SwapRequest[]) => {
    if (!requests.length) return [];

    const namesCache = { ...userCache };
    const events = await getAllEventsApi();
    const eventsMap = Object.fromEntries(events.map((e: any) => [e.id, e]));

    const enriched = await Promise.all(
      requests.map(async (r) => {
        const backendId = r.id;
        const reactKey = backendId || Math.random().toString();

        const fromUserId = r.fromUserId;
        if (!namesCache[fromUserId]) {
          try {
            const res = await fetchUserById(fromUserId);
            namesCache[fromUserId] = res.data?.name || "Unknown User";
          } catch {
            namesCache[fromUserId] = "Unknown User";
          }
        }

        const requestedEvent = eventsMap[r.requestedEventId];
        let toUserId = requestedEvent?.userId || "";
        if (toUserId && !namesCache[toUserId]) {
          try {
            const res = await fetchUserById(toUserId);
            namesCache[toUserId] = res.data?.name || "Unknown User";
          } catch {
            namesCache[toUserId] = "Unknown User";
          }
        }

        return {
          ...r,
          _backendId: backendId,
          _reactKey: reactKey,
          fromUserName: namesCache[fromUserId],
          toUserName: namesCache[toUserId] || "Unknown User",
        };
      })
    );

    setUserCache(namesCache);
    return enriched;
  };

  const loadRequests = async () => {
    if (!currentUser?.id) return;

    try {
      const { incoming, outgoing } = await dispatch(fetchSwapRequests(currentUser.id)).unwrap();

      // Only incoming requests for slots owned by current user
      const filteredIncoming = incoming.filter((r) => myEvents.some((ev) => ev.id === r.requestedEventId));

      setIncomingWithNames(await enrichRequestsWithNames(filteredIncoming));
      setOutgoingWithNames(await enrichRequestsWithNames(outgoing));
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [dispatch, currentUser, myEvents]);

  const handleRespond = async (backendId: string, accept: boolean) => {
    if (!currentUser?.id || !backendId) return;

    try {
      await dispatch(respondSwapRequest({ id: backendId, accept })).unwrap();

      // REFRESH events & requests after swap
      await dispatch(fetchMyEvents(currentUser.id));
      await dispatch(fetchMarketplace(currentUser.id));
      await loadRequests();
    } catch (err) {
      console.error("Failed to respond:", err);
    }
  };

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
                    <div className="font-bold">{r.fromUserName} offers swap</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 rounded bg-green-600 text-white"
                      onClick={() => handleRespond(r._backendId, true)}
                    >
                      Accept
                    </button>
                    <button
                      className="px-2 py-1 rounded border"
                      onClick={() => handleRespond(r._backendId, false)}
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

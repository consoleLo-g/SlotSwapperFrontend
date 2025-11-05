// src/pages/Notifications.tsx
import React, { useEffect } from "react";
import NavBar from "../Components/NavBar";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchIncoming, fetchOutgoing, respondRequest } from "../Store/requestSlice";

export default function Notifications() {
  const dispatch = useAppDispatch();
  const incoming = useAppSelector((s) => s.requests.incoming);
  const outgoing = useAppSelector((s) => s.requests.outgoing);

  useEffect(() => {
    dispatch(fetchIncoming());
    dispatch(fetchOutgoing());
  }, [dispatch]);

  async function handleRespond(id: string, accept: boolean) {
    await dispatch(respondRequest({ id, accept }));
    dispatch(fetchIncoming());
    dispatch(fetchOutgoing());
  }

  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-2 gap-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Incoming Requests</h2>
          <div className="space-y-3">
            {incoming.length === 0 ? <div className="text-gray-500">No incoming</div> : incoming.map((r: any) => (
              <div key={r.id} className="p-3 bg-white/90 rounded shadow flex justify-between items-center">
                <div>
                  <div className="font-bold">{r.fromUserName} offers swap</div>
                  <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => handleRespond(r.id, true)}>Accept</button>
                  <button className="px-2 py-1 border rounded" onClick={() => handleRespond(r.id, false)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Outgoing Requests</h2>
          <div className="space-y-3">
            {outgoing.length === 0 ? <div className="text-gray-500">No outgoing</div> : outgoing.map((r: any) => (
              <div key={r.id} className="p-3 bg-white/90 rounded shadow">
                <div className="font-bold">To: {r.toUserName}</div>
                <div className="text-sm text-gray-600">{r.status}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

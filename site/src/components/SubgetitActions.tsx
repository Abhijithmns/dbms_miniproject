"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
export function SubgetitActions({ subredditId, name }: { subredditId?: number; name?: string }) {
  const [id, setId] = useState(subredditId); const [joined, setJoined] = useState(false); const [busy, setBusy] = useState(false);
  useEffect(() => { if (!id && name) void apiRequest<Array<{ id: number; name: string }>>("/api/subgetits").then((items) => setId(items.find((item) => item.name === name)?.id)).catch(() => undefined); }, [id, name]);
  async function toggleResolved() { if (!id) return; setBusy(true); try { await apiRequest(`/api/subgetits/${id}/join`, { method: joined ? "DELETE" : "POST" }); setJoined(!joined); } catch { /* login required */ } finally { setBusy(false); } }
  return <button type="button" className="btn-ghost" disabled={busy || !id} onClick={() => void toggleResolved()}>{joined ? "Joined" : "Join subgetit"}</button>;
}

"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Award = { awardId: number; name: string; iconUrl?: string; description?: string };
export function AwardsPanel({ commentId }: { commentId: number }) {
  const [open, setOpen] = useState(false);
  const [awards, setAwards] = useState<Award[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => { if (open) void apiRequest<Award[]>("/api/awards").then(setAwards).catch(() => setMessage("Log in to give an award.")); }, [open]);
  async function give(awardId: number) { try { await apiRequest(`/api/comments/${commentId}/award`, { method: "POST", body: JSON.stringify({ awardId }) }); setMessage("Award given."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not give award."); } }
  return <span className="award-control"><button type="button" className="comment-btn" onClick={() => setOpen(!open)}>🏆 Award</button>{open && <span className="award-menu">{awards.map((award) => <button type="button" key={award.awardId} onClick={() => void give(award.awardId)}>{award.iconUrl || "🏆"} {award.name}</button>)}{!awards.length && !message && <small>No awards available.</small>}{message && <small>{message}</small>}</span>}</span>;
}

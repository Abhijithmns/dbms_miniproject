"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type User = { userId: number; username: string; karma: number; role: "user" | "moderator"; moderatorSubredditId?: number | null };
type Subgetit = { id: number; name: string };

export function ModerationPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [subgetits, setSubgetits] = useState<Subgetit[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  function load() { void Promise.all([apiRequest<User[]>("/api/moderation/users"), apiRequest<Subgetit[]>("/api/subgetits")]).then(([nextUsers, nextSubgetits]) => { setUsers(nextUsers); setSubgetits(nextSubgetits); }).catch((reason) => setError(reason instanceof Error ? reason.message : "Moderator access required.")); }
  useEffect(load, []);
  async function changeRole(user: User, role: "user" | "moderator") { setBusy(user.userId); const subredditId = subgetits[0]?.id; try { await apiRequest(`/api/moderation/users/${user.userId}/role`, { method: "POST", body: JSON.stringify({ role, subredditId }) }); load(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update role."); } finally { setBusy(null); } }
  if (error) return <p className="mt-8 text-pen" role="alert">{error}</p>;
  return <div className="sheet mt-8 overflow-x-auto p-6"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line"><th className="p-2">Username</th><th className="p-2">Karma</th><th className="p-2">Role</th><th className="p-2">Action</th></tr></thead><tbody>{users.map((user) => <tr key={user.userId} className="border-b border-line"><td className="p-2 font-mono">u/{user.username}</td><td className="p-2">{user.karma}</td><td className="p-2">{user.role}</td><td className="p-2">{user.role === "moderator" ? <button className="comment-btn" disabled={busy === user.userId} onClick={() => void changeRole(user, "user")}>Remove moderator</button> : <button className="comment-btn" disabled={busy === user.userId} onClick={() => void changeRole(user, "moderator")}>Make moderator</button>}</td></tr>)}</tbody></table></div>;
}

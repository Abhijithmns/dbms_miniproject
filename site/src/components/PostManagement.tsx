"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export function PostManagement({ slug, initialTitle, initialBody }: { slug: string; initialTitle: string; initialBody: string }) {
  const router = useRouter(); const [id, setId] = useState<number>(); const [allowed, setAllowed] = useState(false); const [editing, setEditing] = useState(false); const [title, setTitle] = useState(initialTitle); const [body, setBody] = useState(initialBody); const [confirmDelete, setConfirmDelete] = useState(false); const [error, setError] = useState("");
  useEffect(() => { void Promise.all([apiRequest<{ postId: number; authorId: number }>(`/api/posts/${slug}/details`), apiRequest<{ id: number }>("/api/auth/me")]).then(([post, user]) => { setId(post.postId); setAllowed(post.authorId === user.id); }).catch(() => undefined); }, [slug]);
  if (!id || !allowed) return null;
  async function save(event: React.FormEvent) { event.preventDefault(); try { await apiRequest(`/api/posts/${id}`, { method: "PUT", body: JSON.stringify({ title, body }) }); setEditing(false); router.refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update post"); } }
  async function remove() { try { await apiRequest(`/api/posts/${id}`, { method: "DELETE" }); router.push("/"); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete post"); } }
  return <div className="mt-6 flex flex-wrap gap-2"><button className="btn-ghost" onClick={() => setEditing(!editing)}>Edit post</button><button className="btn-ghost" onClick={() => setConfirmDelete(!confirmDelete)}>Delete post</button>{confirmDelete && <div className="delete-confirm" role="alert">Delete this post? <button className="comment-btn delete-confirm-yes" onClick={() => void remove()}>Delete</button><button className="comment-btn" onClick={() => setConfirmDelete(false)}>Cancel</button></div>}{editing && <form className="sheet basis-full grid gap-3 p-4" onSubmit={save}><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required /><textarea className="input" value={body} onChange={(e) => setBody(e.target.value)} required /><button className="btn justify-self-start">Save changes</button></form>}{error && <p className="w-full text-sm text-pen">{error}</p>}</div>;
}

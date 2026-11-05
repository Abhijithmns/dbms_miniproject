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
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="reddit-pill-btn"
        onClick={() => setEditing(!editing)}
      >
        ✎ Edit post
      </button>
      <button
        type="button"
        className="reddit-pill-btn text-pen"
        onClick={() => setConfirmDelete(!confirmDelete)}
      >
        🗑 Delete post
      </button>
      {confirmDelete && (
        <div className="delete-confirm basis-full mt-2" role="alert">
          Delete this post?{" "}
          <button
            type="button"
            className="reddit-pill-btn !bg-pen !text-white !h-7 !text-xs ml-2"
            onClick={() => void remove()}
          >
            Confirm Delete
          </button>
          <button
            type="button"
            className="reddit-pill-btn !h-7 !text-xs ml-1"
            onClick={() => setConfirmDelete(false)}
          >
            Cancel
          </button>
        </div>
      )}
      {editing && (
        <form className="sheet basis-full grid gap-3 p-4 mt-3" onSubmit={save}>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          <button className="btn justify-self-start !py-2 !text-xs">Save changes</button>
        </form>
      )}
      {error && <p className="w-full text-sm text-pen mt-1">{error}</p>}
    </div>
  );
}

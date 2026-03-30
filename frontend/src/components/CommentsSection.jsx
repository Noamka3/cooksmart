import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { addComment, getComments, toggleDislike, toggleLike } from "../services/commentService";

const teal = "#2E7273";

export default function CommentsSection({ signature }) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!signature) return;
    setLoading(true);
    getComments(signature)
      .then((d) => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [signature]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const { comment } = await addComment(token, signature, text.trim());
      setComments((prev) => [comment, ...prev]);
      setText("");
    } catch (err) {
      setError(err.message || "שגיאה בשליחת התגובה");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) return;
    try {
      const { likes, dislikes, liked } = await toggleLike(token, commentId);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c,
                likes: liked ? [...(c.likes || []), user.id] : (c.likes || []).filter((id) => id !== user.id),
                dislikes: liked ? (c.dislikes || []).filter((id) => id !== user.id) : (c.dislikes || []),
                likeCount: likes, dislikeCount: dislikes }
            : c
        )
      );
    } catch {}
  };

  const handleDislike = async (commentId) => {
    if (!user) return;
    try {
      const { likes, dislikes, disliked } = await toggleDislike(token, commentId);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c,
                dislikes: disliked ? [...(c.dislikes || []), user.id] : (c.dislikes || []).filter((id) => id !== user.id),
                likes: disliked ? (c.likes || []).filter((id) => id !== user.id) : (c.likes || []),
                likeCount: likes, dislikeCount: dislikes }
            : c
        )
      );
    } catch {}
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div dir="rtl">
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: teal }}>
        תגובות ({comments.length})
      </p>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="כתוב תגובה..."
            maxLength={500}
            className="flex-1 rounded-xl border px-4 py-2 text-sm outline-none"
            style={{ borderColor: "#e0d5c5", color: "#1a2e2b" }}
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: teal }}
          >
            {submitting ? "..." : "שלח"}
          </button>
        </form>
      ) : (
        <p className="text-xs mb-4 text-center py-2 rounded-xl" style={{ background: "#f9fbfa", color: "#8aaba5", border: "1px solid #e3edea" }}>
          <a href="/login" style={{ color: teal, fontWeight: 600 }}>התחבר</a> כדי להגיב
        </p>
      )}

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2E7273]/20 border-t-[#2E7273]" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm py-4" style={{ color: "#8aaba5" }}>אין תגובות עדיין — היה הראשון!</p>
      ) : (
        <ul className="space-y-3 max-h-52 overflow-y-auto">
          {comments.map((c) => (
            <li key={c._id} className="rounded-xl px-4 py-3" style={{ background: "#f9fbfa", border: "1px solid #e3edea" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold" style={{ color: "#1a2e2b" }}>{c.userName}</span>
                <span className="text-xs" style={{ color: "#a0b8b4" }}>{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#4f6c66" }}>{c.text}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleLike(c._id)}
                  disabled={!user}
                  className="flex items-center gap-1 text-sm rounded-full px-2.5 py-0.5 transition hover:opacity-80 disabled:cursor-default"
                  style={{
                    background: user && (c.likes || []).includes(user.id) ? "#fff0e0" : "#f3f4f6",
                    color: user && (c.likes || []).includes(user.id) ? "#e05a5a" : "#9ca3af",
                    border: `1px solid ${user && (c.likes || []).includes(user.id) ? "#f5c28b" : "#e5e7eb"}`,
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>♥</span> {c.likeCount ?? (c.likes?.length || 0)}
                </button>
                <button
                  onClick={() => handleDislike(c._id)}
                  disabled={!user}
                  className="flex items-center gap-1 text-sm rounded-full px-2.5 py-0.5 transition hover:opacity-80 disabled:cursor-default"
                  style={{
                    background: user && (c.dislikes || []).includes(user.id) ? "#f0f0f0" : "#f3f4f6",
                    color: user && (c.dislikes || []).includes(user.id) ? "#6b7280" : "#9ca3af",
                    border: `1px solid ${user && (c.dislikes || []).includes(user.id) ? "#d1d5db" : "#e5e7eb"}`,
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>💔</span> {c.dislikeCount ?? (c.dislikes?.length || 0)}
                </button>
                {!user && <span className="text-xs" style={{ color: "#c4cdd6" }}>התחבר כדי להגיב</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

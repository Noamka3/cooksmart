const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getComments = async (signature) => {
  const res = await fetch(`${API_URL}/comments/${signature}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to fetch comments");
  return data;
};

export const toggleLike = async (token, commentId) => {
  const res = await fetch(`${API_URL}/comments/${commentId}/like`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to like");
  return data;
};

export const toggleDislike = async (token, commentId) => {
  const res = await fetch(`${API_URL}/comments/${commentId}/dislike`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to dislike");
  return data;
};

export const addComment = async (token, signature, text) => {
  const res = await fetch(`${API_URL}/comments/${signature}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ text }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to add comment");
  return data;
};

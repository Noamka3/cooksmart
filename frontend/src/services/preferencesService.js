const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export const getPreferences = async (token) => {
  const res = await fetch(`${API_URL}/preferences`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch preferences");
  return res.json();
};

export const savePreferences = async (token, payload) => {
  const res = await fetch(`${API_URL}/preferences`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save preferences");
  return res.json();
};

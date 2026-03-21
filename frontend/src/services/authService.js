const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const buildRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.fields = data.errors || [];
    throw error;
  }

  return data;
};

export const registerUser = (payload) =>
  buildRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginUser = (payload) =>
  buildRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getCurrentUser = (token) =>
  buildRequest("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

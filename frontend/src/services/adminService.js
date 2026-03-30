const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const buildAdminRequest = async (endpoint, token, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    const error = new Error("Network error. Please check your connection and try again.");
    error.code = "NETWORK_ERROR";
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Admin request failed");
    error.status = response.status;
    throw error;
  }

  return data;
};

export const getAdminStats = (token) =>
  buildAdminRequest("/admin/stats", token, { method: "GET" });

export const getAdminUsers = (token) =>
  buildAdminRequest("/admin/users", token, { method: "GET" });

export const updateUserRole = (token, userId, role) =>
  buildAdminRequest(`/admin/users/${userId}/role`, token, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

export const deleteUser = (token, userId) =>
  buildAdminRequest(`/admin/users/${userId}`, token, { method: "DELETE" });

export const getUserSavedRecipes = (token, userId) =>
  buildAdminRequest(`/admin/users/${userId}/saved-recipes`, token, { method: "GET" });

export const getUserPantry = (token, userId) =>
  buildAdminRequest(`/admin/users/${userId}/pantry`, token, { method: "GET" });

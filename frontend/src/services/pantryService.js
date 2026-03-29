const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const buildPantryRequest = async (endpoint, token, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
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
    const error = new Error(data.message || "Pantry request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const getPantryItems = (token) =>
  buildPantryRequest("/pantry", token, {
    method: "GET",
  });

export const createPantryItem = (token, payload, imageFile = null) => {
  if (imageFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value != null) formData.append(key, value);
    });
    formData.append("image", imageFile);
    return buildPantryRequest("/pantry", token, { method: "POST", body: formData });
  }
  return buildPantryRequest("/pantry", token, { method: "POST", body: JSON.stringify(payload) });
};

export const updatePantryItem = (token, id, payload) =>
  buildPantryRequest(`/pantry/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deletePantryItem = (token, id) =>
  buildPantryRequest(`/pantry/${id}`, token, {
    method: "DELETE",
  });

export const identifyPantryImage = (token, file) => {
  const formData = new FormData();
  formData.append("image", file);

  return buildPantryRequest("/pantry/identify-image", token, {
    method: "POST",
    body: formData,
  });
};

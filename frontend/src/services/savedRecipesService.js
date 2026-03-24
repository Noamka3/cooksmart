const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const buildAuthorizedRequest = async (endpoint, token, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
};

export const saveRecipe = (token, recipe) =>
  buildAuthorizedRequest("/saved-recipes", token, {
    method: "POST",
    body: JSON.stringify(recipe),
  });

export const getSavedRecipes = (token) =>
  buildAuthorizedRequest("/saved-recipes", token, {
    method: "GET",
  });

export const removeSavedRecipe = (token, savedRecipeId) =>
  buildAuthorizedRequest(`/saved-recipes/${savedRecipeId}`, token, {
    method: "DELETE",
  });

export const checkSavedRecipe = (token, recipe) =>
  buildAuthorizedRequest("/saved-recipes/check", token, {
    method: "POST",
    body: JSON.stringify(recipe),
  });

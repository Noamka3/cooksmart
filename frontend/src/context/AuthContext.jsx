import { useEffect, useState } from "react";

import { AuthContext } from "./AuthContextObject";
import { getCurrentUser, loginUser, registerUser } from "../services/authService";

const TOKEN_KEY = "cooksmart_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await getCurrentUser(token);
        setUser(response.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapAuth();
  }, [token]);

  const persistSession = (authResponse) => {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    setToken(authResponse.token);
    setUser(authResponse.user);
  };

  const register = async (payload) => {
    const response = await registerUser(payload);
    persistSession(response);
    return response;
  };

  const login = async (payload) => {
    const response = await loginUser(payload);
    persistSession(response);
    return response;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(user),
        isBootstrapping,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

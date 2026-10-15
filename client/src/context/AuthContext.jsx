import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether the user is already logged in
  const checkUser = useCallback(async () => {
    const token = localStorage.getItem("learn_unique_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");

      // Adjust this according to your backend response structure
      const userData = response.data?.data;

      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
        localStorage.removeItem("learn_unique_token");
      }
    } catch (error) {
      console.error(
        "Authentication verification failed:",
        error.response?.data || error.message
      );

      // Clear the session only when the token is invalid
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("learn_unique_token");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // Register a new user
  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      const result = response.data?.data;

      // Save token if the backend returns one
      if (result?.token) {
        localStorage.setItem("learn_unique_token", result.token);
      }

      // Update user state if user information is returned
      if (result?.user) {
        setUser(result.user);
      } else if (result?.token && result?._id) {
        setUser(result);
      }

      return result;
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  // Login existing user
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const result = response.data?.data;

      if (!result?.token) {
        throw new Error("Authentication token was not returned by the server.");
      }

      localStorage.setItem("learn_unique_token", result.token);

      // Support either { token, user } or { token, ...userFields }
      const userData = result.user || result;

      setUser(userData);

      return userData;
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  // Logout the current user
  const logout = () => {
    localStorage.removeItem("learn_unique_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading,
        checkUser,
      }}
    >
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Custom authentication hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export default AuthContext;
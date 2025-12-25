// src/authContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { authApi } from "./api/authApi";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Attendre un peu que le token Firebase soit bien propagé
      // puis retry en cas d'erreur "token invalide"
      const loadUserWithRetry = async (retries = 3, delay = 500) => {
        for (let i = 0; i < retries; i++) {
          try {
            if (i > 0) {
              // Petit délai avant retry
              await new Promise(resolve => setTimeout(resolve, delay));
            }

            const data = await authApi.getUserInfo();
            const userType = (data.USER_TYPE || data.user_type || "").toLowerCase();
            const status = (data.STATUS || data.status || "").toLowerCase();

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: data.displayName || data.DISPLAY_NAME,
              photoURL: data.photoUrl || data.PHOTO_URL,
              userType,
              status,
            });
            setError(null);
            return; // Success, sortir
          } catch (err) {
            // Si c'est la dernière tentative ou une erreur différente de token invalide
            if (i === retries - 1 || (err.status !== 401 && !err.message.includes("token"))) {
              // If Oracle user is missing, treat as not onboarded
              if (err.status === 403 || err.message === "User not found") {
                setUser(null);
                setError(null);
              } else {
                console.error(`Failed to load user info (attempt ${i + 1}/${retries})`, err);
                setError(err.message);
                setUser(null);
              }
              return;
            }
            // Sinon, on continue le retry
            console.log(`Token not ready, retrying... (${i + 1}/${retries})`);
          }
        }
      };

      try {
        await loadUserWithRetry();
      } catch (err) {
        console.error("Unexpected error in loadUserWithRetry", err);
        setUser(null);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  async function reloadUser() {
    setLoading(true);
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.getUserInfo();
      const userType = (data.USER_TYPE || data.user_type || "").toLowerCase();
      const status = (data.STATUS || data.status || "").toLowerCase();

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: data.displayName || data.DISPLAY_NAME || firebaseUser.displayName,
        photoURL: data.photoUrl || data.PHOTO_URL || firebaseUser.photoURL,
        userType,
        status,
      });
      setError(null);
    } catch (err) {
      if (err.status === 403 || err.message === "User not found") {
        setUser(null);
        setError(null);
      } else {
        console.error("Failed to load user info", err);
        setError(err.message);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

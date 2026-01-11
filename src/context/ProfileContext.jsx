import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../authContext";
import { apiFetch } from "../api/client";

const ProfileContext = createContext();

export function useProfile() {
    return useContext(ProfileContext);
}

export function ProfileProvider({ children }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            refreshProfile();
        } else {
            setProfile(null);
        }
    }, [user]);

    const refreshProfile = async () => {
        // Don't fetch if we are in signup flow (incomplete user)
        if (user?.userType === 'unknown' || user?.incomplete) return;

        setLoading(true);
        try {
            const data = await apiFetch("/api/profile/get");
            setProfile(data);
        } catch (err) {
            if (err.status !== 403 && err.status !== 404) {
                console.error("Profile fetch error", err);
            }
        } finally {
            setLoading(false);
        }
    };

    const decrementTokens = () => {
        setProfile(prev => {
            if (!prev) return null;
            return { ...prev, tokensRemaining: Math.max(0, (prev.tokensRemaining || 0) - 1) };
        });
    };

    const incrementTokens = () => {
        setProfile(prev => {
            if (!prev) return null;
            return { ...prev, tokensRemaining: (prev.tokensRemaining || 0) + 1 };
        });
    };

    return (
        <ProfileContext.Provider value={{ profile, loading, refreshProfile, decrementTokens, incrementTokens }}>
            {children}
        </ProfileContext.Provider>
    );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import { studentApi } from '../api/studentApi';

export function useApplicationQuota() {
    const { user } = useAuth();
    const [used, setUsed] = useState(0);
    const [limit, setLimit] = useState(5); // Default limit
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            studentApi.getProfile().then(profile => {
                // Assuming API provides us tokensRemaining, but we want quota logic used/limit
                // If backend only gives 'tokensRemaining', we can infer:
                // limit = 5 (hardcoded for now or from backend)
                // used = limit - tokensRemaining
                const quotaLimit = profile.quotaLimit || 5;
                const tokens = profile.tokensRemaining !== undefined ? profile.tokensRemaining : quotaLimit;

                setLimit(quotaLimit);
                setUsed(quotaLimit - tokens);
                setLoading(false);
            }).catch(err => {
                console.error("Quota fetch error", err);
                setLoading(false);
            });
        }
    }, [user]);

    const isLocked = used >= limit;

    // Optimistic update helper
    const incrementUsed = () => {
        if (!isLocked) {
            setUsed(prev => Math.min(prev + 1, limit));
        }
    };

    return { used, limit, isLocked, loading, incrementUsed };
}

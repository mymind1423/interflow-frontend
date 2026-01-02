import { useState, useEffect } from 'react';

const RECAPTCHA_SITE_KEY = "6Ldo0DwsAAAAAHGhpuMeau9PrLplaFyoIGS7AUJH";

export const useRecaptcha = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const checkRecaptcha = () => {
            if (window.grecaptcha?.enterprise) {
                window.grecaptcha.enterprise.ready(() => {
                    setIsReady(true);
                });
                return true;
            }
            return false;
        };

        if (!checkRecaptcha()) {
            const interval = setInterval(() => {
                if (checkRecaptcha()) {
                    clearInterval(interval);
                }
            }, 500);
            return () => clearInterval(interval);
        }
    }, []);

    const executeRecaptcha = async (action) => {
        if (!isReady || !window.grecaptcha?.enterprise) {
            console.warn('Recaptcha not ready');
            return null;
        }
        try {
            const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
            return token;
        } catch (error) {
            console.error('Recaptcha execution failed', error);
            return null;
        }
    };

    return { executeRecaptcha, isReady };
};

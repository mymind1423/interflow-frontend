import { useEffect, useRef } from 'react';

const RECAPTCHA_SITE_KEY = "6Ldo0DwsAAAAAHGhpuMeau9PrLplaFyoIGS7AUJH";

export default function Recaptcha({ onChange }) {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);

    useEffect(() => {
        const showRecaptcha = () => {
            // Check for either standard or enterprise global object
            const grecaptcha = window.grecaptcha;

            if (grecaptcha?.enterprise && containerRef.current && widgetIdRef.current === null) {
                try {
                    widgetIdRef.current = grecaptcha.enterprise.render(containerRef.current, {
                        sitekey: RECAPTCHA_SITE_KEY,
                        callback: (token) => {
                            onChange(token);
                        },
                        'error-callback': () => {
                            onChange(null);
                        },
                        'expired-callback': () => {
                            onChange(null);
                        }
                    });
                } catch (e) {
                    console.error("Recaptcha render error:", e);
                }
            }
        };

        if (!window.grecaptcha?.enterprise) {
            const interval = setInterval(() => {
                if (window.grecaptcha?.enterprise) {
                    clearInterval(interval);
                    showRecaptcha();
                }
            }, 500);
            return () => clearInterval(interval);
        } else {
            showRecaptcha();
        }
    }, [onChange]);

    return <div ref={containerRef} className="my-4 flex justify-center scale-90 sm:scale-100 origin-center" />;
}

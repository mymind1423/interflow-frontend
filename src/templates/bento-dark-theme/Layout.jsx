
import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
            {/* Background ambient glow */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl opacity-50 mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
            </div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default Layout;

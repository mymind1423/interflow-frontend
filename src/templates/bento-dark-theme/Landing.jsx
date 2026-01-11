
import React from 'react';
import Layout from './Layout';

const BentoCard = ({ children, className = "", title, subtitle }) => (
    <div className={`bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-colors group relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        {title && <h3 className="text-lg font-bold text-white mb-1 relative z-10">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-400 mb-4 relative z-10">{subtitle}</p>}
        <div className="relative z-10 h-full">{children}</div>
    </div>
);

const Landing = () => {
    return (
        <Layout>
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-6 max-w-screen-2xl mx-auto">
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                    KOSMOS
                </div>
                <div className="flex gap-6 text-sm font-medium text-slate-400">
                    <a href="#" className="hover:text-white transition-colors">Features</a>
                    <a href="#" className="hover:text-white transition-colors">Pricing</a>
                    <a href="#" className="hover:text-white transition-colors">About</a>
                </div>
                <button className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                    Sign In
                </button>
            </nav>

            {/* Hero */}
            <header className="pt-20 pb-32 px-6 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-8 uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                    v2.0 is live
                </div>
                <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                    Master your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 animate-gradient-x">
                        Universe
                    </span>
                </h1>
                <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
                    The all-in-one platform for students and companies to connect, collaborate, and create the future. Powered by cosmic intelligence.
                </p>
                <button className="group relative px-8 py-4 bg-slate-100 text-slate-950 font-bold rounded-full overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)]">
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-10 transition-opacity"></span>
                    <span className="relative flex items-center gap-2">
                        Get Started
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </span>
                </button>
            </header>

            {/* Bento Grid */}
            <section className="px-6 pb-24 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 h-[800px] md:h-[600px]">
                    {/* Main Feature */}
                    <BentoCard className="md:col-span-2 md:row-span-2" title="Integrated Ecosystem" subtitle="Everything works together seamlessly">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
                        <div className="mt-8 relative h-full">
                            <div className="absolute top-0 left-0 right-0 p-4 bg-slate-800/50 rounded-xl border border-white/5 backdrop-blur-sm transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                                <div className="h-2 w-20 bg-slate-700/50 rounded mb-2"></div>
                                <div className="h-2 w-full bg-slate-700/50 rounded"></div>
                            </div>
                            <div className="absolute top-12 left-4 right-4 p-4 bg-slate-800/80 rounded-xl border border-white/10 backdrop-blur-md transform rotate-[2deg] hover:rotate-0 transition-transform duration-500 z-10">
                                <div className="flex gap-2 mb-2">
                                    <div className="h-8 w-8 rounded bg-gradient-to-br from-purple-500 to-cyan-500"></div>
                                    <div>
                                        <div className="h-3 w-24 bg-slate-600 rounded mb-1"></div>
                                        <div className="h-2 w-16 bg-slate-700 rounded"></div>
                                    </div>
                                </div>
                                <div className="h-20 bg-slate-900/50 rounded-lg border border-white/5"></div>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Quick Stat 1 */}
                    <BentoCard className="md:col-span-1 md:row-span-1 flex items-center justify-center bg-purple-900/20 border-purple-500/20">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">98%</div>
                            <div className="text-xs text-purple-300 uppercase tracking-widest">Success Rate</div>
                        </div>
                    </BentoCard>

                    {/* Feature List */}
                    <BentoCard className="md:col-span-1 md:row-span-2" title="Real-time Sync">
                        <ul className="space-y-4 mt-6">
                            {[1, 2, 3].map((_, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]"></span>
                                    <span>Instant updates</span>
                                </li>
                            ))}
                        </ul>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
                    </BentoCard>

                    {/* Large Feature */}
                    <BentoCard className="md:col-span-2 md:row-span-1 flex flex-row items-center justify-between" title="Global Network">
                        <div className="text-slate-400 text-sm max-w-[200px]">Connect with talents from over 120 countries instantly.</div>
                        <div className="w-24 h-24 rounded-full border border-white/10 relative flex items-center justify-center animate-[spin_10s_linear_infinite]">
                            <div className="w-2 h-2 bg-white rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 shadow-[0_0_10px_white]"></div>
                        </div>
                    </BentoCard>

                    {/* Toggle Switch */}
                    <BentoCard className="md:col-span-1 md:row-span-1 flex items-center justify-center">
                        <div className="w-16 h-8 bg-slate-800 rounded-full p-1 relative cursor-pointer group-hover:bg-slate-700 transition-colors">
                            <div className="w-6 h-6 bg-cyan-400 rounded-full shadow-lg absolute right-1"></div>
                        </div>
                    </BentoCard>
                </div>
            </section>

            <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
                <p>&copy; 2026 Kosmos Inc. Designed for the stars.</p>
            </footer>
        </Layout>
    );
};

export default Landing;

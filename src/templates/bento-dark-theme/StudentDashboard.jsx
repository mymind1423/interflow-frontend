
import React from 'react';
import Layout from './Layout';

const TechCard = ({ title, company, type, stack, salary }) => (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-cyan-500/50 hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)] transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full blur-xl"></div>
        </div>

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-cyan-400">
                    {company.slice(0, 2).toUpperCase()}
                </div>
                <div>
                    <h3 className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">{title}</h3>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{company}</p>
                </div>
            </div>
            <span className="text-[10px] font-mono border border-slate-700 bg-slate-800/50 px-2 py-1 rounded text-slate-400">
                {type}
            </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 relative z-10">
            {stack.map((tech, i) => (
                <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors cursor-default">
                    {tech}
                </span>
            ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-800/50 relative z-10">
            <div className="font-mono text-xs text-emerald-400">{salary}</div>
            <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 group/btn">
                APPLY <span className="group-hover/btn:translate-x-1 transition-transform">&rarr;</span>
            </button>
        </div>
    </div>
);

const StudentDashboard = () => {
    const jobs = [
        { title: 'Frontend Architect', company: 'Nebula', type: 'FULL-TIME', salary: '$120k - $160k', stack: ['React', 'Three.js', 'WebGL'] },
        { title: 'Systems Core Eng', company: 'Pulsar', type: 'REMOTE', salary: '$140k - $180k', stack: ['Rust', 'WASM', 'Tokio'] },
        { title: 'UX Specialist', company: 'Void', type: 'CONTRACT', salary: '$90k - $130k', stack: ['Figma', 'Principle', 'Spline'] },
        { title: 'Data Scientist', company: 'Quasar', type: 'FULL-TIME', salary: '$110k - $150k', stack: ['Python', 'PyTorch', 'CUDA'] },
        { title: 'DevOps Lead', company: 'Orbit', type: 'REMOTE', salary: '$130k - $170k', stack: ['Kubernetes', 'Go', 'AWS'] },
        { title: 'Blockchain Dev', company: 'Chain', type: 'FULL-TIME', salary: '$150k - $200k', stack: ['Solidity', 'Web3', 'Hardhat'] },
    ];

    return (
        <Layout>
            <div className="flex h-screen overflow-hidden bg-black">
                {/* Sidebar */}
                <aside className="w-20 lg:w-64 border-r border-slate-800 bg-slate-950 flex flex-col items-center lg:items-stretch py-6 z-20">
                    <div className="mb-10 px-6 flex items-center justify-center lg:justify-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-lg animate-pulse"></div>
                        <span className="hidden lg:block font-bold text-xl tracking-tight text-white">HUB</span>
                    </div>

                    <nav className="flex-1 space-y-2 px-3">
                        {[
                            { icon: '◉', label: 'Mission Control', active: true },
                            { icon: '◎', label: 'Transmissions', active: false },
                            { icon: '◈', label: 'Archives', active: false },
                            { icon: '◇', label: 'Settings', active: false },
                        ].map((item, i) => (
                            <a key={i} href="#" className={`flex items-center lg:px-4 py-3 rounded-lg transition-all group ${item.active ? 'bg-white/5 text-cyan-400 border border-white/5' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                <span className="ml-3 font-mono text-sm hidden lg:block">{item.label}</span>
                            </a>
                        ))}
                    </nav>

                    <div className="p-4 mt-auto">
                        <div className="h-12 w-12 lg:w-full rounded-full lg:rounded-xl bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border border-white/10 flex items-center justify-center lg:px-4 gap-3 cursor-pointer hover:border-white/20 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-slate-800"></div>
                            <div className="hidden lg:block">
                                <div className="text-xs font-bold text-white">Cadet Alex</div>
                                <div className="text-[10px] text-slate-500 font-mono">ID: 884-XJ</div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-slate-950/50 relative">
                    <div className="p-8">
                        <header className="flex justify-between items-end mb-10 pb-6 border-b border-slate-800">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Available Missions</h1>
                                <p className="text-slate-500 font-mono text-sm">SECTOR: ENGINEERING // CLEARANCE: LEVEL 3</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm font-mono text-slate-400 flex items-center gap-2">
                                    <span>FILTER:</span>
                                    <span className="text-cyan-400">ALL SYSTEMS</span>
                                </div>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {jobs.map((job, i) => (
                                <TechCard key={i} {...job} />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default StudentDashboard;

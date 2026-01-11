
import React from 'react';
import Layout from './Layout';

const StatusBadge = ({ status }) => {
    const styles = {
        New: 'bg-[#D4E0FF] text-[#6A88CD]',
        Interviewing: 'bg-[#FFF4C4] text-[#D4A346]',
        Hired: 'bg-[#D1F7C4] text-[#6B9E78]',
        Rejected: 'bg-[#FFD1CF] text-[#E07A5F]',
    };

    return (
        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide ${styles[status] || styles.New}`}>
            {status}
        </span>
    );
};

const CandidateCard = ({ name, role, status, applied }) => (
    <div className="clay-card-sm p-4 flex flex-col md:flex-row items-center gap-6 mb-4 hover:scale-[1.01] transition-transform">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
            {name[0]}
        </div>
        <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-slate-700">{name}</h3>
            <p className="text-sm text-slate-400 font-bold">{role}</p>
        </div>
        <div className="flex-1 text-center font-bold text-slate-500 text-sm">
            Applied {applied}
        </div>
        <div className="flex-1 text-center">
            <StatusBadge status={status} />
        </div>
        <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-[#88B0FF] hover:text-white flex items-center justify-center transition-colors">
                ℹ️
            </button>
            <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-[#E07A5F] hover:text-white flex items-center justify-center transition-colors">
                ✕
            </button>
        </div>
    </div>
);

const AdminPanel = () => {
    const candidates = [
        { id: 1, name: 'Sarah Jenkins', role: 'UX Designer', status: 'New', applied: '2h ago' },
        { id: 2, name: 'Mike Ross', role: 'Frontend Dev', status: 'Interviewing', applied: '1d ago' },
        { id: 3, name: 'Jessica Pearson', role: 'Product Manager', status: 'Hired', applied: '3d ago' },
        { id: 4, name: 'Harvey Specter', role: 'Legal Intern', status: 'Rejected', applied: '1w ago' },
        { id: 5, name: 'Rachel Zane', role: 'Paralegal', status: 'New', applied: '5h ago' },
    ];

    return (
        <Layout>
            <div className="flex min-h-screen bg-[#FDFBF7]">
                {/* Sidebar */}
                <aside className="w-20 lg:w-64 bg-white hidden md:flex flex-col items-center lg:items-start py-8 border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                    <div className="px-6 mb-12">
                        <div className="text-2xl font-black text-[#E07A5F]">Bloom</div>
                    </div>

                    <nav className="flex-1 w-full px-4 space-y-2">
                        {[
                            { icon: '🏠', label: 'Dashboard', active: true },
                            { icon: '👥', label: 'Candidates', active: false },
                            { icon: '💼', label: 'Jobs', active: false },
                            { icon: '💬', label: 'Messages', active: false },
                        ].map((item, i) => (
                            <a key={i} href="#" className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold ${item.active ? 'bg-[#FFD1CF] text-[#E07A5F] shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
                                <span className="text-xl">{item.icon}</span>
                                <span className="hidden lg:block">{item.label}</span>
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* Main */}
                <main className="flex-1 p-8">
                    <header className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-2xl font-black text-slate-700">Candidates</h1>
                            <p className="text-slate-400 font-bold">Manage your talent pool</p>
                        </div>
                        <button className="clay-btn bg-[#88D498] text-white px-6 py-2.5 font-bold shadow-lg hover:shadow-xl hover:-translate-y-1">
                            + Post New Job
                        </button>
                    </header>

                    <div className="bg-transparent">
                        <div className="flex gap-4 mb-6 overflow-x-auto pb-4">
                            {['All', 'New', 'Interviewing', 'Hired', 'Rejected'].map(filter => (
                                <button key={filter} className="clay-card-sm px-6 py-2 text-sm font-bold text-slate-500 hover:text-[#88B0FF] transition-colors whitespace-nowrap">
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {candidates.map(candidate => (
                                <CandidateCard key={candidate.id} {...candidate} />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default AdminPanel;


import React from 'react';
import Layout from './Layout';

const PuffyCard = ({ title, company, color, logo }) => (
    <div className="clay-card p-6 flex flex-col items-center text-center transform hover:-translate-y-2 hover:rotate-1 transition-all duration-300 cursor-pointer group relative overflow-hidden">
        <div className={`absolute top-0 w-full h-2 ${color}`}></div>
        <div className="w-16 h-16 rounded-2xl bg-slate-50 mb-4 flex items-center justify-center text-3xl shadow-inner">
            {logo}
        </div>
        <h3 className="font-bold text-lg text-slate-700 mb-1 group-hover:text-[#E07A5F] transition-colors">{title}</h3>
        <p className="text-sm text-slate-400 font-bold mb-6">{company}</p>
        <button className={`w-full py-2 rounded-xl text-white font-bold text-sm shadow-md transition-transform active:scale-95 ${color.replace('bg-', 'bg-')}`}>
            Apply Now
        </button>
    </div>
);

const PipelineStage = ({ label, count, color }) => (
    <div className="flex-1 min-w-[200px]">
        <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-slate-600">{label}</h3>
            <span className={`px-2 py-1 rounded-lg text-xs font-bold text-white ${color}`}>{count}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full mb-4">
            <div className={`h-full rounded-full ${color} opacity-40`} style={{ width: '40%' }}></div>
        </div>
    </div>
);

const StudentDashboard = () => {
    const pipeline = [
        { label: 'Applied', count: 12, color: 'bg-[#88B0FF]' },
        { label: 'Interviewing', count: 4, color: 'bg-[#E07A5F]' },
        { label: 'Offers', count: 1, color: 'bg-[#88D498]' },
    ];

    const jobs = [
        { title: 'Visual Designer', company: 'Dribbble', logo: '🏀', color: 'bg-[#FF9F9C]' },
        { title: 'React Developer', company: 'Meta', logo: '♾️', color: 'bg-[#88B0FF]' },
        { title: 'Content Writer', company: 'Notion', logo: '📝', color: 'bg-[#88D498]' },
        { title: 'Product Intern', company: 'Linear', logo: '⚡', color: 'bg-[#D4A346]' },
    ];

    return (
        <Layout>
            <div className="min-h-screen p-8">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 mb-2">Hello, Alex! 👋</h1>
                        <p className="text-slate-500 font-bold">You have 2 upcoming interviews.</p>
                    </div>

                    <div className="flex gap-4">
                        <button className="clay-card-sm w-12 h-12 flex items-center justify-center text-xl text-slate-400 hover:text-[#E07A5F] transition-colors">
                            🔔
                        </button>
                        <div className="clay-card-sm flex items-center gap-3 px-2 pr-6 py-2">
                            <div className="w-10 h-10 rounded-xl bg-[#FFF4C4] flex items-center justify-center text-xl shadow-sm">
                                😼
                            </div>
                            <div className="text-sm font-bold text-slate-700">Alex M.</div>
                        </div>
                    </div>
                </header>

                {/* Pipeline Tracker */}
                <section className="mb-16">
                    <div className="clay-card p-8 bg-white/50 backdrop-blur-sm">
                        <h2 className="text-xl font-black text-slate-700 mb-6 flex items-center gap-2">
                            <span className="text-2xl">🚀</span> Application Tracker
                        </h2>
                        <div className="flex flex-wrap gap-8">
                            {pipeline.map((stage, i) => <PipelineStage key={i} {...stage} />)}
                        </div>
                    </div>
                </section>

                {/* Recommended Jobs */}
                <section>
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-xl font-black text-slate-700 flex items-center gap-2">
                            <span className="text-2xl">✨</span> Recommended For You
                        </h2>
                        <a href="#" className="font-bold text-[#88B0FF] hover:underline">See All</a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {jobs.map((job, i) => <PuffyCard key={i} {...job} />)}
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default StudentDashboard;

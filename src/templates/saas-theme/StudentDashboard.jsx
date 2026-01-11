
import React from 'react';
import Layout from './Layout';
import JobCard from './JobCard';

const StudentDashboard = () => {
    const jobs = [
        { id: 1, title: 'Frontend Developer', company: 'TechCorp', type: 'Full-time', salary: '$80k - $100k', timePosted: '2h ago' },
        { id: 2, title: 'UX Designer', company: 'CreativeStudio', type: 'Contract', salary: '$60k - $80k', timePosted: '5h ago' },
        { id: 3, title: 'Product Manager', company: 'SaaSFlow', type: 'Full-time', salary: '$90k - $120k', timePosted: '1d ago' },
        { id: 4, title: 'Backend Engineer', company: 'DataSystems', type: 'Remote', salary: '$100k - $130k', timePosted: '2d ago' },
        { id: 5, title: 'Marketing Intern', company: 'GrowthLabs', type: 'Internship', salary: '$20k - $30k', timePosted: '3d ago' },
        { id: 6, title: 'Full Stack Dev', company: 'StartUpX', type: 'Full-time', salary: '$90k - $110k', timePosted: '3d ago' },
    ];

    return (
        <Layout>
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-10">
                    <div className="p-6 border-b border-slate-100">
                        <h1 className="text-xl font-bold text-indigo-700">EduSaaS</h1>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="mb-8">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Filters</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Job Type</label>
                                    <div className="space-y-2">
                                        {['Full-time', 'Contract', 'Remote', 'Internship'].map(type => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                                                <span className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Salary Range</label>
                                    <select className="w-full text-sm border-slate-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                                        <option>Any</option>
                                        <option>$30k - $50k</option>
                                        <option>$50k - $80k</option>
                                        <option>$80k - $120k</option>
                                        <option>$120k+</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Menu</h3>
                            <ul className="space-y-1">
                                {['Dashboard', 'My Applications', 'Saved Jobs', 'Profile', 'Settings'].map(item => (
                                    <li key={item}>
                                        <a href="#" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50">
                    {/* Top Nav */}
                    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
                        <h2 className="text-lg font-semibold text-slate-800">Find Your Next Role</h2>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-64"
                                />
                                <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                JD
                            </div>
                        </div>
                    </header>

                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-slate-700 font-medium">Showing {jobs.length} Jobs</h3>
                            <div className="flex gap-2 text-sm text-slate-500">
                                <span>Sort by:</span>
                                <select className="bg-transparent font-medium text-slate-700 focus:outline-none">
                                    <option>Newest</option>
                                    <option>Salary: High to Low</option>
                                    <option>Relevance</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {jobs.map(job => (
                                <JobCard key={job.id} {...job} />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default StudentDashboard;

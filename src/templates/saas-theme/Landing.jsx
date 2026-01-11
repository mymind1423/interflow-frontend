
import React from 'react';
import Layout from './Layout';

const Landing = () => {
    return (
        <Layout>
            {/* Navigation */}
            <nav className="flex justify-between items-center px-8 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="text-2xl font-bold text-indigo-700 tracking-tight">EduSaaS</div>
                <div className="flex gap-4">
                    <button className="text-slate-600 hover:text-indigo-600 font-medium px-4 py-2 transition-colors">Log In</button>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="px-8 py-24 text-center max-w-5xl mx-auto">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm border border-indigo-100">
                    🚀 Launching Your Career Standard
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                    Find Your Dream Job <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                        Without the Hassle
                    </span>
                </h1>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Connect with top-tier companies and startups. Our platform streamlines the hiring process so you can focus on what matters most.
                </p>
                <div className="flex justify-center gap-4">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-3.5 rounded-lg font-semibold transition-all shadow-lg hover:shadow-indigo-200 hover:-translate-y-1">
                        Get Started Free
                    </button>
                    <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-lg px-8 py-3.5 rounded-lg font-semibold transition-all">
                        View Demo
                    </button>
                </div>
            </header>

            {/* How it Works / Stats */}
            <section className="px-8 py-20 bg-white border-y border-slate-100">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center">
                    {[
                        { label: 'Active Companies', value: '500+', icon: '🏢' },
                        { label: 'Jobs Posted', value: '1,200+', icon: '💼' },
                        { label: 'Happy Students', value: '8k+', icon: '🎓' },
                    ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="text-4xl mb-4">{stat.icon}</div>
                            <div className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
                            <div className="text-slate-500 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="px-8 py-24 text-center">
                <div className="bg-indigo-900 rounded-3xl p-12 max-w-5xl mx-auto text-white shadow-2xl overflow-hidden relative">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your journey?</h2>
                        <p className="text-indigo-100 mb-8 max-w-xl mx-auto text-lg">
                            Join thousands of students who have already found their perfect role through our platform.
                        </p>
                        <button className="bg-white text-indigo-900 px-8 py-3.5 rounded-lg font-bold text-lg hover:bg-indigo-50 transition-colors">
                            Create Account
                        </button>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-50"></div>
                </div>
            </section>

            <footer className="py-12 text-center text-slate-400 text-sm border-t border-slate-200">
                © 2024 EduSaaS Platform. All rights reserved.
            </footer>
        </Layout>
    );
};

export default Landing;

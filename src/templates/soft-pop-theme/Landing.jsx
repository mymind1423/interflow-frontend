
import React from 'react';
import Layout from './Layout';

const Landing = () => {
    return (
        <Layout>
            <div className="relative overflow-hidden">
                {/* Decorative Blobs */}
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#FFD1CF] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D4E0FF] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-[#D1F7C4] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

                {/* Navbar */}
                <nav className="relative z-10 flex justify-between items-center px-10 py-8 max-w-screen-2xl mx-auto">
                    <div className="text-3xl font-black tracking-tight text-[#E07A5F] flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[#E07A5F] flex items-center justify-center text-white text-lg">✿</span>
                        Bloom
                    </div>
                    <div className="hidden md:flex gap-8 font-bold text-slate-500">
                        <a href="#" className="hover:text-[#E07A5F] transition-colors">Find Jobs</a>
                        <a href="#" className="hover:text-[#E07A5F] transition-colors">For Companies</a>
                        <a href="#" className="hover:text-[#E07A5F] transition-colors">Stories</a>
                    </div>
                    <button className="clay-btn bg-[#88B0FF] text-white px-8 py-3 font-bold text-lg hover:bg-[#7aa0f0]">
                        Join Now!
                    </button>
                </nav>

                {/* Hero */}
                <header className="relative z-10 pt-16 pb-32 flex flex-col items-center text-center px-6">
                    <div className="clay-card-sm inline-block px-6 py-2 mb-8 bg-white text-[#88B0FF] font-black tracking-wide text-sm uppercase transform -rotate-2">
                        ✨ Your dream career awaits
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-slate-800 mb-8 leading-tight">
                        Work can be <br />
                        <span className="text-[#FF9F9C]">Fun</span> & <span className="text-[#88D498]">Easy</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mb-12">
                        Discover internships that match your vibe. No boring lists, just connections.
                    </p>

                    {/* Floating Search Pill */}
                    <div className="clay-card p-2 pl-8 flex items-center justify-between w-full max-w-2xl transform hover:scale-[1.02] transition-transform">
                        <input
                            type="text"
                            placeholder="What do you want to do?"
                            className="bg-transparent border-none outline-none text-xl font-bold text-slate-600 w-full placeholder:text-slate-300 placeholder:font-medium"
                        />
                        <button className="clay-btn bg-[#FF9F9C] text-white w-14 h-14 flex items-center justify-center rounded-full text-2xl">
                            🔍
                        </button>
                    </div>
                </header>

                {/* Bubbles Categories */}
                <section className="relative z-10 pb-32 px-6">
                    <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8">
                        {[
                            { label: 'Design', icon: '🎨', color: 'bg-[#FFD1CF] text-[#E07A5F]' },
                            { label: 'Coding', icon: '💻', color: 'bg-[#D4E0FF] text-[#6A88CD]' },
                            { label: 'Business', icon: '📈', color: 'bg-[#D1F7C4] text-[#6B9E78]' },
                            { label: 'Writing', icon: '✍️', color: 'bg-[#FFF4C4] text-[#D4A346]' },
                        ].map((cat, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 group cursor-pointer">
                                <div className={`w-32 h-32 rounded-full ${cat.color} flex items-center justify-center text-5xl shadow-xl transform group-hover:-translate-y-2 group-hover:rotate-6 transition-all duration-300`}>
                                    {cat.icon}
                                </div>
                                <span className="font-bold text-slate-600 text-lg">{cat.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stats Card */}
                <section className="relative z-10 pb-20 px-6">
                    <div className="max-w-5xl mx-auto clay-card p-12 flex flex-col md:flex-row items-center justify-around text-center gap-8 bg-white/80 backdrop-blur-sm">
                        <div>
                            <div className="text-5xl font-black text-[#88B0FF] mb-2">500+</div>
                            <div className="font-bold text-slate-400 uppercase tracking-wider">Startups</div>
                        </div>
                        <div className="w-full md:w-1 h-1 md:h-20 bg-slate-100 rounded-full"></div>
                        <div>
                            <div className="text-5xl font-black text-[#FF9F9C] mb-2">10k+</div>
                            <div className="font-bold text-slate-400 uppercase tracking-wider">Students</div>
                        </div>
                        <div className="w-full md:w-1 h-1 md:h-20 bg-slate-100 rounded-full"></div>
                        <div>
                            <div className="text-5xl font-black text-[#88D498] mb-2">FREE</div>
                            <div className="font-bold text-slate-400 uppercase tracking-wider">Forever</div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default Landing;

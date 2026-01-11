
import React from 'react';
import Layout from './Layout';

const AdminPanel = () => {
    const systemLogs = [
        { time: '10:42:05', level: 'INFO', event: 'USER_LOGIN', user: 'admin_core', status: 'SUCCESS' },
        { time: '10:41:55', level: 'WARN', event: 'HIGH_LATENCY', user: 'system', status: 'RESOLVED' },
        { time: '10:40:12', level: 'INFO', event: 'NEW_REGISTRATION', user: 'cadet_99', status: 'PENDING' },
        { time: '10:38:45', level: 'ERR', event: 'AUTH_FAIL', user: 'unknown', status: 'BLOCKED' },
        { time: '10:35:00', level: 'INFO', event: 'JOB_POST', user: 'recruiter_x', status: 'PUBLISHED' },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-black text-slate-300 font-mono p-4 md:p-8">

                {/* Header HUD */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-white/10 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Command Center</h1>
                        <div className="flex gap-4 text-xs mt-2 text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> SYSTEM ONLINE</span>
                            <span>UPTIME: 42D 12H 30M</span>
                            <span>VER: 2.4.0</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs text-cyan-400 uppercase tracking-wider transition-colors">
                            Run Diagnostics
                        </button>
                        <button className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-red-500 text-xs text-red-400 uppercase tracking-wider transition-colors">
                            Emergency Stop
                        </button>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    {/* Main Chart Area */}
                    <div className="lg:col-span-3 bg-slate-900/30 border border-white/5 rounded-lg p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                        <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-6 flex justify-between">
                            <span>Network Activity</span>
                            <span className="text-cyan-500">LIVE</span>
                        </h3>

                        {/* Fake Chart Visualization */}
                        <div className="h-48 flex items-end gap-1 justify-between px-2">
                            {Array.from({ length: 40 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-full bg-cyan-500/20 hover:bg-cyan-400/50 transition-colors rounded-t-sm"
                                    style={{ height: `${Math.random() * 80 + 20}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Column */}
                    <div className="space-y-6">
                        {[
                            { label: 'Active Cadets', value: '4,021', change: '+12%', color: 'text-purple-400' },
                            { label: 'Companies', value: '892', change: '+5%', color: 'text-cyan-400' },
                            { label: 'Server Load', value: '34%', change: '-2%', color: 'text-emerald-400' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-900/30 border border-white/5 p-5 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase mb-1">{stat.label}</div>
                                <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                                <div className="text-xs text-slate-600 font-mono">DELTA: {stat.change}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Terminal / Table */}
                <div className="bg-slate-900/30 border border-white/5 rounded-lg overflow-hidden">
                    <div className="bg-slate-900/50 px-6 py-3 border-b border-white/5 flex justify-between items-center">
                        <span className="text-xs uppercase tracking-widest text-slate-500">System Logs</span>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs bg-slate-950/20">
                            <thead className="bg-white/5 text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Timestamp</th>
                                    <th className="px-6 py-3 font-medium">Level</th>
                                    <th className="px-6 py-3 font-medium">Event</th>
                                    <th className="px-6 py-3 font-medium">User</th>
                                    <th className="px-6 py-3 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {systemLogs.map((log, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors font-mono">
                                        <td className="px-6 py-3 text-slate-500">{log.time}</td>
                                        <td className={`px-6 py-3 font-bold ${log.level === 'INFO' ? 'text-blue-400' :
                                                log.level === 'WARN' ? 'text-yellow-400' : 'text-red-500'
                                            }`}>{log.level}</td>
                                        <td className="px-6 py-3 text-slate-300">{log.event}</td>
                                        <td className="px-6 py-3 text-purple-300">{log.user}</td>
                                        <td className="px-6 py-3 text-right">
                                            <span className={`px-2 py-0.5 rounded ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    log.status === 'BLOCKED' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-slate-500/10 text-slate-400'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-2 bg-slate-900/50 border-t border-white/5 text-[10px] text-slate-600 flex justify-between">
                        <span>ROOT ACCESS GRANTED</span>
                        <span>TERMINAL SESSION: 8492</span>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default AdminPanel;

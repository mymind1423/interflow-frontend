
import React from 'react';
import Layout from './Layout';

const AdminPanel = () => {
    const users = [
        { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'Student', status: 'Active', lastLogin: '2 mins ago' },
        { id: 2, name: 'Sarah Wilson', email: 'sarah@techcorp.com', role: 'Employer', status: 'Active', lastLogin: '1 hour ago' },
        { id: 3, name: 'Mike Brown', email: 'mike@example.com', role: 'Student', status: 'Inactive', lastLogin: '3 days ago' },
        { id: 4, name: 'Emily Davis', email: 'emily@creativestudio.com', role: 'Employer', status: 'Pending', lastLogin: 'Never' },
        { id: 5, name: 'Chris Lee', email: 'chris@example.com', role: 'Student', status: 'Active', lastLogin: '5 hours ago' },
        { id: 6, name: 'Pat Taylor', email: 'pat@admin.com', role: 'Admin', status: 'Active', lastLogin: 'Just now' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700';
            case 'Inactive': return 'bg-slate-100 text-slate-600';
            case 'Pending': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <Layout>
            <div className="flex h-screen overflow-hidden bg-slate-50">
                {/* Admin Sidebar */}
                <aside className="w-16 md:w-60 bg-indigo-900 text-indigo-100 flex flex-col transition-all duration-300">
                    <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-indigo-800">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">E</div>
                        <span className="ml-3 font-bold text-lg hidden md:block">EduAdmin</span>
                    </div>

                    <nav className="flex-1 py-6 space-y-1 px-2">
                        {[
                            { icon: '📊', label: 'Dashboard', active: true },
                            { icon: '👥', label: 'Users', active: false },
                            { icon: '🏢', label: 'Companies', active: false },
                            { icon: '💼', label: 'Jobs', active: false },
                            { icon: '💳', label: 'Billing', active: false },
                            { icon: '⚙️', label: 'Settings', active: false },
                        ].map((item, i) => (
                            <a
                                key={i}
                                href="#"
                                className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${item.active ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-800/50 hover:text-white'}`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="ml-3 font-medium hidden md:block">{item.label}</span>
                                {item.label === 'Users' && (
                                    <span className="ml-auto bg-indigo-600 text-xs px-2 py-0.5 rounded-full hidden md:block">New</span>
                                )}
                            </a>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-indigo-800">
                        <button className="flex items-center w-full px-4 py-2 text-indigo-300 hover:text-white transition-colors">
                            <span>🚪</span>
                            <span className="ml-3 font-medium hidden md:block">Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Header */}
                    <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 shadow-sm z-10">
                        <h1 className="text-xl font-bold text-slate-800">User Management</h1>
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">🔔</button>
                            <div className="flex items-center gap-2">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-medium text-slate-900">Admin User</div>
                                    <div className="text-xs text-slate-500">Super Admin</div>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-slate-200 border border-slate-300"></div>
                            </div>
                        </div>
                    </header>

                    {/* Table Content */}
                    <div className="flex-1 overflow-auto p-8">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            {/* Toolbar */}
                            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-full sm:w-64"
                                    />
                                    <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Filter</button>
                                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm flex items-center gap-2">
                                        <span>+</span> Add User
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Last Login</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                                        {user.name.slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">{user.name}</div>
                                                        <div className="text-xs text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{user.role}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{user.lastLogin}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-400 hover:text-indigo-600 font-medium text-sm transition-colors">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                                <span>Showing 1 to 6 of 50 entries</span>
                                <div className="flex gap-1">
                                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Prev</button>
                                    <button className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded font-medium">1</button>
                                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">2</button>
                                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">3</button>
                                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default AdminPanel;

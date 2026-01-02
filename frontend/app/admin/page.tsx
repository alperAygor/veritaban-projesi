'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Toolbox, Trash2, Shield, Activity, BarChart3, Server, Clock, Search, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Data States
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [tools, setTools] = useState<any[]>([]);
    const [activity, setActivity] = useState<any[]>([]);

    // UI States
    const [activeTab, setActiveTab] = useState<'users' | 'tools' | 'activity'>('users');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const checkAdmin = async () => {
            const stored = localStorage.getItem('user');
            if (!stored) {
                router.push('/login');
                return;
            }
            const user = JSON.parse(stored);
            if (user.role !== 'admin') {
                router.push('/dashboard');
                return;
            }

            // Fetch Data
            try {
                const [statsRes, usersRes, toolsRes, activityRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/users'),
                    api.get('/admin/tools'),
                    api.get('/admin/activity')
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data);
                setTools(toolsRes.data);
                setActivity(activityRes.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load admin data');
            } finally {
                setLoading(false);
            }
        };
        checkAdmin();
    }, [router]);

    const handleDeleteUser = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete');
        }
    };

    const handleDeleteTool = async (id: number) => {
        if (!confirm('Are you sure you want to delete this tool? THIS CANNOT BE UNDONE.')) return;
        try {
            await api.delete(`/tools/${id}`);
            setTools(tools.filter(t => t.id !== id));
            // Also update stats if we want precise count instantly, but stats are global
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete');
        }
    };

    if (loading) return <div className="flex bg-gray-50 h-screen w-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>;

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredTools = tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.owner_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Shield className="h-6 w-6 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Console</h1>
                        </div>
                        <p className="text-gray-500 text-sm ml-12">System overview and management.</p>
                    </div>

                    {/* System Status Widget */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">System Online</span>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Server className="h-4 w-4" />
                            <span>v2.1.0</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 h-24 w-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl relative z-10">
                            <Users className="h-6 w-6" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <p className="text-2xl font-black text-gray-900">{stats?.total_users}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 h-24 w-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl relative z-10">
                            <Toolbox className="h-6 w-6" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-gray-500">Total Tools</p>
                            <p className="text-2xl font-black text-gray-900">{stats?.total_tools}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 h-24 w-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl relative z-10">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-gray-500">Reservations</p>
                            <p className="text-2xl font-black text-gray-900">{stats?.total_reservations}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 h-24 w-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl relative z-10">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-gray-500">Revenue</p>
                            <p className="text-2xl font-black text-gray-900">${stats?.total_revenue}</p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">

                    {/* Tabs & Search */}
                    <div className="border-b border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Users
                            </button>
                            <button
                                onClick={() => setActiveTab('tools')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'tools' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Tools
                            </button>
                            <button
                                onClick={() => setActiveTab('activity')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'activity' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Activity Feed
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Security</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{u.name}</div>
                                                <div className="text-sm text-gray-500">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {u.role === 'admin' && <Shield className="h-3 w-3" />}
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${u.security_score >= 8 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${(u.security_score || 0) * 10}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-medium">{u.security_score}/10</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {u.role !== 'admin' && (
                                                    <button onClick={() => handleDeleteUser(u.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tools Tab */}
                    {activeTab === 'tools' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Tool</th>
                                        <th className="px-6 py-4">Owner</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredTools.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{t.name}</div>
                                                <div className="text-sm text-gray-500">{t.category} • ${t.daily_price}/day</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 font-medium">{t.owner_name}</div>
                                                <div className="text-xs text-gray-500">{t.owner_email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {t.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDeleteTool(t.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Force Delete Tool">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Activity Feed Tab */}
                    {activeTab === 'activity' && (
                        <div className="p-6 space-y-4">
                            {activity.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p>No recent activity logged.</p>
                                </div>
                            ) : (
                                activity.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-800">
                                                <span className="font-bold">{item.actor}</span> reserved <span className="font-bold">{item.target}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{new Date(item.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

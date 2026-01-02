'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { LayoutGrid, TrendingUp, Activity } from 'lucide-react';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('activity');
    const [activityData, setActivityData] = useState<any[]>([]);
    const [statsData, setStatsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'activity') {
                const res = await api.get('/reports/activity');
                setActivityData(res.data);
            } else {
                const res = await api.get('/reports/stats');
                setStatsData(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm border-b sticky top-0 z-30">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Analytics & Reports</h1>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-blue-600">Dashboard</Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Tabs */}
                <div className="bg-gray-200/50 p-1 rounded-xl inline-flex mb-8">
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'activity'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        My Activity Stream
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'stats'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Top Owners Board
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : activeTab === 'activity' ? (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Events</div>
                                <div className="text-3xl font-black text-gray-900">{activityData.length}</div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {activityData.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">No activity recorded yet.</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {activityData.map((item, idx) => (
                                        <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.type === 'Owned' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                                    }`}>
                                                    {item.type === 'Owned' ? <LayoutGrid className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{item.name}</div>
                                                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{item.type}</div>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-500 font-mono">
                                                {item.date}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {statsData.map((stat, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    #{idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{stat.name}</h3>
                                        <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                            <span>★</span> {parseFloat(stat.avg_rating).toFixed(1)}
                                        </div>
                                    </div>
                                    {/* Bar Chart Visualization */}
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-green-500 h-full rounded-full"
                                            style={{ width: `${(parseFloat(stat.avg_rating) / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400 font-medium">
                                        {stat.tool_count} Tools Listed
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

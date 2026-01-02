'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash, PenTool, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [tools, setTools] = useState<any[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchAllData(parsedUser);
    }, [router]);

    const fetchAllData = async (currentUser: any) => {
        try {
            const [toolsRes, resRes] = await Promise.all([
                api.get('/tools/my'),
                api.get('/reservations')
            ]);
            setTools(toolsRes.data);
            setReservations(resRes.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTool = async (id: number) => {
        if (!confirm('Are you sure you want to delete this tool?')) return;
        try {
            await api.delete(`/tools/${id}`);
            setTools(tools.filter(t => t.id !== id));
        } catch (err) {
            alert('Failed to delete tool');
        }
    };

    const handleReservationAction = async (id: number, status: 'approved' | 'rejected') => {
        try {
            await api.put(`/reservations/${id}/status`, { status });
            // Update local state
            setReservations(reservations.map(r =>
                r.id === id ? { ...r, status } : r
            ));
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    if (!user && loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    // Filter Reservations
    const myRentals = reservations.filter((r: any) => r.renter_id === user?.id);
    const incomingRequests = reservations.filter((r: any) => r.tool_owner_id === user?.id && r.renter_id !== user?.id);
    const pendingRequests = incomingRequests.filter((r: any) => r.status === 'pending');

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-12 space-y-10">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                        <p className="text-gray-500 mt-2">Manage your tools, rentals, and earnings.</p>
                    </div>
                </div>

                {/* Pending Approvals Section */}
                {pendingRequests.length > 0 && (
                    <section>
                        <div className="glass-panel border-l-4 border-l-orange-500 p-6 rounded-2xl relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
                                <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">{pendingRequests.length}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                {pendingRequests.map((req: any) => (
                                    <div key={req.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">{req.tool_name}</h3>
                                        <p className="text-sm text-gray-500 mb-4">Requested by <span className="font-medium text-gray-900">{req.renter_name}</span></p>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-gray-50 p-2 rounded-lg">
                                            <Calendar className="h-4 w-4" />
                                            <span>{req.start_date}</span>
                                            <span>→</span>
                                            <span>{req.end_date}</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleReservationAction(req.id, 'approved')}
                                                className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition shadow-lg shadow-gray-200"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReservationAction(req.id, 'rejected')}
                                                className="flex-1 bg-white text-gray-700 border border-gray-200 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* My Tools Section */}
                <section>
                    <div className="flex items-end justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900">My Tools</h2>
                        </div>
                        <Link
                            href="/tools/new"
                            className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Tool
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        {tools.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <PenTool className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No tools listed yet</h3>
                                <p className="text-gray-500 mt-1">Start earning by sharing your tools with the community.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {tools.map((tool) => (
                                    <div key={tool.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition group">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                                                {tool.image_url ? (
                                                    <img src={tool.image_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400"><PenTool className="h-6 w-6" /></div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{tool.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600">{tool.category}</span>
                                                    <span>•</span>
                                                    <span>${tool.daily_price}/day</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${tool.status === 'available' ? 'bg-green-100 text-green-700' :
                                                tool.status === 'rented' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {tool.status.toUpperCase()}
                                            </span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/tools/edit/${tool.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button onClick={() => handleDeleteTool(tool.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Incoming Requests History */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Rental History (Incoming)</h2>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6">
                            {incomingRequests.length === 0 ? (
                                <p className="text-gray-400 text-sm">No incoming rentals yet.</p>
                            ) : (
                                <table className="min-w-full">
                                    <tbody className="text-sm">
                                        {incomingRequests.map((r: any) => (
                                            <tr key={r.id} className="group border-b border-gray-50 last:border-0">
                                                <td className="py-3 font-medium text-gray-900">{r.tool_name}</td>
                                                <td className="py-3 text-gray-600">{r.renter_name}</td>
                                                <td className="py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${r.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            r.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {r.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                                                        {r.status === 'rejected' && <XCircle className="h-3 w-3" />}
                                                        {r.status.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>

                    {/* My Rentals (Outgoing) */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-6">My Rentals</h2>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6">
                            {myRentals.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">You haven't rented any tools yet.</p>
                            ) : (
                                <table className="min-w-full">
                                    <tbody className="text-sm">
                                        {myRentals.map((r: any) => (
                                            <tr key={r.id} className="border-b border-gray-50 last:border-0">
                                                <td className="py-3 font-medium text-gray-900">{r.tool_name}</td>
                                                <td className="py-3 font-bold text-gray-900">${r.total_price}</td>
                                                <td className="py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${r.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {r.status.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

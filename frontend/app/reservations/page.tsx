'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const res = await api.get('/reservations');
            setReservations(res.data);
        } catch (err) {
            console.error("Failed to fetch reservations", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <h1 className="text-2xl font-bold">My Reservations</h1>
                    </div>
                    <Link href="/tools" className="text-blue-600 font-medium hover:text-blue-500">
                        Find more tools
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading activity...</div>
                ) : reservations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
                        No reservations found. Go rent some tools!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reservations.map((res) => (
                            <div key={res.id} className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-start gap-4">
                                    {res.image_url && <img src={res.image_url} className="h-16 w-16 rounded object-cover" />}
                                    <div>
                                        <h3 className="font-semibold text-lg">{res.tool_name}</h3>
                                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{res.start_date} - {res.end_date}</span>
                                        </div>
                                        <p className="mt-1 font-medium text-gray-900">Total: ${res.total_price}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${res.status === 'completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                            res.status === 'pending' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                                                'bg-gray-50 text-gray-600 ring-gray-500/10'
                                        } uppercase`}>
                                        {res.status}
                                    </span>
                                    {res.status === 'completed' && (
                                        <Link href={`/reservations/${res.id}/review`} className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                                            Leave Review
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

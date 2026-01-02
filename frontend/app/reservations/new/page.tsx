'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

function ReservationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const toolId = searchParams.get('toolId');
    const toolName = searchParams.get('toolName');
    const dailyPrice = searchParams.get('dailyPrice');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [error, setError] = useState('');
    const [authLoading, setAuthLoading] = useState(true);
    const [blockedDates, setBlockedDates] = useState<any[]>([]);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const checkAuthAndOwnership = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (!token || !userData) {
                router.push('/login');
                return;
            }

            const user = JSON.parse(userData);

            if (toolId) {
                try {
                    // Check Ownership
                    const toolRes = await api.get(`/tools/${toolId}`);
                    if (toolRes.data.owner_id === user.id) {
                        setError("You cannot reserve your own tool.");
                        // Optional: Redirect after delay
                        setTimeout(() => router.push('/dashboard'), 3000);
                        setAuthLoading(false);
                        return;
                    }

                    // Fetch Blocked Dates
                    const availRes = await api.get(`/tools/${toolId}/availability`);
                    setBlockedDates(availRes.data);

                } catch (err) {
                    console.error("Failed to fetch details", err);
                }
            }
            setAuthLoading(false);
        };

        checkAuthAndOwnership();
    }, [router, toolId]);

    // Check for overlaps whenever dates or blockedDates change
    useEffect(() => {
        if (startDate && endDate && blockedDates.length > 0) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            const hasOverlap = blockedDates.some((range: any) => {
                const bookedStart = new Date(range.start_date);
                const bookedEnd = new Date(range.end_date);
                // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
                return start <= bookedEnd && end >= bookedStart;
            });

            if (hasOverlap) {
                // Find the specific conflict for message
                const conflict = blockedDates.find((range: any) => {
                    const bookedStart = new Date(range.start_date);
                    const bookedEnd = new Date(range.end_date);
                    return start <= bookedEnd && end >= bookedStart;
                });

                if (conflict) {
                    setError(`Tool is unavailable from ${conflict.start_date} to ${conflict.end_date}`);
                }
            } else {
                if (error.includes("unavailable")) setError('');
            }
        }
    }, [startDate, endDate, blockedDates]);

    // Calculate price when dates change
    useEffect(() => {
        // Only calculate if no error (valid dates)
        if (toolId && startDate && endDate && !error) {
            const fetchPrice = async () => {
                setCalculating(true);
                try {
                    const res = await api.get('/reservations/price', {
                        params: { tool_id: toolId, start_date: startDate, end_date: endDate }
                    });
                    setTotalPrice(res.data.total_price);
                } catch (err) {
                    setTotalPrice(null);
                } finally {
                    setCalculating(false);
                }
            };
            fetchPrice();
        } else {
            setTotalPrice(null);
        }
    }, [toolId, startDate, endDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (new Date(startDate) < new Date(today)) {
            setError("Start date cannot be in the past.");
            setLoading(false);
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            setError("End date must be after start date.");
            setLoading(false);
            return;
        }

        try {
            await api.post('/reservations', {
                tool_id: toolId,
                start_date: startDate,
                end_date: endDate
            });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Reservation failed');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!toolId) return <div className="p-8">Invalid Tool</div>;
    if (error === "You cannot reserve your own tool.") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full border border-red-100">
                    <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Restricted Action</h2>
                    <p className="text-gray-600 mb-8">You cannot reserve your own tool. This feature is intended for other users to rent your items.</p>
                    <Link href="/dashboard" className="btn-primary w-full py-3 rounded-xl block">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-lg bg-white p-6 rounded-lg shadow">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/tools" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Reserve Tool</h1>
                </div>

                <div className="mb-6 border-b pb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{toolName}</h2>
                    <p className="text-gray-500">${dailyPrice} / day</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date" required
                                min={today}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={startDate}
                                onChange={e => { setStartDate(e.target.value); setError(''); }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date" required
                                min={startDate || today}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={endDate}
                                onChange={e => { setEndDate(e.target.value); setError(''); }}
                            />
                        </div>
                    </div>

                    {/* Price Preview */}
                    <div className="rounded-md bg-blue-50 p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Total Price:</span>
                            {calculating ? (
                                <span className="text-gray-500">Calculating...</span>
                            ) : totalPrice !== null ? (
                                <span className="text-2xl font-bold text-blue-700">${totalPrice}</span>
                            ) : (
                                <span className="text-gray-400">--</span>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || totalPrice === null || !!error}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 font-semibold disabled:cursor-not-allowed"
                    >
                        {loading ? 'Confirming...' : 'Confirm Reservation'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function NewReservationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReservationForm />
        </Suspense>
    )
}

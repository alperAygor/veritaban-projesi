'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';

export default function LeaveReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params
    const [reservationId, setReservationId] = useState<string | null>(null);

    // Use .then in useEffect for resolving promise param
    useState(() => {
        params.then(p => setReservationId(p.id));
    });

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reservationId) return;
        setLoading(true);
        setError('');

        try {
            await api.post('/reviews', {
                reservation_id: parseInt(reservationId),
                rating,
                comment
            });
            router.push('/reservations');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to submit review');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-lg bg-white p-6 rounded-lg shadow">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/reservations" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Leave a Review</h1>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rating</label>
                        <div className="mt-2 flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Comment</label>
                        <textarea
                            required rows={4}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="How was your experience?"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}

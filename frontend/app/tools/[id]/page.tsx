'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Star, Calendar, Shield, User, Send } from 'lucide-react';

export default function ToolDetailPage() {
    const params = useParams();
    const router = useRouter();
    const toolId = params.id;

    const [tool, setTool] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Review Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reservations, setReservations] = useState<any[]>([]); // User's reservations for this tool
    const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = localStorage.getItem('user');
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);

                    // Fetch user's reservations to see if they can review
                    // Ideally backend should provide a generic "can_review" flag or list eligible reservations
                    // For now, let's fetch all user reservations and filter client side or use a new endpoint.
                    // Let's use the existing /reservations endpoint which returns MY reservations
                    const myRes = await api.get('/reservations');
                    // Filter for this tool and status='completed' or 'approved' and NOT reviewed? 
                    // Backend check handles "already reviewed".
                    // Let's filter for this toolId.
                    const relevant = myRes.data.filter((r: any) => r.tool_id === parseInt(toolId as string) && (r.status === 'approved' || r.status === 'returned'));
                    setReservations(relevant);
                    if (relevant.length > 0) setSelectedReservationId(relevant[0].id);
                }

                const [toolRes, reviewsRes] = await Promise.all([
                    api.get(`/tools/${toolId}`),
                    api.get(`/tools/${toolId}/reviews`)
                ]);

                setTool(toolRes.data);
                setReviews(reviewsRes.data);
            } catch (err) {
                console.error("Failed to fetch tool data", err);
            } finally {
                setLoading(false);
            }
        };

        if (toolId) fetchData();
    }, [toolId]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReservationId) return;

        setSubmitting(true);
        setReviewError('');

        try {
            await api.post('/reviews', {
                reservation_id: selectedReservationId,
                rating,
                comment
            });

            // Refresh reviews
            const reviewsRes = await api.get(`/tools/${toolId}/reviews`);
            setReviews(reviewsRes.data);
            setComment('');

        } catch (err: any) {
            setReviewError(err.response?.data?.detail || 'Failed to post review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!tool) return <div className="min-h-screen flex items-center justify-center">Tool not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Hero */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/tools" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Marketplace
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Image */}
                        <div className="w-full md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 relative shadow-inner">
                            {tool.image_url ? (
                                <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                            {tool.category}
                                        </span>
                                        <div className="flex items-center text-yellow-500 font-bold">
                                            <Star className="h-5 w-5 fill-current mr-1" />
                                            {tool.average_rating ? Number(tool.average_rating).toFixed(1) : 'New'}
                                            <span className="text-gray-400 text-sm font-normal ml-1">({tool.review_count} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-blue-600">${tool.daily_price}</p>
                                    <p className="text-gray-500 text-sm">per day</p>
                                </div>
                            </div>

                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">{tool.description}</p>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                        {/* Ideally fetch owner Avatar or initials */}
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Owned by User #{tool.owner_id}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Shield className="h-3 w-3" /> Verified Owner
                                        </p>
                                    </div>
                                </div>

                                {user && user.id === tool.owner_id ? (
                                    <button disabled className="bg-gray-100 text-gray-400 px-6 py-3 rounded-xl font-bold cursor-not-allowed">
                                        Your Tool
                                    </button>
                                ) : (
                                    <Link
                                        href={`/reservations/new?toolId=${tool.id}&toolName=${encodeURIComponent(tool.name)}&dailyPrice=${tool.daily_price}`}
                                        className="btn-primary px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                                    >
                                        Reserve Now
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Review List */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>

                        {reviews.length === 0 ? (
                            <p className="text-gray-500 italic">No reviews yet. Be the first to rent and review!</p>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-gray-900">{review.reviewer_name}</p>
                                            <div className="flex items-center text-yellow-400 text-sm mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-400">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600">{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Write Review Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>

                            {!user ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">Please login to write a review.</p>
                                    <Link href="/login" className="btn-primary px-4 py-2 rounded-lg text-sm">Login</Link>
                                </div>
                            ) : reservations.length === 0 ? (
                                <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm">
                                    <p>You need to rent this tool before you can leave a review.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    {/* Reservation Selector (if multiple) */}
                                    {reservations.length > 1 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Rental</label>
                                            <select
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={selectedReservationId || ''}
                                                onChange={(e) => setSelectedReservationId(Number(e.target.value))}
                                            >
                                                {reservations.map(r => (
                                                    <option key={r.id} value={r.id}>{r.start_date} - {r.end_date}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                >
                                                    <Star className="h-8 w-8 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                        <textarea
                                            rows={4}
                                            required
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border"
                                            placeholder="Share your experience..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                    </div>

                                    {reviewError && (
                                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{reviewError}</div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full btn-primary py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2"
                                    >
                                        {submitting ? 'Posting...' : (
                                            <>
                                                <Send className="h-4 w-4" /> Post Review
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState<string | null>(null);

    // Unwrap params using `use` hook which is standard in creating async components or handling promises in client components if needed, or stick to useEffect unpacking
    // But strictly `params` is a Promise in recent Next.js versions.
    // Actually in client components `params` is not a promise in standard pages unless it's a layout?
    // In Next.js 15, params is a Promise. I'll handle it.

    // Simpler approach for client component: use `use` from react if available or useEffect.
    // Assuming Next 14/15 behavior.

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        daily_price: '',
        category: '',
        image_url: '',
        status: ''
    });

    useEffect(() => {
        // Unwrap params
        params.then((p) => {
            setId(p.id);
            fetchTool(p.id);
        });
    }, [params]);

    const fetchTool = async (toolId: string) => {
        try {
            // I don't have a direct "get single tool" endpoint in my plan, only list all or list my...
            // Wait, I missed GET /api/tools/{id} in my main.py update.
            // I only added GET /api/tools (list) and GET /api/tools/my
            // I need to fetch the tool details.
            // I can filter from "my tools" or add the endpoint.
            // Adding endpoint is cleaner. For now I will fetch "my tools" and find it to save a backend roundtrip if I don't want to edit main.py again immediately.
            // But editing main.py is better.

            // Let's try fetching "all my tools" and finding it.
            const res = await api.get('/tools/my');
            const tool = res.data.find((t: any) => t.id === parseInt(toolId));
            if (tool) {
                setFormData({
                    name: tool.name,
                    description: tool.description,
                    daily_price: tool.daily_price,
                    category: tool.category,
                    image_url: tool.image_url || '',
                    status: tool.status
                });
            } else {
                setError('Tool not found');
            }
        } catch (err) {
            setError('Failed to load tool');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                daily_price: parseFloat(String(formData.daily_price))
            };
            await api.put(`/tools/${id}`, payload);
            router.push('/dashboard');
        } catch (err: any) {
            console.error("Tool Update Error:", err);
            let errorMessage = 'Failed to update tool';

            try {
                if (err.response?.data?.detail) {
                    const detail = err.response.data.detail;
                    if (typeof detail === 'string') {
                        errorMessage = detail;
                    } else if (Array.isArray(detail)) {
                        errorMessage = detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
                    } else if (typeof detail === 'object') {
                        errorMessage = JSON.stringify(detail);
                    } else {
                        errorMessage = String(detail);
                    }
                } else if (err.message) {
                    errorMessage = err.message;
                }
            } catch (e) {
                errorMessage = "An unexpected error occurred.";
            }

            setError(errorMessage);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl bg-white p-6 rounded-lg shadow">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Edit Tool</h1>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tool Name</label>
                        <input
                            type="text" required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            required rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                <option value="Power Tools">Power Tools</option>
                                <option value="Hand Tools">Hand Tools</option>
                                <option value="Gardening">Gardening</option>
                                <option value="Automotive">Automotive</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Photography">Photography</option>
                                <option value="Construction">Construction</option>
                                <option value="Painting">Painting</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Daily Price ($)</label>
                            <input
                                type="number" step="0.01" min="0" required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.daily_price}
                                onChange={e => setFormData({ ...formData, daily_price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="available">Available</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="rented">Rented</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                        <input
                            type="url"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData.image_url}
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Tool'}
                    </button>
                </form>
            </div>
        </div>
    );
}

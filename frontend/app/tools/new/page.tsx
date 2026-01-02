'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function NewToolPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        daily_price: '',
        category: '',
        image_url: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate Price
            const price = parseFloat(formData.daily_price);
            if (isNaN(price) || price <= 0) {
                setError("Price must be a valid positive number");
                setLoading(false);
                return;
            }

            // Convert daily_price to float and handle empty strings
            const payload = {
                ...formData,
                daily_price: price,
                image_url: formData.image_url ? formData.image_url : null,
                category: formData.category || 'Other' // Default if empty
            };
            await api.post('/tools', payload);
            router.push('/dashboard');
        } catch (err: any) {
            console.error("Tool Creation Error:", err);
            let errorMessage = 'Failed to create tool';

            try {
                if (err.response?.data?.detail) {
                    const detail = err.response.data.detail;
                    if (Array.isArray(detail)) {
                        // Pydantic format: [{loc: ['body', 'field'], msg: 'error', ...}]
                        errorMessage = detail.map((e: any) => {
                            const field = e.loc ? e.loc[e.loc.length - 1] : 'Field';
                            return `${field}: ${e.msg}`;
                        }).join(' | ');
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl bg-white p-6 rounded-lg shadow">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Add New Tool</h1>
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
                        <label className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                        <input
                            type="url"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData.image_url}
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : 'Add Tool'}
                    </button>
                </form>
            </div>
        </div>
    );
}

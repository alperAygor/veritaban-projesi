'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, PenTool, Star, MapPin } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ToolsPage() {
    const [tools, setTools] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);

    const categories = ['Power Tools', 'Gardening', 'Automotive', 'Cleaning', 'Hand Tools', 'Other'];

    useEffect(() => {
        fetchTools();
    }, [category]);

    const fetchTools = async () => {
        setLoading(true);
        try {
            // If search is active, use search endpoint (Requirement 11)
            if (search) {
                const res = await api.get(`/tools/search?q=${search}`);
                setTools(res.data);
            } else {
                // Use view endpoint (Requirement 6)
                const url = category ? `/tools?category=${category}` : '/tools';
                const res = await api.get(url);
                setTools(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch tools", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTools();
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-12">

                {/* Search Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Find the perfect tool</h1>
                    <p className="text-lg text-gray-600 mb-8">Rent high-quality tools from your neighbors for a fraction of the cost.</p>

                    <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition outline-none text-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <button type="submit" className="absolute right-2 top-2 bottom-2 bg-gray-900 text-white px-6 rounded-xl font-bold hover:bg-gray-800 transition">
                            Search
                        </button>
                    </form>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    <button
                        onClick={() => setCategory('')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${!category ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
                    >
                        All
                    </button>
                    {categories.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${category === c ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-80 bg-gray-100 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {tools.map((tool) => (
                            <Link href={`/tools/${tool.id}`} key={tool.id} className="group">
                                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200 transition-all duration-300 transform group-hover:-translate-y-1">
                                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                        {tool.image_url ? (
                                            <img src={tool.image_url} alt={tool.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-300"><PenTool className="h-12 w-12" /></div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm border border-white/20">
                                            ${tool.daily_price}/day
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs font-bold text-blue-600 mb-1">{tool.category.toUpperCase()}</p>
                                        <h3 className="font-bold text-gray-900 text-lg mb-2 truncate">{tool.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{tool.description}</p>

                                        <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                                            <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
                                                <Star className="h-3 w-3 text-orange-600 fill-orange-600" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">New!</span>
                                            {/* We could add generic location or owner name here if available in tool object */}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

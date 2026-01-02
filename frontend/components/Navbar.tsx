'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutGrid, LogOut, User, ShieldCheck } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            setUser(JSON.parse(stored));
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    // Helper for active link style
    const isActive = (path: string) => pathname === path;
    const linkClass = (path: string) => `text-sm font-medium transition-colors ${isActive(path) ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-900'}`;

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 sm:h-20 justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-blue-600 rounded-xl p-1.5 shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-all duration-300 group-hover:scale-105">
                            <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <span className="text-lg sm:text-xl font-black tracking-tight text-gray-900">ToolShare</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/tools" className={linkClass('/tools')}>Marketplace</Link>
                        {user && <Link href="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>}
                        {user && <Link href="/reports" className={linkClass('/reports')}>Reports</Link>}
                    </div>

                    {/* Right Side (Auth) */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                                {user.role === 'admin' && (
                                    <Link href="/admin" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                                        <ShieldCheck className="h-3 w-3" />
                                        ADMIN
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 group"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:border-blue-200 transition-colors">
                                        <User className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-black hidden sm:block">{user.name.split(' ')[0]}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-black">Login</Link>
                                <Link href="/register" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

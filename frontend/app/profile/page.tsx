'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User, Mail, Save, ArrowLeft, Lock, Key, ShieldCheck, Camera } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Profile State
    const [formData, setFormData] = useState({ name: '', email: '', bio: '' });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    const [profileError, setProfileError] = useState('');

    // Password State
    const [passData, setPassData] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [passSaving, setPassSaving] = useState(false);
    const [passMessage, setPassMessage] = useState('');
    const [passError, setPassError] = useState('');

    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const stored = localStorage.getItem('user');
                if (!stored) {
                    router.push('/login');
                    return;
                }
                const parsed = JSON.parse(stored);
                setUser(parsed);
                setFormData({
                    name: parsed.name || '',
                    email: parsed.email || '',
                    bio: parsed.bio || ''
                });

                // Fetch Stats
                const statsRes = await api.get('/users/me/stats');
                setStats(statsRes.data);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileMessage('');
        setProfileError('');

        try {
            const res = await api.put('/users/me', formData);
            const updatedUser = { ...user, ...res.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setProfileMessage('Profile updated successfully!');
        } catch (err: any) {
            setProfileError(err.response?.data?.detail || 'Failed to update profile');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassSaving(true);
        setPassMessage('');
        setPassError('');

        if (passData.new_password !== passData.confirm_password) {
            setPassError("New passwords do not match");
            setPassSaving(false);
            return;
        }

        try {
            await api.put('/users/me/password', {
                current_password: passData.current_password,
                new_password: passData.new_password
            });
            setPassMessage('Password updated successfully!');
            setPassData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err: any) {
            setPassError(err.response?.data?.detail || 'Failed to update password');
        } finally {
            setPassSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium">
                            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
                        </Link>
                        <h1 className="text-lg font-bold text-gray-900">Account Settings</h1>
                        <div className="w-20"></div> {/* Spacer for center alignment */}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Profile Card & Navigation */}
                    <div className="space-y-6">
                        {/* Profile Summary Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                            <div className="relative mt-4 mb-4">
                                <div className="h-24 w-24 rounded-full bg-white p-1 mx-auto shadow-lg">
                                    <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-3xl font-bold border border-gray-100">
                                        {formData.name ? formData.name.substring(0, 2).toUpperCase() : <User />}
                                    </div>
                                </div>
                                <button className="absolute bottom-0 right-1/2 translate-x-10 translate-y-2 p-2 bg-white rounded-full shadow-md border border-gray-100 text-gray-500 hover:text-blue-600 transition">
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-1">{formData.name || 'User'}</h2>
                            <p className="text-sm text-gray-500 mb-4">{formData.email}</p>

                            <div className="flex justify-center gap-2 mb-6">
                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" /> Verified
                                </span>
                            </div>

                            {/* Stats Section (Requirement 11) */}
                            {stats && (
                                <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-6">
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">{stats.tools_owned}</div>
                                        <div className="text-xs text-gray-500 font-medium">Tools</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">{stats.rentals_count}</div>
                                        <div className="text-xs text-gray-500 font-medium">Rentals</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">${stats.total_spent}</div>
                                        <div className="text-xs text-gray-500 font-medium">Spent</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Forms */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Public Profile Form */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="border-b border-gray-100 px-8 py-5 flex items-center gap-3 bg-gray-50/50">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <User className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                            </div>

                            <div className="p-8">
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    {profileMessage && <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">✅ {profileMessage}</div>}
                                    {profileError && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">⚠️ {profileError}</div>}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-gray-50/50 focus:bg-white transition-all"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-gray-50/50 focus:bg-white transition-all"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                                        <textarea
                                            rows={3}
                                            className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 py-3 px-4 bg-gray-50/50 focus:bg-white transition-all"
                                            placeholder="Tell us a little about yourself..."
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={profileSaving}
                                            className="btn-primary px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2"
                                        >
                                            {profileSaving ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Security Form */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="border-b border-gray-100 px-8 py-5 flex items-center gap-3 bg-gray-50/50">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Security & Password</h3>
                            </div>

                            <div className="p-8">
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    {passMessage && <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">✅ {passMessage}</div>}
                                    {passError && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">⚠️ {passError}</div>}

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <Key className="h-4 w-4" />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                className="w-full rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 py-3 pl-11 pr-4 bg-gray-50/50 focus:bg-white transition-all"
                                                value={passData.current_password}
                                                onChange={e => setPassData({ ...passData, current_password: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 py-3 px-4 bg-gray-50/50 focus:bg-white transition-all"
                                                value={passData.new_password}
                                                onChange={e => setPassData({ ...passData, new_password: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 py-3 px-4 bg-gray-50/50 focus:bg-white transition-all"
                                                value={passData.confirm_password}
                                                onChange={e => setPassData({ ...passData, confirm_password: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={passSaving}
                                            className="bg-gray-900 text-white hover:bg-black px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-gray-200 flex items-center gap-2 transition-all"
                                        >
                                            {passSaving ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

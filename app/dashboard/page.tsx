"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, Upload, ShoppingBag, Wallet, Package, FileText, Clock, CheckCircle, XCircle, TrendingUp, Eye, ArrowRight, Plus, AlertCircle } from "lucide-react";
import { useCache } from "@/lib/useCache";

interface DashboardUser {
    name: string;
    email: string;
    walletBalance: number;
}

interface Purchase {
    _id: string;
    title: string;
    topics?: string[];
    subject: string;
    price: number;
    uploader?: { name?: string };
    createdAt: string;
}

interface UploadedNote {
    _id: string;
    title: string;
    topics?: string[];
    subject: string;
    price: number;
    status: string;
    purchaseCount?: number;
    createdAt: string;
}

interface SubmissionItem {
    _id: string;
    noteId?: { title?: string; topics?: string[]; subject?: string; price?: number };
    status: string;
    adminFeedback?: string;
    submittedAt: string;
    reviewedAt?: string;
}

interface DashboardData {
    user: DashboardUser;
    purchases: Purchase[];
    uploadedNotes: UploadedNote[];
    totalEarnings: number;
    submissions: SubmissionItem[];
}

export default function DashboardPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");

    const { data: dashData, loading, error } = useCache<DashboardData>(
        session?.user?.id ? "dashboard" : "dashboard-placeholder",
        async () => {
            const res = await fetch("/api/user/dashboard");
            if (!res.ok) throw new Error("Failed to load dashboard");
            return res.json();
        },
        5 * 60 * 1000
    );

    useEffect(() => {
        if (authStatus === "unauthenticated") router.push("/login");
    }, [authStatus, router]);

    if (authStatus === "loading" || loading) {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer h-28 rounded-2xl" />
                    ))}
                </div>
                <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer h-[400px] rounded-2xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-8 text-center">
                <AlertCircle size={48} className="text-danger mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-text-secondary mb-2">Failed to load dashboard</h3>
                <p className="text-text-muted">{error.message}</p>
            </div>
        );
    }

    if (!dashData) return null;

    const { user, purchases, uploadedNotes, totalEarnings, submissions } = dashData;

    const tabs = [
        { id: "overview", label: "Overview", icon: BarChart3 },
        { id: "purchases", label: "Purchases", icon: ShoppingBag },
        { id: "uploads", label: "My Notes", icon: Upload },
        { id: "submissions", label: "Submissions", icon: Package },
    ] as const;

    return (
        <div className="max-w-[1280px] mx-auto px-6 py-8 animate-fade-in-up">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-display text-3xl font-extrabold text-text-main mb-2">Dashboard</h1>
                <p className="text-text-secondary">Welcome back, {user.name}!</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-pastel-mint flex items-center justify-center text-success"><Wallet size={20} /></div>
                        <span className="text-sm text-text-secondary">Balance</span>
                    </div>
                    <div className="font-display text-2xl font-bold text-text-main">৳{user.walletBalance.toLocaleString()}</div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-pastel-purple flex items-center justify-center text-primary"><TrendingUp size={20} /></div>
                        <span className="text-sm text-text-secondary">Earnings</span>
                    </div>
                    <div className="font-display text-2xl font-bold text-text-main">৳{totalEarnings.toLocaleString()}</div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-pastel-pink flex items-center justify-center text-accent"><ShoppingBag size={20} /></div>
                        <span className="text-sm text-text-secondary">Purchases</span>
                    </div>
                    <div className="font-display text-2xl font-bold text-text-main">{purchases.length}</div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-pastel-peach flex items-center justify-center text-warning"><Upload size={20} /></div>
                        <span className="text-sm text-text-secondary">Uploads</span>
                    </div>
                    <div className="font-display text-2xl font-bold text-text-main">{uploadedNotes.length}</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 mb-8 flex-wrap">
                <Link href="/sell" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"><Plus size={16} /> Upload Note</Link>
                <Link href="/add-balance" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent text-text-secondary border-2 border-border hover:bg-pastel-purple transition-all"><Wallet size={16} /> Add Balance</Link>
                <Link href="/notes" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent text-text-secondary border-2 border-border hover:bg-pastel-purple transition-all"><Eye size={16} /> Browse Notes</Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-surface border border-border rounded-xl p-1 max-w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                            activeTab === tab.id ? "bg-gradient-to-br from-accent to-primary text-white shadow-sm" : "text-text-secondary hover:text-text-main hover:bg-pastel-purple"
                        }`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Purchases */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h3 className="font-display text-lg font-bold text-text-main mb-4 flex items-center gap-2"><ShoppingBag size={18} className="text-accent" /> Recent Purchases</h3>
                            {purchases.length > 0 ? (
                                <div className="space-y-3">
                                    {purchases.slice(0, 5).map((p: Purchase) => (
                                        <Link key={p._id} href={`/notes/${p._id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-pastel-purple transition-all">
                                            <div>
                                                <div className="font-semibold text-sm text-text-main">{p.title}</div>
                                                <div className="text-xs text-text-muted">{p.subject}</div>
                                            </div>
                                            <span className="text-sm font-bold text-accent-dark">৳{p.price}</span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-muted py-4 text-center">No purchases yet</p>
                            )}
                        </div>

                        {/* Recent Uploads */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h3 className="font-display text-lg font-bold text-text-main mb-4 flex items-center gap-2"><Upload size={18} className="text-primary" /> Recent Uploads</h3>
                            {uploadedNotes.length > 0 ? (
                                <div className="space-y-3">
                                    {uploadedNotes.slice(0, 5).map((n: UploadedNote) => (
                                        <div key={n._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-pastel-purple transition-all">
                                            <div>
                                                <div className="font-semibold text-sm text-text-main">{n.title}</div>
                                                <div className="text-xs text-text-muted">{n.subject} · {n.purchaseCount || 0} sales</div>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                n.status === "Approved" ? "bg-success-light text-success-dark" : n.status === "Pending" ? "bg-pastel-peach text-warning" : "bg-danger/10 text-danger"
                                            }`}>{n.status}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-muted py-4 text-center">No uploads yet</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "purchases" && (
                    <div className="bg-surface border border-border rounded-2xl p-6">
                        <h3 className="font-display text-lg font-bold text-text-main mb-4">All Purchases</h3>
                        {purchases.length > 0 ? (
                            <div className="space-y-3">
                                {purchases.map((p: Purchase) => (
                                    <Link key={p._id} href={`/notes/${p._id}`} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-pastel-purple hover:border-accent-light/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-pastel-pink flex items-center justify-center text-accent"><FileText size={18} /></div>
                                            <div>
                                                <div className="font-semibold text-text-main">{p.title}</div>
                                                <div className="text-xs text-text-muted">{p.subject} · by {p.uploader?.name || "Unknown"}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-accent-dark">৳{p.price}</div>
                                            <div className="text-xs text-text-muted">{new Date(p.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ShoppingBag size={48} className="text-text-muted mx-auto mb-4" />
                                <p className="text-text-secondary mb-4">You haven&apos;t purchased any notes yet</p>
                                <Link href="/notes" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark">Browse Notes <ArrowRight size={16} /></Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "uploads" && (
                    <div className="bg-surface border border-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display text-lg font-bold text-text-main">My Notes</h3>
                            <Link href="/sell" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-dark"><Plus size={16} /> Upload New</Link>
                        </div>
                        {uploadedNotes.length > 0 ? (
                            <div className="space-y-3">
                                {uploadedNotes.map((n: UploadedNote) => (
                                    <div key={n._id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-pastel-purple transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-pastel-purple flex items-center justify-center text-primary"><FileText size={18} /></div>
                                            <div>
                                                <div className="font-semibold text-text-main">{n.title}</div>
                                                <div className="text-xs text-text-muted">{n.subject} · ৳{n.price} · {n.purchaseCount || 0} sales</div>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                            n.status === "Approved" ? "bg-success-light text-success-dark" : n.status === "Pending" ? "bg-pastel-peach text-warning" : "bg-danger/10 text-danger"
                                        }`}>{n.status}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Upload size={48} className="text-text-muted mx-auto mb-4" />
                                <p className="text-text-secondary mb-4">You haven&apos;t uploaded any notes yet</p>
                                <Link href="/sell" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark">Start Selling <ArrowRight size={16} /></Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "submissions" && (
                    <div className="bg-surface border border-border rounded-2xl p-6">
                        <h3 className="font-display text-lg font-bold text-text-main mb-4">Submission History</h3>
                        {submissions.length > 0 ? (
                            <div className="space-y-3">
                                {submissions.map((s: SubmissionItem) => (
                                    <div key={s._id} className="p-4 rounded-xl border border-border hover:bg-pastel-purple transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-text-main">{s.noteId?.title || "Unknown Note"}</div>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 ${
                                                s.status === "Approved" ? "bg-success-light text-success-dark" : s.status === "Pending" ? "bg-pastel-peach text-warning" : "bg-danger/10 text-danger"
                                            }`}>
                                                {s.status === "Approved" ? <CheckCircle size={12} /> : s.status === "Pending" ? <Clock size={12} /> : <XCircle size={12} />}
                                                {s.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-text-muted">Submitted {new Date(s.submittedAt).toLocaleDateString()}</div>
                                        {s.adminFeedback && <div className="mt-2 text-sm text-text-secondary bg-pastel-purple rounded-lg p-3">{s.adminFeedback}</div>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Package size={48} className="text-text-muted mx-auto mb-4" />
                                <p className="text-text-secondary">No submissions yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

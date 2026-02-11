"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, ShoppingBag, DollarSign, FileText, Sparkles, ArrowRight, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState("purchases");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/user/dashboard");
                const json = await res.json();
                if (res.ok) setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        if (status === "authenticated") fetchData();
    }, [status]);

    if (status === "unauthenticated") {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-8 text-center animate-fade-in-up">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="font-display text-xl font-semibold text-text-secondary mb-2">Sign in Required</h2>
                <p className="text-sm text-text-muted mb-4">Please sign in to view your dashboard.</p>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">Sign In</Link>
            </div>
        );
    }

    if (loading || !data) {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-8 animate-fade-in">
                <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer h-8 w-52 rounded-lg mb-8" />
                <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4 mb-8">
                    {[...Array(3)].map((_, i) => <div key={i} className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer h-28 rounded-xl" />)}
                </div>
                <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer h-64 rounded-xl" />
            </div>
        );
    }

    const user = data.user;
    const tabs = [
        { key: "purchases", label: "My Purchases", icon: <ShoppingBag size={16} /> },
        { key: "earnings", label: "My Earnings", icon: <DollarSign size={16} /> },
        { key: "submissions", label: "My Submissions", icon: <FileText size={16} /> },
    ];

    function getStatusBadge(statusVal) {
        const map = {
            approved: { bg: "bg-success-light", text: "text-success-dark", label: "Approved" },
            pending: { bg: "bg-pastel-yellow", text: "text-warning", label: "Pending" },
            rejected: { bg: "bg-danger/10", text: "text-danger", label: "Rejected" },
        };
        const s = map[statusVal] || map.pending;
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>;
    }

    return (
        <div className="max-w-[1280px] mx-auto px-6 py-8">
            <div className="mb-8 animate-fade-in-up">
                <h1 className="font-display text-3xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent mb-2">Dashboard</h1>
                <p className="text-base text-text-secondary">Welcome back, {user?.name || session?.user?.name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4 mb-8 animate-fade-in-up">
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-card text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Wallet Balance</div>
                    <div className="font-display text-2xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent animate-count-up">৳{new Intl.NumberFormat("en-BD").format(user?.walletBalance || 0)}</div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-card text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Total Purchases</div>
                    <div className="font-display text-2xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent animate-count-up">{data.purchases?.length || 0}</div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-card text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Total Earned</div>
                    <div className="font-display text-2xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent animate-count-up">৳{new Intl.NumberFormat("en-BD").format(data.earnings?.reduce((sum, e) => sum + e.amount, 0) || 0)}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface border border-border rounded-xl w-fit p-1 mb-6 animate-fade-in">
                {tabs.map((tab) => (
                    <button key={tab.key} className={`flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer border-none transition-all duration-150 ${activeTab === tab.key ? "bg-gradient-to-br from-primary to-accent text-white shadow-sm" : "text-text-secondary hover:bg-pastel-purple hover:text-primary"}`} onClick={() => setActiveTab(tab.key)}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Purchases Tab */}
            {activeTab === "purchases" && (
                <div className="animate-fade-in">
                    {data.purchases?.length > 0 ? (
                        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-pastel-purple/50">
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Note</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Subject</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Price</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Date</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.purchases.map((purchase) => (
                                            <tr key={purchase._id} className="border-t border-border hover:bg-surface-hover transition-colors">
                                                <td className="px-5 py-3.5 text-sm font-medium text-text-main">
                                                    <Link href={`/notes/${purchase.noteId?._id || purchase.noteId}`} className="text-accent-dark hover:underline">{purchase.noteId?.title || "Untitled"}</Link>
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-text-secondary">{purchase.noteId?.subject || "—"}</td>
                                                <td className="px-5 py-3.5 text-sm font-semibold text-text-main">৳{purchase.amount}</td>
                                                <td className="px-5 py-3.5 text-sm text-text-muted">{new Date(purchase.createdAt).toLocaleDateString()}</td>
                                                <td className="px-5 py-3.5">
                                                    {purchase.noteId?.fileUrl && (
                                                        <a href={purchase.noteId.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent-dark">
                                                            <Download size={14} /> Download
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 animate-fade-in">
                            <div className="text-6xl mb-4 animate-float"><ShoppingBag size={48} className="mx-auto text-text-muted" /></div>
                            <h3 className="font-display text-xl font-semibold text-text-secondary mb-2">No purchases yet</h3>
                            <p className="text-sm text-text-muted mb-4">Start exploring the marketplace to find quality notes.</p>
                            <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-accent-dark hover:underline">Browse Notes <ArrowRight size={14} /></Link>
                        </div>
                    )}
                </div>
            )}

            {/* Earnings Tab */}
            {activeTab === "earnings" && (
                <div className="animate-fade-in">
                    {data.earnings?.length > 0 ? (
                        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-pastel-purple/50">
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Note</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Buyer</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Earned</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.earnings.map((earning) => (
                                            <tr key={earning._id} className="border-t border-border hover:bg-surface-hover transition-colors">
                                                <td className="px-5 py-3.5 text-sm font-medium text-text-main">{earning.noteId?.title || "Untitled"}</td>
                                                <td className="px-5 py-3.5 text-sm text-text-secondary">{earning.buyerId?.name || "Anonymous"}</td>
                                                <td className="px-5 py-3.5 text-sm font-semibold text-success-dark">৳{earning.amount}</td>
                                                <td className="px-5 py-3.5 text-sm text-text-muted">{new Date(earning.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 animate-fade-in">
                            <div className="text-6xl mb-4 animate-float"><Sparkles size={48} className="mx-auto text-text-muted" /></div>
                            <h3 className="font-display text-xl font-semibold text-text-secondary mb-2">No earnings yet</h3>
                            <p className="text-sm text-text-muted mb-4">Start selling notes to earn money!</p>
                            <Link href="/sell" className="inline-flex items-center gap-1 text-sm font-semibold text-accent-dark hover:underline">Sell Notes <ArrowRight size={14} /></Link>
                        </div>
                    )}
                </div>
            )}

            {/* Submissions Tab */}
            {activeTab === "submissions" && (
                <div className="animate-fade-in">
                    {data.submissions?.length > 0 ? (
                        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-pastel-purple/50">
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Title</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Subject</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Price</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Status</th>
                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Sales</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.submissions.map((note) => (
                                            <tr key={note._id} className="border-t border-border hover:bg-surface-hover transition-colors">
                                                <td className="px-5 py-3.5 text-sm font-medium text-text-main">{note.title}</td>
                                                <td className="px-5 py-3.5 text-sm text-text-secondary">{note.subject}</td>
                                                <td className="px-5 py-3.5 text-sm font-semibold text-text-main">৳{note.price}</td>
                                                <td className="px-5 py-3.5">{getStatusBadge(note.status)}</td>
                                                <td className="px-5 py-3.5 text-sm text-text-muted">{note.purchaseCount || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 animate-fade-in">
                            <div className="text-6xl mb-4 animate-float"><FileText size={48} className="mx-auto text-text-muted" /></div>
                            <h3 className="font-display text-xl font-semibold text-text-secondary mb-2">No submissions yet</h3>
                            <p className="text-sm text-text-muted mb-4">Upload your first note and start earning!</p>
                            <Link href="/sell" className="inline-flex items-center gap-1 text-sm font-semibold text-accent-dark hover:underline">Upload Note <ArrowRight size={14} /></Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

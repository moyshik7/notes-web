"use client";

import { useState } from "react";
import { Check, X, CheckCircle, CreditCard, Circle } from "lucide-react";

interface AdminNote {
    _id: string;
    title: string;
    description?: string;
    topics?: string[];
    subject: string;
    price: number;
    preview?: string;
    images?: string[];
    createdAt: string;
    uploader?: {
        name?: string;
        email?: string;
    };
}

interface AdminBalanceRequest {
    _id: string;
    amount: number;
    method: string;
    transactionId: string;
    createdAt: string;
    user?: {
        name?: string;
        email?: string;
    };
}

interface AdminStats {
    totalRevenue?: number;
    platformRevenue?: number;
    totalNotes?: number;
    totalTransactions?: number;
    pendingCount?: number;
    pendingBalanceCount?: number;
    approvedCount?: number;
    rejectedCount?: number;
}

interface AdminData {
    stats?: AdminStats;
    pendingNotes?: AdminNote[];
    pendingBalanceRequests?: AdminBalanceRequest[];
}

interface ReviewModal {
    note: AdminNote;
    action: "Approved" | "Rejected";
}

interface AdminDashboardProps {
    initialData: AdminData;
}

export default function AdminDashboard({ initialData }: AdminDashboardProps) {
    const [data, setData] = useState<AdminData>(initialData);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [balanceActionLoading, setBalanceActionLoading] = useState<string | null>(null);
    const [reviewModal, setReviewModal] = useState<ReviewModal | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [imageUrls, setImageUrls] = useState("");

    async function fetchStats() {
        try {
            const res = await fetch("/api/admin/stats");
            const result = await res.json();
            if (res.ok) setData(result);
        } catch (error) {
            console.error("Failed to load admin stats:", error);
        }
    }

    function openReviewModal(note: AdminNote, action: "Approved" | "Rejected") {
        setReviewModal({ note, action });
        setPreviewUrl(note.preview || "");
        setImageUrls((note.images || []).join("\n"));
    }

    function closeReviewModal() {
        setReviewModal(null);
        setPreviewUrl("");
        setImageUrls("");
    }

    async function handleAction(noteId: string, action: string, feedback: string = "", preview: string = "", images: string[] = []) {
        setActionLoading(noteId);
        try {
            const res = await fetch(`/api/admin/notes/${noteId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: action, feedback, preview, images }),
            });
            if (res.ok) { await fetchStats(); closeReviewModal(); }
            else { const err = await res.json(); alert(err.error || "Action failed"); }
        } catch { alert("Failed to update note"); }
        finally { setActionLoading(null); }
    }

    async function handleBalanceAction(requestId: string, action: string) {
        setBalanceActionLoading(requestId);
        try {
            const adminNote = action === "Rejected" ? prompt("Rejection reason (optional):") : "";
            const res = await fetch(`/api/admin/balance-requests/${requestId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: action, adminNote: adminNote || "" }),
            });
            if (res.ok) await fetchStats();
            else { const err = await res.json(); alert(err.error || "Action failed"); }
        } catch { alert("Failed to update balance request"); }
        finally { setBalanceActionLoading(null); }
    }

    function submitReview() {
        if (!reviewModal) return;
        const { note, action } = reviewModal;
        const feedback = action === "Rejected" ? prompt("Rejection reason (optional):") : "";
        const parsedImages = imageUrls.split("\n").map(url => url.trim()).filter(url => url.length > 0);
        handleAction(note._id, action, feedback || "", previewUrl.trim(), parsedImages);
    }

    return (
        <div className="max-w-[1280px] mx-auto px-6 py-8">
            <div className="mb-8 animate-fade-in-up">
                <h1 className="font-display text-3xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
                <p className="text-base text-text-secondary">Platform overview and note approvals</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4 mb-8 animate-fade-in-up">
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-card text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Total Revenue</div>
                    <div className="font-display text-2xl font-extrabold text-accent-dark animate-count-up">৳{new Intl.NumberFormat("en-BD").format(data.stats?.totalRevenue || 0)}</div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-card text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Platform Revenue (10%)</div>
                    <div className="font-display text-2xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent animate-count-up">৳{new Intl.NumberFormat("en-BD").format(data.stats?.platformRevenue || 0)}</div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-card text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Total Notes</div>
                    <div className="font-display text-2xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent animate-count-up">{data.stats?.totalNotes || 0}</div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-card text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Total Transactions</div>
                    <div className="font-display text-2xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent animate-count-up">{data.stats?.totalTransactions || 0}</div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-card text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Pending Note Approvals</div>
                    <div className="font-display text-2xl font-extrabold text-warning animate-count-up">{data.stats?.pendingCount || 0}</div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-card text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Pending Balance Requests</div>
                    <div className="font-display text-2xl font-extrabold text-warning animate-count-up">{data.stats?.pendingBalanceCount || 0}</div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-card text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Approved</div>
                    <div className="font-display text-2xl font-extrabold text-success animate-count-up">{data.stats?.approvedCount || 0}</div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-card text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                    <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">Rejected</div>
                    <div className="font-display text-2xl font-extrabold text-danger animate-count-up">{data.stats?.rejectedCount || 0}</div>
                </div>
            </div>

            {/* Pending Notes */}
            <div className="mt-4 mb-6">
                <h2 className="font-display text-2xl font-bold text-text-main">Pending Approvals</h2>
            </div>

            {(data.pendingNotes?.length ?? 0) > 0 ? (
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-pastel-purple/50">
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Title</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Topics</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Subject</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Price</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Uploader</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Submitted</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.pendingNotes!.map((note) => (
                                    <tr key={note._id} className="border-t border-border hover:bg-surface-hover transition-colors">
                                        <td className="px-5 py-3.5">
                                            <strong className="text-sm text-text-main">{note.title}</strong>
                                            <br />
                                            <span className="text-xs text-text-muted">{note.description?.substring(0, 80)}...</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-text-secondary">{(note.topics || []).join(", ")}</td>
                                        <td className="px-5 py-3.5 text-sm text-text-secondary">{note.subject}</td>
                                        <td className="px-5 py-3.5 text-sm font-semibold text-text-main">৳{note.price}</td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm text-text-main">{note.uploader?.name}</span>
                                            <br />
                                            <span className="text-[0.7rem] text-text-muted">{note.uploader?.email}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-text-muted">{new Date(note.createdAt).toLocaleDateString("en-BD")}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex gap-1">
                                                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-success text-white hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50" onClick={() => openReviewModal(note, "Approved")} disabled={actionLoading === note._id}>
                                                    <Check size={14} /> Approve
                                                </button>
                                                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger text-white hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50" onClick={() => openReviewModal(note, "Rejected")} disabled={actionLoading === note._id}>
                                                    <X size={14} /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 animate-fade-in mb-8">
                    <div className="text-6xl mb-4"><CheckCircle size={48} className="mx-auto text-success" /></div>
                    <h3 className="font-display text-xl font-semibold text-text-secondary mb-2">All caught up!</h3>
                    <p className="text-sm text-text-muted">No notes pending approval.</p>
                </div>
            )}

            {/* Pending Balance Requests */}
            <div className="mt-8 mb-6">
                <h2 className="font-display text-2xl font-bold text-text-main">
                    <CreditCard size={20} className="inline align-middle" /> Pending Balance Requests
                </h2>
            </div>

            {(data.pendingBalanceRequests?.length ?? 0) > 0 ? (
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-pastel-purple/50">
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">User</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Method</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Amount</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Transaction ID</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Submitted</th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.pendingBalanceRequests!.map((req) => (
                                    <tr key={req._id} className="border-t border-border hover:bg-surface-hover transition-colors">
                                        <td className="px-5 py-3.5">
                                            <strong className="text-sm text-text-main">{req.user?.name || "Unknown"}</strong>
                                            <br />
                                            <span className="text-[0.7rem] text-text-muted">{req.user?.email || "N/A"}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${req.method === "bkash" ? "bg-[#FDF0F5] text-[#E2136E]" : "bg-[#FFF7ED] text-[#F6921E]"}`}>
                                                <Circle size={12} fill={req.method === "bkash" ? "#E2136E" : "#F6921E"} stroke={req.method === "bkash" ? "#E2136E" : "#F6921E"} /> {req.method}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-semibold text-text-main">৳{new Intl.NumberFormat("en-BD").format(req.amount)}</td>
                                        <td className="px-5 py-3.5">
                                            <code className="bg-pastel-purple px-2 py-0.5 rounded-lg text-[0.85rem]">{req.transactionId}</code>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-text-muted">{new Date(req.createdAt).toLocaleDateString("en-BD")}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex gap-1">
                                                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-success text-white hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50" onClick={() => handleBalanceAction(req._id, "Approved")} disabled={balanceActionLoading === req._id}>
                                                    {balanceActionLoading === req._id ? "..." : <><Check size={14} /> Approve</>}
                                                </button>
                                                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger text-white hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50" onClick={() => handleBalanceAction(req._id, "Rejected")} disabled={balanceActionLoading === req._id}>
                                                    {balanceActionLoading === req._id ? "..." : <><X size={14} /> Reject</>}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 animate-fade-in">
                    <div className="text-6xl mb-4"><CreditCard size={48} className="mx-auto text-text-muted" /></div>
                    <h3 className="font-display text-xl font-semibold text-text-secondary mb-2">No pending requests</h3>
                    <p className="text-sm text-text-muted">All balance requests have been processed.</p>
                </div>
            )}

            {/* Review Modal */}
            {reviewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={closeReviewModal}>
                    <div className="bg-surface rounded-2xl p-8 max-w-[600px] w-full max-h-[90vh] overflow-auto shadow-xl animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                        <h2 className="font-display text-2xl font-bold text-text-main mb-4">
                            {reviewModal.action === "Approved" ? <><Check size={20} className="inline align-middle" /> Approve Note</> : <><X size={20} className="inline align-middle" /> Reject Note</>}
                        </h2>

                        <div className="bg-pastel-purple rounded-xl p-4 mb-6">
                            <h3 className="text-lg font-semibold text-text-main mb-1">{reviewModal.note.title}</h3>
                            <p className="text-sm text-text-secondary">{reviewModal.note.description?.substring(0, 150)}...</p>
                        </div>

                        {reviewModal.action === "Approved" && (
                            <>
                                <div className="mb-5">
                                    <label className="block text-sm font-semibold text-text-main mb-1.5">
                                        Preview Image URL <span className="text-text-muted font-normal">(for cover, OG, Twitter card)</span>
                                    </label>
                                    <input type="text" className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150" placeholder="https://example.com/preview.jpg" value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-text-main mb-1.5">
                                        Additional Images <span className="text-text-muted font-normal">(one URL per line)</span>
                                    </label>
                                    <textarea className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none resize-y min-h-[100px] focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150" placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"} value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} rows={4} />
                                </div>
                            </>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent text-text-secondary border-2 border-border hover:bg-pastel-purple transition-all duration-150 cursor-pointer disabled:opacity-50" onClick={closeReviewModal} disabled={actionLoading !== null}>
                                Cancel
                            </button>
                            <button className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border-none cursor-pointer transition-all duration-150 disabled:opacity-50 ${reviewModal.action === "Approved" ? "bg-success hover:opacity-90" : "bg-danger hover:opacity-90"}`} onClick={submitReview} disabled={actionLoading !== null}>
                                {actionLoading ? "Processing..." : (reviewModal.action === "Approved" ? "Approve" : "Reject")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

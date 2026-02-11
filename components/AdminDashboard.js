"use client";

import { useState } from "react";

export default function AdminDashboard({ initialData }) {
    const [data, setData] = useState(initialData);
    const [actionLoading, setActionLoading] = useState(null);
    const [reviewModal, setReviewModal] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [imageUrls, setImageUrls] = useState("");

    async function fetchStats() {
        try {
            const res = await fetch("/api/admin/stats");
            const result = await res.json();
            if (res.ok) {
                setData(result);
            }
        } catch (error) {
            console.error("Failed to load admin stats:", error);
        }
    }

    function openReviewModal(note, action) {
        setReviewModal({ note, action });
        setPreviewUrl(note.preview || "");
        setImageUrls((note.images || []).join("\n"));
    }

    function closeReviewModal() {
        setReviewModal(null);
        setPreviewUrl("");
        setImageUrls("");
    }

    async function handleAction(noteId, action, feedback = "", preview = "", images = []) {
        setActionLoading(noteId);
        try {
            const res = await fetch(`/api/admin/notes/${noteId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: action, feedback, preview, images }),
            });

            if (res.ok) {
                // Refresh data
                await fetchStats();
                closeReviewModal();
            } else {
                const err = await res.json();
                alert(err.error || "Action failed");
            }
        } catch {
            alert("Failed to update note");
        } finally {
            setActionLoading(null);
        }
    }

    function submitReview() {
        if (!reviewModal) return;
        
        const { note, action } = reviewModal;
        const feedback = action === "Rejected" ? prompt("Rejection reason (optional):") : "";
        
        // Parse image URLs from textarea (one per line)
        const parsedImages = imageUrls
            .split("\n")
            .map(url => url.trim())
            .filter(url => url.length > 0);

        handleAction(note._id, action, feedback || "", previewUrl.trim(), parsedImages);
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">Platform overview and note approvals</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value accent">৳{new Intl.NumberFormat("en-BD").format(data.stats?.totalRevenue || 0)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Platform Revenue (10%)</div>
                    <div className="stat-value">৳{new Intl.NumberFormat("en-BD").format(data.stats?.platformRevenue || 0)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Notes</div>
                    <div className="stat-value">{data.stats?.totalNotes || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Pending Approvals</div>
                    <div className="stat-value" style={{ color: "var(--color-warning)" }}>
                        {data.stats?.pendingCount || 0}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Approved</div>
                    <div className="stat-value" style={{ color: "var(--color-approved)" }}>
                        {data.stats?.approvedCount || 0}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Rejected</div>
                    <div className="stat-value" style={{ color: "var(--color-rejected)" }}>
                        {data.stats?.rejectedCount || 0}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Transactions</div>
                    <div className="stat-value">{data.stats?.totalTransactions || 0}</div>
                </div>
            </div>

            {/* Pending Notes */}
            <div className="page-header" style={{ marginTop: "1rem" }}>
                <h2 className="page-title" style={{ fontSize: "1.5rem" }}>
                    Pending Approvals
                </h2>
            </div>

            {data.pendingNotes?.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Topics</th>
                                <th>Subject</th>
                                <th>Price</th>
                                <th>Uploader</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.pendingNotes.map((note) => (
                                <tr key={note._id}>
                                    <td>
                                        <strong>{note.title}</strong>
                                        <br />
                                        <span
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "var(--color-text-muted)",
                                            }}
                                        >
                                            {note.description?.substring(0, 80)}...
                                        </span>
                                    </td>
                                    <td>{(note.topics || []).join(", ")}</td>
                                    <td>{note.subject}</td>
                                    <td>৳{note.price}</td>
                                    <td>
                                        {note.uploader?.name}
                                        <br />
                                        <span
                                            style={{
                                                fontSize: "0.7rem",
                                                color: "var(--color-text-muted)",
                                            }}
                                        >
                                            {note.uploader?.email}
                                        </span>
                                    </td>
                                    <td>{new Date(note.createdAt).toLocaleDateString("en-BD")}</td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button 
                                                className="btn btn-success btn-sm" 
                                                onClick={() => openReviewModal(note, "Approved")} 
                                                disabled={actionLoading === note._id}
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => openReviewModal(note, "Rejected")}
                                                disabled={actionLoading === note._id}
                                            >
                                                ✕ Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">✅</div>
                    <h3 className="empty-state-title">All caught up!</h3>
                    <p className="empty-state-text">No notes pending approval.</p>
                </div>
            )}

            {/* Review Modal */}
            {reviewModal && (
                <div 
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "1rem",
                    }}
                    onClick={closeReviewModal}
                >
                    <div 
                        style={{
                            background: "var(--color-surface)",
                            borderRadius: "16px",
                            padding: "2rem",
                            maxWidth: "600px",
                            width: "100%",
                            maxHeight: "90vh",
                            overflow: "auto",
                            boxShadow: "var(--shadow-xl)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
                            {reviewModal.action === "Approved" ? "✓ Approve Note" : "✕ Reject Note"}
                        </h2>
                        
                        <div style={{ 
                            background: "var(--pastel-purple)", 
                            padding: "1rem", 
                            borderRadius: "12px", 
                            marginBottom: "1.5rem" 
                        }}>
                            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                                {reviewModal.note.title}
                            </h3>
                            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                {reviewModal.note.description?.substring(0, 150)}...
                            </p>
                        </div>

                        {reviewModal.action === "Approved" && (
                            <>
                                <div style={{ marginBottom: "1.25rem" }}>
                                    <label style={{ 
                                        display: "block", 
                                        marginBottom: "0.5rem",
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                    }}>
                                        Preview Image URL
                                        <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
                                            {" "}(for cover, OG, Twitter card)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="https://example.com/preview.jpg"
                                        value={previewUrl}
                                        onChange={(e) => setPreviewUrl(e.target.value)}
                                    />
                                </div>

                                <div style={{ marginBottom: "1.5rem" }}>
                                    <label style={{ 
                                        display: "block", 
                                        marginBottom: "0.5rem",
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                    }}>
                                        Additional Images
                                        <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
                                            {" "}(one URL per line)
                                        </span>
                                    </label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                                        value={imageUrls}
                                        onChange={(e) => setImageUrls(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </>
                        )}

                        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                            <button 
                                className="btn btn-secondary"
                                onClick={closeReviewModal}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                className={`btn ${reviewModal.action === "Approved" ? "btn-success" : "btn-danger"}`}
                                onClick={submitReview}
                                disabled={actionLoading}
                            >
                                {actionLoading ? "Processing..." : (reviewModal.action === "Approved" ? "Approve" : "Reject")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

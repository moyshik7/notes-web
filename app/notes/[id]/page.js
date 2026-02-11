/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flower2, ArrowLeft, FileText, Lock, Tag, BookOpen, User, Heart, CheckCircle, Download, CreditCard, FileType, Unlock, Coins, Camera } from "lucide-react";

export default function NoteDetailPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);

    // Update meta tags for social sharing
    const updateMetaTags = (note) => {
        if (!note.preview) return;

        const metaTags = [
            { property: "og:title", content: note.title },
            { property: "og:description", content: note.description },
            { property: "og:image", content: note.preview },
            { property: "og:type", content: "product" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: note.title },
            { name: "twitter:description", content: note.description },
            { name: "twitter:image", content: note.preview },
        ];

        metaTags.forEach(({ property, name, content }) => {
            const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
            let meta = document.querySelector(selector);
            
            if (!meta) {
                meta = document.createElement("meta");
                if (property) meta.setAttribute("property", property);
                if (name) meta.setAttribute("name", name);
                document.head.appendChild(meta);
            }
            
            meta.setAttribute("content", content);
        });
    };

    const fetchNote = useCallback(async () => {
        try {
            const res = await fetch(`/api/notes/${id}`);
            const data = await res.json();
            if (res.ok) {
                setNote(data.note);
                // Update page title and meta tags for SEO
                document.title = `${data.note.title} — NoteNibo`;
                
                // Update OG and Twitter meta tags
                updateMetaTags(data.note);
            } else {
                setError(data.error || "Note not found");
            }
        } catch {
            setError("Failed to load note");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchNote();
    }, [fetchNote]);

    useEffect(() => {
        // Check if user has purchased this note
        async function checkPurchase() {
            try {
                const res = await fetch("/api/user/dashboard");
                const data = await res.json();
                if (res.ok && data.purchases) {
                    const isPurchased = data.purchases.some((p) => p._id === id);
                    setPurchased(isPurchased);
                }
            } catch {
                // Silently fail
            }
        }

        if (session?.user?.id && note) {
            checkPurchase();
        }
    }, [session, note, id]);

    async function handleBuy() {
        if (authStatus !== "authenticated") {
            router.push("/login");
            return;
        }

        setBuying(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`/api/notes/${id}/buy`, {
                method: "POST",
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess("Purchase successful! Your note is ready to download.");
                setPurchased(true);
                
                // Refresh note data to show updated purchase count
                await fetchNote();
                
                // Auto-clear success message after 5 seconds
                setTimeout(() => setSuccess(""), 5000);
            } else if (res.status === 402) {
                // Insufficient balance
                setShowInsufficientBalanceModal(true);
            } else {
                setError(data.error || "Purchase failed");
            }
        } catch {
            setError("Failed to process purchase");
        } finally {
            setBuying(false);
        }
    }

    async function handleDownload() {
        try {
            const res = await fetch(`/api/notes/${id}/download`);
            const data = await res.json();
            if (res.ok && data.downloadUrl) {
                window.open(data.downloadUrl, "_blank");
            } else {
                alert(data.error || "Failed to get download link");
            }
        } catch {
            alert("Failed to download");
        }
    }

    if (loading) {
        return (
            <div className="page-container">
                <div className="skeleton" style={{ width: 160, height: 16, marginBottom: 24 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2rem" }}>
                    <div>
                        <div className="skeleton" style={{ width: "100%", height: 400, borderRadius: 16, marginBottom: 16 }} />
                        <div className="skeleton" style={{ width: "60%", height: 28, marginBottom: 12 }} />
                        <div className="skeleton" style={{ width: "100%", height: 16, marginBottom: 8 }} />
                        <div className="skeleton" style={{ width: "80%", height: 16 }} />
                    </div>
                    <div className="skeleton" style={{ width: "100%", height: 280, borderRadius: 16 }} />
                </div>
            </div>
        );
    }

    if (error && !note) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-state-icon"><Flower2 size={48} /></div>
                    <h3 className="empty-state-title">{error}</h3>
                    <Link href="/" className="btn btn-primary mt-2">
                        Back to Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    if (!note) return null;

    const isOwner = session?.user?.id === note.uploader?._id;

    return (
        <div className="page-container">
            {/* JSON-LD Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        name: note.title,
                        description: note.description,
                        ...(note.preview && { image: note.preview }),
                        offers: {
                            "@type": "Offer",
                            priceCurrency: "BDT",
                            price: note.price,
                            availability: "https://schema.org/InStock",
                        },
                        category: note.subject,
                        keywords: (note.topics || []).join(", "),
                    }),
                }}
            />

            <Link
                href="/"
                style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "999px",
                    background: "var(--pastel-purple)",
                    border: "1px solid var(--color-border)",
                    transition: "all 0.2s ease",
                }}
            >
                <ArrowLeft size={16} /> Back to Marketplace
            </Link>

            <div className="note-detail">
                {/* Main Content */}
                <div className="note-detail-main">
                    {/* Preview Area */}
                    <div className="note-preview">
                        {note.preview ? (
                            <img 
                                src={note.preview} 
                                alt={note.title}
                                style={{
                                    width: "100%",
                                    height: "400px",
                                    objectFit: "cover",
                                    borderRadius: "12px",
                                    marginBottom: "1rem",
                                }}
                            />
                        ) : (
                            <div style={{ textAlign: "center", padding: "4rem 0" }}>
                                <div style={{ fontSize: "4rem", marginBottom: "1rem", animation: "float 3s ease-in-out infinite" }}><FileText size={64} /></div>
                                <p style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>PDF Preview</p>
                            </div>
                        )}
                        {!purchased && !isOwner && (
                            <div className="note-preview-overlay">
                                <span className="note-preview-overlay-text"><Lock size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Purchase to view full content</span>
                            </div>
                        )}
                    </div>

                    {/* Note Info */}
                    <div className="note-detail-info">
                        <h1 className="note-detail-title">{note.title}</h1>

                        <div className="note-detail-meta">
                            <span className="note-detail-meta-item"><Tag size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {(note.topics || []).join(", ")}</span>
                            <span className="note-detail-meta-item"><BookOpen size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {note.subject}</span>
                            <span className="note-detail-meta-item"><User size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {note.uploader?.name || "Anonymous"}</span>
                            {note.purchaseCount > 0 && <span className="note-detail-meta-item"><Heart size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {note.purchaseCount} purchases</span>}
                        </div>

                        <p className="note-detail-description">{note.description}</p>

                        {/* Additional Images Gallery */}
                        {note.images && note.images.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg mb-4 text-center text-[var(--color-text-secondary)]">
                                    <Camera size={18} style={{ display: "inline", verticalAlign: "middle" }} /> Preview Images
                                </h3>
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                                    {note.images.map((imageUrl, index) => (
                                        <img 
                                            key={index}
                                            src={imageUrl} 
                                            alt={`${note.title} - Image ${index + 1}`}
                                            className="w-full h-[200px] object-cover rounded-xl border border-[var(--color-border)] cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-[var(--shadow-md)]"
                                            onClick={() => window.open(imageUrl, "_blank")}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar — Purchase Card */}
                <div className="note-detail-sidebar">
                    <div className="note-purchase-card">
                        {purchased && (
                            <div style={{
                                background: "var(--color-success-light)",
                                padding: "0.75rem 1rem",
                                borderRadius: "12px",
                                marginBottom: "1rem",
                                textAlign: "center",
                                fontWeight: 600,
                                color: "var(--color-success-dark)",
                                fontSize: "0.875rem",
                            }}>
                                <CheckCircle size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Already Purchased
                            </div>
                        )}
                        
                        <div className="note-purchase-price">৳{new Intl.NumberFormat("en-BD").format(note.price)}</div>
                        <div className="note-purchase-price-label">One-time purchase · Lifetime access</div>

                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        {purchased ? (
                            <button onClick={handleDownload} className="btn btn-primary btn-block btn-lg">
                                <Download size={18} style={{ display: "inline", verticalAlign: "middle" }} /> Download Full PDF
                            </button>
                        ) : isOwner ? (
                            <div className="disclaimer" style={{ textAlign: "center", padding: "0.75rem" }}>
                                This is your note
                            </div>
                        ) : (
                            <button onClick={handleBuy} disabled={buying} className="btn btn-primary btn-block btn-lg">
                                {buying ? "Processing..." : <><CreditCard size={18} style={{ display: "inline", verticalAlign: "middle" }} /> Buy Now</>}
                            </button>
                        )}

                        <div
                            style={{
                                marginTop: "1.25rem",
                                paddingTop: "1.25rem",
                                borderTop: "1px dashed var(--color-border)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "0.8rem",
                                    color: "var(--color-text-muted)",
                                    marginBottom: "0.625rem",
                                    padding: "0.25rem 0",
                                }}
                            >
                                <span><FileType size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Format</span>
                                <span style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>PDF</span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "0.8rem",
                                    color: "var(--color-text-muted)",
                                    marginBottom: "0.625rem",
                                    padding: "0.25rem 0",
                                }}
                            >
                                <span><Unlock size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Access</span>
                                <span style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>Lifetime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insufficient Balance Modal */}
            {showInsufficientBalanceModal && (
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
                    onClick={() => setShowInsufficientBalanceModal(false)}
                >
                    <div 
                        style={{
                            background: "var(--color-surface)",
                            borderRadius: "16px",
                            padding: "2rem",
                            maxWidth: "450px",
                            width: "100%",
                            boxShadow: "var(--shadow-xl)",
                            textAlign: "center",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}><Coins size={64} /></div>
                        <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem", color: "var(--color-text)" }}>
                            Insufficient Balance
                        </h2>
                        <p style={{ 
                            marginBottom: "2rem", 
                            color: "var(--color-text-secondary)",
                            lineHeight: "1.6",
                        }}>
                            You don&apos;t have enough balance to purchase this note. Please add funds to your account to continue.
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setShowInsufficientBalanceModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={() => router.push("/add-balance")}
                            >
                                <CreditCard size={18} style={{ display: "inline", verticalAlign: "middle" }} /> Add Funds
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

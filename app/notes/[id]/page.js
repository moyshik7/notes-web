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
                document.title = `${data.note.title} — NoteNibo`;
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

    useEffect(() => { fetchNote(); }, [fetchNote]);

    useEffect(() => {
        async function checkPurchase() {
            try {
                const res = await fetch("/api/user/dashboard");
                const data = await res.json();
                if (res.ok && data.purchases) {
                    const isPurchased = data.purchases.some((p) => p._id === id);
                    setPurchased(isPurchased);
                }
            } catch { /* Silently fail */ }
        }
        if (session?.user?.id && note) checkPurchase();
    }, [session, note, id]);

    async function handleBuy() {
        if (authStatus !== "authenticated") { router.push("/login"); return; }
        setBuying(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`/api/notes/${id}/buy`, { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Purchase successful! Your note is ready to download.");
                setPurchased(true);
                await fetchNote();
                setTimeout(() => setSuccess(""), 5000);
            } else if (res.status === 402) {
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
            if (res.ok && data.downloadUrl) window.open(data.downloadUrl, "_blank");
            else alert(data.error || "Failed to get download link");
        } catch { alert("Failed to download"); }
    }

    if (loading) {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-8">
                <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer w-40 h-4 rounded-lg mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                    <div>
                        <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer w-full h-[400px] rounded-2xl mb-4" />
                        <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer w-3/5 h-7 rounded-lg mb-3" />
                        <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer w-full h-4 rounded-lg mb-2" />
                        <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer w-4/5 h-4 rounded-lg" />
                    </div>
                    <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer w-full h-[280px] rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error && !note) {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-8 text-center animate-fade-in-up">
                <div className="text-6xl mb-4 animate-float"><Flower2 size={48} /></div>
                <h3 className="font-display text-xl font-semibold text-text-secondary mb-2">{error}</h3>
                <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 mt-2">
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    if (!note) return null;

    const isOwner = session?.user?.id === note.uploader?._id;

    return (
        <div className="max-w-[1280px] mx-auto px-6 py-8">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        name: note.title,
                        description: note.description,
                        ...(note.preview && { image: note.preview }),
                        offers: { "@type": "Offer", priceCurrency: "BDT", price: note.price, availability: "https://schema.org/InStock" },
                        category: note.subject,
                        keywords: (note.topics || []).join(", "),
                    }),
                }}
            />

            <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary mb-6 px-4 py-2 rounded-full bg-pastel-purple border border-border hover:bg-pastel-pink hover:text-accent-dark transition-all duration-200">
                <ArrowLeft size={16} /> Back to Marketplace
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
                {/* Main Content */}
                <div>
                    {/* Preview Area */}
                    <div className="relative bg-gradient-to-b from-pastel-purple to-pastel-pink rounded-2xl overflow-hidden mb-6 border border-border">
                        {note.preview ? (
                            <img src={note.preview} alt={note.title} className="w-full h-[400px] object-cover rounded-xl" />
                        ) : (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4 animate-float"><FileText size={64} className="mx-auto text-text-muted" /></div>
                                <p className="font-semibold text-text-secondary">PDF Preview</p>
                            </div>
                        )}
                        {!purchased && !isOwner && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-6">
                                <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-text-main">
                                    <Lock size={16} className="inline align-middle" /> Purchase to view full content
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Note Info */}
                    <div>
                        <h1 className="font-display text-3xl font-extrabold text-text-main mb-4">{note.title}</h1>

                        <div className="flex flex-wrap gap-4 mb-6 text-sm text-text-secondary">
                            <span className="inline-flex items-center gap-1.5"><Tag size={14} className="text-primary" /> {(note.topics || []).join(", ")}</span>
                            <span className="inline-flex items-center gap-1.5"><BookOpen size={14} className="text-primary" /> {note.subject}</span>
                            <span className="inline-flex items-center gap-1.5"><User size={14} className="text-primary" /> {note.uploader?.name || "Anonymous"}</span>
                            {note.purchaseCount > 0 && <span className="inline-flex items-center gap-1.5"><Heart size={14} className="text-accent" /> {note.purchaseCount} purchases</span>}
                        </div>

                        <p className="text-text-secondary leading-relaxed text-[0.95rem] whitespace-pre-wrap">{note.description}</p>

                        {/* Additional Images Gallery */}
                        {note.images && note.images.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg mb-4 text-center text-text-secondary">
                                    <Camera size={18} className="inline align-middle" /> Preview Images
                                </h3>
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                                    {note.images.map((imageUrl, index) => (
                                        <img
                                            key={index}
                                            src={imageUrl}
                                            alt={`${note.title} - Image ${index + 1}`}
                                            className="w-full h-[200px] object-cover rounded-xl border border-border cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
                                            onClick={() => window.open(imageUrl, "_blank")}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar — Purchase Card */}
                <div className="sticky top-24">
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-card">
                        {purchased && (
                            <div className="bg-success-light text-success-dark px-4 py-3 rounded-xl mb-4 text-center text-sm font-semibold">
                                <CheckCircle size={16} className="inline align-middle" /> Already Purchased
                            </div>
                        )}

                        <div className="font-display text-4xl font-extrabold text-accent-dark text-center mb-1">৳{new Intl.NumberFormat("en-BD").format(note.price)}</div>
                        <div className="text-xs text-text-muted text-center mb-6">One-time purchase · Lifetime access</div>

                        {error && <div className="px-4 py-3 rounded-[10px] text-sm mb-4 bg-danger/10 text-[#c44040] border border-danger/20">{error}</div>}
                        {success && <div className="px-4 py-3 rounded-[10px] text-sm mb-4 bg-success-light text-success-dark border border-success/20">{success}</div>}

                        {purchased ? (
                            <button onClick={handleDownload} className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer border-none">
                                <Download size={18} /> Download Full PDF
                            </button>
                        ) : isOwner ? (
                            <div className="bg-pastel-peach border border-warning/40 rounded-xl p-3 text-center text-sm text-text-secondary">
                                This is your note
                            </div>
                        ) : (
                            <button onClick={handleBuy} disabled={buying} className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed">
                                {buying ? "Processing..." : <><CreditCard size={18} /> Buy Now</>}
                            </button>
                        )}

                        <div className="mt-5 pt-5 border-t border-dashed border-border">
                            <div className="flex justify-between text-[0.8rem] text-text-muted mb-2.5 py-1">
                                <span><FileType size={14} className="inline align-middle" /> Format</span>
                                <span className="font-semibold text-text-secondary">PDF</span>
                            </div>
                            <div className="flex justify-between text-[0.8rem] text-text-muted py-1">
                                <span><Unlock size={14} className="inline align-middle" /> Access</span>
                                <span className="font-semibold text-text-secondary">Lifetime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insufficient Balance Modal */}
            {showInsufficientBalanceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={() => setShowInsufficientBalanceModal(false)}>
                    <div className="bg-surface rounded-2xl p-8 max-w-[450px] w-full shadow-xl text-center animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                        <div className="text-6xl mb-4"><Coins size={64} className="mx-auto text-warning" /></div>
                        <h2 className="font-display text-2xl font-bold text-text-main mb-4">Insufficient Balance</h2>
                        <p className="text-text-secondary leading-relaxed mb-8">
                            You don&apos;t have enough balance to purchase this note. Please add funds to your account to continue.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent text-text-secondary border-2 border-border hover:bg-pastel-purple transition-all duration-150 cursor-pointer" onClick={() => setShowInsufficientBalanceModal(false)}>
                                Cancel
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer border-none" onClick={() => router.push("/add-balance")}>
                                <CreditCard size={18} /> Add Funds
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

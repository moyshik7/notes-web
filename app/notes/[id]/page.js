"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  useEffect(() => {
    fetchNote();
  }, [id]);

  useEffect(() => {
    // Check if user has purchased this note
    if (session?.user?.id && note) {
      checkPurchase();
    }
  }, [session, note]);

  async function fetchNote() {
    try {
      const res = await fetch(`/api/notes/${id}`);
      const data = await res.json();
      if (res.ok) {
        setNote(data.note);
        // Update page title for SEO
        document.title = `${data.note.title} — NoteNibo`;
      } else {
        setError(data.error || "Note not found");
      }
    } catch {
      setError("Failed to load note");
    } finally {
      setLoading(false);
    }
  }

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
        setSuccess("Purchase successful! You can now download this note.");
        setPurchased(true);
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
          <div className="empty-state-icon">😕</div>
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
          gap: "0.25rem",
          marginBottom: "1.5rem",
        }}
      >
        ← Back to Marketplace
      </Link>

      <div className="note-detail">
        {/* Main Content */}
        <div className="note-detail-main">
          {/* Preview Area */}
          <div className="note-preview">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📄</div>
              <p>PDF Preview</p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  marginTop: "0.5rem",
                }}
              >
                Preview restricted to first 3 pages
              </p>
            </div>
            {!purchased && !isOwner && (
              <div className="note-preview-overlay">
                <span className="note-preview-overlay-text">
                  🔒 Purchase to view full content
                </span>
              </div>
            )}
          </div>

          {/* Note Info */}
          <div className="note-detail-info">
            <h1 className="note-detail-title">{note.title}</h1>

            <div className="note-detail-meta">
              <span className="note-detail-meta-item">
                📂 {(note.topics || []).join(", ")}
              </span>
              <span className="note-detail-meta-item">📝 {note.subject}</span>
              <span className="note-detail-meta-item">
                👤 {note.uploader?.name || "Anonymous"}
              </span>
              {note.purchaseCount > 0 && (
                <span className="note-detail-meta-item">
                  📊 {note.purchaseCount} purchases
                </span>
              )}
            </div>

            <p className="note-detail-description">{note.description}</p>
          </div>
        </div>

        {/* Sidebar — Purchase Card */}
        <div className="note-detail-sidebar">
          <div className="note-purchase-card">
            <div className="note-purchase-price">
              ৳{new Intl.NumberFormat("en-BD").format(note.price)}
            </div>
            <div className="note-purchase-price-label">
              One-time purchase · Lifetime access
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {purchased ? (
              <button
                onClick={handleDownload}
                className="btn btn-primary btn-block btn-lg"
              >
                ⬇ Download Full PDF
              </button>
            ) : isOwner ? (
              <div
                className="disclaimer"
                style={{ textAlign: "center", padding: "0.75rem" }}
              >
                This is your note
              </div>
            ) : (
              <button
                onClick={handleBuy}
                disabled={buying}
                className="btn btn-primary btn-block btn-lg"
              >
                {buying ? "Processing..." : "Buy Now"}
              </button>
            )}

            <div
              style={{
                marginTop: "1.25rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--color-border-light)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                <span>Format</span>
                <span>PDF</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                <span>Access</span>
                <span>Lifetime</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                }}
              >
                <span>Seller receives</span>
                <span>90% of price</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

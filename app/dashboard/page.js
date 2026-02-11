"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCache } from "@/lib/useCache";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("purchases");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Cache dashboard data (1 min TTL)
  const {
    data,
    loading,
    refresh,
  } = useCache(
    "dashboard-data",
    useCallback(async () => {
      const res = await fetch("/api/user/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    }, []),
    60 * 1000
  );

  async function handleDownload(noteId) {
    try {
      const res = await fetch(`/api/notes/${noteId}/download`);
      const result = await res.json();
      if (res.ok && result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      } else {
        alert(result.error || "Failed to get download link");
      }
    } catch {
      alert("Failed to download");
    }
  }

  if (status === "loading") {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="skeleton" style={{ width: 200, height: 32, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 300, height: 18 }} />
        </div>
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton skeleton-stat" />
          ))}
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="skeleton" style={{ width: 200, height: 32, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 300, height: 18 }} />
        </div>
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton skeleton-stat" />
          ))}
        </div>
        <div className="skeleton" style={{ width: "100%", height: 42, marginBottom: 24 }} />
        <div className="skeleton" style={{ width: "100%", height: 200 }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <h3 className="empty-state-title">Failed to load dashboard</h3>
          <p className="empty-state-text">Please try refreshing the page.</p>
          <button className="btn btn-primary mt-2" onClick={refresh}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "purchases", label: "My Purchases", icon: "📖", count: data.purchases?.length || 0 },
    { id: "earnings", label: "My Earnings", icon: "💰", count: data.uploadedNotes?.length || 0 },
    { id: "submissions", label: "My Submissions", icon: "📤", count: data.submissions?.length || 0 },
    { id: "printing", label: "Printing Service", icon: "🖨️" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, {data.user?.name} 👋
        </p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">💳 Wallet Balance</div>
          <div className="stat-value accent">
            ৳{new Intl.NumberFormat("en-BD").format(data.user?.walletBalance || 0)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📈 Total Earnings</div>
          <div className="stat-value">
            ৳{new Intl.NumberFormat("en-BD").format(data.totalEarnings || 0)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📚 Notes Purchased</div>
          <div className="stat-value">{data.purchases?.length || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📝 Notes Uploaded</div>
          <div className="stat-value">{data.uploadedNotes?.length || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                marginLeft: 6,
                fontSize: "0.7rem",
                background: activeTab === tab.id ? "var(--color-accent-glow)" : "var(--color-border-light)",
                padding: "1px 6px",
                borderRadius: 999,
                fontWeight: 700,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "purchases" && (
        <div className="animate-fade">
          {data.purchases?.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Topics</th>
                    <th>Subject</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.purchases.map((note) => (
                    <tr key={note._id}>
                      <td>
                        <strong>{note.title}</strong>
                      </td>
                      <td>{(note.topics || []).join(", ")}</td>
                      <td>{note.subject}</td>
                      <td>৳{note.price}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleDownload(note._id)}
                        >
                          ⬇ Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3 className="empty-state-title">No purchases yet</h3>
              <p className="empty-state-text">
                Browse the marketplace to find notes for your courses.
              </p>
              <Link href="/" className="btn btn-primary mt-2">
                Browse Notes
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "earnings" && (
        <div className="animate-fade">
          {data.uploadedNotes?.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Sales</th>
                    <th>Earned (90%)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.uploadedNotes.map((note) => (
                    <tr key={note._id}>
                      <td>
                        <strong>{note.title}</strong>
                      </td>
                      <td>৳{note.price}</td>
                      <td>
                        <span
                          className={`badge badge-${note.status.toLowerCase()}`}
                        >
                          {note.status}
                        </span>
                      </td>
                      <td>{note.purchaseCount}</td>
                      <td>
                        ৳
                        {new Intl.NumberFormat("en-BD").format(
                          Math.round(note.price * note.purchaseCount * 0.9)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💸</div>
              <h3 className="empty-state-title">No uploaded notes yet</h3>
              <p className="empty-state-text">
                Start earning by uploading your handwritten notes.
              </p>
              <Link href="/sell" className="btn btn-primary mt-2">
                Upload Notes
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="animate-fade">
          {data.submissions?.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Topics</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {data.submissions.map((sub) => (
                    <tr key={sub._id}>
                      <td>
                        <strong>{sub.noteId?.title || "—"}</strong>
                      </td>
                      <td>{(sub.noteId?.topics || []).join(", ") || "—"}</td>
                      <td>{sub.noteId?.subject || "—"}</td>
                      <td>
                        <span
                          className={`badge badge-${sub.status.toLowerCase()}`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        {new Date(sub.submittedAt).toLocaleDateString("en-BD")}
                      </td>
                      <td>{sub.adminFeedback || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📤</div>
              <h3 className="empty-state-title">No submissions yet</h3>
              <p className="empty-state-text">
                Submit your notes for review and track their status here.
              </p>
              <Link href="/sell" className="btn btn-primary mt-2">
                Upload Notes
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "printing" && (
        <div className="empty-state animate-fade">
          <div className="empty-state-icon">🖨️</div>
          <h3 className="empty-state-title">On-Demand Printing</h3>
          <p className="empty-state-text">
            We&apos;re working on a service to print and deliver your purchased
            notes right to your doorstep. Stay tuned!
          </p>
          <div
            className="badge badge-pending mt-2"
            style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
          >
            Coming Soon
          </div>
        </div>
      )}
    </div>
  );
}

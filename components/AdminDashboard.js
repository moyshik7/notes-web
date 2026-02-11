"use client";

import { useState } from "react";

export default function AdminDashboard({ initialData }) {
  const [data, setData] = useState(initialData);
  const [actionLoading, setActionLoading] = useState(null);

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

  async function handleAction(noteId, action, feedback = "") {
    setActionLoading(noteId);
    try {
      const res = await fetch(`/api/admin/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action, feedback }),
      });

      if (res.ok) {
        // Refresh data
        await fetchStats();
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
          <div className="stat-value accent">
            ৳{new Intl.NumberFormat("en-BD").format(data.stats?.totalRevenue || 0)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Platform Revenue (10%)</div>
          <div className="stat-value">
            ৳{new Intl.NumberFormat("en-BD").format(data.stats?.platformRevenue || 0)}
          </div>
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
          <div className="stat-value">
            {data.stats?.totalTransactions || 0}
          </div>
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
                  <td>
                    {new Date(note.createdAt).toLocaleDateString("en-BD")}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAction(note._id, "Approved")}
                        disabled={actionLoading === note._id}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          const feedback = prompt("Rejection reason (optional):");
                          handleAction(note._id, "Rejected", feedback || "");
                        }}
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
    </div>
  );
}

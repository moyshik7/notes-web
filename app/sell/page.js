"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topics: "",
    subject: "",
    price: "",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (status === "loading") {
    return (
      <div className="page-container" style={{ maxWidth: 900 }}>
        <div className="skeleton" style={{ width: 240, height: 32, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 360, height: 18, marginBottom: 32 }} />
        <div className="skeleton" style={{ width: "100%", height: 500 }} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    // Parse topics from comma-separated string
    const topicsArray = formData.topics
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (topicsArray.length === 0) {
      setError("Please enter at least one topic");
      return;
    }

    setUploading(true);
    setProgress(20);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("topics", JSON.stringify(topicsArray));
      data.append("subject", formData.subject);
      data.append("price", formData.price);
      data.append("file", file);

      setProgress(50);

      const res = await fetch("/api/notes/upload", {
        method: "POST",
        body: data,
      });

      setProgress(90);

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Upload failed");
        return;
      }

      setProgress(100);
      setSuccess(result.message);

      // Clear cached data so dashboard refreshes
      try { sessionStorage.removeItem("dashboard-data"); } catch {}

      // Reset form
      setFormData({
        title: "",
        description: "",
        topics: "",
        subject: "",
        price: "",
      });
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById("pdf-file");
      if (fileInput) fileInput.value = "";
    } catch {
      setError("Failed to upload. Please try again.");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h1 className="page-title">Sell Your Notes</h1>
        <p className="page-subtitle">
          Upload your handwritten lecture notes and start earning from your hard work
        </p>
      </div>

      {/* Revenue Disclaimer */}
      <div className="disclaimer" style={{ marginBottom: "2rem" }}>
        <strong>💡 Revenue Split:</strong> You receive <strong>90%</strong> of
        each sale, and the platform keeps <strong>10%</strong>. Your note will
        be reviewed manually before publishing. Only high-quality, original
        handwritten notes will be approved.
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        {/* Upload Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                📌 Note Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-input"
                placeholder="e.g., Data Structures — Complete Lecture Notes"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                📝 Description
              </label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                placeholder="Describe what's covered, number of pages, any special topics..."
                value={formData.description}
                onChange={handleChange}
                required
                maxLength={2000}
                rows={4}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="topics">
                  🏷️ Topics
                </label>
                <input
                  id="topics"
                  name="topics"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Calculus, Linear Algebra"
                  value={formData.topics}
                  onChange={handleChange}
                  required
                />
                <p className="form-hint">Separate multiple topics with commas</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subject">
                  📘 Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Computer Science"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="price">
                💰 Price (BDT ৳)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                className="form-input"
                placeholder="e.g., 50"
                value={formData.price}
                onChange={handleChange}
                required
                min="1"
                step="1"
              />
              <p className="form-hint">
                Set a fair price. Most notes sell well between ৳30–৳150.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pdf-file">
                📄 Upload PDF
              </label>
              <input
                id="pdf-file"
                type="file"
                className="form-input"
                accept=".pdf,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
              <p className="form-hint">Max file size: 50MB. PDF format only.</p>
            </div>

            {progress > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="progress-text">
                  {progress < 100 ? "Uploading..." : "✅ Upload complete!"}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg mt-2"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload & Submit for Review"}
            </button>
          </form>
        </div>

        {/* Tips Sidebar */}
        <div>
          <div className="sell-tips">
            <h3>💡 Tips for Best Results</h3>
            <ul>
              <li>Use clear, legible handwriting</li>
              <li>Scan at 300 DPI or higher</li>
              <li>Include all pages in a single PDF</li>
              <li>Add diagrams and illustrations</li>
              <li>Cover complete chapters or modules</li>
              <li>Use headings and page numbers</li>
              <li>Write a detailed description</li>
              <li>Price competitively (৳30–৳150)</li>
            </ul>
          </div>

          <div className="sell-tips" style={{ marginTop: "1rem" }}>
            <h3>📊 What Sells Well</h3>
            <ul>
              <li>Final exam preparation notes</li>
              <li>Solved problem sets</li>
              <li>Lab manuals and experiment notes</li>
              <li>Formulae sheets and summaries</li>
              <li>Chapter-wise revision guides</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

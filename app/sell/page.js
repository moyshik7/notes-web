"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const UNIVERSITIES = [
  "University of Dhaka",
  "BUET",
  "Jahangirnagar University",
  "Rajshahi University",
  "CUET",
  "KUET",
  "RUET",
  "NSU",
  "BRAC University",
  "IUT",
  "Other",
];

export default function SellPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    university: "",
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
      <div className="loading-spinner">
        <div className="spinner" />
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

    setUploading(true);
    setProgress(20);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("university", formData.university);
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

      // Reset form
      setFormData({
        title: "",
        description: "",
        university: "",
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
    <div className="page-container" style={{ maxWidth: 720 }}>
      <div className="page-header">
        <h1 className="page-title">Sell Your Notes</h1>
        <p className="page-subtitle">
          Upload your handwritten lecture notes and start earning
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

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Note Title
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
              Description
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
              <label className="form-label" htmlFor="university">
                University
              </label>
              <select
                id="university"
                name="university"
                className="form-select"
                value={formData.university}
                onChange={handleChange}
                required
              >
                <option value="">Select University</option>
                {UNIVERSITIES.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="subject">
                Subject
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
              Price (BDT ৳)
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
              Upload PDF
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
                {progress < 100 ? "Uploading..." : "Upload complete!"}
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
    </div>
  );
}

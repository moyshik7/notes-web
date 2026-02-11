"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, FileText, AlertCircle, Sparkles, Lightbulb, X } from "lucide-react";

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
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    if (status === "unauthenticated") {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-8 text-center animate-fade-in-up">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="font-display text-xl font-semibold text-text-secondary mb-2">Sign in to Sell Notes</h2>
                <p className="text-sm text-text-muted mb-4">You need to be signed in to upload and sell notes.</p>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">Sign In</Link>
            </div>
        );
    }

    function handleChange(e) {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleFile(selectedFile) {
        if (selectedFile && selectedFile.type === "application/pdf") {
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError("File size must be under 10MB");
                return;
            }
            setFile(selectedFile);
            setError("");
        } else {
            setError("Please select a PDF file");
        }
    }

    function handlePreview(selectedFile) {
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError("Preview image must be under 5MB");
                return;
            }
            setPreview(selectedFile);
            setError("");
        } else {
            setError("Please select an image file (JPG, PNG, WebP)");
        }
    }

    function handleDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setUploading(true);
        setUploadProgress(0);

        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            // Convert comma-separated topics to JSON array
            const topicsArray = formData.topics
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);
            data.append("topics", JSON.stringify(topicsArray));
            data.append("subject", formData.subject);
            data.append("price", formData.price);
            if (file) data.append("file", file);
            if (preview) data.append("preview", preview);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 300);

            const res = await fetch("/api/notes/upload", { method: "POST", body: data });
            clearInterval(progressInterval);
            setUploadProgress(100);
            const result = await res.json();

            if (!res.ok) {
                setError(result.error || "Upload failed");
                setUploadProgress(0);
                return;
            }
            router.push("/dashboard");
        } catch {
            setError("Something went wrong. Please try again.");
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="max-w-[900px] mx-auto px-6 py-8">
            <div className="mb-8 animate-fade-in-up">
                <h1 className="font-display text-3xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent mb-2">Sell Your Notes</h1>
                <p className="text-base text-text-secondary">Share your knowledge and earn money from your hard work</p>
            </div>

            <div className="bg-pastel-peach border border-warning/40 rounded-xl p-5 flex items-start gap-3 mb-6 animate-fade-in">
                <AlertCircle size={20} className="text-warning flex-shrink-0 mt-0.5" />
                <div>
                    <b className="text-sm text-text-main mb-0.5 block">Review Required</b>
                    <p className="text-sm text-text-secondary leading-relaxed m-0">All notes are manually reviewed before being published. This ensures quality and protects buyers. Review usually takes 12-24 hours.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
                {/* Form Card */}
                <div className="bg-surface border border-border rounded-2xl p-8 shadow-card animate-fade-in-up">
                    {error && <div className="px-4 py-3 rounded-[10px] text-sm mb-4 animate-slide-down bg-danger/10 text-[#c44040] border border-danger/20">{error}</div>}

                    {uploading && (
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-text-secondary mb-1">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-accent to-primary h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="title">Title</label>
                            <input id="title" name="title" type="text" className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150" placeholder="e.g. Organic Chemistry – Full Chapter Notes" value={formData.title} onChange={handleChange} required />
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="description">Description</label>
                            <textarea id="description" name="description" rows={4} className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none resize-y min-h-[100px] focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150" placeholder="Describe your notes in detail..." value={formData.description} onChange={handleChange} required />
                        </div>

                        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 mb-5">
                            <div>
                                <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="topics">Topics</label>
                                <input id="topics" name="topics" type="text" className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150" placeholder="Comma separated: CH1, CH2" value={formData.topics} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="subject">Subject</label>
                                <input id="subject" name="subject" type="text" className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150" placeholder="e.g. Chemistry" value={formData.subject} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="price">Price (৳)</label>
                            <input id="price" name="price" type="number" min="0" step="1" className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150" placeholder="Set your price (0 for free)" value={formData.price} onChange={handleChange} required />
                        </div>

                        {/* PDF Upload */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-text-main mb-1.5">Upload PDF</label>
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${dragActive ? "border-accent bg-pastel-pink" : file ? "border-success bg-success-light" : "border-border bg-pastel-purple/30 hover:border-accent-light hover:bg-pastel-pink"}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                            >
                                {file ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <FileText size={20} className="text-success" />
                                        <span className="text-sm text-text-main font-medium">{file.name}</span>
                                        <button type="button" className="ml-2 text-danger hover:text-accent-dark" onClick={(e) => { e.stopPropagation(); setFile(null); }}><X size={16} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={32} className="mx-auto mb-2 text-text-muted" />
                                        <p className="text-sm text-text-secondary">Drag & drop your PDF here, or <span className="text-accent-dark font-semibold">click to browse</span></p>
                                        <p className="text-xs text-text-muted mt-1">Max file size: 10MB</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                            </div>
                        </div>

                        {/* Preview Image */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-text-main mb-1.5">Preview Image (optional)</label>
                            <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150 ${preview ? "border-success bg-success-light" : "border-border hover:border-accent-light hover:bg-pastel-pink"}`} onClick={() => document.getElementById("previewInput")?.click()}>
                                {preview ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm text-text-main font-medium">{preview.name}</span>
                                        <button type="button" className="ml-2 text-danger hover:text-accent-dark" onClick={(e) => { e.stopPropagation(); setPreview(null); }}><X size={16} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-text-secondary">Upload a preview image to attract buyers</p>
                                        <p className="text-xs text-text-muted mt-1">JPG, PNG, or WebP — Max 5MB</p>
                                    </>
                                )}
                                <input id="previewInput" type="file" accept="image/*" className="hidden" onChange={(e) => handlePreview(e.target.files[0])} />
                            </div>
                        </div>

                        <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed mt-2" disabled={uploading}>
                            {uploading ? "Uploading..." : "Submit for Review"}
                        </button>
                    </form>
                </div>

                {/* Tips Sidebar */}
                <div className="bg-gradient-to-b from-pastel-purple to-surface border border-border rounded-2xl p-6 shadow-card sticky top-24 animate-fade-in-up max-lg:relative max-lg:top-0">
                    <h3 className="font-display text-lg font-bold text-text-main mb-4 flex items-center gap-2"><Lightbulb size={18} className="text-warning" /> Tips for Sellers</h3>
                    <ul className="text-sm text-text-secondary leading-relaxed space-y-2.5 list-none pl-0">
                        <li className="flex items-start gap-2"><Sparkles size={14} className="text-accent mt-0.5 flex-shrink-0" /> Write clear, descriptive titles that mention the subject and topic</li>
                        <li className="flex items-start gap-2"><Sparkles size={14} className="text-accent mt-0.5 flex-shrink-0" /> Include a detailed description of what the notes cover</li>
                        <li className="flex items-start gap-2"><Sparkles size={14} className="text-accent mt-0.5 flex-shrink-0" /> Upload a preview image showing a sample page</li>
                        <li className="flex items-start gap-2"><Sparkles size={14} className="text-accent mt-0.5 flex-shrink-0" /> Price competitively — check similar notes for reference</li>
                        <li className="flex items-start gap-2"><Sparkles size={14} className="text-accent mt-0.5 flex-shrink-0" /> Ensure your handwriting is clean and legible</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect, type FormEvent, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";

export default function SellPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        topics: "",
        subject: "",
        price: "",
    });
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (authStatus === "unauthenticated") router.push("/login");
    }, [authStatus, router]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleDrag(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    }

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            const dropped = e.dataTransfer.files[0];
            if (dropped.type === "application/pdf") setFile(dropped);
            else setError("Only PDF files are allowed");
        }
    }

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files?.[0]) {
            const selected = e.target.files[0];
            if (selected.type === "application/pdf") setFile(selected);
            else setError("Only PDF files are allowed");
        }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!file) {
            setError("Please select a PDF file");
            return;
        }

        const topics = formData.topics
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        if (topics.length === 0) {
            setError("Please add at least one topic");
            return;
        }

        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) {
            setError("Please set a valid price");
            return;
        }

        setUploading(true);
        setProgress(10);

        try {
            const body = new FormData();
            body.append("title", formData.title);
            body.append("description", formData.description);
            body.append("topics", JSON.stringify(topics));
            body.append("subject", formData.subject);
            body.append("price", formData.price);
            body.append("file", file);

            setProgress(30);

            const res = await fetch("/api/notes/upload", {
                method: "POST",
                body,
            });

            setProgress(80);

            const data = await res.json();

            if (res.ok) {
                setProgress(100);
                setSuccess("Note uploaded successfully! It will be reviewed before publishing.");
                setFormData({ title: "", description: "", topics: "", subject: "", price: "" });
                setFile(null);
                setTimeout(() => router.push("/dashboard"), 3000);
            } else {
                setError(data.error || "Upload failed");
            }
        } catch {
            setError("Failed to upload note");
        } finally {
            setUploading(false);
        }
    }

    if (authStatus === "loading") {
        return (
            <div className="max-w-[800px] mx-auto px-6 py-8">
                <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer h-[600px] rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="max-w-[800px] mx-auto px-6 py-8 animate-fade-in-up">
            <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-extrabold text-text-main mb-2">Sell Your Notes</h1>
                <p className="text-text-secondary">Upload your lecture notes and start earning</p>
            </div>

            {success && (
                <div className="px-4 py-3 rounded-[10px] text-sm mb-6 bg-success-light text-success-dark border border-success/20 flex items-center gap-2">
                    <CheckCircle size={18} /> {success}
                </div>
            )}

            {error && (
                <div className="px-4 py-3 rounded-[10px] text-sm mb-6 bg-danger/10 text-[#c44040] border border-danger/20 flex items-center gap-2">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-3xl p-8 shadow-card">
                {/* File Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 transition-all duration-200 cursor-pointer ${
                        dragActive ? "border-accent bg-pastel-pink/30" : file ? "border-success bg-success-light" : "border-border hover:border-accent-light hover:bg-pastel-pink/10"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                    {file ? (
                        <div className="flex items-center justify-center gap-3">
                            <FileText size={24} className="text-success" />
                            <div>
                                <p className="font-semibold text-text-main">{file.name}</p>
                                <p className="text-xs text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1 rounded-full hover:bg-danger/10 text-text-muted hover:text-danger transition-all">
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Upload size={36} className="text-text-muted mx-auto mb-3" />
                            <p className="font-semibold text-text-main mb-1">Drop your PDF here</p>
                            <p className="text-sm text-text-muted">or click to browse · Max 50MB</p>
                        </>
                    )}
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="title">Title</label>
                        <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent transition-all" placeholder="e.g. CSE 101 — Data Structures Complete Notes" required />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="description">Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent transition-all resize-y" placeholder="Describe the contents of your notes..." required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="subject">Subject</label>
                            <input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent transition-all" placeholder="e.g. Computer Science" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="price">Price (৳ BDT)</label>
                            <input id="price" name="price" type="number" min="1" step="1" value={formData.price} onChange={handleChange} className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent transition-all" placeholder="e.g. 50" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="topics">Topics (comma-separated)</label>
                        <input id="topics" name="topics" type="text" value={formData.topics} onChange={handleChange} className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent transition-all" placeholder="e.g. Arrays, Linked Lists, Trees" required />
                    </div>
                </div>

                {/* Progress Bar */}
                {uploading && (
                    <div className="mt-6">
                        <div className="h-2 bg-border/30 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-text-muted mt-2 text-center">Uploading... {progress}%</p>
                    </div>
                )}

                <button type="submit" disabled={uploading} className="w-full mt-6 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed">
                    {uploading ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : <><Upload size={18} /> Upload Note</>}
                </button>
            </form>
        </div>
    );
}

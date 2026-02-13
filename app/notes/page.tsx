import { Suspense } from "react";
import Link from "next/link";
import NoteCard from "@/components/NoteCard";
import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";
import "@/models/User"; // Ensure User schema is registered for populate()
import SearchFilter from "./SearchFilter";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface NotesPageProps {
    searchParams: Promise<{ q?: string; topic?: string; page?: string }>;
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
    const params = await searchParams;
    const q = params.q || "";
    const topic = params.topic || "";
    const page = parseInt(params.page || "1");
    const limit = 12;
    const skip = (page - 1) * limit;

    await connectDB();

    // Build query
    const query: Record<string, unknown> = { status: "Approved" };
    if (topic) query.topics = { $regex: topic, $options: "i" };
    if (q) query.$text = { $search: q };

    const [notes, total, topics] = await Promise.all([
        Note.find(query)
            .populate("uploader", "name image")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Note.countDocuments(query),
        Note.distinct("topics", { status: "Approved" }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const serializedNotes = JSON.parse(JSON.stringify(notes)) as Array<{ _id: string; title: string; subject: string; topics?: string[]; price: number; preview?: string; purchaseCount?: number; uploader?: { name?: string; image?: string } }>;

    return (
        <div className="max-w-[1280px] mx-auto px-6 py-8 animate-fade-in-up">
            <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-extrabold text-text-main mb-2">Browse Notes</h1>
                <p className="text-text-secondary">Find the perfect study materials for your courses</p>
            </div>

            {/* Search & Filters */}
            <Suspense fallback={<div className="h-20 bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer rounded-2xl mb-8" />}>
                <SearchFilter topics={(topics as string[]).sort()} />
            </Suspense>

            {/* Notes Grid */}
            {serializedNotes.length > 0 ? (
                <>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-sm:grid-cols-1 gap-8 mb-8">
                        {serializedNotes.map((note) => (
                            <NoteCard key={note._id} note={note} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            {page > 1 && (
                                <Link href={`/notes?${new URLSearchParams({ ...(q && { q }), ...(topic && { topic }), page: String(page - 1) }).toString()}`} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-surface border-2 border-border text-text-secondary hover:border-accent-light hover:text-accent-dark transition-all">
                                    <ChevronLeft size={16} /> Previous
                                </Link>
                            )}
                            <span className="px-4 py-2 text-sm font-semibold text-text-secondary">
                                Page {page} of {totalPages}
                            </span>
                            {page < totalPages && (
                                <Link href={`/notes?${new URLSearchParams({ ...(q && { q }), ...(topic && { topic }), page: String(page + 1) }).toString()}`} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-surface border-2 border-border text-text-secondary hover:border-accent-light hover:text-accent-dark transition-all">
                                    Next <ChevronRight size={16} />
                                </Link>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 px-8 bg-surface border border-dashed border-border rounded-3xl">
                    <div className="text-6xl mb-4 animate-float"><Sparkles size={48} className="text-accent-light mx-auto" /></div>
                    <h3 className="font-display text-xl font-bold text-text-main mb-2">No notes found</h3>
                    <p className="text-text-secondary max-w-[400px] mx-auto leading-relaxed">Try adjusting your search or browse all available notes.</p>
                </div>
            )}
        </div>
    );
}

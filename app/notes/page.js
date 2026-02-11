import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";
import NoteCard from "@/components/NoteCard";
import SearchFilter from "./SearchFilter";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
    title: "Browse Notes | NoteNibo",
    description: "Find high-quality handwritten lecture notes, summaries, and study guides.",
};

export const revalidate = 3600; // ISR: Revalidate every hour

async function getNotes(searchParams) {
    await connectDB();

    const page = parseInt(searchParams.page || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const query = { status: "Approved" };

    if (searchParams.q) {
        query.$text = { $search: searchParams.q };
    }

    if (searchParams.topic) {
        query.topics = { $regex: searchParams.topic, $options: "i" };
    }

    const [notes, totalCount] = await Promise.all([
        Note.find(query)
            .populate("uploader", "name image")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Note.countDocuments(query),
    ]);
    
    // Get distinct topics for filter
    const distinctTopics = await Note.distinct("topics", { status: "Approved" });

    return {
        notes: JSON.parse(JSON.stringify(notes)), // Serialize for client components if needed
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        topics: distinctTopics.sort(),
    };
}

export default async function NotesPage({ searchParams }) {
    const { notes, totalCount, totalPages, currentPage, topics } = await getNotes(searchParams);

    return (
        <div className="min-h-screen bg-bg relative">
             <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(253,121,168,0.05)_0%,transparent_50%),radial-gradient(circle_at_90%_50%,rgba(108,92,231,0.05)_0%,transparent_50%)]" />

            <div className="max-w-[1280px] mx-auto px-6 py-12 relative z-10">
                <div className="text-center mb-10">
                    <h1 className="font-display text-4xl font-extrabold text-text-main mb-3">Browse Notes</h1>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        Explore our collection of handwritten notes from top students. Filter by topic or search to find exactly what you need.
                    </p>
                </div>

                <Suspense fallback={<div className="text-center py-10">Loading filters...</div>}>
                    <SearchFilter topics={topics} />
                </Suspense>

                {notes.length > 0 ? (
                    <>
                        <div className="mb-6 text-sm text-text-muted font-medium">
                            Showing {notes.length} of {totalCount} notes
                        </div>

                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mb-12">
                            {notes.map((note) => (
                                <NoteCard key={note._id} note={note} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <Link
                                    href={`/notes?${new URLSearchParams({ ...searchParams, page: Math.max(1, currentPage - 1) }).toString()}`}
                                    className={`p-3 rounded-full border border-border bg-surface hover:bg-white hover:shadow-md transition-all ${currentPage <= 1 ? "opacity-50 pointer-events-none" : ""}`}
                                    aria-disabled={currentPage <= 1}
                                >
                                    <ChevronLeft size={20} className="text-text-main" />
                                </Link>
                                
                                <div className="flex items-center gap-2 px-4 font-semibold text-text-secondary bg-surface border border-border rounded-full">
                                    <span>{currentPage}</span>
                                    <span className="text-text-muted">/</span>
                                    <span>{totalPages}</span>
                                </div>

                                <Link
                                    href={`/notes?${new URLSearchParams({ ...searchParams, page: Math.min(totalPages, currentPage + 1) }).toString()}`}
                                    className={`p-3 rounded-full border border-border bg-surface hover:bg-white hover:shadow-md transition-all ${currentPage >= totalPages ? "opacity-50 pointer-events-none" : ""}`}
                                    aria-disabled={currentPage >= totalPages}
                                >
                                    <ChevronRight size={20} className="text-text-main" />
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24 bg-surface border border-dashed border-border rounded-3xl animate-fade-in">
                        <div className="text-6xl mb-6 mx-auto w-20 h-20 flex items-center justify-center bg-pastel-purple rounded-full">
                            <Sparkles size={40} className="text-primary" />
                        </div>
                        <h2 className="font-display text-2xl font-bold text-text-main mb-2">No notes found</h2>
                        <p className="text-text-secondary max-w-md mx-auto mb-8">
                            We couldn't find any notes matching your criteria. Try adjusting your search or filters.
                        </p>
                        <Link href="/notes" className="px-6 py-2.5 bg-text-main text-white rounded-xl font-medium hover:bg-primary transition-colors">
                            Clear Filters
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

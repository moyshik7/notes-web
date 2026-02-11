"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import NoteCard from "@/components/NoteCard";
import { useCache } from "@/lib/useCache";
import { Sparkles, Star, Search as SearchIcon, CreditCard, ArrowRight } from "lucide-react";

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopic, setSelectedTopic] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);

    // Cache topics list (5 min TTL)
    const { data: topicsData } = useCache(
        "home-topics",
        useCallback(async () => {
            const res = await fetch("/api/notes?distinct=topics");
            return res.json();
        }, []),
        5 * 60 * 1000,
    );

    // Cache initial notes (2 min TTL)
    const { data: notesData, loading: notesLoading } = useCache(
        "home-notes",
        useCallback(async () => {
            const res = await fetch("/api/notes?limit=12");
            return res.json();
        }, []),
        2 * 60 * 1000,
    );

    const availableTopics = topicsData?.topics || [];
    const displayNotes = searchResults !== null ? searchResults : notesData?.notes || [];
    const isLoading = searchResults === null && notesLoading;

    // Re-fetch when topic filter changes
    useEffect(() => {
        if (!selectedTopic && searchResults === null) return;
        fetchFilteredNotes();
    }, [selectedTopic]);

    async function fetchFilteredNotes(query) {
        setSearching(true);
        try {
            const params = new URLSearchParams();
            if (query || searchQuery) params.set("q", query || searchQuery);
            if (selectedTopic) params.set("topic", selectedTopic);
            const res = await fetch(`/api/notes?${params.toString()}`);
            const data = await res.json();
            setSearchResults(data.notes || []);
        } catch (error) {
            console.error("Failed to fetch notes:", error);
        } finally {
            setSearching(false);
        }
    }

    function handleSearch(e) {
        e.preventDefault();
        if (!searchQuery && !selectedTopic) {
            setSearchResults(null);
            return;
        }
        fetchFilteredNotes(searchQuery);
    }

    function handleTopicClick(topic) {
        if (topic === selectedTopic) {
            setSelectedTopic("");
            if (!searchQuery) setSearchResults(null);
        } else {
            setSelectedTopic(topic);
        }
    }

    return (
        <>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-pastel-purple via-pastel-pink to-pastel-blue py-20 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_40%,rgba(253,121,168,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_60%,rgba(108,92,231,0.12)_0%,transparent_40%),radial-gradient(circle_at_50%_90%,rgba(0,184,148,0.08)_0%,transparent_30%)]" />
                <div className="relative max-w-[800px] mx-auto animate-fade-in-up">
                    <h1 className="font-display text-5xl max-md:text-3xl font-extrabold text-text-main mb-4 leading-tight tracking-tight">
                        Get the <span className="bg-gradient-to-br from-accent-dark to-primary bg-clip-text text-transparent">Topper&apos;s Notes</span> You Need
                    </h1>
                    <p className="text-lg text-text-secondary mb-10 max-w-[550px] mx-auto leading-relaxed">Bangladesh&apos;s first marketplace for handwritten university lecture notes. Buy, sell, and ace your exams</p>
                    <form className="flex max-sm:flex-col gap-2 max-w-[600px] mx-auto bg-white/70 backdrop-blur-xl border-2 border-border/80 rounded-3xl max-sm:rounded-2xl p-1 shadow-md focus-within:bg-white/90 focus-within:border-accent-light focus-within:shadow-[0_0_32px_rgba(253,121,168,0.12)] transition-all duration-250" onSubmit={handleSearch}>
                        <input type="text" className="flex-1 border-none bg-transparent px-4 py-3 text-[0.95rem] text-text-main outline-none font-sans placeholder:text-text-muted" placeholder="Search by subject, topic, or keyword..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <button type="submit" className="px-6 py-3 bg-gradient-to-br from-accent to-primary text-white border-none rounded-3xl max-sm:rounded-xl font-semibold text-sm cursor-pointer hover:shadow-glow hover:scale-[1.03] transition-all duration-150 font-sans whitespace-nowrap">
                            Search
                        </button>
                    </form>
                </div>
            </section>

            {/* Trust Stats Bar */}
            <div className="flex justify-center gap-12 max-sm:gap-6 py-8 px-6 bg-surface border-b border-border animate-fade-in">
                <div className="text-center">
                    <div className="font-display text-2xl max-sm:text-xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent animate-count-up">500+</div>
                    <div className="text-xs font-medium text-text-muted uppercase tracking-wide mt-0.5">Notes Shared</div>
                </div>
                <div className="text-center">
                    <div className="font-display text-2xl max-sm:text-xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent animate-count-up">200+</div>
                    <div className="text-xs font-medium text-text-muted uppercase tracking-wide mt-0.5">Happy Students</div>
                </div>
                <div className="text-center">
                    <div className="font-display text-2xl max-sm:text-xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent animate-count-up">50+</div>
                    <div className="text-xs font-medium text-text-muted uppercase tracking-wide mt-0.5">Topics Covered</div>
                </div>
                <div className="text-center">
                    <div className="font-display text-2xl max-sm:text-xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent animate-count-up">4.8<Star size={14} className="inline align-middle fill-current" /></div>
                    <div className="text-xs font-medium text-text-muted uppercase tracking-wide mt-0.5">Avg. Rating</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1280px] mx-auto px-6 py-8 animate-fade-in">
                {/* Topic Filter */}
                <div className="flex gap-2 mb-6 flex-wrap animate-fade-in">
                    <button
                        className={`px-4.5 py-2 rounded-full border-2 text-[0.825rem] font-medium cursor-pointer font-sans transition-all duration-150 ${!selectedTopic ? "border-accent text-white bg-gradient-to-br from-accent to-primary shadow-[0_3px_12px_var(--color-accent-glow)]" : "border-border bg-surface text-text-secondary hover:border-accent-light hover:text-accent-dark hover:bg-pastel-pink hover:-translate-y-0.5"}`}
                        onClick={() => {
                            setSelectedTopic("");
                            if (!searchQuery) setSearchResults(null);
                        }}
                    >
                        All Topics
                    </button>
                    {availableTopics.map((topic) => (
                        <button key={topic} className={`px-4.5 py-2 rounded-full border-2 text-[0.825rem] font-medium cursor-pointer font-sans transition-all duration-150 ${selectedTopic === topic ? "border-accent text-white bg-gradient-to-br from-accent to-primary shadow-[0_3px_12px_var(--color-accent-glow)]" : "border-border bg-surface text-text-secondary hover:border-accent-light hover:text-accent-dark hover:bg-pastel-pink hover:-translate-y-0.5"}`} onClick={() => handleTopicClick(topic)}>
                            {topic}
                        </button>
                    ))}
                </div>

                {/* Notes Grid */}
                <section>
                    <div className="mb-8">
                        <h2 className="font-display text-3xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent mb-2">{selectedTopic || searchQuery ? "Search Results" : "Featured Notes"}</h2>
                        <p className="text-base text-text-secondary">{selectedTopic || searchQuery ? `Showing notes${selectedTopic ? ` in "${selectedTopic}"` : ""}${searchQuery ? ` matching "${searchQuery}"` : ""}` : "Recently approved, top-quality lecture notes"}</p>
                    </div>

                    {isLoading || searching ? (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-sm:grid-cols-1 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden p-5">
                                    <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer w-12 h-12 rounded-xl mb-4" />
                                    <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer h-3.5 rounded-md mb-3 w-3/4" />
                                    <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer h-3.5 rounded-md mb-3 w-full" />
                                    <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer h-3.5 rounded-md w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : displayNotes.length > 0 ? (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-sm:grid-cols-1 gap-6">
                            {displayNotes.map((note) => (
                                <NoteCard key={note._id} note={note} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-8 text-text-muted animate-fade-in">
                            <div className="text-6xl mb-4 animate-float"><Sparkles size={48} /></div>
                            <h3 className="font-display text-xl font-semibold text-text-secondary mb-2">No notes found</h3>
                            <p className="text-sm max-w-[400px] mx-auto leading-relaxed">{searchQuery || selectedTopic ? "Try adjusting your search or filters." : "Be the first to upload your notes and start earning!"}</p>
                        </div>
                    )}
                </section>

                {/* How It Works */}
                <section className="py-14 text-center">
                    <h2 className="font-display text-3xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent mb-2 text-center">How It Works</h2>
                    <p className="text-base text-text-secondary text-center">Three simple steps to get the notes you need</p>
                    <div className="grid grid-cols-3 max-md:grid-cols-1 max-md:max-w-[400px] max-md:mx-auto gap-8 mt-8">
                        <div className="p-8 px-6 rounded-2xl bg-gradient-to-b from-pastel-pink to-surface border border-border shadow-card hover:-translate-y-1.5 hover:shadow-lg hover:border-accent-light transition-all duration-500 animate-fade-in-up">
                            <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-accent to-primary text-white font-display font-bold text-base flex items-center justify-center mx-auto mb-4 shadow-[0_4px_12px_var(--color-accent-glow)]">1</div>
                            <div className="text-4xl mb-3"><Star size={32} /></div>
                            <h3 className="font-display font-bold text-lg text-text-main mb-2">Browse & Discover</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">Search by topic, subject, or keyword. Filter through high-quality handwritten notes from top students.</p>
                        </div>
                        <div className="p-8 px-6 rounded-2xl bg-gradient-to-b from-pastel-purple to-surface border border-border shadow-card hover:-translate-y-1.5 hover:shadow-lg hover:border-accent-light transition-all duration-500 animate-fade-in-up [animation-delay:0.1s]">
                            <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-accent to-primary text-white font-display font-bold text-base flex items-center justify-center mx-auto mb-4 shadow-[0_4px_12px_var(--color-accent-glow)]">2</div>
                            <div className="text-4xl mb-3"><CreditCard size={32} /></div>
                            <h3 className="font-display font-bold text-lg text-text-main mb-2">Purchase Securely</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">Pay safely through our platform. Every note is reviewed and approved by our team before listing.</p>
                        </div>
                        <div className="p-8 px-6 rounded-2xl bg-gradient-to-b from-pastel-mint to-surface border border-border shadow-card hover:-translate-y-1.5 hover:shadow-lg hover:border-accent-light transition-all duration-500 animate-fade-in-up [animation-delay:0.2s]">
                            <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-accent to-primary text-white font-display font-bold text-base flex items-center justify-center mx-auto mb-4 shadow-[0_4px_12px_var(--color-accent-glow)]">3</div>
                            <div className="text-4xl mb-3"><Sparkles size={32} /></div>
                            <h3 className="font-display font-bold text-lg text-text-main mb-2">Download & Study</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">Instantly download your notes in high quality. Access them anytime from your dashboard.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center py-16 px-8 mt-12 bg-gradient-to-br from-pastel-purple via-pastel-pink to-pastel-peach rounded-3xl relative overflow-hidden border border-border">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(253,121,168,0.1)_0%,transparent_50%)] pointer-events-none" />
                    <h2 className="font-display text-[1.75rem] font-extrabold text-text-main mb-3 relative">Start Earning From Your Notes</h2>
                    <p className="text-text-secondary text-base mb-6 max-w-[500px] mx-auto relative">Got amazing lecture notes? Upload them on NoteNibo and earn money every time someone buys them.</p>
                    <Link href="/sell" className="relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[10px] text-base font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 overflow-hidden">
                        Start Selling <ArrowRight size={16} className="inline align-middle" />
                    </Link>
                </section>
            </div>
        </>
    );
}

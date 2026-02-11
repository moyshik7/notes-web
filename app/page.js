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
    console.log(displayNotes)
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
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Get the <span>Topper&apos;s Notes</span> You Need
                    </h1>
                    <p className="hero-subtitle">Bangladesh&apos;s first marketplace for handwritten university lecture notes. Buy, sell, and ace your exams</p>
                    <form className="hero-search" onSubmit={handleSearch}>
                        <input type="text" className="hero-search-input" placeholder="Search by subject, topic, or keyword..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <button type="submit" className="hero-search-btn">
                            Search
                        </button>
                    </form>
                </div>
            </section>

            {/* Trust Stats Bar */}
            <div className="trust-bar">
                <div className="trust-stat">
                    <div className="trust-stat-value">500+</div>
                    <div className="trust-stat-label">Notes Shared</div>
                </div>
                <div className="trust-stat">
                    <div className="trust-stat-value">200+</div>
                    <div className="trust-stat-label">Happy Students</div>
                </div>
                <div className="trust-stat">
                    <div className="trust-stat-value">50+</div>
                    <div className="trust-stat-label">Topics Covered</div>
                </div>
                <div className="trust-stat">
                    <div className="trust-stat-value">4.8<Star size={14} style={{ display: "inline", verticalAlign: "middle", fill: "currentColor" }} /></div>
                    <div className="trust-stat-label">Avg. Rating</div>
                </div>
            </div>

            {/* Main Content */}
            <div className="page-container">
                {/* Topic Filter */}
                <div className="filter-bar">
                    <button
                        className={`filter-chip ${!selectedTopic ? "active" : ""}`}
                        onClick={() => {
                            setSelectedTopic("");
                            if (!searchQuery) setSearchResults(null);
                        }}
                    >
                        All Topics
                    </button>
                    {availableTopics.map((topic) => (
                        <button key={topic} className={`filter-chip ${selectedTopic === topic ? "active" : ""}`} onClick={() => handleTopicClick(topic)}>
                            {topic}
                        </button>
                    ))}
                </div>

                {/* Notes Grid */}
                <section>
                    <div className="page-header">
                        <h2 className="page-title">{selectedTopic || searchQuery ? "Search Results" : "Featured Notes"}</h2>
                        <p className="page-subtitle">{selectedTopic || searchQuery ? `Showing notes${selectedTopic ? ` in "${selectedTopic}"` : ""}${searchQuery ? ` matching "${searchQuery}"` : ""}` : "Recently approved, top-quality lecture notes"}</p>
                    </div>

                    {isLoading || searching ? (
                        <div className="notes-grid">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="skeleton-card">
                                    <div className="skeleton skeleton-avatar" />
                                    <div className="skeleton skeleton-line w-75" />
                                    <div className="skeleton skeleton-line w-100" />
                                    <div className="skeleton skeleton-line w-50" />
                                </div>
                            ))}
                        </div>
                    ) : displayNotes.length > 0 ? (
                        <div className="notes-grid">
                            {displayNotes.map((note) => (
                                <NoteCard key={note._id} note={note} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon"><Sparkles size={48} /></div>
                            <h3 className="empty-state-title">No notes found</h3>
                            <p className="empty-state-text">{searchQuery || selectedTopic ? "Try adjusting your search or filters." : "Be the first to upload your notes and start earning!"}</p>
                        </div>
                    )}
                </section>

                {/* How It Works */}
                <section className="how-it-works">
                    <h2 className="page-title text-center">How It Works</h2>
                    <p className="page-subtitle text-center">Three simple steps to get the notes you need</p>
                    <div className="how-it-works-grid">
                        <div className="how-step animate-stagger-1">
                            <div className="how-step-number">1</div>
                            <div className="how-step-icon"><Star size={32} /></div>
                            <h3 className="how-step-title">Browse & Discover</h3>
                            <p className="how-step-desc">Search by topic, subject, or keyword. Filter through high-quality handwritten notes from top students.</p>
                        </div>
                        <div className="how-step animate-stagger-2">
                            <div className="how-step-number">2</div>
                            <div className="how-step-icon"><CreditCard size={32} /></div>
                            <h3 className="how-step-title">Purchase Securely</h3>
                            <p className="how-step-desc">Pay safely through our platform. Every note is reviewed and approved by our team before listing.</p>
                        </div>
                        <div className="how-step animate-stagger-3">
                            <div className="how-step-number">3</div>
                            <div className="how-step-icon"><Sparkles size={32} /></div>
                            <h3 className="how-step-title">Download & Study</h3>
                            <p className="how-step-desc">Instantly download your notes in high quality. Access them anytime from your dashboard.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <h2>Start Earning From Your Notes</h2>
                    <p>Got amazing lecture notes? Upload them on NoteNibo and earn money every time someone buys them.</p>
                    <Link href="/sell" className="btn btn-primary btn-lg">
                        Start Selling <ArrowRight size={16} style={{ display: "inline", verticalAlign: "middle" }} />
                    </Link>
                </section>
            </div>
        </>
    );
}

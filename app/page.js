"use client";

import { useState, useEffect } from "react";
import NoteCard from "@/components/NoteCard";

const UNIVERSITIES = [
  "All Universities",
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
];

export default function HomePage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");

  useEffect(() => {
    fetchNotes();
  }, [selectedUniversity]);

  async function fetchNotes(query = "") {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (selectedUniversity && selectedUniversity !== "All Universities") {
        params.set("university", selectedUniversity);
      }

      const res = await fetch(`/api/notes?${params.toString()}`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchNotes(searchQuery);
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Get the <span>Topper&apos;s Notes</span> You Need
          </h1>
          <p className="hero-subtitle">
            Bangladesh&apos;s first marketplace for handwritten university lecture
            notes. Buy, sell, and ace your exams.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="hero-search-input"
              placeholder="Search by subject, topic, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="hero-search-btn">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <div className="page-container">
        {/* University Filter */}
        <div className="filter-bar">
          {UNIVERSITIES.map((uni) => (
            <button
              key={uni}
              className={`filter-chip ${
                (uni === "All Universities" && !selectedUniversity) ||
                selectedUniversity === uni
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedUniversity(uni === "All Universities" ? "" : uni)
              }
            >
              {uni}
            </button>
          ))}
        </div>

        {/* Notes Grid */}
        <section>
          <div className="page-header">
            <h2 className="page-title">Featured Notes</h2>
            <p className="page-subtitle">
              Recently approved, top-quality lecture notes
            </p>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
            </div>
          ) : notes.length > 0 ? (
            <div className="notes-grid">
              {notes.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3 className="empty-state-title">No notes found</h3>
              <p className="empty-state-text">
                {searchQuery || selectedUniversity
                  ? "Try adjusting your search or filters."
                  : "Be the first to upload your notes and start earning!"}
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

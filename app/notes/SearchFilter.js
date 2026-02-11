"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search as SearchIcon, Filter, X } from "lucide-react";

export default function SearchFilter({ topics }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const initialQuery = searchParams.get("q") || "";
    const initialTopic = searchParams.get("topic") || "";

    const [search, setSearch] = useState(initialQuery);
    const [selectedTopic, setSelectedTopic] = useState(initialTopic);
    
    // Simple debounce implementation inside useEffect to avoid extra file for now
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== initialQuery) {
                updateParams({ q: search, page: 1 });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    function updateParams(updates) {
        const params = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === "" || value === null) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        
        startTransition(() => {
            router.push(`/notes?${params.toString()}`);
        });
    }

    const handleTopicChange = (topic) => {
        if (topic === selectedTopic) {
            setSelectedTopic("");
            updateParams({ topic: "", page: 1 });
        } else {
            setSelectedTopic(topic);
            updateParams({ topic, page: 1 });
        }
    };

    return (
        <div className="mb-8 space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted">
                    <SearchIcon size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search notes by title, subject, or keywords..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-border/50 rounded-2xl shadow-sm focus:outline-none focus:border-accent-light focus:shadow-[0_0_20px_rgba(253,121,168,0.1)] transition-all duration-300 text-text-main placeholder:text-text-muted"
                />
                {search && (
                    <button 
                        onClick={() => {
                            setSearch("");
                            updateParams({ q: "", page: 1 });
                        }}
                        className="absolute inset-y-0 right-4 flex items-center text-text-muted hover:text-danger transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Topic Filters */}
            <div className="flex flex-wrapjustify-center gap-2 justify-center">
                <button
                    onClick={() => handleTopicChange("")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                        !selectedTopic
                            ? "bg-text-main text-white border-text-main shadow-md"
                            : "bg-surface text-text-secondary border-border hover:border-text-secondary/30"
                    }`}
                >
                    All Topics
                </button>
                {topics.map((topic) => (
                    <button
                        key={topic}
                        onClick={() => handleTopicChange(topic)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                            selectedTopic === topic
                                ? "bg-accent text-white border-accent shadow-md shadow-accent/20"
                                : "bg-surface text-text-secondary border-border hover:border-accent-light hover:text-accent-dark hover:bg-pastel-pink/10"
                        }`}
                    >
                        {topic}
                    </button>
                ))}
            </div>
            
            {isPending && (
                 <div className="h-1 w-full bg-border/30 overflow-hidden rounded-full">
                    <div className="h-full bg-accent/50 animate-progress origin-left w-full"></div>
                 </div>
            )}
        </div>
    );
}

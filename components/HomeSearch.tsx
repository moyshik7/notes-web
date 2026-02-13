"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";

interface HomeSearchProps {
    availableTopics?: string[];
}

export default function HomeSearch({ availableTopics = [] }: HomeSearchProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopic, setSelectedTopic] = useState("");

    function handleSearch(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (selectedTopic) params.set("topic", selectedTopic);
        
        router.push(`/notes?${params.toString()}`);
    }

    function handleTopicClick(topic: string) {
        if (topic === selectedTopic) {
            setSelectedTopic("");
        } else {
            router.push(`/notes?topic=${topic}`);
        }
    }

    return (
        <>
            <form className="flex max-sm:flex-col gap-2 max-w-[600px] mx-auto bg-white/70 backdrop-blur-xl border-2 border-border/80 rounded-3xl max-sm:rounded-2xl p-1.5 shadow-lg shadow-primary/5 focus-within:bg-white/95 focus-within:border-accent-light focus-within:shadow-[0_0_32px_rgba(253,121,168,0.15)] transition-all duration-300" onSubmit={handleSearch}>
                <div className="relative flex-1 flex items-center">
                    <SearchIcon className="absolute left-4 text-text-muted" size={20} />
                    <input 
                        type="text" 
                        className="w-full border-none bg-transparent pl-12 pr-4 py-3 text-[0.95rem] text-text-main outline-none font-sans placeholder:text-text-muted" 
                        placeholder="Search by subject, code, or topic..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                </div>
                <button type="submit" className="px-8 py-3 bg-gradient-to-br from-accent to-primary text-white border-none rounded-2xl max-sm:rounded-xl font-bold text-sm cursor-pointer hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-sans whitespace-nowrap">
                    Search
                </button>
            </form>
        </>
    );    
}

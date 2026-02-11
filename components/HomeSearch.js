"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";

export default function HomeSearch({ availableTopics = [] }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopic, setSelectedTopic] = useState("");

    function handleSearch(e) {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (selectedTopic) params.set("topic", selectedTopic);
        
        router.push(`/notes?${params.toString()}`);
    }

    function handleTopicClick(topic) {
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

            {/* Topic Filter */}
            {/* Note: This is now placed inside the content area in the original design, but logically belongs with search functionality if we want filtering to feel cohesive. However, the original design had topics separate. 
                For the Server Component refactor, I'll extract the topic buttons logic here or keep them as simple Links if they navigate away. 
                Since we want navigation, simple Links are best, BUT to match the exact visual style and "selected" state interaction (even if transient), a client component is okay. 
                Actually, let's keep the Topic Filter separate in the main page as Links for better SEO, or use a separate client component if interactive state is complex.
                Given the requirement to redirect to /notes, simple Links or buttons that router.push are fine. 
            */}
        </>
    );    
}

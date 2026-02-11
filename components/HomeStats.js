"use client";

import { Star } from "lucide-react";

export default function HomeStats() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 px-6 bg-surface border-b border-border animate-fade-in">
            <div className="text-center">
                <div className="font-display text-3xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent">500+</div>
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Notes Shared</div>
            </div>
            <div className="text-center">
                <div className="font-display text-3xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent">200+</div>
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Happy Students</div>
            </div>
            <div className="text-center">
                <div className="font-display text-3xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent">50+</div>
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Universities</div>
            </div>
            <div className="text-center">
                <div className="font-display text-3xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent">4.8<Star size={18} className="inline align-text-top ml-1 fill-current" /></div>
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mt-1">Avg. Rating</div>
            </div>
        </div>
    );
}

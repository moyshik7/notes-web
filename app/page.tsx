import Link from "next/link";
import NoteCard from "@/components/NoteCard";
import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";
import "@/models/User"; // Ensure User schema is registered for populate()
import HomeSearch from "@/components/HomeSearch";
import HomeFAQ from "@/components/HomeFAQ";
import HomeStats from "@/components/HomeStats";
import { Sparkles, Star, Search as SearchIcon, CreditCard, ArrowRight } from "lucide-react";

export const revalidate = 3600; // ISR: Revalidate every hour

async function getHomeData() {
    await connectDB();

    const [featuredNotes, topics] = await Promise.all([
        Note.find({ status: "Approved" })
            .populate("uploader", "name image")
            .sort({ createdAt: -1 }) // Newest first
            .limit(12)
            .lean(),
        Note.distinct("topics", { status: "Approved" }),
    ]);

    return {
        notes: JSON.parse(JSON.stringify(featuredNotes)) as Array<{ _id: string; title: string; subject: string; topics?: string[]; price: number; preview?: string; purchaseCount?: number; uploader?: { name?: string; image?: string } }>,
        topics: (topics as string[]).sort(),
    };
}

export default async function HomePage() {
    const { notes, topics } = await getHomeData();

    return (
        <>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-pastel-purple via-pastel-pink to-pastel-blue py-20 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_40%,rgba(253,121,168,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_60%,rgba(108,92,231,0.12)_0%,transparent_40%),radial-gradient(circle_at_50%_90%,rgba(0,184,148,0.08)_0%,transparent_30%)]" />
                <div className="relative max-w-[800px] mx-auto animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-accent-light/30 text-xs font-semibold text-accent-dark mb-6 shadow-sm animate-fade-in">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        #1 Marketplace for Students
                    </div>
                    <h1 className="font-display text-5xl max-md:text-4xl font-extrabold text-text-main mb-6 leading-tight tracking-tight">
                        Get the <span className="bg-gradient-to-br from-accent-dark to-primary bg-clip-text text-transparent">Notes</span> You Need
                    </h1>
                    <p className="text-lg text-text-secondary mb-10 max-w-[600px] mx-auto leading-relaxed">
                        Access high-quality lecture notes, summaries, and study guides. Ace your exams with materials from top students across Bangladesh.
                    </p>
                    
                    <HomeSearch availableTopics={topics} />
                    
                    {/* Trusted Tags */}
                    <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-text-secondary font-medium animate-fade-in [animation-delay:200ms]">
                        <span className="px-3 py-1 rounded-lg bg-white/40 border border-white/60">✨ Verified Quality</span>
                        <span className="px-3 py-1 rounded-lg bg-white/40 border border-white/60">🚀 Instant Access</span>
                        <span className="px-3 py-1 rounded-lg bg-white/40 border border-white/60">💰 Earn Money</span>
                    </div>
                </div>
            </section>

            {/* Trust Stats Bar */}
            <HomeStats />

            {/* Main Content */}
            <div className="max-w-[1280px] mx-auto px-6 py-12 animate-fade-in">

                {/* Topic Filter Links */}
                <div className="flex gap-2 mb-8 flex-wrap animate-fade-in justify-center">
                    <Link
                        href="/notes"
                        className="px-5 py-2.5 rounded-full border-2 text-sm font-semibold cursor-pointer font-sans transition-all duration-200 border-border bg-surface text-text-secondary hover:border-accent-light hover:text-accent-dark hover:bg-pastel-pink"
                    >
                        View All
                    </Link>
                    {topics.slice(0, 10).map((topic) => (
                        <Link 
                            key={topic} 
                            href={`/notes?topic=${encodeURIComponent(topic)}`}
                            className="px-5 py-2.5 rounded-full border-2 text-sm font-semibold cursor-pointer font-sans transition-all duration-200 border-border bg-surface text-text-secondary hover:border-accent-light hover:text-accent-dark hover:bg-pastel-pink"
                        >
                            {topic}
                        </Link>
                    ))}
                    {topics.length > 10 && (
                        <Link
                            href="/notes"
                            className="px-5 py-2.5 rounded-full border-2 text-sm font-semibold cursor-pointer font-sans transition-all duration-200 border-border bg-surface text-text-secondary hover:border-accent-light hover:text-accent-dark hover:bg-pastel-pink"
                        >
                            +{topics.length - 10} more
                        </Link>
                    )}
                </div>

                {/* Featured Notes Grid */}
                <section className="mb-20">
                    <div className="flex items-end justify-between mb-8 max-sm:flex-col max-sm:items-start max-sm:gap-4">
                        <div>
                            <h2 className="font-display text-3xl font-extrabold text-text-main mb-2">Featured Notes</h2>
                            <p className="text-base text-text-secondary">Recently approved, top-quality study materials</p>
                        </div>
                        <Link href="/notes" className="text-sm font-bold text-accent hover:text-accent-dark flex items-center gap-1 transition-colors">
                            View All Notes <ArrowRight size={16} />
                        </Link>
                    </div>

                    {notes.length > 0 ? (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-sm:grid-cols-1 gap-8">
                            {notes.map((note) => (
                                <NoteCard key={note._id} note={note} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 px-8 bg-surface border border-dashed border-border rounded-3xl">
                            <div className="text-6xl mb-4 animate-float"><Sparkles size={48} className="text-accent-light mx-auto" /></div>
                            <h3 className="font-display text-xl font-bold text-text-main mb-2">No notes found</h3>
                            <p className="text-text-secondary max-w-[400px] mx-auto leading-relaxed mb-6">Be the first to upload your notes and start earning!</p>
                             <Link 
                                href="/sell"
                                className="inline-block px-6 py-2.5 border-2 border-border rounded-xl font-semibold text-text-secondary hover:border-accent hover:text-accent transition-all"
                             >
                                Start Selling
                             </Link>
                        </div>
                    )}
                </section>

                {/* Features Section */}
                <section className="mb-20">
                     <div className="text-center mb-12">
                        <span className="text-accent font-bold tracking-wider uppercase text-xs mb-2 block">Why Choose NoteNibo?</span>
                        <h2 className="font-display text-3xl font-extrabold text-text-main">Everything you need to excel</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-surface p-8 rounded-3xl border border-border hover:border-accent-light/50 hover:shadow-lg transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-pastel-purple flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                                <SearchIcon size={28} />
                            </div>
                            <h3 className="font-display text-xl font-bold text-text-main mb-3">Easy Discovery</h3>
                            <p className="text-text-secondary leading-relaxed">Find exactly what you need in seconds with our advanced search filters by subject, topic, or university.</p>
                        </div>
                        <div className="bg-surface p-8 rounded-3xl border border-border hover:border-accent-light/50 hover:shadow-lg transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-2xl bg-pastel-pink flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Star size={28} />
                            </div>
                            <h3 className="font-display text-xl font-bold text-text-main mb-3">Quality Assured</h3>
                            <p className="text-text-secondary leading-relaxed">Every note is reviewed by our team to ensure readability, accuracy, and relevance before it goes live.</p>
                        </div>
                        <div className="bg-surface p-8 rounded-3xl border border-border hover:border-accent-light/50 hover:shadow-lg transition-all duration-300 group">
                             <div className="w-14 h-14 rounded-2xl bg-pastel-mint flex items-center justify-center text-success mb-6 group-hover:scale-110 transition-transform duration-300">
                                <CreditCard size={28} />
                            </div>
                            <h3 className="font-display text-xl font-bold text-text-main mb-3">Secure Payments</h3>
                            <p className="text-text-secondary leading-relaxed">Buy with confidence using bKash, Nagad, or Rocket. Sellers get paid securely and on time.</p>
                        </div>
                    </div>
                </section>
                
                {/* Testimonials */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl font-extrabold text-text-main mb-3">Loved by Students</h2>
                        <p className="text-text-secondary">Join thousands of students who are acing their exams</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: "Rafiqul Islam", role: "CSE Student, BUET", text: "NoteNibo saved my semester! The notes are so organized and easy to understand. Highly recommended!" },
                            { name: "Sadia Rahman", role: "Medical Student, DMC", text: "I sold my anatomy notes here and earned enough to buy my books for the next year. Great platform!" },
                            { name: "Tanvir Ahmed", role: "BBA Student, NSU", text: "Finally a place to find quality notes specific to our curriculum. The instant download feature is a lifesaver." }
                        ].map((t, i) => (
                            <div key={i} className="bg-gradient-to-br from-white to-pastel-blue/30 p-8 rounded-3xl border border-border">
                                <div className="flex text-warning mb-4"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                                <p className="text-text-main mb-6 italic">&quot;{t.text}&quot;</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold text-sm">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-text-main">{t.name}</div>
                                        <div className="text-xs text-text-secondary">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="max-w-[800px] mx-auto mb-20">
                     <div className="text-center mb-10">
                        <h2 className="font-display text-3xl font-extrabold text-text-main mb-3">Frequently Asked Questions</h2>
                    </div>
                    <HomeFAQ />
                </section>

                {/* CTA Section */}
                <section className="text-center py-20 px-8 bg-gradient-to-br from-text-main to-primary-dark rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-primary/20 text-white">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%20opacity%3D%220.1%22%2F%3E%3C%2Fsvg%3E')] opacity-30 mix-blend-overlay" />
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-accent rounded-full blur-[80px] opacity-40 mix-blend-screen animate-pulse-soft"></div>
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary rounded-full blur-[80px] opacity-40 mix-blend-screen animate-pulse-soft [animation-delay:1s]"></div>
                    </div>
                    
                    <div className="relative z-10 max-w-[600px] mx-auto">
                        <h2 className="font-display text-4xl font-extrabold mb-6 leading-tight">Ready to Boost Your Grades?</h2>
                        <p className="text-white/80 text-lg mb-10 leading-relaxed">Join the fastest growing student community in Bangladesh today.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/notes" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-primary font-bold bg-white text-base shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-gray-50 transition-all duration-200">
                                Browse Notes
                            </Link>
                             <Link href="/sell" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold bg-white/10 backdrop-blur-md border border-white/20 text-base shadow-lg hover:bg-white/20 hover:-translate-y-1 transition-all duration-200">
                                Start Selling
                             </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

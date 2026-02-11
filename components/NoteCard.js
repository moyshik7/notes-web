/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function NoteCard({ note }) {
    const formattedPrice = new Intl.NumberFormat("en-BD").format(note.price);

    return (
        <Link href={`/notes/${note._id}`} className="group flex flex-col bg-surface border border-border rounded-2xl overflow-hidden cursor-pointer no-underline relative animate-fade-in-up shadow-card hover:shadow-lg hover:-translate-y-1.5 transition-all duration-500">
            {note.preview ? (
                <div className="relative w-full h-[180px] overflow-hidden rounded-t-xl bg-gray-100">
                    <img
                        src={note.preview}
                        alt={note.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.style.display = "none";
                        }}
                    />
                    <div className="absolute top-3 right-3 text-[0.7rem] font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-pastel-lavender text-primary">
                        {note.subject}
                    </div>
                </div>
            ) : (
                <div className="px-5 pt-5 flex items-start justify-between">
                    <div className="text-[0.7rem] font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-pastel-lavender text-primary">{note.subject}</div>
                </div>
            )}

            <div className="px-5 pb-5 pt-4 flex-1 flex flex-col">
                <h3 className="font-display text-[1.05rem] font-semibold text-text-main mb-2 leading-snug line-clamp-2">{note.title}</h3>
                <p className="flex flex-wrap gap-1.5 mb-auto pb-3">
                    {(note.topics || []).map((topic, i) => (
                        <span key={i} className="inline-block text-[0.7rem] font-medium px-2.5 py-0.5 rounded-full bg-pastel-blue text-primary whitespace-nowrap group-hover:bg-pastel-pink group-hover:text-accent-dark transition-all duration-150">
                            {topic}
                        </span>
                    ))}
                </p>

                <div className="flex items-end justify-between pt-3 border-t border-dashed border-border">
                    <div className="font-display text-xl font-bold text-accent-dark">৳{formattedPrice}</div>
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs text-text-secondary">{note.uploader?.name || "Anonymous"}</span>
                        {note.purchaseCount > 0 && <span className="text-[0.7rem] text-text-muted bg-pastel-mint px-2 py-0.5 rounded-full">{note.purchaseCount} sold</span>}
                    </div>
                </div>
            </div>
        </Link>
    );
}

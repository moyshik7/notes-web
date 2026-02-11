import Link from "next/link";

export default function NoteCard({ note }) {
  const formattedPrice = new Intl.NumberFormat("en-BD").format(note.price);

  return (
    <Link href={`/notes/${note._id}`} className="note-card">
      <div className="note-card-header">
        <div className="note-card-icon">📄</div>
        <div className="note-card-badge">{note.subject}</div>
      </div>

      <div className="note-card-body">
        <h3 className="note-card-title">{note.title}</h3>
        <p className="note-card-topics">
          {(note.topics || []).map((topic, i) => (
            <span key={i} className="note-card-topic-tag">
              {topic}
            </span>
          ))}
        </p>

        <div className="note-card-footer">
          <div className="note-card-price">৳{formattedPrice}</div>
          <div className="note-card-meta">
            <span className="note-card-uploader">
              {note.uploader?.name || "Anonymous"}
            </span>
            {note.purchaseCount > 0 && (
              <span className="note-card-purchases">
                {note.purchaseCount} sold
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

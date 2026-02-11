import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const note = await Note.findById(id)
      .populate("uploader", "name image")
      .lean();

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.status !== "Approved") {
      return NextResponse.json(
        { error: "This note is not available" },
        { status: 403 }
      );
    }

    // Don't expose the full fileUrl to unauthenticated/non-purchasers
    const { fileUrl, ...safeNote } = note;

    return NextResponse.json({ note: safeNote });
  } catch (error) {
    console.error("[Note Detail] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

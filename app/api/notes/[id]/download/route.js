import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";
import User from "@/models/User";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const note = await Note.findById(id);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Security: Check if user has purchased this note or is the uploader
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPurchased = user.purchasedNotes.some(
      (noteId) => noteId.toString() === id
    );
    const isUploader = note.uploader.toString() === session.user.id;
    const isAdmin = user.role === "admin";

    if (!isPurchased && !isUploader && !isAdmin) {
      return NextResponse.json(
        { error: "You do not have access to download this note" },
        { status: 403 }
      );
    }

    // Generate presigned URL (valid for 1 hour)
    const downloadUrl = await getSignedDownloadUrl(note.fileUrl, 3600);

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error("[Download] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Note from "@/models/Note";
import Submission from "@/models/Submission";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify admin role
    const user = await User.findById(session.user.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status, feedback, preview, images } = await request.json();

    if (!["Approved", "Rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'Approved' or 'Rejected'" },
        { status: 400 }
      );
    }

    // Update note status and optional image fields
    const updateData = { status };
    if (preview !== undefined) updateData.preview = preview;
    if (images !== undefined) updateData.images = images;
    
    const note = await Note.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Update submission record
    await Submission.findOneAndUpdate(
      { noteId: id },
      {
        status,
        adminFeedback: feedback || "",
        reviewedAt: new Date(),
      }
    );

    return NextResponse.json({
      message: `Note ${status.toLowerCase()} successfully`,
      note: {
        id: note._id.toString(),
        title: note.title,
        status: note.status,
      },
    });
  } catch (error) {
    console.error("[Admin Note Update] Error:", error);
    return NextResponse.json(
      { error: "Failed to update note status" },
      { status: 500 }
    );
  }
}

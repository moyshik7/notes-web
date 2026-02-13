import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";
import Submission from "@/models/Submission";
import { uploadToR2, getSignedDownloadUrl } from "@/lib/r2";
import { sendToTelegram } from "@/lib/telegram";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const topicsRaw = formData.get("topics") as string;
    const subject = formData.get("subject") as string;
    const price = parseFloat(formData.get("price") as string);
    const file = formData.get("file") as File;

    // Parse topics array
    let topics: string[];
    try {
      const parsed = JSON.parse(topicsRaw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error();
      }
      topics = (parsed as string[]).map((t) => t.trim()).filter((t) => t.length > 0);
      if (topics.length === 0) throw new Error();
    } catch {
      return NextResponse.json(
        { error: "At least one topic is required" },
        { status: 400 }
      );
    }

    // Validation
    if (!title || !description || !topics || !subject || !price || !file) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must not exceed 50MB" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get uploader info
    const uploader = await User.findById(session.user.id);
    if (!uploader) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique key for R2
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `notes/${session.user.id}/${timestamp}_${sanitizedName}`;

    // Upload to Cloudflare R2
    await uploadToR2(buffer, fileKey, "application/pdf");

    // Create Note document
    const note = await Note.create({
      title,
      description,
      topics,
      subject,
      price,
      fileUrl: fileKey,
      previewUrl: fileKey, // Same file — preview restriction handled client-side
      uploader: session.user.id,
      status: "Pending",
    });

    // Create Submission record
    await Submission.create({
      noteId: note._id,
      uploaderId: session.user.id,
      status: "Pending",
    });

    // Send to Telegram for admin review (fire & forget)
    sendToTelegram({
      title,
      description,
      topics: topics.join(", "),
      subject,
      price,
      uploaderName: uploader.name,
      uploaderId: session.user.id,
      noteId: note._id.toString(),
      fileUrl: await getSignedDownloadUrl(fileKey, 86400),
    }).catch((err: unknown) =>
      console.error("[Upload] Telegram notification failed:", err)
    );

    return NextResponse.json(
      {
        message: "Note uploaded successfully. It will be reviewed before publishing.",
        note: {
          id: note._id.toString(),
          title: note.title,
          status: note.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload note" },
      { status: 500 }
    );
  }
}

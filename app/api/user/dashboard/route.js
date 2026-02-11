import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Note from "@/models/Note";
import Transaction from "@/models/Transaction";
import Submission from "@/models/Submission";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .populate({
        path: "purchasedNotes",
        select: "title topics subject price uploader createdAt",
        populate: { path: "uploader", select: "name" },
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get uploaded notes with sales data
    const uploadedNotes = await Note.find({ uploader: session.user.id })
      .select("title topics subject price status purchaseCount createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate total earnings
    const transactions = await Transaction.find()
      .populate("noteId", "uploader")
      .lean();

    const totalEarnings = transactions
      .filter(
        (t) => t.noteId?.uploader?.toString() === session.user.id
      )
      .reduce((sum, t) => sum + t.sellerAmount, 0);

    // Get submissions
    const submissions = await Submission.find({
      uploaderId: session.user.id,
    })
      .populate("noteId", "title topics subject price")
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
      },
      purchases: user.purchasedNotes || [],
      uploadedNotes,
      totalEarnings,
      submissions,
    });
  } catch (error) {
    console.error("[Dashboard] Error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}

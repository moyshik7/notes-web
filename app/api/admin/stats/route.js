import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Note from "@/models/Note";
import Transaction from "@/models/Transaction";
import BalanceRequest from "@/models/BalanceRequest";

export async function GET() {
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

    const [totalNotes, pendingCount, approvedCount, rejectedCount, transactions, pendingBalanceCount] =
      await Promise.all([
        Note.countDocuments(),
        Note.countDocuments({ status: "Pending" }),
        Note.countDocuments({ status: "Approved" }),
        Note.countDocuments({ status: "Rejected" }),
        Transaction.find().lean(),
        BalanceRequest.countDocuments({ status: "Pending" }),
      ]);

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const platformRevenue = transactions.reduce(
      (sum, t) => sum + t.platformAmount,
      0
    );

    // Get pending notes for review
    const pendingNotesRaw = await Note.find({ status: "Pending" })
      .populate("uploader", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Serialize pending notes
    const pendingNotes = pendingNotesRaw.map((note) => ({
      _id: note._id.toString(),
      title: note.title,
      description: note.description,
      topics: note.topics,
      subject: note.subject,
      price: note.price,
      preview: note.preview || "",
      images: note.images || [],
      createdAt: note.createdAt.toISOString(),
      uploader: note.uploader ? {
        _id: note.uploader._id.toString(),
        name: note.uploader.name,
        email: note.uploader.email,
      } : null,
    }));

    // Get pending balance requests for review
    const pendingBalanceRequests = await BalanceRequest.find({ status: "Pending" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Serialize balance requests
    const serializedBalanceRequests = pendingBalanceRequests.map((req) => ({
      _id: req._id.toString(),
      amount: req.amount,
      method: req.method,
      transactionId: req.transactionId,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
      user: req.userId ? {
        _id: req.userId._id.toString(),
        name: req.userId.name,
        email: req.userId.email,
      } : null,
    }));

    return NextResponse.json({
      stats: {
        totalNotes,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalRevenue,
        platformRevenue,
        totalTransactions: transactions.length,
        pendingBalanceCount,
      },
      pendingNotes,
      pendingBalanceRequests: serializedBalanceRequests,
    });
  } catch (error) {
    console.error("[Admin Stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to load admin stats" },
      { status: 500 }
    );
  }
}

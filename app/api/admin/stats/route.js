import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Note from "@/models/Note";
import Transaction from "@/models/Transaction";

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

    const [totalNotes, pendingCount, approvedCount, rejectedCount, transactions] =
      await Promise.all([
        Note.countDocuments(),
        Note.countDocuments({ status: "Pending" }),
        Note.countDocuments({ status: "Approved" }),
        Note.countDocuments({ status: "Rejected" }),
        Transaction.find().lean(),
      ]);

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const platformRevenue = transactions.reduce(
      (sum, t) => sum + t.platformAmount,
      0
    );

    // Get pending notes for review
    const pendingNotes = await Note.find({ status: "Pending" })
      .populate("uploader", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      stats: {
        totalNotes,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalRevenue,
        platformRevenue,
        totalTransactions: transactions.length,
      },
      pendingNotes,
    });
  } catch (error) {
    console.error("[Admin Stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to load admin stats" },
      { status: 500 }
    );
  }
}

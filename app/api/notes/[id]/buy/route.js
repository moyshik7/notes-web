import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export async function POST(request, { params }) {
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

    if (note.status !== "Approved") {
      return NextResponse.json(
        { error: "This note is not available for purchase" },
        { status: 403 }
      );
    }

    // Check if already purchased
    const buyer = await User.findById(session.user.id);

    if (!buyer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (buyer.purchasedNotes.includes(note._id)) {
      return NextResponse.json(
        { error: "You have already purchased this note" },
        { status: 409 }
      );
    }

    // Prevent buying your own note
    if (note.uploader.toString() === session.user.id) {
      return NextResponse.json(
        { error: "You cannot buy your own note" },
        { status: 400 }
      );
    }

    // Calculate revenue split
    const totalAmount = note.price;
    const sellerAmount = Math.round(totalAmount * 0.9 * 100) / 100; // 90%
    const platformAmount = Math.round(totalAmount * 0.1 * 100) / 100; // 10%

    // Create transaction
    const transaction = await Transaction.create({
      buyerId: session.user.id,
      noteId: note._id,
      amount: totalAmount,
      sellerAmount,
      platformAmount,
    });

    // Add note to buyer's purchased list
    buyer.purchasedNotes.push(note._id);
    await buyer.save();

    // Credit seller's wallet
    await User.findByIdAndUpdate(note.uploader, {
      $inc: { walletBalance: sellerAmount },
    });

    // Increment purchase count
    note.purchaseCount += 1;
    await note.save();

    return NextResponse.json({
      message: "Purchase successful!",
      transaction: {
        id: transaction._id.toString(),
        amount: totalAmount,
        sellerAmount,
        platformAmount,
      },
    });
  } catch (error) {
    console.error("[Buy] Error:", error);
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}

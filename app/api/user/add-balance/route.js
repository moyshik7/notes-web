import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { amount } = await request.json();

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const amountNum = parseFloat(amount);

    if (amountNum < 10) {
      return NextResponse.json(
        { error: "Minimum amount is ৳10" },
        { status: 400 }
      );
    }

    if (amountNum > 100000) {
      return NextResponse.json(
        { error: "Maximum amount is ৳100,000" },
        { status: 400 }
      );
    }

    // Update user balance
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $inc: { walletBalance: amountNum } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Balance added successfully",
      newBalance: user.walletBalance,
      amountAdded: amountNum,
    });
  } catch (error) {
    console.error("[Add Balance] Error:", error);
    return NextResponse.json(
      { error: "Failed to add balance" },
      { status: 500 }
    );
  }
}

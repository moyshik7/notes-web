import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import BalanceRequest from "@/models/BalanceRequest";
import { sendBalanceRequestToTelegram } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { amount, method, transactionId } = await request.json() as {
      amount: number | string;
      method: string;
      transactionId: string;
    };

    // Validate amount
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const amountNum = parseFloat(String(amount));

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

    // Validate method
    if (!method || !["bkash", "nagad"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Validate transaction ID
    if (!transactionId || transactionId.trim().length === 0) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Check if transaction ID already exists
    const existingRequest = await BalanceRequest.findOne({ 
      transactionId: transactionId.trim() 
    });
    
    if (existingRequest) {
      return NextResponse.json(
        { error: "This transaction ID has already been used" },
        { status: 400 }
      );
    }

    // Get user info
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create a pending balance request
    const balanceRequest = await BalanceRequest.create({
      userId: session.user.id,
      amount: amountNum,
      method: method as "bkash" | "nagad",
      transactionId: transactionId.trim(),
      status: "Pending",
    });

    // Send notification to Telegram
    await sendBalanceRequestToTelegram({
      requestId: balanceRequest._id.toString(),
      userName: user.name,
      userEmail: user.email,
      userId: user._id.toString(),
      amount: amountNum,
      method: method as "bkash" | "nagad",
      transactionId: transactionId.trim(),
    });

    return NextResponse.json({
      message: "Balance request submitted successfully",
      requestId: balanceRequest._id,
    });
  } catch (error) {
    console.error("[Add Balance] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit balance request" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import BalanceRequest from "@/models/BalanceRequest";

interface PopulatedBalanceRequest {
  _id: { toString(): string };
  amount: number;
  method: string;
  transactionId: string;
  status: string;
  createdAt: { toISOString(): string };
  userId: {
    _id: { toString(): string };
    name: string;
    email: string;
  } | null;
}

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

    // Get pending balance requests
    const pendingRequests = await BalanceRequest.find({ status: "Pending" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean() as unknown as PopulatedBalanceRequest[];

    // Serialize the data
    const serializedRequests = pendingRequests.map((req) => ({
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
      pendingBalanceRequests: serializedRequests,
    });
  } catch (error) {
    console.error("[Admin Balance Requests] Error:", error);
    return NextResponse.json(
      { error: "Failed to load balance requests" },
      { status: 500 }
    );
  }
}

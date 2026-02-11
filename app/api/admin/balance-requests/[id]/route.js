import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import BalanceRequest from "@/models/BalanceRequest";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify admin role
    const adminUser = await User.findById(session.user.id);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status, adminNote } = await request.json();

    if (!["Approved", "Rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'Approved' or 'Rejected'" },
        { status: 400 }
      );
    }

    // Find the balance request
    const balanceRequest = await BalanceRequest.findById(id);
    
    if (!balanceRequest) {
      return NextResponse.json(
        { error: "Balance request not found" },
        { status: 404 }
      );
    }

    if (balanceRequest.status !== "Pending") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    // Update the balance request
    balanceRequest.status = status;
    balanceRequest.adminNote = adminNote || "";
    balanceRequest.reviewedAt = new Date();
    await balanceRequest.save();

    // If approved, add balance to user's wallet
    if (status === "Approved") {
      await User.findByIdAndUpdate(
        balanceRequest.userId,
        { $inc: { walletBalance: balanceRequest.amount } }
      );
    }

    return NextResponse.json({
      message: `Balance request ${status.toLowerCase()} successfully`,
      request: {
        id: balanceRequest._id.toString(),
        status: balanceRequest.status,
        amount: balanceRequest.amount,
      },
    });
  } catch (error) {
    console.error("[Admin Balance Request Update] Error:", error);
    return NextResponse.json(
      { error: "Failed to update balance request" },
      { status: 500 }
    );
  }
}

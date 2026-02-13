import mongoose, { Document, Model } from "mongoose";
import type { IBalanceRequest } from "@/types";

export interface IBalanceRequestDocument extends Omit<IBalanceRequest, "_id">, Document {}

const BalanceRequestSchema = new mongoose.Schema<IBalanceRequestDocument>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: [10, "Minimum amount is ৳10"],
        },
        method: {
            type: String,
            enum: ["bkash", "nagad"],
            required: true,
        },
        transactionId: {
            type: String,
            required: [true, "Transaction ID is required"],
            trim: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        adminNote: {
            type: String,
            default: "",
        },
        reviewedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

BalanceRequestSchema.index({ userId: 1 });
BalanceRequestSchema.index({ status: 1 });

export default (mongoose.models.BalanceRequest as Model<IBalanceRequestDocument>) || mongoose.model<IBalanceRequestDocument>("BalanceRequest", BalanceRequestSchema);

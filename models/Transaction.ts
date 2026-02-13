import mongoose, { Document, Model } from "mongoose";
import type { ITransaction } from "@/types";

export interface ITransactionDocument extends Omit<ITransaction, "_id">, Document {}

const TransactionSchema = new mongoose.Schema<ITransactionDocument>({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    sellerAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    platformAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

TransactionSchema.index({ buyerId: 1 });
TransactionSchema.index({ noteId: 1 });

export default (mongoose.models.Transaction as Model<ITransactionDocument>) || mongoose.model<ITransactionDocument>("Transaction", TransactionSchema);

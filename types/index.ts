import { Types } from "mongoose";

// ─── Domain Models ───────────────────────────────────────────────

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    image: string;
    role: "student" | "admin";
    walletBalance: number;
    purchasedNotes: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface INote {
    _id: Types.ObjectId;
    title: string;
    description: string;
    topics: string[];
    subject: string;
    price: number;
    fileUrl: string;
    previewUrl: string;
    coverImage: string;
    preview: string;
    images: string[];
    uploader: Types.ObjectId | IUser;
    status: "Pending" | "Approved" | "Rejected";
    purchaseCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITransaction {
    _id: Types.ObjectId;
    buyerId: Types.ObjectId;
    noteId: Types.ObjectId;
    amount: number;
    sellerAmount: number;
    platformAmount: number;
    timestamp: Date;
}

export interface ISubmission {
    _id: Types.ObjectId;
    noteId: Types.ObjectId;
    uploaderId: Types.ObjectId;
    status: "Pending" | "Approved" | "Rejected";
    adminFeedback: string;
    submittedAt: Date;
    reviewedAt: Date | null;
}

export interface IBalanceRequest {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    amount: number;
    method: "bkash" | "nagad";
    transactionId: string;
    status: "Pending" | "Approved" | "Rejected";
    adminNote: string;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Telegram Payloads ───────────────────────────────────────────

export interface NoteData {
    title: string;
    description: string;
    topics: string;
    subject: string;
    price: number;
    uploaderName: string;
    uploaderId: string;
    noteId: string;
    fileUrl: string;
}

export interface BalanceRequestData {
    requestId: string;
    userName: string;
    userEmail: string;
    userId: string;
    amount: number;
    method: "bkash" | "nagad";
    transactionId: string;
}

// ─── Cache ───────────────────────────────────────────────────────

export interface CacheEntry<T> {
    data: T;
    ts: number;
}

// ─── NextAuth Module Augmentation ────────────────────────────────

declare module "next-auth" {
    interface User {
        id: string;
        role?: string;
    }
    interface Session {
        user: {
            id: string;
            role: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId?: string;
        role?: string;
    }
}

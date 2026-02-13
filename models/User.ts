import mongoose, { Document, Model } from "mongoose";
import type { IUser } from "@/types";

export interface IUserDocument extends Omit<IUser, "_id">, Document {}

const UserSchema = new mongoose.Schema<IUserDocument>(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
            trim: true,
            maxlength: [60, "Name cannot be more than 60 characters"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            select: false, // Don't include password in queries by default
        },
        image: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student",
        },
        walletBalance: {
            type: Number,
            default: 0,
            min: 0,
        },
        purchasedNotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Note",
            },
        ],
    },
    {
        timestamps: true,
    },
);

export default (mongoose.models.User as Model<IUserDocument>) || mongoose.model<IUserDocument>("User", UserSchema);

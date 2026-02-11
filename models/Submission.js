import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
        required: true,
    },
    uploaderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },
    adminFeedback: {
        type: String,
        default: "",
        maxlength: [500, "Feedback cannot exceed 500 characters"],
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    reviewedAt: {
        type: Date,
        default: null,
    },
});

SubmissionSchema.index({ uploaderId: 1 });
SubmissionSchema.index({ status: 1 });

export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);

import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    topics: {
      type: [String],
      required: [true, "Please provide at least one topic"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0 && v.every((t) => t.trim().length > 0);
        },
        message: "At least one non-empty topic is required",
      },
    },
    subject: {
      type: String,
      required: [true, "Please specify the subject"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please set a price in BDT"],
      min: [0, "Price cannot be negative"],
    },
    fileUrl: {
      type: String, // R2 object key for the full PDF
      required: true,
    },
    previewUrl: {
      type: String, // R2 object key for the first 3 pages preview
      default: "",
    },
    coverImage: {
      type: String, // R2 object key for cover thumbnail
      default: "",
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    purchaseCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
NoteSchema.index({ title: "text", description: "text", subject: "text", topics: "text" });
NoteSchema.index({ topics: 1, subject: 1 });
NoteSchema.index({ status: 1 });

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);

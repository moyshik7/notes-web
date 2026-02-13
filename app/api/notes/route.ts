import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const topic = searchParams.get("topic");
        const subject = searchParams.get("subject");
        const q = searchParams.get("q");
        const distinct = searchParams.get("distinct");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const skip = (page - 1) * limit;

        // Return distinct topic values if requested
        if (distinct === "topics") {
            const topics = await Note.distinct("topics", { status: "Approved" });
            return NextResponse.json({ topics: (topics as string[]).sort() });
        }

        // Build query — only show approved notes
        const query: Record<string, unknown> = { status: "Approved" };

        if (topic) {
            query.topics = { $regex: topic, $options: "i" };
        }

        if (subject) {
            query.subject = { $regex: subject, $options: "i" };
        }

        if (q) {
            query.$text = { $search: q };
        }

        const [notes, total] = await Promise.all([Note.find(query).populate("uploader", "name image").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Note.countDocuments(query)]);

        return NextResponse.json({
            notes,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("[Notes List] Error:", error);
        return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
    }
}

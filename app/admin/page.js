import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Note from "@/models/Note";
import Transaction from "@/models/Transaction";
import AdminDashboard from "@/components/AdminDashboard";

async function getAdminData() {
    await connectDB();

    // Get stats
    const [totalRevenue, totalNotes, pendingCount, approvedCount, rejectedCount, totalTransactions] = await Promise.all([
        Transaction.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                    platformRevenue: { $sum: "$platformAmount" },
                },
            },
        ]),
        Note.countDocuments(),
        Note.countDocuments({ status: "Pending" }),
        Note.countDocuments({ status: "Approved" }),
        Note.countDocuments({ status: "Rejected" }),
        Transaction.countDocuments(),
    ]);

    const stats = {
        totalRevenue: totalRevenue[0]?.totalRevenue || 0,
        platformRevenue: totalRevenue[0]?.platformRevenue || 0,
        totalNotes,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalTransactions,
    };

    // Get pending notes
    const pendingNotes = await Note.find({ status: "Pending" }).populate("uploader", "name email").sort({ createdAt: -1 }).lean();

    // Convert MongoDB objects to plain objects with string IDs
    const serializedNotes = pendingNotes.map((note) => ({
        ...note,
        _id: note._id.toString(),
        uploader: {
            ...note.uploader,
            _id: note.uploader._id.toString(),
        },
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
    }));

    return {
        stats,
        pendingNotes: serializedNotes,
    };
}

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user?.id) {
        redirect("/login");
    }

    // Check if user is admin (server-side)
    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user || user.role !== "admin") {
        redirect("/dashboard");
    }

    // Fetch data server-side
    const data = await getAdminData();

    return <AdminDashboard initialData={data} />;
}

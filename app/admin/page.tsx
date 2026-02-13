"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { useCache } from "@/lib/useCache";
import { AlertCircle, Shield } from "lucide-react";

interface AdminStats {
    totalNotes: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalRevenue: number;
    platformRevenue: number;
    totalTransactions: number;
    pendingBalanceCount: number;
}

interface PendingNote {
    _id: string;
    title: string;
    description: string;
    topics: string[];
    subject: string;
    price: number;
    preview?: string;
    images?: string[];
    createdAt: string;
    uploader?: { _id: string; name: string; email: string };
}

interface BalanceRequestItem {
    _id: string;
    amount: number;
    method: string;
    transactionId: string;
    status: string;
    createdAt: string;
    user?: { _id: string; name: string; email: string };
}

interface AdminData {
    stats: AdminStats;
    pendingNotes: PendingNote[];
    pendingBalanceRequests: BalanceRequestItem[];
}

export default function AdminPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();

    const { data: adminData, loading, error } = useCache<AdminData>(
        session?.user?.role === "admin" ? "admin-stats" : "admin-stats-placeholder",
        async () => {
            const res = await fetch("/api/admin/stats");
            if (!res.ok) throw new Error("Failed to load admin data");
            return res.json();
        },
        30 * 1000
    );

    useEffect(() => {
        if (authStatus === "unauthenticated") router.push("/login");
    }, [authStatus, router]);

    if (authStatus === "loading" || loading) {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-8">
                <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer h-[600px] rounded-2xl" />
            </div>
        );
    }

    if (session?.user?.role !== "admin") {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-8 text-center">
                <Shield size={48} className="text-danger mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-text-secondary">Access Denied</h3>
                <p className="text-text-muted mt-2">You do not have admin permissions.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-8 text-center">
                <AlertCircle size={48} className="text-danger mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-text-secondary">Failed to load admin data</h3>
                <p className="text-text-muted mt-2">{error.message}</p>
            </div>
        );
    }

    if (!adminData) return null;

    return <AdminDashboard initialData={adminData} />;
}

"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddBalancePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentBalance, setCurrentBalance] = useState(0);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchBalance();
        }
    }, [status, router]);

    async function fetchBalance() {
        try {
            const res = await fetch("/api/user/dashboard");
            const data = await res.json();
            if (res.ok && data.user) {
                setCurrentBalance(data.user.walletBalance || 0);
            }
        } catch {
            // Silently fail
        }
    }

    async function handleAddBalance(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        const amountNum = parseFloat(amount);
        
        if (isNaN(amountNum) || amountNum <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        if (amountNum < 10) {
            setError("Minimum amount is ৳10");
            return;
        }

        if (amountNum > 100000) {
            setError("Maximum amount is ৳100,000");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/user/add-balance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amountNum }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(`✅ Successfully added ৳${new Intl.NumberFormat("en-BD").format(amountNum)} to your account!`);
                setAmount("");
                setCurrentBalance(data.newBalance);
                
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    router.push("/dashboard");
                }, 2000);
            } else {
                setError(data.error || "Failed to add balance");
            }
        } catch {
            setError("Failed to process request");
        } finally {
            setLoading(false);
        }
    }

    const quickAmounts = [50, 100, 200, 500, 1000, 2000];

    if (status === "loading") {
        return (
            <div className="page-container">
                <div className="skeleton" style={{ width: 200, height: 32, marginBottom: 24 }} />
                <div className="skeleton" style={{ width: "100%", height: 400, borderRadius: 16 }} />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">💳 Add Balance</h1>
                <p className="page-subtitle">Add funds to your NoteNibo wallet</p>
            </div>

            <div style={{ 
                maxWidth: "600px", 
                margin: "0 auto",
            }}>
                {/* Current Balance Card */}
                <div style={{
                    background: "linear-gradient(135deg, var(--pastel-purple), var(--pastel-pink))",
                    padding: "2rem",
                    borderRadius: "16px",
                    marginBottom: "2rem",
                    border: "1px solid var(--color-border)",
                    textAlign: "center",
                }}>
                    <p style={{ 
                        fontSize: "0.875rem", 
                        color: "var(--color-text-secondary)",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                    }}>
                        Current Balance
                    </p>
                    <p style={{ 
                        fontSize: "2.5rem", 
                        fontWeight: 700,
                        color: "var(--color-primary)",
                        margin: 0,
                    }}>
                        ৳{new Intl.NumberFormat("en-BD").format(currentBalance)}
                    </p>
                </div>

                {/* Add Balance Form */}
                <div className="card">
                    <form onSubmit={handleAddBalance}>
                        <div className="form-group">
                            <label className="form-label">Amount (BDT)</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="10"
                                max="100000"
                                step="1"
                                required
                            />
                            <p className="form-hint">Minimum: ৳10 · Maximum: ৳100,000</p>
                        </div>

                        {/* Quick Amount Buttons */}
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label className="form-label" style={{ marginBottom: "0.75rem" }}>
                                Quick Select
                            </label>
                            <div style={{ 
                                display: "grid", 
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "0.75rem",
                            }}>
                                {quickAmounts.map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setAmount(amt.toString())}
                                        style={{
                                            padding: "0.75rem",
                                            fontSize: "0.875rem",
                                        }}
                                    >
                                        ৳{new Intl.NumberFormat("en-BD").format(amt)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        <div style={{ 
                            display: "flex", 
                            gap: "0.75rem",
                            marginTop: "1.5rem",
                        }}>
                            <Link href="/dashboard" className="btn btn-secondary" style={{ flex: 1 }}>
                                Cancel
                            </Link>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={loading}
                                style={{ flex: 2 }}
                            >
                                {loading ? "Processing..." : "💰 Add Balance"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div style={{
                    marginTop: "2rem",
                    padding: "1.5rem",
                    background: "var(--pastel-blue)",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                }}>
                    <h3 style={{ 
                        fontSize: "1rem", 
                        marginBottom: "1rem",
                        color: "var(--color-text)",
                    }}>
                        ℹ️ Payment Information
                    </h3>
                    <ul style={{ 
                        margin: 0, 
                        paddingLeft: "1.5rem",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.875rem",
                        lineHeight: "1.8",
                    }}>
                        <li>This is a demo system - funds are virtual</li>
                        <li>Use your balance to purchase notes</li>
                        <li>Earn 90% of sales when users buy your notes</li>
                        <li>Minimum add balance: ৳10</li>
                        <li>Maximum add balance: ৳100,000</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

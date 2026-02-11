"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const MERCHANT_NUMBER = "01885596054";

export default function AddBalancePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [step, setStep] = useState("amount"); // amount | method | transaction
    const [amount, setAmount] = useState("");
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [transactionId, setTransactionId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    if (status === "loading") {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-state-icon">⏳</div>
                    <h3 className="empty-state-title">Loading...</h3>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        router.push("/login");
        return null;
    }

    const handleCopyNumber = async () => {
        try {
            await navigator.clipboard.writeText(MERCHANT_NUMBER);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = MERCHANT_NUMBER;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleAmountSubmit = (e) => {
        e.preventDefault();
        setError("");
        
        const amountNum = parseFloat(amount);
        if (!amount || isNaN(amountNum) || amountNum < 10) {
            setError("Minimum amount is ৳10");
            return;
        }
        if (amountNum > 100000) {
            setError("Maximum amount is ৳100,000");
            return;
        }
        
        setStep("method");
    };

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        setStep("transaction");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!transactionId.trim()) {
            setError("Please enter your transaction ID");
            return;
        }
        
        setLoading(true);
        
        try {
            const res = await fetch("/api/user/add-balance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    method: selectedMethod,
                    transactionId: transactionId.trim(),
                }),
            });
            
            const result = await res.json();
            
            if (res.ok) {
                setStep("success");
            } else {
                setError(result.error || "Failed to submit request");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === "transaction") {
            setStep("method");
            setSelectedMethod(null);
        } else if (step === "method") {
            setStep("amount");
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">💳 Add Balance</h1>
                <p className="page-subtitle">
                    {step === "amount" && "Enter the amount you want to add"}
                    {step === "method" && "Choose your payment method"}
                    {step === "transaction" && "Complete your payment"}
                    {step === "success" && "Request submitted!"}
                </p>
            </div>

            <div 
                style={{
                    maxWidth: "500px",
                    margin: "0 auto",
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-lg)",
                    padding: "2rem",
                    boxShadow: "var(--shadow-card)",
                }}
            >
                {/* Step: Amount */}
                {step === "amount" && (
                    <form onSubmit={handleAmountSubmit}>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label 
                                style={{ 
                                    display: "block", 
                                    marginBottom: "0.5rem", 
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                }}
                            >
                                Amount (BDT)
                            </label>
                            <div style={{ position: "relative" }}>
                                <span 
                                    style={{
                                        position: "absolute",
                                        left: "1rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "var(--color-text-muted)",
                                        fontWeight: 600,
                                    }}
                                >
                                    ৳
                                </span>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    min="10"
                                    max="100000"
                                    style={{ paddingLeft: "2rem" }}
                                    autoFocus
                                />
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                                Minimum: ৳10 | Maximum: ৳100,000
                            </p>
                        </div>

                        {/* Quick Amount Buttons */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                            {[50, 100, 200, 500, 1000].map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setAmount(String(val))}
                                    style={{ flex: "1 1 auto", minWidth: "80px" }}
                                >
                                    ৳{val}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div style={{ 
                                background: "var(--pastel-pink)", 
                                color: "var(--color-danger)", 
                                padding: "0.75rem 1rem", 
                                borderRadius: "var(--radius-sm)",
                                marginBottom: "1rem",
                                fontSize: "0.875rem",
                            }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                            Continue →
                        </button>
                    </form>
                )}

                {/* Step: Payment Method */}
                {step === "method" && (
                    <div>
                        <div 
                            style={{
                                background: "var(--pastel-purple)",
                                padding: "1rem",
                                borderRadius: "var(--radius-md)",
                                marginBottom: "1.5rem",
                                textAlign: "center",
                            }}
                        >
                            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                Amount to add
                            </p>
                            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-primary)" }}>
                                ৳{new Intl.NumberFormat("en-BD").format(parseFloat(amount))}
                            </p>
                        </div>

                        <p style={{ marginBottom: "1rem", fontWeight: 600, fontSize: "0.875rem" }}>
                            Select Payment Method
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <button
                                className="btn"
                                onClick={() => handleMethodSelect("bkash")}
                                style={{
                                    background: "#E2136E",
                                    color: "white",
                                    padding: "1.25rem",
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                <span style={{ fontSize: "1.5rem" }}>📱</span> bKash
                            </button>
                            <button
                                className="btn"
                                onClick={() => handleMethodSelect("nagad")}
                                style={{
                                    background: "#F6921E",
                                    color: "white",
                                    padding: "1.25rem",
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                <span style={{ fontSize: "1.5rem" }}>📱</span> Nagad
                            </button>
                        </div>

                        <button 
                            className="btn btn-secondary" 
                            onClick={handleBack}
                            style={{ width: "100%", marginTop: "1rem" }}
                        >
                            ← Back
                        </button>
                    </div>
                )}

                {/* Step: Transaction */}
                {step === "transaction" && (
                    <form onSubmit={handleSubmit}>
                        <div 
                            style={{
                                background: selectedMethod === "bkash" ? "#FDF0F5" : "#FFF7ED",
                                border: `2px solid ${selectedMethod === "bkash" ? "#E2136E" : "#F6921E"}`,
                                padding: "1.25rem",
                                borderRadius: "var(--radius-md)",
                                marginBottom: "1.5rem",
                            }}
                        >
                            <p style={{ 
                                fontWeight: 600, 
                                marginBottom: "0.75rem",
                                color: selectedMethod === "bkash" ? "#E2136E" : "#F6921E",
                                textTransform: "capitalize",
                            }}>
                                📱 {selectedMethod} Payment
                            </p>
                            <p style={{ fontSize: "0.925rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                                Send <strong>৳{new Intl.NumberFormat("en-BD").format(parseFloat(amount))}</strong> to the following Merchant Account:
                            </p>
                            
                            <div 
                                style={{
                                    background: "white",
                                    padding: "0.75rem 1rem",
                                    borderRadius: "var(--radius-sm)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "0.75rem",
                                }}
                            >
                                <code 
                                    style={{ 
                                        fontSize: "1.25rem", 
                                        fontWeight: 700,
                                        letterSpacing: "0.05em",
                                        color: "var(--color-text)",
                                    }}
                                >
                                    {MERCHANT_NUMBER}
                                </code>
                                <button
                                    type="button"
                                    onClick={handleCopyNumber}
                                    className="btn btn-sm"
                                    style={{
                                        background: copied ? "var(--color-success)" : "var(--color-primary)",
                                        color: "white",
                                        padding: "0.5rem 1rem",
                                        fontSize: "0.8rem",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {copied ? "✓ Copied!" : "📋 Copy"}
                                </button>
                            </div>

                            <p style={{ 
                                fontSize: "0.8rem", 
                                color: "var(--color-text-muted)", 
                                marginTop: "0.75rem",
                                fontStyle: "italic",
                            }}>
                                After sending, paste the Transaction ID below
                            </p>
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label 
                                style={{ 
                                    display: "block", 
                                    marginBottom: "0.5rem", 
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                }}
                            >
                                Transaction ID
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="e.g., 8N7A2HGLD8"
                                autoFocus
                            />
                            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                                You can find this in your {selectedMethod} transaction history
                            </p>
                        </div>

                        {error && (
                            <div style={{ 
                                background: "var(--pastel-pink)", 
                                color: "var(--color-danger)", 
                                padding: "0.75rem 1rem", 
                                borderRadius: "var(--radius-sm)",
                                marginBottom: "1rem",
                                fontSize: "0.875rem",
                            }}>
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ width: "100%" }}
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>
                        
                        <button 
                            type="button"
                            className="btn btn-secondary" 
                            onClick={handleBack}
                            style={{ width: "100%", marginTop: "0.75rem" }}
                            disabled={loading}
                        >
                            ← Back
                        </button>
                    </form>
                )}

                {/* Step: Success */}
                {step === "success" && (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.75rem", color: "var(--color-success)" }}>
                            Request Submitted!
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                            Your balance request of <strong>৳{new Intl.NumberFormat("en-BD").format(parseFloat(amount))}</strong> has been submitted for review.
                            <br /><br />
                            You will receive your balance once an admin verifies your payment.
                        </p>
                        
                        <div 
                            style={{
                                background: "var(--pastel-blue)",
                                padding: "1rem",
                                borderRadius: "var(--radius-md)",
                                marginBottom: "1.5rem",
                            }}
                        >
                            <p style={{ fontSize: "0.875rem" }}>
                                <strong>Transaction ID:</strong> {transactionId}
                            </p>
                            <p style={{ fontSize: "0.875rem", textTransform: "capitalize" }}>
                                <strong>Method:</strong> {selectedMethod}
                            </p>
                        </div>

                        <button 
                            className="btn btn-primary" 
                            onClick={() => router.push("/dashboard")}
                            style={{ width: "100%" }}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

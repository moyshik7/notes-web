"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Wallet, CreditCard, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Copy, Check } from "lucide-react";

type PaymentMethod = "bkash" | "nagad";

export default function AddBalancePage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState<PaymentMethod | "">("");
    const [transactionId, setTransactionId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (authStatus === "unauthenticated") router.push("/login");
    }, [authStatus, router]);

    const merchantNumbers: Record<PaymentMethod, string> = {
        bkash: "01XXXXXXXXX",
        nagad: "01XXXXXXXXX",
    };

    function copyNumber() {
        if (method && method in merchantNumbers) {
            navigator.clipboard.writeText(merchantNumbers[method as PaymentMethod]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/user/add-balance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    method,
                    transactionId: transactionId.trim(),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Failed to submit request");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    if (authStatus === "loading") {
        return (
            <div className="max-w-[600px] mx-auto px-6 py-8">
                <div className="bg-gradient-to-r from-pastel-purple via-pastel-pink to-pastel-purple bg-[length:200%_100%] animate-shimmer h-[400px] rounded-2xl" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-[600px] mx-auto px-6 py-8 text-center animate-fade-in-up">
                <div className="bg-surface border border-border rounded-3xl p-10 shadow-card">
                    <CheckCircle size={64} className="text-success mx-auto mb-4" />
                    <h2 className="font-display text-2xl font-bold text-text-main mb-2">Request Submitted!</h2>
                    <p className="text-text-secondary mb-6">Your balance request of ৳{parseFloat(amount).toLocaleString()} via {method} has been submitted for review.</p>
                    <button onClick={() => router.push("/dashboard")} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border-none">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[600px] mx-auto px-6 py-8 animate-fade-in-up">
            <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-extrabold text-text-main mb-2">Add Balance</h1>
                <p className="text-text-secondary">Fund your wallet to purchase notes</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            step >= s ? "bg-gradient-to-br from-accent to-primary text-white" : "bg-surface border-2 border-border text-text-muted"
                        }`}>{s}</div>
                        {s < 3 && <div className={`w-12 h-0.5 rounded ${step > s ? "bg-accent" : "bg-border"}`} />}
                    </div>
                ))}
            </div>

            {error && (
                <div className="px-4 py-3 rounded-[10px] text-sm mb-6 bg-danger/10 text-[#c44040] border border-danger/20 flex items-center gap-2">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div className="bg-surface border border-border rounded-3xl p-8 shadow-card">
                {step === 1 && (
                    <div>
                        <h2 className="font-display text-xl font-bold text-text-main mb-4 flex items-center gap-2"><Wallet size={20} className="text-accent" /> Enter Amount</h2>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="amount">Amount (৳ BDT)</label>
                            <input id="amount" type="number" min="10" max="100000" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 border-2 border-border rounded-[10px] text-lg font-sans text-text-main bg-surface outline-none focus:border-accent transition-all" placeholder="Enter amount (min ৳10)" />
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[50, 100, 200, 500, 1000].map((preset) => (
                                <button key={preset} type="button" onClick={() => setAmount(String(preset))} className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer ${
                                    amount === String(preset) ? "border-accent bg-pastel-pink text-accent-dark" : "border-border bg-surface text-text-secondary hover:border-accent-light"
                                }`}>৳{preset}</button>
                            ))}
                        </div>
                        <button onClick={() => { if (parseFloat(amount) >= 10) { setError(""); setStep(2); } else { setError("Minimum amount is ৳10"); } }} className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md transition-all cursor-pointer border-none">
                            Continue <ArrowRight size={16} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="font-display text-xl font-bold text-text-main mb-4 flex items-center gap-2"><CreditCard size={20} className="text-accent" /> Payment Method</h2>
                        <div className="space-y-3 mb-6">
                            {(["bkash", "nagad"] as const).map((m) => (
                                <button key={m} type="button" onClick={() => setMethod(m)} className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                                    method === m ? "border-accent bg-pastel-pink" : "border-border bg-surface hover:border-accent-light"
                                }`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${m === "bkash" ? "bg-[#E2136E]" : "bg-[#F6921E]"}`}>
                                        {m[0].toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-text-main capitalize">{m}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-transparent text-text-secondary border-2 border-border hover:bg-pastel-purple transition-all cursor-pointer">
                                <ArrowLeft size={16} /> Back
                            </button>
                            <button onClick={() => { if (method) { setError(""); setStep(3); } else { setError("Please select a payment method"); } }} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md transition-all cursor-pointer border-none">
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={handleSubmit}>
                        <h2 className="font-display text-xl font-bold text-text-main mb-4">Complete Payment</h2>
                        <div className="bg-pastel-purple rounded-xl p-4 mb-6">
                            <p className="text-sm text-text-secondary mb-2">Send <strong className="text-text-main">৳{parseFloat(amount).toLocaleString()}</strong> to:</p>
                            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3">
                                <span className="font-mono font-bold text-text-main">{method && merchantNumbers[method as PaymentMethod]}</span>
                                <button type="button" onClick={copyNumber} className="text-accent hover:text-accent-dark transition-colors">
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="transactionId">Transaction ID</label>
                            <input id="transactionId" type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent transition-all" placeholder="Enter your transaction ID" required />
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setStep(2)} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-transparent text-text-secondary border-2 border-border hover:bg-pastel-purple transition-all cursor-pointer">
                                <ArrowLeft size={16} /> Back
                            </button>
                            <button type="submit" disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

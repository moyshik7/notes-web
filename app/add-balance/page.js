"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader, CreditCard, Smartphone, ArrowLeft, ArrowRight, Check, Clipboard, PartyPopper } from "lucide-react";

const MERCHANT_NUMBER = "01885596054";

export default function AddBalancePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [step, setStep] = useState("amount");
    const [amount, setAmount] = useState("");
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [transactionId, setTransactionId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    if (status === "loading") {
        return (
            <div className="max-w-[1280px] mx-auto px-6 py-8 text-center animate-fade-in-up">
                <div className="text-6xl mb-4 animate-spin-slow"><Loader size={48} className="mx-auto text-text-muted" /></div>
                <h3 className="font-display text-xl font-semibold text-text-secondary">Loading...</h3>
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
        if (!amount || isNaN(amountNum) || amountNum < 10) { setError("Minimum amount is ৳10"); return; }
        if (amountNum > 100000) { setError("Maximum amount is ৳100,000"); return; }
        setStep("method");
    };

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        setStep("transaction");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!transactionId.trim()) { setError("Please enter your transaction ID"); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/user/add-balance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(amount), method: selectedMethod, transactionId: transactionId.trim() }),
            });
            const result = await res.json();
            if (res.ok) setStep("success");
            else setError(result.error || "Failed to submit request");
        } catch { setError("Something went wrong. Please try again."); }
        finally { setLoading(false); }
    };

    const handleBack = () => {
        if (step === "transaction") { setStep("method"); setSelectedMethod(null); }
        else if (step === "method") setStep("amount");
    };

    return (
        <div className="max-w-[1280px] mx-auto px-6 py-8">
            <div className="mb-8 animate-fade-in-up">
                <h1 className="font-display text-3xl font-extrabold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent mb-2">
                    <CreditCard size={24} className="inline align-middle" /> Add Balance
                </h1>
                <p className="text-base text-text-secondary">
                    {step === "amount" && "Enter the amount you want to add"}
                    {step === "method" && "Choose your payment method"}
                    {step === "transaction" && "Complete your payment"}
                    {step === "success" && "Request submitted!"}
                </p>
            </div>

            <div className="max-w-[500px] mx-auto bg-surface rounded-2xl p-8 shadow-card border border-border animate-fade-in-up">
                {/* Step: Amount */}
                {step === "amount" && (
                    <form onSubmit={handleAmountSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-text-main mb-1.5">Amount (BDT)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-semibold">৳</span>
                                <input
                                    type="number"
                                    className="w-full pl-8 pr-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    min="10"
                                    max="100000"
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-text-muted mt-2">Minimum: ৳10 | Maximum: ৳100,000</p>
                        </div>

                        {/* Quick Amount Buttons */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[50, 100, 200, 500, 1000].map((val) => (
                                <button key={val} type="button" className="flex-1 min-w-[80px] px-3 py-2 rounded-xl text-sm font-semibold border-2 border-border bg-surface text-text-secondary hover:border-accent-light hover:text-accent-dark hover:bg-pastel-pink transition-all duration-150 cursor-pointer" onClick={() => setAmount(String(val))}>
                                    ৳{val}
                                </button>
                            ))}
                        </div>

                        {error && <div className="px-4 py-3 rounded-[10px] text-sm mb-4 bg-pastel-pink text-danger">{error}</div>}

                        <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer border-none">
                            Continue <ArrowRight size={16} />
                        </button>
                    </form>
                )}

                {/* Step: Payment Method */}
                {step === "method" && (
                    <div>
                        <div className="bg-pastel-purple rounded-xl p-4 mb-6 text-center">
                            <p className="text-sm text-text-secondary">Amount to add</p>
                            <p className="text-[1.75rem] font-bold text-primary">৳{new Intl.NumberFormat("en-BD").format(parseFloat(amount))}</p>
                        </div>

                        <p className="mb-4 font-semibold text-sm text-text-main">Select Payment Method</p>

                        <div className="flex flex-col gap-3">
                            <button onClick={() => handleMethodSelect("bkash")} className="flex items-center justify-center gap-2 p-5 rounded-xl text-lg font-semibold text-white bg-[#E2136E] hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-pointer border-none">
                                <Smartphone size={24} /> bKash
                            </button>
                            <button onClick={() => handleMethodSelect("nagad")} className="flex items-center justify-center gap-2 p-5 rounded-xl text-lg font-semibold text-white bg-[#F6921E] hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-pointer border-none">
                                <Smartphone size={24} /> Nagad
                            </button>
                        </div>

                        <button onClick={handleBack} className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent text-text-secondary border-2 border-border hover:bg-pastel-purple transition-all duration-150 cursor-pointer">
                            <ArrowLeft size={16} /> Back
                        </button>
                    </div>
                )}

                {/* Step: Transaction */}
                {step === "transaction" && (
                    <form onSubmit={handleSubmit}>
                        <div className={`border-2 rounded-xl p-5 mb-6 ${selectedMethod === "bkash" ? "bg-[#FDF0F5] border-[#E2136E]" : "bg-[#FFF7ED] border-[#F6921E]"}`}>
                            <p className={`font-semibold mb-3 capitalize ${selectedMethod === "bkash" ? "text-[#E2136E]" : "text-[#F6921E]"}`}>
                                <Smartphone size={16} className="inline align-middle" /> {selectedMethod} Payment
                            </p>
                            <p className="text-[0.925rem] leading-relaxed mb-4">
                                Send <strong>৳{new Intl.NumberFormat("en-BD").format(parseFloat(amount))}</strong> to the following Merchant Account:
                            </p>

                            <div className="bg-white px-4 py-3 rounded-lg flex items-center justify-between gap-3">
                                <code className="text-xl font-bold tracking-wide text-text-main">{MERCHANT_NUMBER}</code>
                                <button
                                    type="button"
                                    onClick={handleCopyNumber}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap border-none cursor-pointer transition-colors ${copied ? "bg-success" : "bg-primary hover:bg-primary-dark"}`}
                                >
                                    {copied ? <><Check size={14} className="inline align-middle" /> Copied!</> : <><Clipboard size={14} className="inline align-middle" /> Copy</>}
                                </button>
                            </div>

                            <p className="text-xs text-text-muted mt-3 italic">After sending, paste the Transaction ID below</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-text-main mb-1.5">Transaction ID</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="e.g., 8N7A2HGLD8"
                                autoFocus
                            />
                            <p className="text-xs text-text-muted mt-2">You can find this in your {selectedMethod} transaction history</p>
                        </div>

                        {error && <div className="px-4 py-3 rounded-[10px] text-sm mb-4 bg-pastel-pink text-danger">{error}</div>}

                        <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>

                        <button type="button" onClick={handleBack} disabled={loading} className="w-full mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-transparent text-text-secondary border-2 border-border hover:bg-pastel-purple transition-all duration-150 cursor-pointer disabled:opacity-50">
                            <ArrowLeft size={16} /> Back
                        </button>
                    </form>
                )}

                {/* Step: Success */}
                {step === "success" && (
                    <div className="text-center animate-fade-in-up">
                        <div className="text-6xl mb-4"><PartyPopper size={64} className="mx-auto text-warning" /></div>
                        <h2 className="font-display text-2xl font-bold text-success mb-3">Request Submitted!</h2>
                        <p className="text-text-secondary leading-relaxed mb-6">
                            Your balance request of <strong>৳{new Intl.NumberFormat("en-BD").format(parseFloat(amount))}</strong> has been submitted for review.
                            <br /><br />
                            You will receive your balance once an admin verifies your payment.
                        </p>

                        <div className="bg-pastel-blue rounded-xl p-4 mb-6 text-left">
                            <p className="text-sm"><strong>Transaction ID:</strong> {transactionId}</p>
                            <p className="text-sm capitalize"><strong>Method:</strong> {selectedMethod}</p>
                        </div>

                        <button onClick={() => router.push("/dashboard")} className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer border-none">
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

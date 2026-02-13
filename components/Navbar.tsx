/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Wallet, X, Menu } from "lucide-react";

export default function Navbar() {
    const { data: session, status } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [balance, setBalance] = useState(0);

    async function fetchBalance(signal: AbortSignal) {
        try {
            const res = await fetch("/api/user/dashboard", { signal });
            const data = await res.json();
            if (res.ok && data.user) {
                setBalance(data.user.walletBalance || 0);
            }
        } catch {
            // Silently fail
        }
    }

    useEffect(() => {
        if (status === "authenticated") {
            const controller = new AbortController();
            (async () => {
                await fetchBalance(controller.signal);
            })();
            return () => controller.abort();
        }
    }, [status]);

    return (
        <nav className="sticky top-0 z-50 bg-white/82 backdrop-blur-xl backdrop-saturate-[1.8] border-b border-border/70 transition-all duration-250">
            <div className="max-w-[1280px] mx-auto px-6 h-[68px] flex items-center justify-between gap-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-text-main hover:scale-[1.04] transition-transform duration-500">
                    <span className="flex items-center justify-center mr-2.5">
                        <img src="/logo.webp" alt="NoteNibo" width="50" height="50" />
                    </span>
                    <span>NoteNibo</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    <Link href="/" className="px-4 py-2 rounded-[10px] text-sm font-medium text-text-secondary hover:text-primary hover:bg-pastel-purple transition-all duration-150 whitespace-nowrap">
                        Marketplace
                    </Link>
                    {status === "authenticated" && (
                        <>
                            <Link href="/sell" className="px-4 py-2 rounded-[10px] text-sm font-medium text-text-secondary hover:text-primary hover:bg-pastel-purple transition-all duration-150 whitespace-nowrap">
                                Sell Notes
                            </Link>
                            <Link href="/dashboard" className="px-4 py-2 rounded-[10px] text-sm font-medium text-text-secondary hover:text-primary hover:bg-pastel-purple transition-all duration-150 whitespace-nowrap">
                                Dashboard
                            </Link>
                            {session?.user?.role === "admin" && (
                                <Link href="/admin" className="px-4 py-2 rounded-[10px] text-sm font-medium text-accent-dark hover:text-primary hover:bg-pastel-purple transition-all duration-150 whitespace-nowrap">
                                    Admin
                                </Link>
                            )}
                        </>
                    )}
                </div>

                {/* Auth Section */}
                <div className="hidden md:flex items-center gap-3">
                    {status === "loading" ? (
                        <div className="w-[120px] h-8 rounded-[10px] bg-border-light animate-pulse-soft" />
                    ) : status === "authenticated" ? (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/add-balance"
                                className="bg-pastel-mint px-4 py-2 rounded-full text-sm font-semibold text-text-main border border-border hover:bg-pastel-blue transition-all duration-200 mr-4 no-underline"
                            >
                                <Wallet size={16} className="inline align-middle" /> ৳{new Intl.NumberFormat("en-BD").format(balance)}
                            </Link>
                            <span className="text-sm font-medium text-text-secondary max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">{session.user.name}</span>
                            <button onClick={() => signOut({ callbackUrl: "/" })} className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-transparent text-primary border-[1.5px] border-border hover:border-accent hover:text-accent-dark hover:bg-pastel-pink transition-all duration-150 cursor-pointer">
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-transparent text-primary border-[1.5px] border-border hover:border-accent hover:text-accent-dark hover:bg-pastel-pink transition-all duration-150">
                                Sign In
                            </Link>
                            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden bg-transparent border-none text-2xl cursor-pointer text-text-main p-1" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden flex flex-col gap-1 px-6 pb-4 pt-3 border-t border-border-light animate-slide-down bg-white/95">
                    {status === "authenticated" && (
                        <Link
                            href="/add-balance"
                            className="bg-pastel-mint px-4 py-3 rounded-xl text-sm font-semibold text-text-main border border-border mb-4 block text-center no-underline"
                            onClick={() => setMobileOpen(false)}
                        >
                            <Wallet size={16} className="inline align-middle" /> Balance: ৳{new Intl.NumberFormat("en-BD").format(balance)}
                        </Link>
                    )}
                    <Link href="/" className="px-4 py-2 rounded-[10px] text-sm font-medium text-text-secondary hover:text-primary hover:bg-pastel-purple transition-all duration-150" onClick={() => setMobileOpen(false)}>
                        Marketplace
                    </Link>
                    {status === "authenticated" && (
                        <>
                            <Link href="/sell" className="px-4 py-2 rounded-[10px] text-sm font-medium text-text-secondary hover:text-primary hover:bg-pastel-purple transition-all duration-150" onClick={() => setMobileOpen(false)}>
                                Sell Notes
                            </Link>
                            <Link href="/dashboard" className="px-4 py-2 rounded-[10px] text-sm font-medium text-text-secondary hover:text-primary hover:bg-pastel-purple transition-all duration-150" onClick={() => setMobileOpen(false)}>
                                Dashboard
                            </Link>
                            {session?.user?.role === "admin" && (
                                <Link href="/admin" className="px-4 py-2 rounded-[10px] text-sm font-medium text-accent-dark hover:text-primary hover:bg-pastel-purple transition-all duration-150" onClick={() => setMobileOpen(false)}>
                                    Admin
                                </Link>
                            )}
                            <button
                                onClick={() => {
                                    setMobileOpen(false);
                                    signOut({ callbackUrl: "/" });
                                }}
                                className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-transparent text-primary border-[1.5px] border-border hover:border-accent hover:text-accent-dark hover:bg-pastel-pink transition-all duration-150 cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </>
                    )}
                    {status === "unauthenticated" && (
                        <>
                            <Link href="/login" className="px-4 py-2 rounded-[10px] text-sm font-medium text-text-secondary hover:text-primary hover:bg-pastel-purple transition-all duration-150" onClick={() => setMobileOpen(false)}>
                                Sign In
                            </Link>
                            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150" onClick={() => setMobileOpen(false)}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

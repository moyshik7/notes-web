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

    async function fetchBalance(signal) {
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
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
                    <span className="flex items-center justify-center mr-10">
                        <img src="/logo.webp" alt="NoteNibo" width="50" height="50" />
                    </span>
                    <span>NoteNibo</span>
                </Link>

                {/* Desktop Nav */}
                <div className="navbar-links">
                    <Link href="/" className="nav-link">
                        Marketplace
                    </Link>
                    {status === "authenticated" && (
                        <>
                            <Link href="/sell" className="nav-link">
                                Sell Notes
                            </Link>
                            <Link href="/dashboard" className="nav-link">
                                Dashboard
                            </Link>
                            {session?.user?.role === "admin" && (
                                <Link href="/admin" className="nav-link nav-link-admin">
                                    Admin
                                </Link>
                            )}
                        </>
                    )}
                </div>

                {/* Auth Section */}
                <div className="navbar-auth">
                    {status === "loading" ? (
                        <div className="nav-skeleton" />
                    ) : status === "authenticated" ? (
                        <div className="nav-user">
                            <Link
                                href="/add-balance"
                                style={{
                                    background: "var(--pastel-mint)",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "999px",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "var(--color-text)",
                                    border: "1px solid var(--color-border)",
                                    transition: "all 0.2s ease",
                                    marginRight: "1rem",
                                    textDecoration: "none",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = "var(--pastel-blue)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = "var(--pastel-mint)";
                                }}
                            >
                                <Wallet size={16} style={{ display: "inline", verticalAlign: "middle" }} /> ৳{new Intl.NumberFormat("en-BD").format(balance)}
                            </Link>
                            <span className="nav-user-name">{session.user.name}</span>
                            <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-outline btn-sm">
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="nav-auth-buttons">
                            <Link href="/login" className="btn btn-outline btn-sm">
                                Sign In
                            </Link>
                            <Link href="/register" className="btn btn-primary btn-sm">
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="navbar-mobile-menu">
                    {status === "authenticated" && (
                        <Link
                            href="/add-balance"
                            style={{
                                background: "var(--pastel-mint)",
                                padding: "0.75rem 1rem",
                                borderRadius: "12px",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "var(--color-text)",
                                border: "1px solid var(--color-border)",
                                marginBottom: "1rem",
                                display: "block",
                                textAlign: "center",
                                textDecoration: "none",
                            }}
                            onClick={() => setMobileOpen(false)}
                        >
                            <Wallet size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Balance: ৳{new Intl.NumberFormat("en-BD").format(balance)}
                        </Link>
                    )}
                    <Link href="/" className="nav-link" onClick={() => setMobileOpen(false)}>
                        Marketplace
                    </Link>
                    {status === "authenticated" && (
                        <>
                            <Link href="/sell" className="nav-link" onClick={() => setMobileOpen(false)}>
                                Sell Notes
                            </Link>
                            <Link href="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>
                                Dashboard
                            </Link>
                            {session?.user?.role === "admin" && (
                                <Link href="/admin" className="nav-link nav-link-admin" onClick={() => setMobileOpen(false)}>
                                    Admin
                                </Link>
                            )}
                            <button
                                onClick={() => {
                                    setMobileOpen(false);
                                    signOut({ callbackUrl: "/" });
                                }}
                                className="btn btn-outline btn-sm"
                            >
                                Sign Out
                            </button>
                        </>
                    )}
                    {status === "unauthenticated" && (
                        <>
                            <Link href="/login" className="nav-link" onClick={() => setMobileOpen(false)}>
                                Sign In
                            </Link>
                            <Link href="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

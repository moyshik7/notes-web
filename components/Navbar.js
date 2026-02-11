"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Navbar() {
    const { data: session, status } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        if (status === "authenticated") {
            fetchBalance();
        }
    }, [status]);

    async function fetchBalance() {
        try {
            const res = await fetch("/api/user/dashboard");
            const data = await res.json();
            if (res.ok && data.user) {
                setBalance(data.user.walletBalance || 0);
            }
        } catch {
            // Silently fail
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link href="/" className="navbar-logo">
                    <span className="logo-icon">🌸</span>
                    <span className="logo-text">NoteNibo</span>
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
                                💰 ৳{new Intl.NumberFormat("en-BD").format(balance)}
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
                    {mobileOpen ? "✕" : "☰"}
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
                            💰 Balance: ৳{new Intl.NumberFormat("en-BD").format(balance)}
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

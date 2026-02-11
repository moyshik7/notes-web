"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="logo-icon">📚</span>
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
              <span className="nav-user-name">{session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn btn-outline btn-sm"
              >
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
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          <Link
            href="/"
            className="nav-link"
            onClick={() => setMobileOpen(false)}
          >
            Marketplace
          </Link>
          {status === "authenticated" && (
            <>
              <Link
                href="/sell"
                className="nav-link"
                onClick={() => setMobileOpen(false)}
              >
                Sell Notes
              </Link>
              <Link
                href="/dashboard"
                className="nav-link"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              {session?.user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="nav-link nav-link-admin"
                  onClick={() => setMobileOpen(false)}
                >
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
              <Link
                href="/login"
                className="nav-link"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary btn-sm"
                onClick={() => setMobileOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

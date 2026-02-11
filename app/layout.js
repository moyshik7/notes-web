import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Flower2 } from "lucide-react";
import "./globals.css";

export const metadata = {
  title: "NoteNibo — Student Note Marketplace",
  description:
    "Bangladesh's first marketplace for handwritten university lecture notes. Buy, sell, and ace your exams with topper's notes.",
  keywords: [
    "notes",
    "lecture notes",
    "handwritten notes",
    "student marketplace",
    "Bangladesh",
    "study materials",
    "university notes",
    "exam preparation",
  ],
  authors: [{ name: "NoteNibo Team" }],
  metadataBase: new URL("https://notenibo.com"),
  openGraph: {
    title: "NoteNibo — Student Note Marketplace",
    description:
      "Buy and sell handwritten university lecture notes. Bangladesh's first student-to-student note marketplace.",
    siteName: "NoteNibo",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoteNibo — Student Note Marketplace",
    description:
      "Buy and sell handwritten university lecture notes. Bangladesh's first student-to-student note marketplace.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>

          {/* Enhanced Footer */}
          <footer className="footer">
            <div className="footer-content">
              <div className="footer-brand">
                <h3>
                  <Flower2 size={18} style={{ display: "inline", verticalAlign: "middle" }} /> NoteNibo
                </h3>
                <p>
                  Bangladesh&apos;s first marketplace for handwritten lecture
                  notes. Helping students share knowledge and earn from their
                  hard work.
                </p>
              </div>
              <div className="footer-links">
                <h4>Platform</h4>
                <Link href="/">Marketplace</Link>
                <Link href="/sell">Sell Notes</Link>
                <Link href="/dashboard">Dashboard</Link>
              </div>
              <div className="footer-links">
                <h4>Account</h4>
                <Link href="/login">Sign In</Link>
                <Link href="/register">Create Account</Link>
              </div>
            </div>
            <div className="footer-bottom">
              <p>
                © {new Date().getFullYear()} NoteNibo. Made for students, by
                students.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

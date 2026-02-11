import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Link from "next/link";
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

          {/* Footer */}
          <footer className="border-t border-border mt-16 pt-12 pb-8 px-6 bg-gradient-to-t from-pastel-purple to-transparent">
            <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-8 mb-8">
              <div className="font-display md:text-left text-center">
                <h3 className="text-lg font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-2 flex items-center gap-1.5 md:justify-start justify-center">
                  <img src="/logo.webp" alt="NoteNibo" width="18" height="18" className="inline align-middle mr-2" /> NoteNibo
                </h3>
                <p className="text-[0.825rem] text-text-secondary leading-relaxed md:max-w-[300px]">
                  Bangladesh&apos;s first marketplace for handwritten lecture
                  notes. Helping students share knowledge and earn from their
                  hard work.
                </p>
              </div>
              <div className="md:text-left text-center">
                <h4 className="text-xs font-bold uppercase tracking-wide text-text-main mb-3">Platform</h4>
                <Link href="/" className="block text-[0.825rem] text-text-secondary py-1 hover:text-accent-dark hover:translate-x-0.5 transition-all">Marketplace</Link>
                <Link href="/sell" className="block text-[0.825rem] text-text-secondary py-1 hover:text-accent-dark hover:translate-x-0.5 transition-all">Sell Notes</Link>
                <Link href="/dashboard" className="block text-[0.825rem] text-text-secondary py-1 hover:text-accent-dark hover:translate-x-0.5 transition-all">Dashboard</Link>
              </div>
              <div className="md:text-left text-center">
                <h4 className="text-xs font-bold uppercase tracking-wide text-text-main mb-3">Account</h4>
                <Link href="/login" className="block text-[0.825rem] text-text-secondary py-1 hover:text-accent-dark hover:translate-x-0.5 transition-all">Sign In</Link>
                <Link href="/register" className="block text-[0.825rem] text-text-secondary py-1 hover:text-accent-dark hover:translate-x-0.5 transition-all">Create Account</Link>
              </div>
            </div>
            <div className="text-center pt-6 border-t border-border text-xs text-text-muted">
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

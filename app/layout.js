import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata = {
  title: "NoteNibo — Student Note Marketplace",
  description:
    "Buy and sell handwritten university lecture notes. Digitize your topper's notes and earn money while helping fellow students in Bangladesh.",
  keywords: [
    "notes",
    "university",
    "Bangladesh",
    "lecture notes",
    "handwritten notes",
    "student marketplace",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="footer">
            <p>© {new Date().getFullYear()} NoteNibo. Made for students, by students. 🇧🇩</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

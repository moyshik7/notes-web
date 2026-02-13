"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Auto sign-in after registration
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center px-6 py-8 bg-[radial-gradient(ellipse_at_20%_50%,rgba(253,121,168,0.06)_0%,transparent_50%),radial-gradient(ellipse_at_80%_30%,rgba(108,92,231,0.06)_0%,transparent_50%),radial-gradient(ellipse_at_50%_80%,rgba(0,184,148,0.04)_0%,transparent_50%)] bg-bg">
      <div className="w-full max-w-[440px] bg-surface border border-border rounded-3xl p-10 shadow-lg animate-fade-in-up relative before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-20 before:h-1 before:bg-gradient-to-r before:from-accent before:to-primary before:rounded-sm">
        <div className="text-center mb-8 pt-3">
          <h1 className="font-display text-2xl font-bold bg-gradient-to-br from-primary to-accent-dark bg-clip-text text-transparent mb-1.5">Create Account</h1>
          <p className="text-sm text-text-secondary">
            Join NoteNibo and start earning from your notes
          </p>
        </div>

        {error && <div className="px-4 py-3 rounded-[10px] text-sm mb-4 animate-slide-down bg-danger/10 text-[#c44040] border border-danger/20">{error}</div>}

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full py-3 border-2 border-border rounded-[10px] bg-surface text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 font-sans text-text-main hover:bg-pastel-purple hover:border-primary-light hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign up with Google
        </button>

        <div className="flex items-center gap-4 my-6 text-text-muted text-xs before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">or</div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input id="name" name="name" type="text" className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150" placeholder="Your full name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150" placeholder="you@university.edu.bd" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="password">
              Password
            </label>
            <input id="password" name="password" type="password" className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150" placeholder="At least 6 characters" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input id="confirmPassword" name="confirmPassword" type="password" className="w-full px-4 py-2.5 border-2 border-border rounded-[10px] text-sm font-sans text-text-main bg-surface outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--color-accent-glow)] focus:bg-white transition-all duration-150" placeholder="Repeat your password" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-br from-accent to-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-text-secondary">
          Already have an account? <Link href="/login" className="text-accent-dark font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

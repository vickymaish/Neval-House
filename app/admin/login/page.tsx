"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      if (loginError) {
        setError("The email or password is incorrect. Please try again.");
        setLoading(false);
        return;
      }
      window.location.assign("/admin/enquiries");
    } catch {
      setError("Sign in is temporarily unavailable. Check your connection and try again.");
      setLoading(false);
    }
  }

  return <main className="min-h-screen bg-[#F7F5F0] p-4 text-[#24251f] sm:p-8">
    <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-6xl overflow-hidden rounded-2xl border border-[#dedbd2] bg-white shadow-sm sm:min-h-[calc(100svh-4rem)] md:grid-cols-2">
      <section className="relative hidden min-h-[620px] bg-[#35362f] text-white md:block">
        <Image src="/images/hero-image.jpeg" alt="Interior of Nevel Apartments" fill priority sizes="(max-width: 767px) 0px, 50vw" className="object-cover opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/20" />
        <div className="absolute inset-x-10 bottom-10">
          <p className="eyebrow text-white/75">OWNER PORTAL</p>
          <h1 className="serif mt-4 max-w-md text-5xl leading-[1.02]">A considered stay, thoughtfully managed.</h1>
          <p className="mt-4 text-sm text-white/80">Manage enquiries and availability for Nevel Apartments.</p>
        </div>
      </section>
      <section className="flex min-h-[calc(100svh-2rem)] flex-col p-6 sm:p-10 md:min-h-0 md:p-12 lg:p-16">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="serif text-2xl">Nevel Apartments</Link>
          <Link href="/" className="min-h-11 px-2 py-3 text-xs text-[#73736b] underline underline-offset-4">Back to website</Link>
        </div>
        <div className="my-auto py-12">
          <p className="eyebrow text-[#66715b]">PRIVATE OWNER PORTAL</p>
          <h2 className="serif mt-4 text-4xl sm:text-5xl">Welcome back.</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#73736b]">Sign in to manage your guest enquiries, availability, and property details.</p>
          <form action={login} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-medium" htmlFor="email">Email address
              <input className="min-h-12 rounded-md border border-[#dedbd2] bg-[#F7F5F0]/60 px-3 text-base outline-none transition focus:border-[#66715b] focus:ring-2 focus:ring-[#66715b]/20" id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
            </label>
            <label className="grid gap-2 text-sm font-medium" htmlFor="password">Password
              <input className="min-h-12 rounded-md border border-[#dedbd2] bg-[#F7F5F0]/60 px-3 text-base outline-none transition focus:border-[#66715b] focus:ring-2 focus:ring-[#66715b]/20" id="password" name="password" type="password" autoComplete="current-password" required />
            </label>
            {error && <p role="alert" className="rounded-md border border-red-800/20 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
            <button type="submit" disabled={loading} className="button button-dark mt-1 w-full disabled:cursor-wait disabled:opacity-60">{loading ? "Signing in…" : "Sign in"}</button>
          </form>
        </div>
        <p className="text-xs leading-5 text-[#88877e]">Authorized property owner access only.</p>
      </section>
    </div>
  </main>;
}

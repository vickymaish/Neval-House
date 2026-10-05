import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return <div className="min-h-screen bg-[#F7F5F0] text-[#24251f]"><header className="sticky top-0 z-10 border-b border-[#dedbd2] bg-[#F7F5F0]/95 backdrop-blur"><div className="mx-auto flex min-h-16 max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2"><Link href="/admin/enquiries" className="serif text-2xl">Nevel Apartments</Link><nav aria-label="Admin" className="flex items-center gap-1 text-sm"><Link className="min-h-11 px-3 py-3" href="/admin/enquiries">Enquiries</Link><Link className="min-h-11 px-3 py-3" href="/admin/availability">Availability</Link><Link className="min-h-11 px-3 py-3" href="/admin/settings">Settings</Link><form action="/admin/logout" method="post"><button className="min-h-11 px-3 text-sm underline underline-offset-4">Logout</button></form></nav></div></header><main className="mx-auto max-w-5xl px-4 py-7">{children}</main></div>;
}

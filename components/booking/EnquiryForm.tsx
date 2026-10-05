"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, parseISO } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useForm, type FieldError } from "react-hook-form";
import { siteConfig } from "@/data/site";
import { buildMailtoLink, buildWhatsAppLink } from "@/lib/contact";
import { calcNights, enquirySchema, normalizeKenyanPhone, type EnquiryValues } from "@/lib/validation";

type SentEnquiry = EnquiryValues & { nights: number; estimatedTotal: number };
type FormStatus = "idle" | "sending" | "success" | "error";
const inputClass = "min-h-12 w-full rounded-md border border-[#dedbd2] bg-white/60 px-3 text-base text-[#24251f] outline-none transition focus:border-[#66715b] focus:ring-2 focus:ring-[#66715b]/20";

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: FieldError; hint?: string; children: React.ReactNode }) {
  const errorId = `${id}-error`;
  return <div className="grid gap-2">
    <label htmlFor={id} className="text-xs font-medium tracking-wide">{label}</label>
    {children}
    {hint && <span className="text-xs text-[#73736b]">{hint}</span>}
    {error?.message && <p id={errorId} className="text-xs text-red-700">{error.message}</p>}
  </div>;
}

function summaryText(data: SentEnquiry) {
  return [
    `Hello, I'm ${data.name}.`,
    `I'd like to enquire about ${data.nights} ${data.nights === 1 ? "night" : "nights"} at ${siteConfig.propertyName}.`,
    `Check-in: ${data.checkIn}; check-out: ${data.checkOut}; guests: ${data.guests}.`,
    `Phone: ${normalizeKenyanPhone(data.phone) ?? data.phone}; email: ${data.email}.`,
    data.message ? `Message: ${data.message}` : "",
  ].filter(Boolean).join("\n");
}

export default function EnquiryForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [sent, setSent] = useState<SentEnquiry | null>(null);
  const [notice, setNotice] = useState("");
  const confirmationRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { name: "", phone: "", email: "", checkIn: "", checkOut: "", guests: "1", message: "", botcheck: "" },
  });
  const [checkIn, checkOut, message = ""] = watch(["checkIn", "checkOut", "message"]);
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const checkOutMin = checkIn && !Number.isNaN(parseISO(checkIn).getTime()) ? format(addDays(parseISO(checkIn), 1), "yyyy-MM-dd") : todayStr;
  const nights = calcNights(checkIn, checkOut);
  const estimate = nights * siteConfig.pricePerNightKES;

  useEffect(() => {
    if (status === "success") confirmationRef.current?.focus();
  }, [status]);

  async function submit(values: EnquiryValues) {
    setNotice("");
    const countNights = calcNights(values.checkIn, values.checkOut);
    const submission: SentEnquiry = { ...values, nights: countNights, estimatedTotal: countNights * siteConfig.pricePerNightKES };
    if (values.botcheck?.trim()) {
      setSent(submission);
      setStatus("success");
      return;
    }
    try {
      const lastSubmission = Number(sessionStorage.getItem("nevel-enquiry-last-submit") ?? 0);
      const remaining = 30_000 - (Date.now() - lastSubmission);
      if (remaining > 0) {
        setNotice(`Please wait ${Math.ceil(remaining / 1000)} seconds before sending another enquiry.`);
        setStatus("error");
        return;
      }
    } catch {
      // Storage may be unavailable in private browsing; continue without persistence.
    }
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    if (!accessKey) {
      console.warn("Web3Forms is not configured. Add NEXT_PUBLIC_WEB3FORMS_KEY to .env.local and Vercel environment variables, then restart or redeploy.");
      setNotice("Enquiry email is not configured yet. Please contact us directly using WhatsApp or email below.");
      setSent(submission);
      setStatus("error");
      return;
    }

    setStatus("sending");
    try { sessionStorage.setItem("nevel-enquiry-last-submit", String(Date.now())); } catch { /* Storage is optional. */ }
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `New enquiry: ${values.name}, ${values.checkIn} to ${values.checkOut}`,
          from_name: `${siteConfig.propertyName} Website`,
          replyto: values.email,
          name: values.name,
          email: values.email,
          phone: normalizeKenyanPhone(values.phone),
          check_in: values.checkIn,
          check_out: values.checkOut,
          nights: countNights,
          guests: values.guests,
          estimated_total_kes: submission.estimatedTotal,
          message: values.message ?? "",
          botcheck: values.botcheck ?? "",
        }),
      });
      const result: unknown = await response.json();
      const success = typeof result === "object" && result !== null && "success" in result && result.success === true;
      if (!response.ok || !success) throw new Error("Web3Forms rejected the enquiry");
      setSent(submission);
      setStatus("success");
    } catch {
      setSent(submission);
      setStatus("error");
      setNotice("Something went wrong sending your enquiry.");
    }
  }

  const firstName = sent?.name.trim().split(/\s+/)[0] ?? "";
  const details = sent ? summaryText(sent) : "";
  if (status === "success" && sent) return <div ref={confirmationRef} tabIndex={-1} role="status" aria-live="polite" className="rounded-lg border border-[#dedbd2] bg-white/50 p-7 outline-none focus:ring-2 focus:ring-[#66715b]">
    <p className="eyebrow text-[#66715b]">ENQUIRY SENT</p>
    <h3 className="serif mt-4 text-3xl">Thank you, {firstName}.</h3>
    <p className="mt-3 text-sm leading-7">Your enquiry has been sent. We&apos;ll reply to {sent.email} within a few hours.</p>
    <div className="mt-6 flex flex-wrap items-center gap-5">
      <a className="button button-dark" href={buildWhatsAppLink(details)} target="_blank" rel="noopener noreferrer">Continue on WhatsApp</a>
      <button className="min-h-11 text-sm underline underline-offset-4" onClick={() => { reset(); setSent(null); setNotice(""); setStatus("idle"); }}>Send another enquiry</button>
    </div>
  </div>;

  return <form className="grid gap-6" onSubmit={handleSubmit(submit)} noValidate>
    {status === "error" && <div role="alert" className="rounded-lg border border-red-800/20 bg-red-50 p-4 text-sm text-red-900">
      <p>{notice || "Something went wrong sending your enquiry."}</p>
      <p className="mt-2 text-red-800/80">Your details are still here. You can try again, or reach us directly:</p>
      <div className="mt-3 flex flex-wrap gap-4">
        <a href={buildWhatsAppLink(details)} target="_blank" rel="noopener noreferrer" className="min-h-11 underline underline-offset-4">Message us on WhatsApp</a>
        <a href={buildMailtoLink("Enquiry: Nevel Apartment", details)} className="min-h-11 underline underline-offset-4">Email us directly</a>
      </div>
    </div>}
    <Field id="name" label="Full name" error={errors.name}><input id="name" autoComplete="name" className={inputClass} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} {...register("name")} /></Field>
    <div className="grid gap-6 sm:grid-cols-2">
      <Field id="phone" label="Phone / WhatsApp" hint="e.g. 0712 345 678" error={errors.phone}><input id="phone" type="tel" inputMode="tel" autoComplete="tel" className={inputClass} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} {...register("phone")} /></Field>
      <Field id="email" label="Email" error={errors.email}><input id="email" type="email" autoComplete="email" className={inputClass} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} /></Field>
    </div>
    <div className="grid gap-6 sm:grid-cols-3">
      <Field id="checkIn" label="Check-in" error={errors.checkIn}><input id="checkIn" type="date" min={todayStr} className={inputClass} aria-invalid={!!errors.checkIn} aria-describedby={errors.checkIn ? "checkIn-error" : undefined} {...register("checkIn")} /></Field>
      <Field id="checkOut" label="Check-out" error={errors.checkOut}><input id="checkOut" type="date" min={checkOutMin} className={inputClass} aria-invalid={!!errors.checkOut} aria-describedby={errors.checkOut ? "checkOut-error" : undefined} {...register("checkOut")} /></Field>
      <Field id="guests" label="Guests" error={errors.guests}><select id="guests" className={inputClass} aria-invalid={!!errors.guests} aria-describedby={errors.guests ? "guests-error" : undefined} {...register("guests")}>{Array.from({ length: siteConfig.maxGuests }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}</select></Field>
    </div>
    {nights > 0 && <p className="rounded-lg bg-black/5 px-4 py-3 text-sm">{nights} {nights === 1 ? "night" : "nights"}, estimated KES {estimate.toLocaleString("en-KE")} <span className="opacity-60">(estimate only, final price confirmed by host)</span></p>}
    <Field id="message" label="Message (optional)" hint={`${message.length}/600`} error={errors.message}><textarea id="message" rows={4} className={`${inputClass} py-3`} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} {...register("message")} /></Field>
    <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" {...register("botcheck")} />
    <button type="submit" disabled={status === "sending"} className="button button-dark w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit">{status === "sending" ? "Sending..." : "Send enquiry"}</button>
    <p className="text-sm text-[#73736b]">Prefer email? <a href={buildMailtoLink()} className="underline underline-offset-4">{siteConfig.ownerEmail}</a></p>
  </form>;
}

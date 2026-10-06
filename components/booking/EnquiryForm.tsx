"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, parseISO } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useForm, type FieldError } from "react-hook-form";
import { bedroomOptions, siteConfig } from "@/data/site";
import { buildMailtoLink, buildWhatsAppLink } from "@/lib/contact";
import { calcNights, enquirySchema, normalizeKenyanPhone, type EnquiryValues } from "@/lib/validation";
import { createClient } from "@/lib/supabase/client";

type SentEnquiry = EnquiryValues & { nights: number; pricePerNightKES: number; estimatedTotalKES: number };
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
    `I'd like to enquire about ${data.nights} ${data.nights === 1 ? "night" : "nights"} at Nevel House C8.`,
    `Bedrooms: ${data.bedrooms} (${data.bedrooms === "3" ? "entire house" : "bedroom option"}); check-in: ${data.checkIn}; check-out: ${data.checkOut}; guests: ${data.guests}.`,
    `Placeholder estimate: KES ${data.pricePerNightKES.toLocaleString()} per night; KES ${data.estimatedTotalKES.toLocaleString()} total.`,
    `Phone: ${normalizeKenyanPhone(data.phone) ?? data.phone}; email: ${data.email}.`,
    data.message ? `Message: ${data.message}` : "",
  ].filter(Boolean).join("\n");
}

export default function EnquiryForm({ whatsappNumber, options = bedroomOptions }: { whatsappNumber?: string; options?: readonly { bedrooms:1|2|3; label:string; pricePerNightKES:number; maxGuests:number; description:string }[] }) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [sent, setSent] = useState<SentEnquiry | null>(null);
  const [notice, setNotice] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [dateRanges, setDateRanges] = useState<{ start: string; end: string }[]>([]);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { name: "", phone: "", email: "", bedrooms: "3", checkIn: "", checkOut: "", guests: "1", message: "", botcheck: "" },
  });
  const [checkIn, checkOut, message = "", bedrooms = "3", guestCount = "1"] = watch(["checkIn", "checkOut", "message", "bedrooms", "guests"]);
  const selectedOption = options.find((option) => option.bedrooms === Number(bedrooms)) ?? options[2]!;
  const selectedMax = selectedOption.maxGuests;
  const estimate = calcNights(checkIn, checkOut) * selectedOption.pricePerNightKES;
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const checkOutMin = checkIn && !Number.isNaN(parseISO(checkIn).getTime()) ? format(addDays(parseISO(checkIn), 1), "yyyy-MM-dd") : todayStr;
  const nights = calcNights(checkIn, checkOut);

  useEffect(() => {
    let active = true;
    void (async () => {
      const cacheKey = "nevel-public-date-ranges";
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) { const parsed: unknown = JSON.parse(cached); if (typeof parsed === "object" && parsed !== null && "time" in parsed && "ranges" in parsed && typeof parsed.time === "number" && Array.isArray(parsed.ranges) && Date.now() - parsed.time < 60_000) { if (active) setDateRanges(parsed.ranges as { start: string; end: string }[]); return; } }
      } catch { /* Fetch fresh public availability if local cache is unavailable. */ }
      const { data, error } = await createClient().from("blocked_dates").select("start_date,end_date");
      if (!error && data && active) { const ranges = data.map((row) => ({ start: row.start_date, end: row.end_date })); setDateRanges(ranges); try { sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), ranges })); } catch { /* Cache is optional. */ } }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const choose = (event: Event) => {
      const count = (event as CustomEvent<number>).detail;
      if ([1, 2, 3].includes(count)) {
        setValue("bedrooms", String(count) as EnquiryValues["bedrooms"]);
        const option = options.find((item) => item.bedrooms === count) ?? options[2]!;
        if (Number(guestCount) > option.maxGuests) setValue("guests", String(option.maxGuests));
      }
    };
    window.addEventListener("nevel:bedrooms", choose);
    return () => window.removeEventListener("nevel:bedrooms", choose);
  }, [setValue, guestCount, options]);

  useEffect(() => {
    setUnavailable(Boolean(checkIn && checkOut && dateRanges.some((range) => checkIn < range.end && range.start < checkOut)));
  }, [checkIn, checkOut, dateRanges]);

  useEffect(() => {
    if (status === "success") confirmationRef.current?.focus();
  }, [status]);

  async function submit(values: EnquiryValues) {
    setNotice("");
    const option = options.find((item) => item.bedrooms === Number(values.bedrooms)) ?? options[2]!;
    if (Number(values.guests) > option.maxGuests) {
      setNotice(`This option can accommodate up to ${option.maxGuests} guests. Please adjust the guest count or contact us.`);
      setStatus("error");
      return;
    }
    const countNights = calcNights(values.checkIn, values.checkOut);
    const submission: SentEnquiry = { ...values, nights: countNights, pricePerNightKES: option.pricePerNightKES, estimatedTotalKES: option.pricePerNightKES * countNights };
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
    setStatus("sending");
    try { sessionStorage.setItem("nevel-enquiry-last-submit", String(Date.now())); } catch { /* Storage is optional. */ }
    const db = createClient();
    const databaseWrite = db.from("enquiries").insert({
      name: values.name.trim(), phone: normalizeKenyanPhone(values.phone)!, email: values.email.trim(),
      check_in: values.checkIn, check_out: values.checkOut, guests: Number(values.guests), bedrooms: Number(values.bedrooms), message: values.message?.trim() || null, status: "new",
    });
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    const emailSend = (async () => {
      if (!accessKey) throw new Error("Web3Forms is not configured");
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
          bedrooms: values.bedrooms,
          price_per_night_kes: option.pricePerNightKES,
          estimated_total_kes: option.pricePerNightKES * countNights,
          property: "Nevel Apartment · House C8",
          message: values.message ?? "",
          botcheck: values.botcheck ?? "",
        }),
      });
      const result: unknown = await response.json();
      const success = typeof result === "object" && result !== null && "success" in result && result.success === true;
      if (!response.ok || !success) throw new Error("Web3Forms rejected the enquiry");
    })();
    const outcomes = await Promise.allSettled([databaseWrite, emailSend]);
    const databaseSucceeded = outcomes[0]?.status === "fulfilled" && !outcomes[0].value.error;
    const emailSucceeded = outcomes[1]?.status === "fulfilled";
    setSent(submission);
    if (databaseSucceeded || emailSucceeded) setStatus("success");
    else {
      setSent(submission);
      setStatus("error");
      setNotice("We could not save or email your enquiry. Please contact us directly.");
    }
  }

  const firstName = sent?.name.trim().split(/\s+/)[0] ?? "";
  const details = sent ? summaryText(sent) : "";
  if (status === "success" && sent) return <div ref={confirmationRef} tabIndex={-1} role="status" aria-live="polite" className="rounded-lg border border-[#dedbd2] bg-white/50 p-7 outline-none focus:ring-2 focus:ring-[#66715b]">
    <p className="eyebrow text-[#66715b]">ENQUIRY SENT</p>
    <h3 className="serif mt-4 text-3xl">Thank you, {firstName}.</h3>
    <p className="mt-3 text-sm leading-7">Your enquiry has been received. The host can reply to {sent.email} with availability and rate details.</p>
    <div className="mt-6 flex flex-wrap items-center gap-5">
      <a className="button button-dark" href={buildWhatsAppLink(details, whatsappNumber)} target="_blank" rel="noopener noreferrer">Continue on WhatsApp</a>
      <button className="min-h-11 text-sm underline underline-offset-4" onClick={() => { reset(); setSent(null); setNotice(""); setStatus("idle"); }}>Send another enquiry</button>
    </div>
  </div>;

  return <form className="grid gap-6" onSubmit={handleSubmit(submit)} noValidate>
    {status === "error" && <div role="alert" className="rounded-lg border border-red-800/20 bg-red-50 p-4 text-sm text-red-900">
      <p>{notice || "Something went wrong sending your enquiry."}</p>
      <p className="mt-2 text-red-800/80">Your details are still here. You can try again, or reach us directly:</p>
      <div className="mt-3 flex flex-wrap gap-4">
        <a href={buildWhatsAppLink(details, whatsappNumber)} target="_blank" rel="noopener noreferrer" className="min-h-11 underline underline-offset-4">Message us on WhatsApp</a>
        <a href={buildMailtoLink("Enquiry: Nevel Apartment", details)} className="min-h-11 underline underline-offset-4">Email us directly</a>
      </div>
    </div>}
    <Field id="name" label="Full name" error={errors.name}><input id="name" autoComplete="name" className={inputClass} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} {...register("name")} /></Field>
    <Field id="bedrooms" label="Bedrooms (the whole house remains private)" error={errors.bedrooms}><select id="bedrooms" className={inputClass} aria-invalid={!!errors.bedrooms} {...register("bedrooms", { onChange: (event) => { const choice=options.find((option) => option.bedrooms === Number(event.target.value)) ?? options[2]!; if (Number(guestCount) > choice.maxGuests) setValue("guests", String(choice.maxGuests)); } })}>{options.map((option) => <option value={option.bedrooms} key={option.bedrooms}>{option.label} · KES {option.pricePerNightKES.toLocaleString()} / night</option>)}</select></Field>
    <div className="grid gap-6 sm:grid-cols-2">
      <Field id="phone" label="Phone / WhatsApp" hint="e.g. 0712 345 678" error={errors.phone}><input id="phone" type="tel" inputMode="tel" autoComplete="tel" className={inputClass} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} {...register("phone")} /></Field>
      <Field id="email" label="Email" error={errors.email}><input id="email" type="email" autoComplete="email" className={inputClass} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} /></Field>
    </div>
    <div className="grid gap-6 sm:grid-cols-3">
      <Field id="checkIn" label="Check-in" error={errors.checkIn}><input id="checkIn" type="date" min={todayStr} className={inputClass} aria-invalid={!!errors.checkIn} aria-describedby={errors.checkIn ? "checkIn-error" : undefined} {...register("checkIn")} /></Field>
      <Field id="checkOut" label="Check-out" error={errors.checkOut}><input id="checkOut" type="date" min={checkOutMin} className={inputClass} aria-invalid={!!errors.checkOut} aria-describedby={errors.checkOut ? "checkOut-error" : undefined} {...register("checkOut")} /></Field>
      <Field id="guests" label="Number of guests" hint={`Up to ${selectedMax} guests for this option.`} error={errors.guests}><input id="guests" type="number" min="1" max={selectedMax} step="1" className={inputClass} aria-invalid={!!errors.guests} aria-describedby={errors.guests ? "guests-error" : undefined} {...register("guests", { max: selectedMax })} /></Field>
    </div>
    {unavailable && <p role="status" className="rounded-lg border border-[#dedbd2] bg-white/70 px-4 py-3 text-sm">Those dates look unavailable, message us on WhatsApp to check.</p>}
    {nights > 0 && <p className="rounded-lg bg-black/5 px-4 py-3 text-sm">Estimated total: KES {estimate.toLocaleString()} for {nights} {nights === 1 ? "night" : "nights"} (KES {selectedOption.pricePerNightKES.toLocaleString()} per night). Price is a placeholder to confirm with the host.</p>}
    <Field id="message" label="Message (optional)" hint={`${message.length}/600`} error={errors.message}><textarea id="message" rows={4} className={`${inputClass} py-3`} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} {...register("message")} /></Field>
    <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" {...register("botcheck")} />
    <button type="submit" disabled={status === "sending"} className="button button-dark w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit">{status === "sending" ? "Sending..." : "Send enquiry"}</button>
    <p className="text-sm text-[#73736b]">Prefer email? <a href={buildMailtoLink()} className="underline underline-offset-4">{siteConfig.ownerEmail}</a></p>
  </form>;
}

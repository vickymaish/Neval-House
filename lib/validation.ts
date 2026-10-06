import { differenceInCalendarDays, isValid, parseISO, startOfToday } from "date-fns";
import { z } from "zod";

export function normalizeKenyanPhone(input: string): string | null {
  const cleaned = input.replace(/[\s\-()]/g, "").replace(/^\+/, "");
  if (/^0[17]\d{8}$/.test(cleaned)) return `254${cleaned.slice(1)}`;
  if (/^254[17]\d{8}$/.test(cleaned)) return cleaned;
  return null;
}

export function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  if (!isValid(start) || !isValid(end)) return 0;
  return Math.max(0, differenceInCalendarDays(end, start));
}

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80, "Name is too long"),
  phone: z.string().trim().refine((value) => normalizeKenyanPhone(value) !== null, "Enter a valid Kenyan number, e.g. 0712 345 678"),
  email: z.string().trim().email("Enter a valid email address"),
  bedrooms: z.enum(["1", "2", "3"]),
  checkIn: z.string().min(1, "Choose a check-in date"),
  checkOut: z.string().min(1, "Choose a check-out date"),
  guests: z.string().trim().regex(/^[1-9]\d{0,2}$/, "Enter a valid number of guests"),
  message: z.string().max(600, "Maximum 600 characters").optional(),
  botcheck: z.string().optional(),
}).superRefine((data, ctx) => {
  const checkIn = parseISO(data.checkIn);
  const checkOut = parseISO(data.checkOut);
  if (isValid(checkIn) && checkIn < startOfToday()) {
    ctx.addIssue({ code: "custom", path: ["checkIn"], message: "Check-in cannot be in the past" });
  }
  if (isValid(checkIn) && isValid(checkOut)) {
    const nights = differenceInCalendarDays(checkOut, checkIn);
    if (nights < 1) ctx.addIssue({ code: "custom", path: ["checkOut"], message: "Check-out must be after check-in" });
    if (nights > 60) ctx.addIssue({ code: "custom", path: ["checkOut"], message: "Maximum stay is 60 nights" });
  }
});

export type EnquiryValues = z.infer<typeof enquirySchema>;

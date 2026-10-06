# Nevel Apartment

## Project structure and final pass

- `app/` contains the public page, metadata routes, and private `/admin` dashboard.
- `components/` contains the photo gallery, stay cards, booking form, and shared sections.
- `data/site.ts` contains bedroom options and the hero source/crop; `data/photos.ts` is generated from the files in `public/images`.
- `lib/photos.ts` provides photo selectors. Run `node scripts/audit-images.mjs` to print image dimensions and SHA-256 hashes.
- To replace a photo, add it to `public/images`, update its entry in `data/photos.ts`, and keep recorded dimensions accurate. To change the hero, set `heroImage` in `data/site.ts` to an existing photo source; adjust desktop/mobile `heroObjectPosition` there.
- Edit page wording in `data/property.ts` and bedroom defaults in `data/site.ts`. Prices and guest limits can also be edited in `/admin/settings`.
- Set `NEXT_PUBLIC_WEB3FORMS_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` in `.env.local` (or the deployment environment). Do not commit `.env.local` or use a service role key.

Apply `supabase/migrations/202610060001_add_enquiry_bedrooms.sql` to add/validate `enquiries.bedrooms` (1–3). Existing dashboard tables and RLS policies remain required as described below.

Bedroom prices and guest limits currently use placeholder values. Confirm them, the address/nearby places, map pin, amenities, house rules, payment details, cancellation policy, Wi-Fi, and parking before publishing.

## Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: project anon/public key. If your Supabase dashboard gives you a publishable key instead, use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The application accepts either and never uses a service role key.
- `NEXT_PUBLIC_WEB3FORMS_KEY`: Web3Forms access key used by the existing enquiry email flow.

Set the same three variables in Vercel Project Settings → Environment Variables for the environments you deploy, then redeploy. Keep `.env.local` private.

## Supabase setup

The `enquiries`, `blocked_dates`, and `site_settings` tables and their RLS policies are expected to exist already. In Supabase Dashboard → Authentication → Users, choose **Add user**, enter the owner's email and a strong password, and create the account. Disable public sign-ups in Authentication settings. Sign in at `/admin/login`.

The app uses only `@supabase/supabase-js` and `@supabase/ssr`. Admin data reads and writes use the signed-in owner's cookie session. Browser access still goes through RLS. Public users can insert enquiries and read the explicitly public tables only.

## Owner dashboard guide

The owner can open `/admin/login` directly or use the discreet **Owner sign in** link at the left side of the public site's footer. After signing in, `/admin` opens the Enquiries section. The dashboard is private: middleware refreshes the Supabase session and redirects signed-out visitors to login, and the admin layout checks the session again on the server. Use **Logout** when finished. There is no public sign-up or password-reset flow; create the owner's account in Supabase Authentication → Users.

### 1. Enquiries

Guest submissions appear newest first with their requested dates, nights, guest count, contact details, message, received time, and status. The status filters show counts so the owner can focus on new requests. **New** means the owner has not marked the request as handled; **Contacted** means a reply or follow-up has been sent; **Confirmed** means the host accepted the stay; **Declined** means it was not accepted. These are owner-managed labels, not automatic messages to the guest. Changing status saves to Supabase immediately. Mark a stay **Confirmed** so it appears in Availability and so overlapping enquiries can be flagged.

Use **Reply on WhatsApp** to open a prefilled message or **Email** to start an email to the guest. The **Dates clash** badge is a prompt to review the dates: it appears when the requested stay overlaps a blocked range or another confirmed enquiry. It does not decide whether to accept the enquiry. Deleting permanently removes that enquiry after a confirmation prompt; changing status is preferable when the owner wants to retain its history.

### 2. Availability

Use **Block dates** for a period when guests should not be offered the apartment, for example maintenance, owner use, or a temporary closure. Add the first unavailable date, the date guests could next check out/arrive, and an optional reason. The start date is included and the end date is the checkout boundary (exclusive): a block from 10 June to 13 June covers the nights of 10, 11, and 12 June. The end date must be after the start date. Delete a block when it no longer applies.

Confirmed enquiries are shown separately as booked stays. They are read-only in this section; change their status in Enquiries if a booking is no longer confirmed. Blocking dates is a manual availability control and does not change enquiry status. The public booking form checks blocked ranges and displays a gentle warning, but it still lets the guest submit so the host can review the request.

### 3. Settings

Edit and save the nightly price (KES), maximum guests, check-in and check-out times, WhatsApp number, tagline, and welcome paragraph. The public page uses the tagline and welcome paragraph in the hero; shows the price when a positive price is set; displays guest capacity and check-in/out times in the booking section; applies the guest limit to the enquiry form; and uses the saved WhatsApp number in its contact links. Settings are cached publicly for about 60 seconds. If a setting has not been saved, the public site uses its built-in default so it can still render.

### Suggested daily flow

1. Sign in and open Enquiries; start with the **New** filter.
2. Review the requested dates and any **Dates clash** badge. Check Availability before promising dates.
3. Reply by WhatsApp or email, then mark the request **Contacted**.
4. When the host and guest agree, mark it **Confirmed**. If it is not accepted, mark it **Declined**.
5. Add a blocked range for owner use, maintenance, or closures, and remove it when the dates reopen.
6. Sign out when done.

## RLS checks

To verify anon users cannot read enquiries, use Supabase SQL Editor or a local script initialized with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (never a service role key):

```ts
const { data, error } = await supabase.from("enquiries").select("id");
Inspect `data` and `error` in the local debugger.
```

The anonymous query must be denied by RLS (or return no rows, depending on the policy behavior); it must not reveal enquiry records. In the same anon session, verify that `blocked_dates` and `site_settings` can be selected, and that a valid enquiry insert succeeds. Then sign in through `/admin/login` and verify that the owner can list, update, and delete enquiries and manage blocked dates and settings. Do not relax the anonymous `SELECT` policy on `enquiries` to make public clash checks work.

## Availability policy note

The public enquiry form caches `blocked_dates` for 60 seconds and displays a friendly warning when selected dates overlap. The supplied RLS rules do not let anon users read confirmed enquiry ranges, and no database view or RPC for publishing those ranges was specified. The public form therefore cannot include confirmed enquiries in its clash check without exposing the private `enquiries` table. Admin enquiry cards do flag overlaps with other confirmed stays. A safe public availability view or RPC can be added separately if confirmed ranges should appear publicly.

## Booking flow

After client-side validation, the form sends the enquiry insert and Web3Forms email request independently. It reports success if either request succeeds. Supabase insert errors are logged; the public anon role cannot select the inserted record. Phone numbers are stored in `2547XXXXXXXX`/`2541XXXXXXXX` form. Set `NEXT_PUBLIC_WEB3FORMS_KEY` to keep the existing email notification flow enabled.

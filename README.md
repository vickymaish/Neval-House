# Nevel Apartment

## Booking setup

The enquiry form sends guest details to the host by email through Web3Forms.

- Get a Web3Forms access key at [web3forms.com](https://web3forms.com/) using the host email address.
- For local development, put `NEXT_PUBLIC_WEB3FORMS_KEY=your_key_here` in `.env.local`, then restart `npm run dev`.
- For production, add `NEXT_PUBLIC_WEB3FORMS_KEY` under Vercel Project Settings → Environment Variables, then redeploy.
- Change the host email, WhatsApp number, nightly estimate, guest limit and check-in/out times in `data/site.ts`.
- Submit an enquiry using your own contact details and verify receipt in the host inbox (including spam). Also try invalid dates and an invalid phone number.

The Web3Forms access key is used in the browser for this client-side form. `.env.local` is ignored by Git; `.env.example` contains only a placeholder.

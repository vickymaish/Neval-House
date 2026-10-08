import type { photos } from "./photos";

export const siteConfig = {
  propertyName: "Nevel Apartments",
  location: "Eldoret, Kenya",
  ownerEmail: "64holidayhomesandbnb@gmail.com",
  whatsappNumber: "254711884316",
  whatsappDisplay: "+254 711 884 316",
} as const;

export const bedroomOptions = [
  { bedrooms: 1, label: "1 bedroom", pricePerNightKES: 3500, maxGuests: 2, description: "A private stay with one bedroom available; the other bedrooms remain locked." },
  { bedrooms: 2, label: "2 bedrooms", pricePerNightKES: 5500, maxGuests: 4, description: "Room to settle into two bedrooms, with the rest of the house kept private." },
  { bedrooms: 3, label: "Entire house", pricePerNightKES: 7500, maxGuests: 6, description: "All three bedrooms in a private house for your group." },
] as const; // TODO: confirm nightly prices and guest limits.

export const heroImage: (typeof photos)[number]["src"] = "/images/hero-image.jpeg";
// Change this source to another existing /public/images photo and adjust the crop here.
export const heroObjectPosition = { desktop: "center 35%", mobile: "center 40%" } as const;

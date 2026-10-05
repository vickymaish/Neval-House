import { siteConfig } from "@/data/site";

export function buildWhatsAppLink(message = "Hi, I'd like to enquire about Nevel Apartment.") {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoLink(subject = "Enquiry: Nevel Apartment", body = "") {
  return `mailto:${siteConfig.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

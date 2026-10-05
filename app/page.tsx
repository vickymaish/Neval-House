import Image from "next/image";
import { property } from "@/data/property";
import { BookingLink, FAQ, FloatingWhatsApp, HouseGrid, Navigation, PhotoGallery, Reveal, WhatsAppLink } from "@/components/site";
import Booking from "@/components/sections/Booking";
import { siteConfig } from "@/data/site";
import { buildMailtoLink, buildWhatsAppLink } from "@/lib/contact";

export default function Home() {
  return <main id="top">
    <Navigation />

    <section id="hero" className="relative flex min-h-[640px] h-[88svh] max-h-[900px] items-end overflow-hidden bg-[#35362f] text-white md:items-center">
      <Image src={property.hero.image} alt={property.hero.imageAlt} fill priority sizes="100vw" className="object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/25 md:bg-gradient-to-r md:from-black/55 md:via-black/20 md:to-black/10" />
      <div className="wrap relative z-10 pb-24 pt-32 md:pb-10">
        <Reveal className="max-w-[760px]">
          <p className="eyebrow mb-6 text-white/75">{property.hero.eyebrow}</p>
          <h1 className="serif max-w-[740px] text-[clamp(3.25rem,7vw,6.5rem)] leading-[.98]">{property.hero.title}</h1>
          <p className="mt-7 max-w-[440px] text-[14px] leading-7 text-white/80 md:text-base">{property.hero.description}</p>
          <div className="mt-9 flex flex-wrap gap-3"><BookingLink className="button button-light">Book now <span className="ml-4" aria-hidden="true">↗</span></BookingLink><WhatsAppLink>Chat on WhatsApp</WhatsAppLink></div>
        </Reveal>
      </div>
      <div className="absolute bottom-8 right-6 hidden items-center gap-3 text-[9px] uppercase tracking-[.18em] text-white/65 md:flex"><span className="h-px w-12 bg-white/60" />A place to feel at home</div>
    </section>

    <section id="house" className="section-pad wrap">
      <Reveal className="mx-auto max-w-[700px] text-center">
        <p className="eyebrow text-[#66715b]">{property.house.eyebrow}</p>
        <h2 className="serif mt-5 text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05]">{property.house.title}</h2>
        <p className="mx-auto mt-6 max-w-[570px] text-sm leading-7 text-[#6f7069]">{property.house.description}</p>
      </Reveal>
      <HouseGrid />
      <div className="mt-8 flex justify-end"><a className="nav-link border-b border-[#a4a296] pb-2" href="#gallery">Explore the gallery <span className="ml-2">↗</span></a></div>
    </section>

    <section id="gallery" className="section-pad bg-[#eeece5]">
      <div className="wrap">
        <Reveal className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow text-[#66715b]">A CLOSER LOOK</p><h2 className="serif mt-4 text-[clamp(2.5rem,5vw,4.5rem)] leading-none">The spaces within.</h2></div><p className="max-w-[340px] text-sm leading-7 text-[#6f7069]">A look around the apartment. Select a photograph to view it full screen.</p></Reveal>
        <PhotoGallery />
      </div>
    </section>

    <section id="amenities" className="section-pad wrap grid gap-12 md:grid-cols-[.8fr_1.2fr] md:gap-24">
      <Reveal><p className="eyebrow text-[#66715b]">THOUGHTFUL ESSENTIALS</p><h2 className="serif mt-5 max-w-[480px] text-[clamp(2.6rem,5vw,4.5rem)] leading-[1.02]">Everything in its place.</h2><p className="mt-6 max-w-[360px] text-sm leading-7 text-[#6f7069]">Comforts and practical details for your time in Eldoret.</p></Reveal>
      <div className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">{property.amenities.map((amenity, i) => <Reveal key={amenity} delay={i * .03}><div className="flex min-h-[64px] items-center border-b border-[#dedbd2] text-sm">{amenity}</div></Reveal>)}</div>
    </section>

    <section id="location" className="bg-[#eeece5]">
      <div className="grid md:min-h-[600px] md:grid-cols-2">
        <div className="relative min-h-[380px] md:min-h-full"><Image src="/images/apartment.jpeg" alt="Nevel Apartments building in Eldoret" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" /></div>
        <div className="flex items-center py-16 md:py-24"><Reveal className="wrap md:!ml-0 md:!mr-auto md:max-w-[560px] md:px-16"><p className="eyebrow text-[#66715b]">A PLACE IN ELDORET</p><h2 className="serif mt-5 text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.02]">Find your way to Nevel.</h2><p className="mt-6 text-sm leading-7 text-[#6f7069]">{property.locationDescription}</p><p className="mt-5 text-xs uppercase tracking-[.1em] text-[#66715b]">{property.location}</p></Reveal></div>
      </div>
      <div className="wrap pb-16 md:pb-24"><div className="relative h-[260px] overflow-hidden rounded-[12px] bg-[#dedbd2] md:h-[380px]"><iframe title="Map showing Nevel Apartment in Eldoret" src={property.mapEmbedUrl === "TODO — add the exact Google Maps embed URL" ? `https://www.google.com/maps?q=${encodeURIComponent(`${property.fullName}, Eldoret, Kenya`)}&output=embed` : property.mapEmbedUrl} className="h-full w-full border-0 grayscale-[.7]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><a className="absolute bottom-4 right-4 bg-[#F7F5F0] px-4 py-3 text-[10px] uppercase tracking-[.12em]" href={`https://maps.google.com/?q=${encodeURIComponent(`${property.fullName}, Eldoret, Kenya}`)}`} target="_blank" rel="noreferrer">Open in Google Maps ↗</a></div></div>
    </section>

    <section id="faq" className="section-pad wrap grid gap-10 md:grid-cols-[.8fr_1.2fr] md:gap-24">
      <Reveal><p className="eyebrow text-[#66715b]">GOOD TO KNOW</p><h2 className="serif mt-5 text-[clamp(2.75rem,5vw,4.5rem)] leading-[1.02]">A few useful details.</h2></Reveal>
      <FAQ />
    </section>

    <Booking />

    <footer className="wrap py-10 md:py-12">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"><div><a href="#top" className="serif text-[27px]">{property.name}</a><p className="mt-2 text-xs tracking-wide text-[#73736b]">{property.location}</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] uppercase tracking-[.13em]">
        <a className="hover:text-[#66715b]" href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer">WhatsApp {siteConfig.whatsappDisplay}</a>
        <a className="hover:text-[#66715b]" href={buildMailtoLink()}>{siteConfig.ownerEmail}</a>
        {property.instagramUrl === "TODO" ? <span aria-disabled="true" title="Add an Instagram URL in data/property.ts">Instagram</span> : <a className="hover:text-[#66715b]" href={property.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>}
        {property.airbnbUrl === "TODO" ? <span aria-disabled="true" title="Add the Airbnb listing URL in data/property.ts">Airbnb</span> : <a className="hover:text-[#66715b]" href={property.airbnbUrl} target="_blank" rel="noreferrer">Airbnb</a>}
      </div></div>
      <div className="mt-8 flex justify-between border-t border-[#dedbd2] pt-5 text-[10px] tracking-wide text-[#88877e]"><span>© {new Date().getFullYear()} {property.name}</span><span>ELDORET · KENYA</span></div>
    </footer>
    <FloatingWhatsApp />
  </main>;
}

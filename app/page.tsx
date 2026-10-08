import Image from "next/image";
import { property } from "@/data/property";
import { BookingLink, FAQ, FloatingWhatsApp, Navigation, PhotoGallery, Reveal, WhatsAppLink } from "@/components/site";
import Booking from "@/components/sections/Booking";
import { siteConfig } from "@/data/site";
import { buildMailtoLink, buildWhatsAppLink } from "@/lib/contact";
import { getPublicSettings } from "@/lib/public-settings";
import Stays from "@/components/sections/Stays";
import { getHero } from "@/lib/photos";
import { heroImage, heroObjectPosition } from "@/data/site";

export default async function Home() {
  const settings = await getPublicSettings();
  const hero = getHero(heroImage);
  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"; // TODO: set the live canonical site URL.
  const jsonLd = { "@context":"https://schema.org", "@type":["VacationRental","LodgingBusiness"], name:"Nevel Apartment · House C8", telephone:siteConfig.whatsappDisplay, email:siteConfig.ownerEmail, address:{"@type":"PostalAddress", addressLocality:"Eldoret", addressCountry:"KE", streetAddress:"TODO: add verified address"}, image:`${canonicalBase}${hero.src}`, priceRange:"TODO: confirm nightly prices" };
  return <main id="top">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <Navigation />

    <section id="hero" className="relative flex min-h-[640px] h-[88svh] max-h-[900px] items-end overflow-hidden bg-[#35362f] text-white md:items-center">
      <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: heroObjectPosition.mobile }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/40 md:bg-gradient-to-r md:from-black/70 md:via-black/35 md:to-black/20" />
      <style>{`@media(min-width:768px){#hero img{object-position:${heroObjectPosition.desktop}!important}}`}</style>
      <div className="wrap relative z-10 pb-24 pt-32 md:pb-10">
        <Reveal className="max-w-[760px]">
          <p className="eyebrow mb-6 text-white/75">{property.hero.eyebrow}</p>
          <h1 className="serif max-w-[740px] text-[clamp(3.25rem,7vw,6.5rem)] leading-[.98]">{settings.tagline}</h1>
          <p className="mt-7 max-w-[440px] text-[14px] leading-7 text-white/80 md:text-base">{settings.welcome_paragraph}</p>
          <div className="mt-9 flex flex-wrap gap-3"><BookingLink className="button button-light">Book now <span className="ml-4" aria-hidden="true">↗</span></BookingLink><WhatsAppLink whatsappNumber={settings.whatsapp_number}>Chat on WhatsApp</WhatsAppLink></div>
        </Reveal>
      </div>
      <div className="absolute bottom-8 right-6 hidden items-center gap-3 text-[9px] uppercase tracking-[.18em] text-white/65 md:flex"><span className="h-px w-12 bg-white/60" />A place to feel at home</div>
    </section>

    <div id="main-content" tabIndex={-1} />
    <section id="house" className="section-pad wrap">
      <Reveal className="mx-auto max-w-[700px] text-center">
        <p className="eyebrow text-[#66715b]">{property.house.eyebrow}</p>
        <h2 className="serif mt-5 text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05]">{property.house.title}</h2>
        <p className="mx-auto mt-6 max-w-[570px] text-sm leading-7 text-[#6f7069]">{property.house.description}</p>
      </Reveal>
      <div className="mt-10 text-center"><p className="eyebrow text-[#66715b]">HOUSE C8 · ELDORET</p><p className="serif mt-3 text-3xl">One private house. Three bedroom options.</p></div>
      <div className="mt-8 flex justify-end"><a className="nav-link border-b border-[#a4a296] pb-2" href="#gallery">Explore the gallery <span className="ml-2">↗</span></a></div>
    </section>

    <Stays options={settings.bedroom_options} />

    <section id="other-apartment" className="section-pad wrap">
      <div className="mx-auto max-w-3xl rounded-lg border border-[#dedbd2] bg-white/40 p-7 md:p-10">
        <p className="eyebrow text-[#66715b]">A SEPARATE LISTING · {property.separateApartment.status.toUpperCase()}</p>
        <h2 className="serif mt-4 text-4xl">{property.separateApartment.name}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f7069]">{property.separateApartment.description}</p>
        <a className="button button-outline mt-6 !border-[#24251f] !text-[#24251f]" href={buildWhatsAppLink("Hello, I would like to enquire about the separate two-bedroom apartment.", settings.whatsapp_number)} target="_blank" rel="noopener noreferrer">Enquire about this apartment</a>
      </div>
    </section>

    <section id="gallery" className="section-pad bg-[#eeece5]">
      <div className="wrap">
        <Reveal className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow text-[#66715b]">3-BEDROOM APARTMENT · A CLOSER LOOK</p><h2 className="serif mt-4 text-[clamp(2.5rem,5vw,4.5rem)] leading-none">The spaces within.</h2></div><p className="max-w-[340px] text-sm leading-7 text-[#6f7069]">A look around the three-bedroom apartment. Select a photograph to view it full screen.</p></Reveal>
        <PhotoGallery />
      </div>
    </section>

    <section id="amenities" className="section-pad wrap grid gap-12 md:grid-cols-[.8fr_1.2fr] md:gap-24">
      <Reveal><p className="eyebrow text-[#66715b]">HOUSE C8 · DETAILS</p><h2 className="serif mt-5 max-w-[480px] text-[clamp(2.6rem,5vw,4.5rem)] leading-[1.02]">The useful details.</h2><p className="mt-6 max-w-[360px] text-sm leading-7 text-[#6f7069]">We are confirming the amenities with the host. Please ask if you need a particular facility.</p></Reveal>
      <div className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">{property.amenities.map((amenity, i) => <Reveal key={amenity} delay={i * .03}><div className="flex min-h-[64px] items-center border-b border-[#dedbd2] text-sm">{amenity}</div></Reveal>)}</div>
    </section>

    <section className="section-pad wrap grid gap-10 md:grid-cols-[.8fr_1.2fr] md:gap-24"><Reveal><p className="eyebrow text-[#66715b]">BEFORE YOU ARRIVE</p><h2 className="serif mt-5 text-[clamp(2.5rem,5vw,4rem)]">House rules.</h2></Reveal><div>{property.houseRules.map((rule) => <p key={rule} className="min-h-[64px] border-b border-[#dedbd2] py-5 text-sm leading-6 text-[#6f7069]">{rule}</p>)}</div></section>

    <section id="location" className="bg-[#eeece5]">
      <div className="grid md:min-h-[600px] md:grid-cols-2">
        <div className="relative min-h-[380px] md:min-h-full"><Image src="/images/apartment.jpeg" alt="Nevel Apartments building in Eldoret" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" /></div>
        <div className="flex items-center py-16 md:py-24"><Reveal className="wrap md:!ml-0 md:!mr-auto md:max-w-[560px] md:px-16"><p className="eyebrow text-[#66715b]">A PLACE IN ELDORET</p><h2 className="serif mt-5 text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.02]">Find your way to Nevel.</h2><p className="mt-6 text-sm leading-7 text-[#6f7069]">{property.locationDescription}</p><p className="mt-5 text-xs uppercase tracking-[.1em] text-[#66715b]">{property.location}</p></Reveal></div>
      </div>
      <div className="wrap pb-16 md:pb-24"><div className="relative h-[260px] overflow-hidden rounded-[12px] bg-[#dedbd2] md:h-[380px]"><iframe title="Map showing Nevel Apartments in Eldoret" src={property.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(`${property.fullName}, Eldoret, Kenya`)}&output=embed`} className="h-full w-full border-0 grayscale-[.7]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><a className="absolute bottom-4 right-4 bg-[#F7F5F0] px-4 py-3 text-[10px] uppercase tracking-[.12em]" href={`https://maps.google.com/?q=${encodeURIComponent(`${property.fullName}, Eldoret, Kenya}`)}`} target="_blank" rel="noreferrer">Open in Google Maps ↗</a></div></div>
    </section>

    <section id="faq" className="section-pad wrap grid gap-10 md:grid-cols-[.8fr_1.2fr] md:gap-24">
      <Reveal><p className="eyebrow text-[#66715b]">GOOD TO KNOW</p><h2 className="serif mt-5 text-[clamp(2.75rem,5vw,4.5rem)] leading-[1.02]">A few useful details.</h2></Reveal>
      <FAQ />
    </section>

    <Booking settings={settings} />

    <footer className="wrap py-10 md:py-12">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"><div><a href="#top" className="serif text-[27px]">{property.name}</a><p className="mt-2 text-xs tracking-wide text-[#73736b]">{property.location}</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] uppercase tracking-[.13em]">
        <a className="hover:text-[#66715b]" href={buildWhatsAppLink(undefined, settings.whatsapp_number)} target="_blank" rel="noopener noreferrer">WhatsApp +{settings.whatsapp_number}</a>
        <a className="hover:text-[#66715b]" href={buildMailtoLink()}>{siteConfig.ownerEmail}</a>
      </div></div>
      <div className="mt-8 flex justify-between border-t border-[#dedbd2] pt-5 text-[10px] tracking-wide text-[#88877e]"><span>© {new Date().getFullYear()} {property.name}</span><span>ELDORET · KENYA</span></div>
      <div className="mt-4 text-left"><a href="/admin/login" className="min-h-11 inline-flex items-center px-2 text-[10px] tracking-wide text-[#88877e] underline-offset-4 hover:text-[#66715b] hover:underline">Owner sign in</a></div>
    </footer>
    <FloatingWhatsApp whatsappNumber={settings.whatsapp_number} />
  </main>;
}

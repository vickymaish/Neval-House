"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { property } from "@/data/property";
import { buildWhatsAppLink } from "@/lib/contact";


export function BookingLink({ children, className = "button button-dark", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <a className={className} href="#booking" onClick={() => { onClick?.(); requestAnimationFrame(() => document.getElementById("booking-heading")?.focus()); }}>{children}</a>;
}
export function WhatsAppLink({ children, className = "button button-outline" }: { children: React.ReactNode; className?: string }) {
  return <a className={className} href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 40); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  const links = [["House", "#house"], ["Gallery", "#gallery"], ["Amenities", "#amenities"], ["FAQ", "#faq"]];
  return <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${scrolled ? "bg-[#F7F5F0]/95 text-[#24251f] shadow-[0_1px_0_#dedbd2] backdrop-blur-sm" : "text-white"}`}>
    <div className="wrap flex h-[76px] items-center justify-between">
      <a href="#top" className="serif text-[25px] leading-none tracking-tight">{property.name}</a>
      <nav className="hidden items-center gap-9 md:flex" aria-label="Main navigation">{links.map(([label, href]) => <a className="nav-link" href={href} key={label}>{label}</a>)}</nav>
      <div className="hidden md:block"><BookingLink className={`button !min-h-10 !px-5 ${scrolled ? "button-dark" : "button-outline"}`}>Book now</BookingLink></div>
      <button className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}><span className={`h-px w-5 bg-current transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} /><span className={`h-px w-5 bg-current transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`} /></button>
    </div>
    <AnimatePresence>{open && <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[#F7F5F0] text-[#24251f] md:hidden"><div className="wrap flex flex-col pb-6">{links.map(([label, href]) => <a onClick={() => setOpen(false)} className="border-t border-[#dedbd2] py-4 text-xs uppercase tracking-[.15em]" href={href} key={label}>{label}</a>)}<BookingLink className="button button-dark mt-3" onClick={() => setOpen(false)}>Book now</BookingLink></div></motion.nav>}</AnimatePresence>
  </header>;
}

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}>{children}</motion.div>;
}

export function HouseGrid() {
  const photos = property.photos.slice(0, 6);
  return <div className="house-grid mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
    {photos.map((photo) => <a key={photo.src} href="#gallery" className="photo group block">
      <Image src={photo.src} alt={photo.alt} width={1500} height={1000} sizes="(max-width: 767px) 50vw, 33vw" className="group-hover:scale-[1.015]" />
    </a>)}
  </div>;
}

export function PhotoGallery() {
  const [active, setActive] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const close = useCallback(() => setActive(null), []);
  const move = useCallback((direction: number) => setActive((current) => current === null ? null : (current + direction + property.photos.length) % property.photos.length), []);
  useEffect(() => {
    if (active === null) return;
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); if (event.key === "ArrowRight") move(1); if (event.key === "ArrowLeft") move(-1); };
    document.addEventListener("keydown", keydown); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", keydown); document.body.style.overflow = ""; };
  }, [active, close, move]);
  return <>
    <div className="photo-gallery mt-12 columns-2 gap-3 md:columns-3 md:gap-5">{property.photos.map((photo, i) => <button key={photo.src} aria-label={`Open image: ${photo.alt}`} onClick={() => setActive(i)} className="photo mb-3 block w-full break-inside-avoid text-left md:mb-5"><Image src={photo.src} alt={photo.alt} width={photo.src.includes("kitchen-detail") ? 1000 : photo.src.includes("apartment") ? 1280 : 1500} height={photo.src.includes("kitchen-detail") ? 1500 : photo.src.includes("apartment") ? 854 : 1000} loading="lazy" sizes="(max-width: 767px) 50vw, 33vw" /></button>)}</div>
    <AnimatePresence>{active !== null && <motion.div className="lightbox-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Photo gallery" onClick={close} onTouchStart={(e) => setTouchStart(e.touches[0].clientX)} onTouchEnd={(e) => { if (touchStart !== null && Math.abs(e.changedTouches[0].clientX - touchStart) > 45) move(e.changedTouches[0].clientX < touchStart ? 1 : -1); setTouchStart(null); }}>
      <button onClick={close} aria-label="Close gallery" className="absolute right-5 top-5 z-10 grid h-12 w-12 place-items-center text-3xl text-white">×</button>
      <button onClick={(e) => { e.stopPropagation(); move(-1); }} aria-label="Previous image" className="absolute left-2 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center text-3xl text-white md:left-8">‹</button>
      <figure className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}><div className="relative h-[78vh] w-full"><Image src={property.photos[active].src} alt={property.photos[active].alt} fill sizes="100vw" className="object-contain" priority /></div><figcaption className="mt-4 text-xs tracking-wide text-white/75">{property.photos[active].alt} <span className="ml-3">{active + 1} / {property.photos.length}</span></figcaption></figure>
      <button onClick={(e) => { e.stopPropagation(); move(1); }} aria-label="Next image" className="absolute right-2 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center text-3xl text-white md:right-8">›</button>
    </motion.div>}</AnimatePresence>
  </>;
}

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return <div>{property.faqs.map((item, i) => <div className="faq-row" key={item.question}><button className="flex min-h-[76px] w-full items-center justify-between gap-4 py-5 text-left" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}><span className="serif text-[20px] md:text-[24px]">{item.question}</span><span className="text-xl text-[#66715b]">{open === i ? "−" : "+"}</span></button><AnimatePresence initial={false}>{open === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="max-w-2xl pb-6 pr-8 text-sm leading-7 text-[#73736b]">{item.answer}</p></motion.div>}</AnimatePresence></div>)}</div>;
}

export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => {
      const heroBottom = document.getElementById("hero")?.getBoundingClientRect().bottom ?? window.innerHeight;
      setVisible(heroBottom <= 90);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className={`fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#66715b] text-white shadow-lg transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#24251f] ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}><svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-current"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.16 1.6 5.97L.05 24l6.25-1.64a11.9 11.9 0 0 0 5.77 1.47h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.18-3.49-8.42ZM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.87 9.87 0 0 1-1.52-5.26c0-5.46 4.44-9.9 9.91-9.9 2.65 0 5.14 1.03 7.01 2.9a9.84 9.84 0 0 1 2.9 7c0 5.47-4.45 9.91-9.93 9.91Zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.3 1.27.49 1.7.62.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg></a>;
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { bedroomOptions } from "@/data/site";
import { getPhotosForListing } from "@/lib/photos";

const leadImages = {
  1: { src: "/images/sitting-area-view2.jpeg", alt: "TODO: Sitting area shown in sitting-area-view2.jpeg.", matchingPhoto: "interior" },
  2: { src: "/images/sitting-area.jpeg", alt: "TODO: Sitting area shown in sitting-area.jpeg.", matchingPhoto: "sitting-area" },
  3: { src: "/images/lounge-detail.jpeg", alt: "TODO: Lounge detail shown in lounge-detail.jpeg.", matchingPhoto: "lounge-detail" },
} as const;

type StayOption = { bedrooms: 1 | 2 | 3; label: string; pricePerNightKES: number; maxGuests: number; description: string };

export default function Stays({ options = bedroomOptions }: { options?: readonly StayOption[] }) {
  return <section id="stays" className="section-pad bg-[#eeece5]"><div className="wrap">
    <p className="eyebrow text-[#66715b]">HOUSE C8</p>
    <h2 className="serif mt-4 text-[clamp(2.5rem,5vw,4.5rem)]">Three ways to stay.</h2>
    <div className="mt-10 grid gap-5 lg:grid-cols-3">{options.map((option) => <StayCard key={option.bedrooms} option={option} />)}</div>
    <p className="mt-6 text-sm text-[#6f7069]">Same house. The whole house is private to you; unused bedrooms stay locked.</p>
    <p className="mt-2 text-xs text-[#73736b]">Rates and guest limits are placeholders. TODO: confirm before publishing.</p>
  </div></section>;
}

function StayCard({ option }: { option: StayOption }) {
  const photos = getPhotosForListing(option.bedrooms);
  const lead = leadImages[option.bedrooms];
  const leadIndex = Math.max(0, photos.findIndex((photo) => photo.id === lead.matchingPhoto));
  const [active, setActive] = useState(leadIndex);
  const selectedPhoto = photos[active]!;
  const imageSrc = active === leadIndex ? lead.src : selectedPhoto.src;
  const imageAlt = active === leadIndex ? lead.alt : selectedPhoto.alt;
  const select = () => {
    window.dispatchEvent(new CustomEvent("nevel:bedrooms", { detail: option.bedrooms }));
    window.location.hash = "booking";
  };

  return <article className="overflow-hidden rounded-lg border border-[#dedbd2] bg-[#F7F5F0]">
    <div className="relative aspect-[4/3] bg-[#dedbd2]">
      <Image src={imageSrc} alt={imageAlt} fill sizes="(max-width: 1023px) 100vw, 33vw" className="object-cover" />
      <button aria-label="Previous photo" className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/55 text-white" onClick={() => setActive((active + photos.length - 1) % photos.length)}>‹</button>
      <button aria-label="Next photo" className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/55 text-white" onClick={() => setActive((active + 1) % photos.length)}>›</button>
      <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white">{active + 1} / {photos.length}</span>
    </div>
    <div className="flex gap-2 overflow-x-auto p-3" aria-label={`Photos for ${option.label}`}>
      {photos.slice(0, 8).map((photo, index) => <button key={photo.id} aria-label={`Show photo ${index + 1}`} aria-pressed={active === index} onClick={() => setActive(index)} className={`relative h-14 w-16 shrink-0 overflow-hidden rounded ${active === index ? "ring-2 ring-[#66715b]" : "opacity-70"}`}>
        <Image src={photo.src} alt="" fill sizes="64px" className="object-cover" />
      </button>)}
    </div>
    <div className="p-6 pt-2">
      <p className="eyebrow text-[#66715b]">{option.bedrooms === 3 ? "3 BEDROOMS" : option.label.toUpperCase()}</p>
      <h3 className="serif mt-2 text-3xl">{option.label}</h3>
      <p className="mt-2 text-sm text-[#6f7069]">Up to {option.maxGuests} guests</p>
      <p className="mt-4 text-sm leading-6 text-[#6f7069]">{option.description}</p>
      <p className="mt-5 text-lg">KES {option.pricePerNightKES.toLocaleString()} <span className="text-xs text-[#73736b]">per night · TODO confirm</span></p>
      <button onClick={select} className="button button-dark mt-5 w-full">Choose this option</button>
    </div>
  </article>;
}

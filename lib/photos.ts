import { photos } from "@/data/photos";

export type Room = "living" | "bedroom" | "kitchen" | "bathroom" | "exterior" | "other";
export type Listing = 1 | 2 | 3;
export type Photo = { id:string; src:string; alt:string; room:Room; width:number; height:number; listings:Listing[]; featured:boolean; needsReview:boolean };
export function getHero(source?: string): Photo { return photos.find((photo) => photo.src === source) ?? photos.find((photo) => photo.featured) ?? photos[0]!; }
export function getPhotosForListing(listing: Listing): Photo[] { return getUniquePhotos().filter((photo) => photo.listings.includes(listing)); }
export function getPhotosByRoom(room: Room): Photo[] { return getUniquePhotos().filter((photo) => photo.room === room); }
export function getUniquePhotos(): Photo[] { return [...new Map(photos.map((photo) => [photo.src, photo])).values()]; }

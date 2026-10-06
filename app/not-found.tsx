import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center px-6 text-center"><div><p className="eyebrow text-[#66715b]">NEVEL APARTMENT · ELDORET</p><h1 className="serif mt-5 text-6xl">Page not found.</h1><p className="mt-5 text-sm text-[#6f7069]">That address does not lead to a page here.</p><Link className="button button-dark mt-8" href="/">Return to the house</Link></div></main>;
}

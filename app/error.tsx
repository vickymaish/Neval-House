"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center px-6 text-center"><div><p className="eyebrow text-[#66715b]">NEVEL APARTMENT · ELDORET</p><h1 className="serif mt-5 text-6xl">We hit a snag.</h1><p className="mt-5 text-sm text-[#6f7069]">Please try loading this page again.</p><button className="button button-dark mt-8" onClick={reset}>Try again</button></div></main>;
}

import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { LandingShell } from "@/components/landing/landing-shell";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    absolute: "Aturseva — The doctor visits. Aturseva stays.",
  },
  description:
    "Doctor home visits with an AI care companion that never clocks out. Medicine reminders, vitals check-ins and your live queue number — living on your family's phone.",
  keywords: [
    "Aturseva",
    "doctor home visit",
    "AI care companion",
    "home healthcare India",
    "queue token",
    "Doctorooms",
  ],
  icons: {
    icon: [{ url: "/aturseva-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/aturseva-icon.svg" }],
  },
  openGraph: {
    title: "Aturseva — The doctor visits. Aturseva stays.",
    description:
      "Doctor home visits with an AI care companion that never clocks out.",
    type: "website",
    images: [
      {
        url: "/og/aturseva-og.png",
        width: 1200,
        height: 630,
        alt: "Aturseva — the doctor visits, she stays. A monochrome ink-and-ivory orb breathing on black.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aturseva — The doctor visits. Aturseva stays.",
    description:
      "Doctor home visits with an AI care companion that never clocks out.",
    images: ["/og/aturseva-og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
};

export default function AtursevaLandingPage() {
  return (
    <div className={`${fraunces.variable} ${manrope.variable}`}>
      <LandingShell />
    </div>
  );
}

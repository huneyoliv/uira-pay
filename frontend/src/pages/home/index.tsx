import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Partners } from "@/components/landing/Partners";
import { Features } from "@/components/landing/Features";
import { AppShowcase } from "@/components/landing/AppShowcase";

import { Testimonial } from "@/components/landing/Testimonial";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Partners />
      <Features />
      <AppShowcase />

      <Testimonial />
      <FAQ />
      <Footer />
    </main>
  );
}

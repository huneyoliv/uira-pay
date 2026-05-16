import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Partners } from '@/components/landing/Partners';
import { Features } from '@/components/landing/Features';
import { AppShowcase } from '@/components/landing/AppShowcase';
import { Testimonial } from '@/components/landing/Testimonial';
import { FAQ } from '@/components/landing/FAQ';
import { CallToAction } from '@/components/landing/CallToAction';
import { Footer } from '@/components/landing/Footer';

export function HomePage() {
    return (
        <div className="min-h-screen bg-[#0C0C0C] text-white font-sans selection:bg-emerald-500/30">
            <Navbar />
            <main>
                <Hero />
                <Partners />
                <Features />
                <AppShowcase />
                <Testimonial />
                <FAQ />
                <CallToAction />
            </main>
            <Footer />
        </div>
    );
}

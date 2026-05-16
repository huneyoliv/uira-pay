export function Partners() {
    const partners = [
        "QUARTZ", "Bloomberg", "CNBC", "Forbes", "TechCrunch", "Wired", "The Verge"
    ];

    return (
        <section className="w-full bg-[#0C0C0C] border-y border-white/5 py-8 overflow-hidden">
            <p className="text-xs text-[#6B6B6B] uppercase tracking-widest text-center mb-6 font-semibold">Coberto pela imprensa</p>
            <div className="flex whitespace-nowrap overflow-hidden">
                <div className="flex animate-marquee items-center gap-16 pr-16 w-max shrink-0">
                    {[...partners, ...partners].map((partner, index) => (
                        <span key={index} className="text-2xl lg:text-3xl font-bold text-white opacity-30 hover:opacity-70 transition-opacity uppercase tracking-tight font-sans">
                            {partner}
                        </span>
                    ))}
                </div>
                {/* Duplicate for seamless infinite loop */}
                <div className="flex animate-marquee items-center gap-16 pr-16 w-max shrink-0" aria-hidden="true">
                    {[...partners, ...partners].map((partner, index) => (
                        <span key={index} className="text-2xl lg:text-3xl font-bold text-white opacity-30 hover:opacity-70 transition-opacity uppercase tracking-tight font-sans">
                            {partner}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}

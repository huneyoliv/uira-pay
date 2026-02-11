export function Partners() {
    const partners = [
        "QUARTZ", "Bloomberg", "CNBC", "Forbes", "TC"
    ];

    return (
        <section className="w-full bg-[#9ca3af] py-8">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-wrap justify-between items-center opacity-60 grayscale mix-blend-multiply gap-8">
                    {partners.map((partner) => (
                        <span key={partner} className="text-2xl lg:text-3xl font-bold text-white uppercase tracking-wider font-serif">
                            {partner}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}

import { Link } from 'react-router-dom';
import { Play } from "lucide-react";
import { MobileDashboardMockup } from "@/components/dashboard/MobileDashboardMockup";

export function CallToAction() {
    return (
        <section className="py-24 lg:py-32 bg-[#0C0C0C] relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-[#141414] border border-white/10 text-white p-12 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-16">
                    {/* Background elements */}
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>

                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                            Faça negócios com o mundo
                        </h2>
                        <p className="text-xl text-[#6B6B6B] mb-10 leading-relaxed">
                            Junte-se a milhares de usuários que já confiam no Uirá Pay para enviar, receber e gerenciar dinheiro globalmente.
                        </p>
                        
                        <div className="flex flex-wrap gap-4">
                            <Link to="#" className="inline-flex items-center gap-3 bg-[#0C0C0C] border border-white/10 rounded-xl px-6 py-3 hover:bg-white/5 transition-colors group">
                                <img src="/apple-logo.svg" alt="Apple" className="w-6 h-6 transition-transform group-hover:scale-110 filter brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] uppercase text-[#6B6B6B] tracking-wider mb-1">Download on the</span>
                                    <span className="text-base font-bold">App Store</span>
                                </div>
                            </Link>
                            <Link to="#" className="inline-flex items-center gap-3 bg-[#0C0C0C] border border-white/10 rounded-xl px-6 py-3 hover:bg-white/5 transition-colors group">
                                <img src="/google-play-logo.svg" alt="Google Play" className="w-6 h-6 transition-transform group-hover:scale-110 filter brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] uppercase text-[#6B6B6B] tracking-wider mb-1">Get it on</span>
                                    <span className="text-base font-bold">Google Play</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="relative z-10 w-full lg:w-auto flex justify-center lg:justify-end perspective-1000">
                        {/* Phone mockup slightly cropped or positioned */}
                        <div className="relative w-[260px] h-[520px] bg-[#0C0C0C] rounded-[2.5rem] border-[8px] border-[#222] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden rotate-[15deg] -translate-y-4 hover:rotate-[10deg] transition-transform duration-700 animate-float bg-white">
                            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/40 to-transparent z-20 pointer-events-none"></div>
                            <MobileDashboardMockup />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

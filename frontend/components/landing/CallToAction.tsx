import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function CallToAction() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="relative overflow-hidden rounded-3xl bg-[#1a1a1a] text-white p-12 lg:p-24 flex flex-col md:flex-row items-center justify-between gap-12">
                    {/* Background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 max-w-xl">
                        <div className="flex items-center gap-2 mb-4">
                            {/* Lightning icon placeholder */}
                            <div className="w-8 h-8 md:w-12 md:h-12 text-yellow-400">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-8">
                            Do business with the world
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            <Link href="#" className="inline-block bg-black border border-gray-700 rounded-lg px-4 py-2 hover:bg-gray-900 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="text-2xl"></div>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] uppercase">Download on the</span>
                                        <span className="text-sm font-bold">App Store</span>
                                    </div>
                                </div>
                            </Link>
                            <Link href="#" className="inline-block bg-black border border-gray-700 rounded-lg px-4 py-2 hover:bg-gray-900 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="text-xl">▶</div>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] uppercase">Get it on</span>
                                        <span className="text-sm font-bold">Google Play</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="relative z-10">
                        {/* Phone mockup slightly cropped or positioned */}
                        <div className="relative w-[240px] h-[480px] bg-white rounded-[2rem] border-4 border-gray-800 shadow-2xl overflow-hidden rotate-6 translate-y-12 md:translate-y-0">
                            <div className="w-full h-full bg-gray-100 p-4">
                                {/* Simple app UI */}
                                <div className="h-8 w-full bg-gray-200 rounded mb-4"></div>
                                <div className="h-32 w-full bg-black rounded-xl mb-4 p-4 text-white">
                                    <div className="text-xs">Balance</div>
                                    <div className="text-2xl font-bold">$25,000.40</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-12 w-full bg-white rounded-lg shadow-sm"></div>
                                    <div className="h-12 w-full bg-white rounded-lg shadow-sm"></div>
                                    <div className="h-12 w-full bg-white rounded-lg shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coins/elements decor */}
                    <div className="absolute bottom-12 left-[20%] w-12 h-12 bg-yellow-400 rounded-full blur-sm opacity-50 animate-pulse"></div>
                </div>
            </div>
        </section>
    );
}

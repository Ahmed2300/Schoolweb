/**
 * Premium Maintenance Page - Light Mode Clean Design
 * @module presentation/pages/MaintenancePage
 * 
 * A clean, minimal maintenance page featuring:
 * - Light mode with Shibl brand colors
 * - Simple, focused design without visual clutter
 * - Subtle animations
 * - Bilingual support (Arabic + English)
 */

import React from 'react';
import { Wrench, Mail, Phone } from 'lucide-react';

export function MaintenancePage() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-12">
            {/* Main Content Card */}
            <div className="w-full max-w-md text-center">

                {/* Icon */}
                <div className="flex justify-center mb-8">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #AF0C15 0%, #8B0A11 100%)',
                            boxShadow: '0 8px 32px rgba(175, 12, 21, 0.25)',
                        }}
                    >
                        <Wrench size={36} className="text-white" />
                    </div>
                </div>

                {/* Arabic Title */}
                <h1
                    className="text-3xl md:text-4xl font-bold text-[#1F1F1F] mb-2"
                    style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
                >
                    جاري الصيانة
                </h1>

                {/* English Subtitle */}
                <h2 className="text-base text-[#636E72] mb-6">
                    Under Maintenance
                </h2>

                {/* Description */}
                <p className="text-[#636E72] leading-relaxed mb-8 max-w-sm mx-auto">
                    نعمل على تحسين تجربتكم. الموقع سيعود للعمل قريباً.
                </p>

                {/* Progress Bar */}
                <div className="mb-10 max-w-xs mx-auto">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full relative overflow-hidden"
                            style={{
                                width: '60%',
                                background: 'linear-gradient(90deg, #AF0C15, #D41420)',
                            }}
                        >
                            {/* Shimmer Effect */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                                    animation: 'shimmer 1.5s ease-in-out infinite',
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-3 max-w-xs mx-auto">
                    <a
                        href="mailto:support@shibl.edu"
                        className="flex items-center justify-center gap-3 py-3 px-5 rounded-full bg-white border border-slate-200 hover:border-[#AF0C15]/30 hover:shadow-md transition-all duration-300"
                    >
                        <Mail size={18} className="text-[#AF0C15]" />
                        <span className="text-[#1F1F1F] text-sm font-medium">support@shibl.edu</span>
                    </a>

                    <a
                        href="tel:+96800000000"
                        className="flex items-center justify-center gap-3 py-3 px-5 rounded-full bg-white border border-slate-200 hover:border-[#AF0C15]/30 hover:shadow-md transition-all duration-300"
                    >
                        <Phone size={18} className="text-[#AF0C15]" />
                        <span className="text-[#1F1F1F] text-sm font-medium" dir="ltr">+968 0000 0000</span>
                    </a>
                </div>

                {/* Footer */}
                <p className="text-[#636E72] text-xs mt-12">
                    © 2026 Shibl Educational Platform
                </p>
            </div>

            {/* Shimmer Animation */}
            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
        </div>
    );
}

export default MaintenancePage;


import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';

// Country Data
export const COUNTRY_CODES = [
    { code: '+968', country: 'OM', name: 'Oman', nameAr: 'عمان', flag: '🇴🇲' },
    { code: '+966', country: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦' },
    { code: '+971', country: 'AE', name: 'UAE', nameAr: 'الإمارات', flag: '🇦🇪' },
    { code: '+965', country: 'KW', name: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼' },
    { code: '+973', country: 'BH', name: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭' },
    { code: '+974', country: 'QA', name: 'Qatar', nameAr: 'قطر', flag: '🇶🇦' },
    { code: '+962', country: 'JO', name: 'Jordan', nameAr: 'الأردن', flag: '🇯🇴' },
    { code: '+970', country: 'PS', name: 'Palestine', nameAr: 'فلسطين', flag: '🇵🇸' },
    { code: '+961', country: 'LB', name: 'Lebanon', nameAr: 'لبنان', flag: '🇱🇧' },
    { code: '+963', country: 'SY', name: 'Syria', nameAr: 'سوريا', flag: '🇸🇾' },
    { code: '+964', country: 'IQ', name: 'Iraq', nameAr: 'العراق', flag: '🇮🇶' },
    { code: '+967', country: 'YE', name: 'Yemen', nameAr: 'اليمن', flag: '🇾🇪' },
    { code: '+20', country: 'EG', name: 'Egypt', nameAr: 'مصر', flag: '🇪🇬' },
    { code: '+249', country: 'SD', name: 'Sudan', nameAr: 'السودان', flag: '🇸🇩' },
    { code: '+218', country: 'LY', name: 'Libya', nameAr: 'ليبيا', flag: '🇱🇾' },
    { code: '+216', country: 'TN', name: 'Tunisia', nameAr: 'تونس', flag: '🇹🇳' },
    { code: '+213', country: 'DZ', name: 'Algeria', nameAr: 'الجزائر', flag: '🇩🇿' },
    { code: '+212', country: 'MA', name: 'Morocco', nameAr: 'المغرب', flag: '🇲🇦' },
    { code: '+222', country: 'MR', name: 'Mauritania', nameAr: 'موريتانيا', flag: '🇲🇷' },
    { code: '+252', country: 'SO', name: 'Somalia', nameAr: 'الصومال', flag: '🇸🇴' },
    { code: '+253', country: 'DJ', name: 'Djibouti', nameAr: 'جيبوتي', flag: '🇩🇯' },
    { code: '+269', country: 'KM', name: 'Comoros', nameAr: 'جزر القمر', flag: '🇰🇲' },
];

interface CountryCodeSelectProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({ value, onChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedCountry = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];

    const filteredCountries = COUNTRY_CODES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.nameAr.includes(search) ||
        c.code.includes(search)
    );

    return (
        <div className={`relative ${className}`} ref={dropdownRef} dir="ltr">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 sm:h-12 flex items-center justify-between gap-2 px-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 outline-none focus:ring-2 focus:ring-shibl-crimson/20 min-w-[100px]"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{selectedCountry.flag}</span>
                    <span className="text-sm font-semibold text-slate-700 font-mono tracking-tight">{selectedCountry.code}</span>
                </div>
                <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-[260px] bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                    >
                        {/* Search */}
                        <div className="px-3 pb-2 border-b border-slate-50 mb-1">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search / بحث"
                                    className="w-full h-9 pl-8 pr-3 bg-slate-50 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-slate-100 transition-colors"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                    <button
                                        key={`${country.code}-${country.country}`}
                                        type="button"
                                        onClick={() => {
                                            onChange(country.code);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors group ${value === country.code ? 'bg-slate-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl leading-none">{country.flag}</span>
                                            <div className="flex flex-col items-start gap-0.5">
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                                                    {country.nameAr}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {country.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                {country.code}
                                            </span>
                                            {value === country.code && (
                                                <Check size={14} className="text-shibl-crimson" />
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-center text-sm text-slate-400">
                                    No results found
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

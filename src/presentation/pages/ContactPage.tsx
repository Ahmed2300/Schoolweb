import { useState, useEffect } from 'react';
import {
    Phone,
    Mail,
    MapPin,
    Facebook,
    Instagram,
    Youtube,
    Clock,
    Send,
    Loader2,
    Link as LinkIcon
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/common/Footer';

export function ContactPage() {
    const { data: settings = {}, isLoading: settingsLoading } = useSettings();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        // Simulate sending message
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFormLoading(false);
        setFormSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });

        setTimeout(() => setFormSuccess(false), 5000);
    };

    if (settingsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-shibl-crimson animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-right" dir="rtl">
            <Navbar />

            {/* Header / Hero */}
            <div className="bg-shibl-crimson text-white py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">اتصل بنا</h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        نحن هنا لمساعدتك. تواصل معنا لأي استفسار أو اقتراح.
                    </p>
                </div>
                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            </div>

            <main className="max-w-7xl mx-auto px-4 py-16 -mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Info Card */}
                        <div className="bg-white rounded-[20px] shadow-sm p-8 border border-slate-100">
                            <h3 className="text-xl font-bold text-charcoal mb-6 border-b border-slate-100 pb-4">معلومات التواصل</h3>

                            <div className="space-y-6">
                                {settings.contact_phone && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                            <Phone size={20} className="text-shibl-crimson" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 font-bold mb-1">رقم الهاتف</p>
                                            <p className="text-charcoal font-medium dir-ltr text-right">{settings.contact_phone}</p>
                                        </div>
                                    </div>
                                )}

                                {settings.contact_whatsapp && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                            <Phone size={20} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 font-bold mb-1">واتساب</p>
                                            <a
                                                href={`https://wa.me/${settings.contact_whatsapp.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-charcoal font-medium hover:text-green-600 transition-colors dir-ltr text-right block"
                                            >
                                                {settings.contact_whatsapp}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {settings.support_email && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <Mail size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 font-bold mb-1">البريد الإلكتروني</p>
                                            <a href={`mailto:${settings.support_email}`} className="text-charcoal font-medium hover:text-blue-600 transition-colors">
                                                {settings.support_email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {settings.contact_address && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                            <MapPin size={20} className="text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 font-bold mb-1">العنوان</p>
                                            <p className="text-charcoal font-medium leading-relaxed">
                                                {settings.contact_address}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {settings.working_hours && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                            <Clock size={20} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 font-bold mb-1">ساعات العمل</p>
                                            <p className="text-charcoal font-medium whitespace-pre-line">
                                                {settings.working_hours}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Social Media Card */}
                        <div className="bg-white rounded-[20px] shadow-sm p-8 border border-slate-100">
                            <h3 className="text-xl font-bold text-charcoal mb-6 border-b border-slate-100 pb-4">تابعنا على</h3>
                            <div className="flex gap-4">
                                {settings.social_facebook && (
                                    <a href={settings.social_facebook} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                        <Facebook size={24} />
                                    </a>
                                )}
                                {settings.social_twitter && (
                                    <a href={settings.social_twitter} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 hover:bg-black hover:text-white transition-all">
                                        {/* X Logo */}
                                        <span className="font-bold text-lg">X</span>
                                    </a>
                                )}
                                {settings.social_instagram && (
                                    <a href={settings.social_instagram} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-600 hover:text-white transition-all">
                                        <Instagram size={24} />
                                    </a>
                                )}
                                {settings.social_youtube && (
                                    <a href={settings.social_youtube} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all">
                                        <Youtube size={24} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form & Map */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Contact Form */}
                        <div className="bg-white rounded-[20px] shadow-sm p-8 border border-slate-100">
                            <h2 className="text-2xl font-bold text-charcoal mb-2">أرسل لنا رسالة</h2>
                            <p className="text-slate-500 mb-8">سنقوم بالرد عليك في أقرب وقت ممكن</p>

                            {formSuccess ? (
                                <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-[12px] text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send size={32} className="text-green-600" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">تم الإرسال بنجاح!</h3>
                                    <p>شكراً لتواصلك معنا، سنرد عليك قريباً.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">الاسم</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full h-12 px-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all"
                                                placeholder="الاسم الكامل"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full h-12 px-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all"
                                                placeholder="example@domain.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">الموضوع</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full h-12 px-4 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all"
                                            placeholder="موضوع الرسالة"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">الرسالة</label>
                                        <textarea
                                            required
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full h-40 px-4 py-3 rounded-[10px] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all resize-none"
                                            placeholder="اكتب رسالتك هنا..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="h-12 px-8 rounded-[10px] bg-shibl-crimson hover:bg-red-800 text-white font-bold transition-all flex items-center justify-center gap-2 min-w-[150px]"
                                    >
                                        {formLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                        إرسال الرسالة
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Map Embed */}
                        {settings.contact_map_url && (
                            <div className="bg-white rounded-[20px] shadow-sm p-2 border border-slate-100 h-96 overflow-hidden">
                                <iframe
                                    src={settings.contact_map_url}
                                    className="w-full h-full rounded-[16px]"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

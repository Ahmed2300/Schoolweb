import re

file_path = "src/presentation/components/admin/AddLectureModal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { X, ChevronLeft, ChevronRight, Check, Video, FileText, Calendar, Loader2, Radio, Upload, AlertCircle } from 'lucide-react';",
    "import { X, ChevronLeft, ChevronRight, Check, Video, FileText, Calendar, Loader2, Radio, Upload, AlertCircle } from 'lucide-react';\nimport { motion, AnimatePresence } from 'framer-motion';"
)

# 2. Main Wrapper and Header
old_wrapper_start = """    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-charcoal">إضافة محاضرة جديدة</h2>
                        <p className="text-sm text-slate-500">الخطوة {step} من 2</p>
                    </div>
                    <button onClick={handleClose} disabled={loading} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Steps Indicator */}
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-10" />
                        <div className={`flex flex-col items-center gap-2 bg-white px-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                                <FileText size={20} />
                            </div>
                            <span className="text-xs font-medium">بيانات المحاضرة</span>
                        </div>
                        <div className={`flex flex-col items-center gap-2 bg-white px-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                                <Video size={20} />
                            </div>
                            <span className="text-xs font-medium">الفيديو (اختياري)</span>
                        </div>
                    </div>
                </div>

                <div className="p-6">"""

new_wrapper_start = """    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    style={{ direction: 'rtl' }}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="bg-white dark:bg-[#1E1E1E] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-card hover:shadow-card-hover text-right border border-slate-200 dark:border-white/5 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 flex-none">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">إضافة محاضرة جديدة</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">الخطوة {step} من 2</p>
                            </div>
                            <button onClick={handleClose} disabled={loading} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Steps Indicator */}
                        <div className="px-6 py-4 flex-none border-b border-slate-50 dark:border-white/5">
                            <div className="flex items-center justify-between relative max-w-md mx-auto">
                                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-white/5 -z-10 rounded-full" />
                                <div className={`flex flex-col items-center gap-2 bg-white dark:bg-[#1E1E1E] px-2 ${step >= 1 ? 'text-shibl-crimson' : 'text-slate-grey dark:text-gray-500'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 1 ? 'border-shibl-crimson bg-rose-50 dark:bg-shibl-crimson/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E]'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-xs font-bold">بيانات المحاضرة</span>
                                </div>
                                <div className={`flex flex-col items-center gap-2 bg-white dark:bg-[#1E1E1E] px-2 ${step >= 2 ? 'text-shibl-crimson' : 'text-slate-grey dark:text-gray-500'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= 2 ? 'border-shibl-crimson bg-rose-50 dark:bg-shibl-crimson/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E]'}`}>
                                        <Video size={20} />
                                    </div>
                                    <span className="text-xs font-bold">الفيديو (اختياري)</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">"""

content = content.replace(old_wrapper_start, new_wrapper_start)

# 3. Transitions
old_step1_form = """                    {step === 1 ? (
                        <form id="detailsForm" onSubmit={handleSubmitDetails} className="space-y-4">"""
new_step1_form = """                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                id="detailsForm"
                                onSubmit={handleSubmitDetails}
                                className="space-y-6"
                            >"""
content = content.replace(old_step1_form, new_step1_form)

old_step2_div = """                    ) : (
                        <div className="space-y-6">"""
new_step2_div = """                        </motion.form>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6 max-w-2xl mx-auto"
                            >"""
content = content.replace(old_step2_div, new_step2_div)

# 4. Inputs
content = content.replace(
    'className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors"',
    'className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all placeholder-slate-400"'
)

content = content.replace(
    'className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors appearance-none bg-white"',
    'className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all appearance-none cursor-pointer"'
)

content = content.replace(
    'className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors appearance-none bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"',
    'className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all appearance-none disabled:bg-slate-50 dark:disabled:bg-white/5 disabled:cursor-not-allowed cursor-pointer"'
)

content = content.replace(
    'className={`w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors appearance-none bg-white ${formData.courseId && formData.teacherId ? \'bg-slate-50 text-slate-600 cursor-not-allowed\' : \'\'\n                                            }`}',
    'className={`w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all appearance-none cursor-pointer ${formData.courseId && formData.teacherId ? \'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 cursor-not-allowed pointer-events-none\' : \'bg-white dark:bg-[#121212]\'}`}'
)

content = content.replace(
    'className="w-full p-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors resize-none"',
    'className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all resize-none placeholder-slate-400"'
)

content = content.replace(
    'className="w-full h-10 pr-10 pl-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none transition-colors text-sm"',
    'className="w-full h-11 pr-10 pl-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] text-charcoal dark:text-white focus:border-shibl-crimson focus:ring-1 focus:ring-shibl-crimson/30 outline-none transition-all text-sm"'
)

# 5. Type Selection Cards
old_live_card = """                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isOnline: true }))}
                                            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-right transition-all ${formData.isOnline === true
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500/30'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${formData.isOnline === true ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                <Radio size={20} />
                                            </div>
                                            <div>
                                                <span className={`text-sm font-bold block ${formData.isOnline === true ? 'text-blue-700' : 'text-charcoal'
                                                    }`}>بث مباشر (أونلاين)</span>
                                                <span className="text-xs text-slate-500">جدولة موعد للبث المباشر مع الطلاب</span>
                                            </div>
                                        </button>"""
new_live_card = """                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isOnline: true }))}
                                            className={`flex justify-start items-center gap-3 p-4 rounded-xl border-2 text-right transition-all duration-300 ${formData.isOnline === true
                                                ? 'border-shibl-crimson bg-rose-50 dark:bg-shibl-crimson/10 ring-1 ring-shibl-crimson/30 shadow-crimson'
                                                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-soft-cloud dark:hover:bg-white/5'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${formData.isOnline === true
                                                ? 'bg-rose-100 dark:bg-shibl-crimson/20 text-shibl-crimson'
                                                : 'bg-soft-cloud dark:bg-white/10 text-slate-grey dark:text-slate-400'
                                                }`}>
                                                <Radio size={20} />
                                            </div>
                                            <div>
                                                <span className={`text-sm font-bold block transition-colors ${formData.isOnline === true
                                                    ? 'text-shibl-crimson'
                                                    : 'text-charcoal dark:text-white'
                                                    }`}>بث مباشر (أونلاين)</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">جدولة موعد للبث المباشر مع الطلاب</span>
                                            </div>
                                        </button>"""
content = content.replace(old_live_card, new_live_card)

old_recorded_card = """                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, isOnline: false }));
                                                setSelectedSlot(null);
                                                setSelectedDate(null);
                                            }}
                                            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-right transition-all ${formData.isOnline === false
                                                ? 'border-green-500 bg-green-50 ring-1 ring-green-500/30'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${formData.isOnline === false ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                <Upload size={20} />
                                            </div>
                                            <div>
                                                <span className={`text-sm font-bold block ${formData.isOnline === false ? 'text-green-700' : 'text-charcoal'
                                                    }`}>فيديو مسجل</span>
                                                <span className="text-xs text-slate-500">رفع فيديو مسجل مسبقاً للطلاب</span>
                                            </div>
                                        </button>"""
new_recorded_card = """                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, isOnline: false }));
                                                setSelectedSlot(null);
                                                setSelectedDate(null);
                                            }}
                                            className={`flex justify-start items-center gap-3 p-4 rounded-xl border-2 text-right transition-all duration-300 ${formData.isOnline === false
                                                ? 'border-success-green bg-success-green/5 ring-1 ring-success-green/30 shadow-[0_4px_14px_0_rgba(39,174,96,0.15)]'
                                                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-soft-cloud dark:hover:bg-white/5'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${formData.isOnline === false
                                                ? 'bg-success-green/10 text-success-green'
                                                : 'bg-soft-cloud dark:bg-white/10 text-slate-grey dark:text-slate-400'
                                                }`}>
                                                <Upload size={20} />
                                            </div>
                                            <div>
                                                <span className={`text-sm font-bold block transition-colors ${formData.isOnline === false
                                                    ? 'text-success-green'
                                                    : 'text-charcoal dark:text-white'
                                                    }`}>فيديو مسجل</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">رفع فيديو مسجل مسبقاً للطلاب</span>
                                            </div>
                                        </button>"""
content = content.replace(old_recorded_card, new_recorded_card)

# 6. Close the outer div and AnimatePresence at the bottom
old_footer = """                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    {step === 1 ? (
                        <>
                            <button
                                onClick={handleClose}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-white hover:border-slate-300 transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                form="detailsForm"
                                disabled={loading || formData.isOnline === null}
                                className={`px-5 py-2.5 rounded-xl text-white font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${formData.isOnline === true
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {loading && formData.isOnline === true ? (
                                    'جاري الحفظ...'
                                ) : formData.isOnline === true ? (
                                    <>
                                        حفظ المحاضرة
                                        <Check size={18} />
                                    </>
                                ) : (
                                    <>
                                        التالي
                                        <ChevronLeft size={18} />
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep(1)}
                                disabled={loading}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-white hover:border-slate-300 transition-all flex items-center gap-2"
                            >
                                <ChevronRight size={18} />
                                السابق
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                disabled={loading || !uploadedVideoPath}
                                className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!uploadedVideoPath ? 'يرجى رفع فيديو أولاً' : ''}
                            >
                                {loading ? (
                                    'جاري الحفظ...'
                                ) : (
                                    <>
                                        <Check size={18} />
                                        حفظ المحاضرة
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
"""

new_footer = """                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>

                    {/* Footer - Fixed at bottom */}
                    <div className="px-6 py-4 bg-slate-50/80 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between flex-none backdrop-blur-md">
                        {step === 1 ? (
                            <>
                                <button
                                    onClick={handleClose}
                                    type="button"
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-grey dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    form="detailsForm"
                                    disabled={loading || formData.isOnline === null}
                                    className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${formData.isOnline === true
                                        ? 'bg-gradient-to-r from-success-green to-emerald-500 text-white hover:shadow-[0_8px_24px_0_rgba(39,174,96,0.3)] shadow-[0_4px_14px_0_rgba(39,174,96,0.2)]'
                                        : 'bg-gradient-to-r from-shibl-crimson to-rose-600 text-white shadow-crimson hover:shadow-crimson-lg'
                                        }`}
                                >
                                    {loading && formData.isOnline === true ? (
                                        'جاري الحفظ...'
                                    ) : formData.isOnline === true ? (
                                        <>
                                            حفظ ونشر
                                            <Check size={18} />
                                        </>
                                    ) : (
                                        <>
                                            التالي
                                            <ChevronLeft size={18} />
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-grey dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all flex items-center gap-2"
                                >
                                    <ChevronRight size={18} />
                                    السابق
                                </button>
                                <button
                                    onClick={handleFinalSubmit}
                                    disabled={loading || !uploadedVideoPath}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-success-green to-emerald-500 text-white font-bold hover:shadow-[0_8px_24px_0_rgba(39,174,96,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(39,174,96,0.2)]"
                                    title={!uploadedVideoPath ? 'يرجى رفع فيديو أولاً' : ''}
                                >
                                    {loading ? (
                                        'جاري الحفظ...'
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            حفظ المحاضرة
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
"""
content = content.replace(old_footer, new_footer)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replacement Complete!")

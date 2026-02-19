import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
    password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
    const requirements = useMemo(() => [
        { label: '8 أحرف على الأقل', met: password.length >= 8 },
        { label: 'حرف كبير (A-Z)', met: /[A-Z]/.test(password) },
        { label: 'حرف صغير (a-z)', met: /[a-z]/.test(password) },
        { label: 'رقم (0-9)', met: /[0-9]/.test(password) },
        { label: 'رمز خاص (!@#$...)', met: /[^A-Za-z0-9]/.test(password) },
    ], [password]);

    const strength = useMemo(() => {
        return requirements.filter(r => r.met).length;
    }, [requirements]);

    const getStrengthColor = (score: number) => {
        if (score === 0) return 'bg-slate-200';
        if (score <= 2) return 'bg-red-500';
        if (score === 3) return 'bg-yellow-500';
        if (score >= 4) return 'bg-green-500';
        return 'bg-slate-200';
    };

    const getStrengthLabel = (score: number) => {
        if (score === 0) return 'ضعيفة جداً';
        if (score <= 2) return 'ضعيفة';
        if (score === 3) return 'متوسطة';
        if (score >= 4) return 'قوية';
        return '';
    };

    return (
        <div className="space-y-3 mt-2">
            {/* Bars */}
            <div className="flex gap-1 h-1.5 w-full">
                {[1, 2, 3, 4, 5].map((level) => (
                    <motion.div
                        key={level}
                        className={`h-full rounded-full flex-1 transition-colors duration-300 ${level <= strength ? getStrengthColor(strength) : 'bg-slate-100'
                            }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: level * 0.1 }}
                    />
                ))}
            </div>

            <div className="flex justify-between items-center text-xs">
                <span className={`${strength >= 4 ? 'text-green-600 font-bold' : 'text-slate-500'}`}>
                    مستوى كلمة المرور: {getStrengthLabel(strength)}
                </span>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-2">
                {requirements.map((req, index) => (
                    <div key={index} className={`flex items-center gap-1.5 text-[11px] transition-colors duration-300 ${req.met ? 'text-green-600 font-medium' : 'text-slate-400'
                        }`}>
                        {req.met ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                        <span>{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

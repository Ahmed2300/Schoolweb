import { motion } from 'framer-motion';

/**
 * FullPageSkeleton — Branded loading placeholder shown during React.lazy chunk downloads.
 * Minimal DOM, zero layout shift, instant render. Uses the Shibl crimson brand color.
 */
export const FullPageSkeleton = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-[#181818]">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
        >
            {/* Branded logo pulse */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#AF0C15] to-[#8C0A11] flex items-center justify-center shadow-lg shadow-[#AF0C15]/20">
                <img
                    src="/images/subol-white.webp"
                    alt=""
                    className="w-8 h-8"
                    width={32}
                    height={32}
                />
            </div>

            {/* Animated loading bar */}
            <div className="w-32 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-[#AF0C15] to-[#D4232E] rounded-full"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{ width: '50%' }}
                />
            </div>
        </motion.div>
    </div>
);

export default FullPageSkeleton;

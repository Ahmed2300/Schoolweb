/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'cairo': ['Cairo', 'Tajawal', 'sans-serif'],
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                light: {
                    "primary": "#2563EB", // Blue 600 - Richer Blue
                    "primary-content": "#FFFFFF",
                    "secondary": "#7C3AED", // Violet 600 - Creative Violet
                    "secondary-content": "#FFFFFF",
                    "accent": "#059669", // Emerald 600 - Success Green
                    "accent-content": "#FFFFFF",
                    "neutral": "#1E293B", // Slate 800
                    "base-100": "#F8FAFC", // Slate 50
                    "info": "#3B82F6",
                    "success": "#10B981",
                    "warning": "#F59E0B",
                    "error": "#EF4444",
                },
            },
        ],
        rtl: true,
    },
}

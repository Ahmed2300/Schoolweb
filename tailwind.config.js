/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                'cairo': ['Cairo', 'sans-serif'],
                'tajawal': ['Tajawal', 'sans-serif'],
            },
            colors: {
                // Shibl Brand Colors
                'shibl': {
                    'crimson': '#AF0C15',
                    'crimson-dark': '#8B0A11',
                    'crimson-light': '#D41420',
                },
                'charcoal': '#1F1F1F',
                'soft-cloud': '#F8F9FA',
                'slate-grey': '#636E72',
                'success-green': '#27AE60',
            },
            borderRadius: {
                '2xl': '16px',
                '3xl': '24px',
                'pill': '50px',
            },
            boxShadow: {
                'card': '0px 4px 12px rgba(0,0,0,0.08)',
                'card-hover': '0px 8px 24px rgba(0,0,0,0.12)',
                'crimson': '0 4px 14px 0 rgba(175, 12, 21, 0.39)',
                'crimson-lg': '0 8px 24px 0 rgba(175, 12, 21, 0.45)',
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                shibl: {
                    // Primary - Shibl Crimson
                    "primary": "#AF0C15",
                    "primary-content": "#FFFFFF",

                    // Secondary - Deep Charcoal
                    "secondary": "#1F1F1F",
                    "secondary-content": "#FFFFFF",

                    // Accent - Success Green (use sparingly)
                    "accent": "#27AE60",
                    "accent-content": "#FFFFFF",

                    // Neutral - Deep Charcoal
                    "neutral": "#1F1F1F",
                    "neutral-content": "#F8F9FA",

                    // Base - Soft Cloud background
                    "base-100": "#FFFFFF",
                    "base-200": "#F8F9FA",
                    "base-300": "#E9ECEF",
                    "base-content": "#1F1F1F",

                    // Semantic colors
                    "info": "#3B82F6",
                    "info-content": "#FFFFFF",
                    "success": "#27AE60",
                    "success-content": "#FFFFFF",
                    "warning": "#F59E0B",
                    "warning-content": "#1F1F1F",
                    "error": "#EF4444",
                    "error-content": "#FFFFFF",
                },
            },
        ],
        rtl: true,
    },
}


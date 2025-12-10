/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                display: ['"Playfair Display"', 'serif'],
            },
            colors: {
                'rose-accent': '#E11D48',
                'rose-50': '#FFF1F2',
                'rose-100': '#FFE4E6',
                'rose-200': '#FECDD3',
                'lavender-accent': '#8B5CF6',
                'lavender-50': '#F5F3FF',
                'lavender-100': '#EDE9FE',
                'peach-accent': '#F97316',
                'light-100': '#FDFCF8', // Warm Cream
                'light-200': '#F7F5F0',
                'light-300': '#EBE5DA',
                'dark-text': '#4A3B3B', // Soft Brown-Black
            },
            animation: {
                'shimmer': 'shimmer 2.5s linear infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'fade-up': 'fadeUp 0.8s ease-out forwards',
            },
            keyframes: {
                shimmer: {
                    '100%': { transform: 'translateX(100%)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        }
    },
    plugins: [],
}

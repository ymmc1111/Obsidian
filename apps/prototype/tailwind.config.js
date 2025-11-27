/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./index.tsx",
        "./*.tsx",
        "./components/**/*.{tsx,ts}",
        "./services/**/*.{tsx,ts}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Inter Tight', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                ios: {
                    bg: '#F5F5F7',
                    surface: '#FFFFFF',
                    text: '#1D1D1F',
                    subtext: '#86868B',
                    border: '#D2D2D7',
                    blue: '#007AFF',
                    orange: '#FF3B30',
                    green: '#34C759',
                }
            },
            borderRadius: {
                '4xl': '2rem',
            },
            boxShadow: {
                'soft': '0 10px 30px -10px rgba(0,0,0,0.05)',
                'key': '0 2px 5px rgba(0,0,0,0.05), 0 1px 1px rgba(0,0,0,0.02)',
                'key-pressed': 'inset 0 2px 4px rgba(0,0,0,0.05)',
            }
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        foreground: '#FAFAFA',
        card: {
          DEFAULT: '#0A0A0A',
          foreground: '#FAFAFA'
        },
        popover: {
          DEFAULT: '#0A0A0A',
          foreground: '#FAFAFA'
        },
        primary: {
          DEFAULT: '#D4AF37',
          foreground: '#000000'
        },
        secondary: {
          DEFAULT: '#1A1A1A',
          foreground: '#D4AF37'
        },
        muted: {
          DEFAULT: '#1A1A1A',
          foreground: '#888888'
        },
        accent: {
          DEFAULT: '#D4AF37',
          foreground: '#000000'
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#FAFAFA'
        },
        border: 'rgba(212, 175, 55, 0.2)',
        input: '#1A1A1A',
        ring: '#D4AF37',
        gold: '#D4AF37',
        'gold-dark': '#C5A028',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        heading: ['Playfair Display', 'serif'],
        body: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        lg: '0px',
        md: '0px',
        sm: '0px',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

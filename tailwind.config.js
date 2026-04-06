/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2c7be5',
        success: '#00b894',
        danger: '#e74c3c',
        warning: '#f39c12',
        background: '#e0e5ec',
      },
      fontFamily: {
        ui: ['Poppins', 'sans-serif'],
        invoice: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'neu-up': '6px 6px 12px #b8bec7, -6px -6px 12px #ffffff',
        'neu-down': 'inset 4px 4px 8px #b8bec7, inset -4px -4px 8px #ffffff',
      },
      borderRadius: {
        'neu-card': '16px',
        'neu-input': '12px',
        'neu-btn': '50px',
      }
    },
  },
  plugins: [],
}

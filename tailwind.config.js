/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#1f6feb",
          600: "#1957b8",
          700: "#123f82",
          800: "#0f2f60",
          900: "#0b2347"
        },
        teal: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e"
        }
      },
      boxShadow: {
        soft: "0 12px 36px rgba(15, 47, 96, 0.08)"
      }
    }
  },
  plugins: []
};

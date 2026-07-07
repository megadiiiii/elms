/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        scholarly: {
          primary: "#1E3A8A",
          secondary: "#00695C",
          tertiary: "#F59E0B",
          bg: "#F8FAFC",
          card: "#F1F5F9",
          success: {
            DEFAULT: "#10B981",
            light: "#D1FAE5",
            text: "#065F46",
          },
          warning: {
            DEFAULT: "#D97706",
          },
          danger: {
            DEFAULT: "#EF4444",
            light: "#FEE2E2",
            text: "#991B1B",
          },
          info: {
            DEFAULT: "#3B82F6",
            light: "#DBEAFE",
            text: "#1E40AF",
          },
        },
      },
    },
  },
  plugins: [],
};

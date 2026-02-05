/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
// tailwind.config.js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      genz: {
        bg: "#F9FAFB",        // Clean Slate Gray (Background)
        card: "#FFFFFF",      // Pure White (Cards)
        accent: "#EA580C",    // Dark/Safety Orange (The New Accent)
        softAccent: "#FFEDD5",// Very light orange for hover/subtle backgrounds
        ink: "#0F172A",       // Slate Black (Text)
        border: "#E2E8F0",    // Soft Gray (Borders)
        muted: "#64748B",     // Muted Blue-Gray (Secondary Text)
      },
    },
    borderRadius: {
      'genz': '1.25rem',      // Modern rounded corners
    }
  },
},
  plugins: [],
};

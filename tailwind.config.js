/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
theme: {
  extend: {
    colors: {
      genz: {
        bg: "#FAFAFA",        // Off-white / Eggshell
        card: "#FFFFFF",      // Pure white for elevation
        accent: "#8B5CF6",    // A trendy Electric Violet (swap for Lime or Cyan if preferred)
        softAccent: "#EDE9FE",// For subtle backgrounds
        ink: "#121212",      // Not quite pure black (softer on eyes)
        border: "#E2E8F0",    // Very light slate
        muted: "#64748B",     // Cool gray for secondary text
      },
    },
    borderRadius: {
      'genz': '1.5rem',       // Extra rounded corners are very "now"
    }
  },
},
  plugins: [],
};

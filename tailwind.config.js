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
        amazon: {
          orange: "#FF9900",
          orangeHover: "#F3A847",
          darkBlue: "#131921",
          navy: "#232F3E",
          lightGray: "#EAEDED",
          borderGray: "#DDD",
          text: "#0F1111",
          mutedText: "#565959",
          success: "#007600",
          danger: "#B12704",
        },
      },
    },
  },
  plugins: [],
};

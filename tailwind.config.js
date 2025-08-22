/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-purple": "#667eea",
        "secondary-purple": "#764ba2",
        "kaia-yellow": "#FEE500",
        "trust-green": "#155724",
        "trust-light-green": "#d4edda",
        "trust-blue": "#004085",
        "trust-light-blue": "#cce5ff",
        "trust-yellow": "#856404",
        "trust-light-yellow": "#fff3cd",
      },
    },
  },
  plugins: [],
};

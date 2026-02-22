/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        femiRed: "#c21927",
        femiBlue: "#123c8f",
        femiMustard: "#d6a01b",
        femiCream: "#fff8ea"
      }
    }
  },
  plugins: []
};
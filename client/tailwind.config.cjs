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
      },
      boxShadow: {
        warm: "0 14px 30px rgba(194, 25, 39, 0.17)"
      }
    }
  },
  plugins: []
};

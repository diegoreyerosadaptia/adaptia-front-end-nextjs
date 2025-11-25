/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontSize: {
          base: "15px",   // texto normal
          sm: "14px",     // texto secundario
          xs: "12px",     // captions
        },
      },
    },
    plugins: [],
  }
  
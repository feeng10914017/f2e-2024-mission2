/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#D4009B",
        dark: "#334155", // text primary color
        light: "#64748B", // text secondary color
        purple: "#8082FF", // role 1 color
        orange: "#F4A76F", // role 2 color
        green: "#57D2A9", // role 3 color
        gray: {
          100: "#F8F9FA", // hover color
          200: "#E9ECEF", // background color
          300: "#DEE2E6", // line color
          400: "#CED4DA",
          500: "#ADB5BD",
          600: "#6C757D",
          700: "#495057",
          800: "#343A40",
          900: "#212529",
        },
      },
      screens: {
        sm: "576px", // => @media (min-width: 576px) { ... }
        md: "768px", // => @media (min-width: 768px) { ... }
        lg: "1024px", // => @media (min-width: 1024px) { ... }
        xl: "1280px", // => @media (min-width: 1280px) { ... }
        "2xl": "1536px", // => @media (min-width: 1536px) { ... }
        "3xl": "1920px", // => @media (min-width: 1920px) { ... }
      },
    },
  },
  plugins: [],
};

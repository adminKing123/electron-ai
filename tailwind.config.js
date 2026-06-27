module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        fuseExpandIn: {
          "0%":   { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.2s ease-in-out infinite",
        fuseExpandIn: "fuseExpandIn 0.22s ease-out",
      },
    },
  },
  plugins: [],
};

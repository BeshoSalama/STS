import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./frontend/src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1320px",
      },
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#F8F4FF",
          soft: "#D8CBEA",
        },
        surface: {
          DEFAULT: "#080216",
          card: "#1A0A32",
        },
        violet: {
          50: "#1A0A32",
          100: "#241044",
          200: "#3B1D66",
          300: "#A984E3",
          400: "#B78DF0",
          500: "#C69CFF",
          600: "#DAC7F5",
          700: "#EFE5FF",
          800: "#421952",
          900: "#2E103A",
          950: "#080216",
        },
        muted: "#C7B8DB",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "violet-gradient": "linear-gradient(135deg, #A86AC8 0%, #71308F 52%, #421952 100%)",
        "violet-gradient-soft": "linear-gradient(135deg, rgba(42, 20, 84, 0.92) 0%, rgba(109, 63, 196, 0.72) 100%)",
        "violet-gradient-text": "linear-gradient(120deg, #ffffff 0%, #efe5ff 38%, #c69cff 76%, #a984e3 100%)",
      },
      boxShadow: {
        card: "0 20px 48px -24px rgba(4, 0, 15, 0.78), 0 0 0 1px rgba(169, 132, 227, 0.12)",
        "card-lg": "0 30px 74px -30px rgba(4, 0, 15, 0.86), 0 0 40px rgba(169, 132, 227, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

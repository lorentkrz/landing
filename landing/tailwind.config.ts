import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: "#03050f",
          850: "#050814",
          800: "#0c1024",
          750: "#0f1633",
          700: "#1b1f3d"
        },
        brand: {
          primary: "#7cf8ff",
          secondary: "#b4ff5c",
          accent: "#ffb366",
          plasma: "#7d8bff"
        },
        ink: "#ecf1ff",
        muted: "#9fb2e5",
        border: "rgba(255,255,255,0.08)",
        "border-strong": "rgba(255,255,255,0.14)"
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      boxShadow: {
        glow: "0 15px 60px rgba(124, 248, 255, 0.24)",
        card: "0 12px 40px rgba(0,0,0,0.35)",
        plasma: "0 25px 120px rgba(125, 139, 255, 0.35)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 25px 25px, rgba(124,248,255,0.08) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(180,255,92,0.08) 2px, transparent 0)",
        "glass-veil":
          "linear-gradient(135deg, rgba(124,248,255,0.16), rgba(180,255,92,0.14))",
        "aurora":
          "radial-gradient(120% 160% at 20% 20%, rgba(124,248,255,0.15), transparent 55%), radial-gradient(100% 120% at 80% 10%, rgba(180,255,92,0.12), transparent 50%), radial-gradient(80% 100% at 40% 80%, rgba(255,179,102,0.12), transparent 50%)",
        "scanlines": "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 12px)"
      },
      animation: {
        "slow-pulse": "pulse 4s ease-in-out infinite",
        "float": "float 10s ease-in-out infinite",
        "marquee": "marquee 26s linear infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      }
    }
  },
  plugins: []
};

export default config;

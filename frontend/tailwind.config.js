/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7F5AF0",
        secondary: "#2CB67D",
        accent: "#FF8906",
        midnight: "#0F172A",
        glass: "rgba(255,255,255,0.08)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        neon: "0 0 28px rgba(127,90,240,.45)",
        success: "0 0 28px rgba(44,182,125,.38)"
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 18px rgba(127,90,240,.30), 0 0 0 0 rgba(127,90,240,.30)" },
          "50%": { boxShadow: "0 0 44px rgba(127,90,240,.72), 0 0 0 12px rgba(127,90,240,0)" }
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 18px rgba(127,90,240,.28)" },
          "50%": { boxShadow: "0 0 42px rgba(127,90,240,.65)" }
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        fadeScale: {
          "0%": { opacity: "0", transform: "scale(.94)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        glowBorder: {
          "0%, 100%": { borderColor: "rgba(127,90,240,.32)" },
          "50%": { borderColor: "rgba(255,137,6,.62)" }
        },
        floatCard: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" }
        },
        rotateBorder: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-8px) scale(1.02)" }
        },
        neonPulse: {
          "0%, 100%": { filter: "drop-shadow(0 0 8px rgba(127,90,240,.42))" },
          "50%": { filter: "drop-shadow(0 0 22px rgba(44,182,125,.55))" }
        },
        backgroundMove: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        },
        themeGlow: {
          "0%, 100%": { boxShadow: "var(--shadow)" },
          "50%": { boxShadow: "var(--shadow), 0 0 34px rgba(127,90,240,.32)" }
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.015)", opacity: ".92" }
        },
        fadeSwitch: {
          "0%": { opacity: ".72", filter: "saturate(.82)" },
          "100%": { opacity: "1", filter: "saturate(1)" }
        },
        stockDrop: {
          "0%": { transform: "scale(1)", color: "#fff" },
          "50%": { transform: "scale(1.12)", color: "#FF8906" },
          "100%": { transform: "scale(1)", color: "#fff" }
        },
        explode: {
          "0%": { transform: "scale(.8)", opacity: ".4" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        slideIn: {
          "0%": { transform: "translateX(24px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        },
        countdown: {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" }
        }
      },
      animation: {
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        glow: "glowPulse 2.4s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        float: "floatCard 5s ease-in-out infinite",
        rotateBorder: "rotateBorder 9s linear infinite",
        slideUp: "slideUp .6s ease-out both",
        bounceSoft: "bounceSoft 3.2s ease-in-out infinite",
        neonPulse: "neonPulse 2.8s ease-in-out infinite",
        backgroundMove: "backgroundMove 12s ease infinite",
        stock: "stockDrop .45s ease-out",
        explode: "explode .75s cubic-bezier(.2,.8,.2,1)",
        slide: "slideIn .35s ease-out",
        countdown: "countdown 1s ease-in-out infinite",
        fadeScale: "fadeScale .35s ease-out both",
        glowBorder: "glowBorder 2.6s ease-in-out infinite",
        themeGlow: "themeGlow 1.8s ease-in-out",
        pulseSoft: "pulseSoft 2.8s ease-in-out infinite",
        fadeSwitch: "fadeSwitch .3s ease both"
      }
    }
  },
  plugins: []
};

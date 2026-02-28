import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        panel: "#0b1220",
        slateSoft: "#94a3b8"
      }
    }
  },
  plugins: []
};

export default config;

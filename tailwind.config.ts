import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: "#FBCFE8",
          pinkHover: "#F9A8D4",
          yellow: "#FEF08A",
          blue: "#BAE6FD",
          green: "#BBF7D0",
          purple: "#DDD6FE",
          cream: "#FAF9F5",
        },
      },
      boxShadow: {
        '3d': '0px 6px 0px 0px rgba(0, 0, 0, 0.08)',
        '3d-btn': '0px 4px 0px 0px rgba(0, 0, 0, 0.12)',
        '3d-active': '0px 1px 0px 0px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
};
export default config;

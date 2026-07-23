import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"], theme: { extend: { colors: { ink: "#17221b", cream: "#f7f4ec", lime: "#c9f31d", forest: "#17452d" }, boxShadow: { soft: "0 16px 50px rgba(23,34,27,.08)" } } }, plugins: [] } satisfies Config;

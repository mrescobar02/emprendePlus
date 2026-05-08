import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,css}"],
  theme: {
    extend: {},
  },
  plugins: [ require('preline/plugin'),
    require('@tailwindcss/typography')
  ],
};

export default config;

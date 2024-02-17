
import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import typography from '@tailwindcss/typography'

export default {
  content: ["./src/**/*.tsx", "./public/**/*.css"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [typography],
  corePlugins: {
    preflight: true,
  },
} satisfies Config;


import { withUt } from "uploadthing/tw";
import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import typography from '@tailwindcss/typography'

export default withUt({
  content: ["./src/**/*.tsx", "./public/**/*.css"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [typography],
}) satisfies Config;

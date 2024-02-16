import { env } from "~/env"

async function main() {
    console.log(env.DATABASE_URL)
}

await main()
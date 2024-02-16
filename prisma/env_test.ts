import { env } from "process"

async function main() {
    console.log(env.DATABASE_URL)
}

await main()
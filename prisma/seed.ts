import { db } from "~/server/db"


async function main() {
    const luka_id = await db.user.findFirst({
        where: {
            email: "prsinaluka@gmail.com",
        }
    })
    if (!luka_id) {
        throw new Error("No user found")
    }

    await db.post.create({
        data: {
            title: "Prisma makes databases easy",
            createdById: luka_id.id,
        }
    })
}

await main()
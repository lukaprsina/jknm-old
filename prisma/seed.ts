import { db } from "~/server/db"


async function main() {
    const luka_user = await db.user.findFirst({
        where: {
            email: "prsinaluka@gmail.com",
        }
    })
    if (!luka_user)
        throw new Error("No user found")
    
        for(let i = 0; i < 10; i++) {
            await db.article.create({
                data: {
                    title: `Article ${i}`,
                    url: `article-${i}`,
                    imageUrl: "https://source.unsplash.com/random",
                    content: `# Article ${i}

                    Some content`,
                    createdById: luka_user.id
                }
            })
        }
}

await main()
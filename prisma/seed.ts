import { db } from "~/server/db";
import fs from "fs/promises";
import path from "path";
import { FILESYSTEM_PREFIX, title_to_url } from "~/lib/fs";
import { faker } from "@faker-js/faker";
import compileMDXOnServer from "~/lib/compileMDX";
import { algoliaElevatedInstance } from "~/lib/algolia_elevated";

async function main() {
  const luka_user = await db.user.findFirst({
    where: {
      email: "prsinaluka@gmail.com",
    },
  });
  if (!luka_user) throw new Error("No user found");

  for (let i = 0; i < 10; i++) {
    const title = `${faker.commerce.productName()} ${i}`;
    const url = title_to_url(title);

    const content = `# ${title}
        
${i}
Some content`;

    const imageUrl = "https://picsum.photos/1500/1000";

    const algolia = algoliaElevatedInstance.getClient();
    const index = algolia.initIndex("novice");
    const createdAt = new Date();
    const publishedAt = new Date();
    createdAt.setDate(createdAt.getDate() - 100 + 3 * i);
    publishedAt.setDate(publishedAt.getDate() - 99 + 3 * i);

    await index.saveObject({
      objectID: i,
      title,
      url,
      content,
      imageUrl,
      createdAt,
      publishedAt,
    });

    const cached = await compileMDXOnServer(content);

    await fs.mkdir(path.join(FILESYSTEM_PREFIX, url), { recursive: true });
    await db.article.create({
      data: {
        title,
        url,
        imageUrl,
        content,
        cached,
        createdById: luka_user.id,
        published: true,
        publishedAt: new Date(),
      },
    });
  }
}

await main();

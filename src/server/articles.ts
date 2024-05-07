"use server";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { title_to_url } from "~/lib/fs";

import { action } from "~/lib/safe_action";
import { z } from "zod";
import type { Article } from "@prisma/client";
import compileMDXOnServer from "~/lib/compileMDX";
import { algoliaElevatedInstance } from "~/lib/algoliaElevated";
import { title } from "process";

/* 
Plus button -> New draft -> Save draft -> Publish
Edit button:
  - Draft -> Edit draft -> Save draft -> Publish
  - Published -> Draft select screen -> New/Edit draft -> Save draft -> Publish:
    - Publish as new article
    - Publish as update to the original article

get (public)
new
edit
delete
*/

export async function get_published_articles() {
  return await db.article.findMany({
    where: {
      published: true,
    },
    select: {
      title: true,
      id: true,
      url: true,
      createdById: true,
      imageUrl: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export const get_article_by_url = action(
  z.object({
    url: z.string(),
  }),
  async ({ url }): Promise<Article | undefined> => {
    const article = await db.article.findUnique({
      where: {
        url,
      },
    });

    if (!article) throw new Error("No article found");
    return can_user_read_article(article);
  },
);

export const get_article_id_url = action(
  z.object({
    id: z.number(),
  }),
  async ({ id }): Promise<Article | undefined> => {
    const article = await db.article.findUnique({
      where: {
        id,
      },
    });

    if (!article) throw new Error("No article found");
    return can_user_read_article(article);
  },
);

async function can_user_read_article(article: Article) {
  const session = await getServerAuthSession();
  console.log("server: reading article", article.url);

  if (!article?.published) {
    // Not published, check if user is the author
    if (session?.user.id !== article?.createdById) return undefined;
  }

  return article ?? undefined;
}

export const new_article = action(
  z.object({
    draftArticleId: z.number().optional(),
  }),
  async ({ draftArticleId }) => {
    const session = await getServerAuthSession();
    if (!session?.user) throw new Error("No user");

    let final_title;
    if (draftArticleId) {
      const original_article = await db.article.findUniqueOrThrow({
        where: {
          id: draftArticleId,
        },
        select: {
          title: true,
          drafts: {
            where: {
              createdById: session.user.id,
            },
          },
        },
      });

      final_title = `${original_article.title}-draft-${original_article.drafts.length + 1}`;
    } else {
      const now = new Date();
      final_title = `untitled-${now.getTime()}`;
    }

    let final_url = title_to_url(final_title);

    const duplicate = await db.article.findFirst({
      where: {
        url: final_url,
      },
    });

    if (duplicate) throw new Error("Duplicate URL");

    const content = `# ${final_title}`;
    const cached = await compileMDXOnServer(content);
    const article = await db.article.create({
      data: {
        title: final_title,
        url: final_title,
        cached,
        createdById: session.user.id,
        content,
        draftArticleId,
      },
    });

    // add article to drafts of draftArticleId, if draftArticleId exists
    if (draftArticleId) {
      await db.article.update({
        where: {
          id: draftArticleId,
        },
        data: {
          drafts: {
            connect: {
              id: article.id,
            },
          },
        },
      });
    }

    console.log("server: new article", { id: article.url, draftArticleId });

    const algolia = algoliaElevatedInstance.getClient();
    const index = algolia.initIndex("novice");
    index.saveObject({
      objectID: article.id,
      title: final_title,
      url: final_url,
      content: content,
    });

    return article;
  },
);

const save_article_schema = z.object({
  id: z.number(),
  title: z.string().optional(),
  url: z.string().optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
  image_url: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  published_at: z.date().optional(),
});

export type SaveArticleType = z.infer<typeof save_article_schema>;

export const save_article = action(save_article_schema, async (article) => {
  const session = await getServerAuthSession();
  if (!session?.user) throw new Error("No user");
  console.log("server: saving article", article.url);

  const old_article = await db.article.findUniqueOrThrow({
    where: {
      id: article.id,
    },
  });

  const final_content = article.content ?? old_article.content;
  const final_title = title ?? old_article.title;
  let final_url = article.url ?? title_to_url(final_title);

  const duplicate = await db.article.count({
    where: {
      url: final_url,
      id: { not: article.id },
    },
  });

  if (duplicate !== 0) throw new Error("Duplicate URL");

  const final_image_url =
    article.image_url ?? old_article.imageUrl ?? undefined;

  const updated_article = await db.article.update({
    where: {
      id: article.id,
    },
    data: {
      title: final_title,
      url: final_url,
      content: final_content,
      published: article.published ?? old_article.published,
      imageUrl: final_image_url,
      createdAt: article.created_at ?? old_article.createdAt,
      updatedAt: article.updated_at ?? new Date(),
      publishedAt:
        article.published_at ??
        (article.published ? new Date() : old_article.publishedAt),
    },
  });

  const algolia = algoliaElevatedInstance.getClient();
  const index = algolia.initIndex("novice");
  index.saveObject({
    objectID: article.id,
    title: final_title,
    url: final_url,
    content: final_content,
    imageUrl: final_image_url,
  });

  return updated_article;
});

export const get_drafts_by_id = action(
  z.object({
    id: z.number(),
  }),
  async ({ id }) => {
    const session = await getServerAuthSession();
    if (!session?.user) throw new Error("No user");

    const original_article = await db.article.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        drafts: {
          where: {
            createdById: session.user.id,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    return original_article.drafts;
  },
);

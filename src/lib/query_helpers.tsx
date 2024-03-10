import { read_article } from "~/server/data_layer/articles"
import { ServerError } from "./server_error"

export async function read_article_safe(article_url: string | undefined) {
    if (typeof article_url !== "string") return null

    const article = await read_article({ url: article_url })
    // console.log("read_article_safe", { article_url, article })
    if (!article.data || article.serverError || article.validationErrors)
        throw new ServerError("Zod error", { ...article })

    return article.data
}

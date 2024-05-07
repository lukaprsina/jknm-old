import { get_article_by_url } from "~/server/articles";
import { ServerError } from "./server_error";

export async function read_article_safe(novica_name: string | undefined) {
  if (typeof novica_name !== "string") return null;

  const article = await get_article_by_url({ url: novica_name });
  // console.log("read_article_safe", { novica_name, article })
  if (!article.data || article.serverError || article.validationErrors)
    throw new ServerError("Zod error", { ...article });

  return article.data;
}

import { ArticleView } from "./ArticleView";
import { getArticles } from "../data_layer/articles";

export default async function Testing() {
    const articles = await getArticles()

    return (
        <div>
            <h1>Server page content</h1>
            <ArticleView articles={articles} />
        </div>
    )
}
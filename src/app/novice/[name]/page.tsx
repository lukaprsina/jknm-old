type ArticleType = {
    params: { name: string }
}

export default function Article({ params }: ArticleType) {
    return <div>My Post: {params.name}</div>
}
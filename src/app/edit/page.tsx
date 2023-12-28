import dynamic from "next/dynamic";

const TinyMCE = dynamic(
    () => import("./TinyMCE"),
    {
        loading: () => <p>Loading...</p>,
        ssr: false,
    }
)

export default async function Tiny() {
    return (
        <TinyMCE />
    )
}
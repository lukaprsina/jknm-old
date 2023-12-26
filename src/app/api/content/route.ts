import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    /* const formData = await request.formData()
    const keys = formData.keys();
    console.log("save")
    console.log("keys")
    for (const key of keys) {
        console.log(key)
    } */
    return NextResponse.json({ message: "Hello from /api/content", request })
}

export async function GET(request: NextRequest) {
    /* const formData = await request.formData()
    const keys = formData.keys();
    console.log("save")
    console.log("keys")
    for (const key of keys) {
        console.log(key)
    } */
    return NextResponse.json({ message: "Hello from /api/content", request })
}
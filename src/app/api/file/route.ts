import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
    const res = await request.text()
    console.log(res)
    return new Response(res)
}
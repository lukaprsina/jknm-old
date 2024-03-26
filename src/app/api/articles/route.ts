import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  const articles = await db.article.findMany();

  return NextResponse.json({ articles });
}

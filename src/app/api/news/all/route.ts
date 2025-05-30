import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/newses?sort[0]=date:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    const res = await fetch(apiUrl, { next: { revalidate: 60 } });
    const data = await res.json();

    return NextResponse.json(data);
}
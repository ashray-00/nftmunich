import { NextResponse } from "next/server";

export async function GET() {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/newses?sort[0]=date:desc&pagination[limit]=5`;
    const res = await fetch(apiUrl, { next: { revalidate: 60 } }); // Cache for 60s at the edge
    const data = await res.json();

    return NextResponse.json(data.data || []);
}
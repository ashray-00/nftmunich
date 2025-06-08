import { NextResponse } from "next/server";

export async function GET() {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/home-images?populate=images`;
    const res = await fetch(apiUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour at the edge
    const data = await res.json();

    // Optionally, you can filter/map the data here if needed

    return NextResponse.json(data, {
        headers: {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
    });
}
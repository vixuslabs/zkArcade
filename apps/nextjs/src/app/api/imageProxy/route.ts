import type { NextApiRequest } from "next";

export async function GET(req: NextApiRequest) {
  if (!req.url) {
    return Response.json({ error: "No url given", status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return Response.json({ error: "Invalid image source" });
  }

  if (!imageUrl.startsWith("https://img.clerk.com")) {
    return Response.json({ error: "URL must be from Clerk", status: 500 });
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return Response.json({ error: "Image not found", status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      status: 200,
      headers: [
        ["Content-Type", response.headers.get("content-type") ?? "image/jpeg"],
      ],
    });
  } catch (error) {
    return Response.json({ error: "Error fetching image", status: 500 });
  }
}

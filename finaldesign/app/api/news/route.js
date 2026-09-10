import { NextResponse } from "next/server";

const NEWS_API_URL = "https://newsapi.org/v2/everything";
const DEFAULT_QUERY = "cryptocurrency OR blockchain OR bitcoin OR web3";

// NewsAPI results are cached briefly to stay within free-tier rate limits.
export const revalidate = 300;

export async function GET(request) {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, message: "News API key is not configured." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || DEFAULT_QUERY;
  const pageSize = Math.min(Number(searchParams.get("pageSize")) || 12, 50);
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const url = new URL(NEWS_API_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("page", String(page));

  try {
    const response = await fetch(url, {
      headers: { "X-Api-Key": apiKey },
      next: { revalidate },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to fetch news." },
        { status: response.status }
      );
    }

    const articles = (data.articles || [])
      .filter((article) => article.title && article.title !== "[Removed]")
      .map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage,
        source: article.source?.name || "Unknown",
        publishedAt: article.publishedAt,
      }));

    return NextResponse.json({
      success: true,
      totalResults: data.totalResults || 0,
      articles,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Unable to reach news service." },
      { status: 502 }
    );
  }
}

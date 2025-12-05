import { NextRequest, NextResponse } from "next/server";

interface FirecrawlResponse {
  success: boolean;
  data: {
    markdown: string;
    html: string;
    metadata: {
      title: string;
      description: string;
      ogImage: string;
    };
  };
}

interface PropertyData {
  price: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  photos: string[];
}

async function scrapeWithFirecrawl(url: string): Promise<FirecrawlResponse> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY environment variable is not set");
  }

  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: ["markdown", "html"],
      onlyMainContent: true,
      includeTags: ["img", "picture"],
    }),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl API error: ${response.statusText}`);
  }

  return response.json();
}

function extractPropertyData(
  markdown: string,
  html: string,
  url: string
): PropertyData {
  const data: PropertyData = {
    price: "",
    address: "",
    beds: 0,
    baths: 0,
    sqft: 0,
    description: "",
    photos: [],
  };

  // Extract price - common patterns across platforms
  const priceMatch = markdown.match(
    /\$[\d,]+(?:\.\d{2})?|\$[\d,]+[KkMm]?(?:\/[a-z]+)?/i
  );
  if (priceMatch) {
    data.price = priceMatch[0];
  }

  // Extract address - usually near the top or in specific patterns
  const addressMatch = markdown.match(
    /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct|Boulevard|Blvd|Circle|Cir)[,.]?\s+[A-Za-z\s]+,?\s+[A-Z]{2}\s+\d{5})/i
  );
  if (addressMatch) {
    data.address = addressMatch[0];
  }

  // Extract beds/baths using regex patterns
  const bedsMatch = markdown.match(/(\d+)\s*(?:bed|br|bedroom)/i);
  if (bedsMatch) {
    data.beds = parseInt(bedsMatch[1], 10);
  }

  const bathsMatch = markdown.match(/(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)/i);
  if (bathsMatch) {
    data.baths = parseFloat(bathsMatch[1]);
  }

  // Extract sqft
  const sqftMatch = markdown.match(
    /(\d+(?:,\d{3})*)\s*(?:sq\.?f(?:t)?|square feet)/i
  );
  if (sqftMatch) {
    data.sqft = parseInt(sqftMatch[1].replace(/,/g, ""), 10);
  }

  // Extract description - get first substantial paragraph
  const paragraphMatch = markdown.match(/[A-Z][^.!?]*[.!?]\s+/);
  if (paragraphMatch) {
    data.description = paragraphMatch[0].trim().substring(0, 500);
  }

  // Extract image URLs from HTML
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
  let imgMatch;
  const imageSet = new Set<string>();

  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const imgUrl = imgMatch[1];
    // Filter out tracking pixels and small images
    if (
      imgUrl &&
      !imgUrl.includes("pixel") &&
      !imgUrl.includes("1x1") &&
      !imgUrl.includes("spacer")
    ) {
      imageSet.add(imgUrl);
    }
  }

  // Also extract from picture tags
  const pictureRegex = /<picture[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>/g;
  while ((imgMatch = pictureRegex.exec(html)) !== null) {
    const imgUrl = imgMatch[1];
    if (imgUrl && !imgUrl.includes("pixel") && !imgUrl.includes("1x1")) {
      imageSet.add(imgUrl);
    }
  }

  // Convert relative URLs to absolute
  data.photos = Array.from(imageSet)
    .slice(0, 30) // Get up to 30 images
    .map((photoUrl) => {
      try {
        if (!photoUrl.startsWith("http")) {
          const baseUrl = new URL(url);
          const absoluteUrl = new URL(photoUrl, baseUrl.origin);
          return absoluteUrl.toString();
        }
        return photoUrl;
      } catch {
        return photoUrl;
      }
    });

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Invalid request: url is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Scrape the page with Firecrawl
    const firecrawlData = await scrapeWithFirecrawl(url);

    if (!firecrawlData.success) {
      return NextResponse.json(
        { error: "Failed to scrape the provided URL" },
        { status: 400 }
      );
    }

    // Extract property data from the scraped content
    const propertyData = extractPropertyData(
      firecrawlData.data.markdown,
      firecrawlData.data.html,
      url
    );

    return NextResponse.json(propertyData);
  } catch (error) {
    console.error("Scrape API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while scraping the URL",
      },
      { status: 500 }
    );
  }
}

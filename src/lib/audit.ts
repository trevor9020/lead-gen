import type { AuditResult, VideoCheck } from "./types";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function checkYouTube(businessName: string): Promise<VideoCheck> {
  if (!YOUTUBE_API_KEY) {
    return {
      label: "YouTube Channel",
      found: false,
      detail: "API key not configured — skipped",
    };
  }

  try {
    const query = encodeURIComponent(businessName);
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    const found = data.items?.length > 0;
    return {
      label: "YouTube Channel",
      found,
      detail: found
        ? `Found: ${data.items[0].snippet.title}`
        : "No YouTube channel found",
    };
  } catch {
    return {
      label: "YouTube Channel",
      found: false,
      detail: "YouTube check failed",
    };
  }
}

async function checkYouTubeVideos(businessName: string): Promise<VideoCheck> {
  if (!YOUTUBE_API_KEY) {
    return {
      label: "YouTube Videos",
      found: false,
      detail: "API key not configured — skipped",
    };
  }

  try {
    const query = encodeURIComponent(businessName);
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    const count = data.items?.length ?? 0;
    return {
      label: "YouTube Videos",
      found: count >= 3,
      detail:
        count > 0
          ? `Found ${count} video${count > 1 ? "s" : ""}`
          : "No videos found",
    };
  } catch {
    return {
      label: "YouTube Videos",
      found: false,
      detail: "YouTube video check failed",
    };
  }
}

async function checkWebsiteVideo(businessName: string, city: string): Promise<VideoCheck> {
  if (!GOOGLE_PLACES_API_KEY) {
    return {
      label: "Website Video",
      found: false,
      detail: "Places API key not configured — skipped",
    };
  }

  try {
    const query = encodeURIComponent(`${businessName} ${city}`);
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_PLACES_API_KEY}`
    );
    const searchData = await searchRes.json();
    const placeId = searchData.results?.[0]?.place_id;

    if (!placeId) {
      return {
        label: "Website Video",
        found: false,
        detail: "Business not found in Google Places",
      };
    }

    const detailRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=website&key=${GOOGLE_PLACES_API_KEY}`
    );
    const detailData = await detailRes.json();
    const website = detailData.result?.website;

    if (!website) {
      return {
        label: "Website Video",
        found: false,
        detail: "No website listed",
      };
    }

    const pageRes = await fetch(website, {
      headers: { "User-Agent": "Mozilla/5.0 VideoGapDetector/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await pageRes.text();

    const hasVideo =
      /<video[\s>]/i.test(html) ||
      /youtube\.com\/embed/i.test(html) ||
      /player\.vimeo\.com/i.test(html) ||
      /wistia\.com/i.test(html);

    return {
      label: "Website Video",
      found: hasVideo,
      detail: hasVideo
        ? "Embedded video found on homepage"
        : `No video on ${new URL(website).hostname}`,
    };
  } catch {
    return {
      label: "Website Video",
      found: false,
      detail: "Could not check website",
    };
  }
}

async function checkSocialVideo(businessName: string): Promise<VideoCheck> {
  const query = encodeURIComponent(`${businessName} reels OR tiktok`);
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoDuration=short&maxResults=3&key=${YOUTUBE_API_KEY}`
    );
    if (!res.ok) {
      return {
        label: "Social Short-Form Video",
        found: false,
        detail: "Check skipped — API unavailable",
      };
    }
    const data = await res.json();
    const found = (data.items?.length ?? 0) > 0;
    return {
      label: "Social Short-Form Video",
      found,
      detail: found
        ? `Found ${data.items.length} short-form video${data.items.length > 1 ? "s" : ""}`
        : "No short-form video presence detected",
    };
  } catch {
    return {
      label: "Social Short-Form Video",
      found: false,
      detail: "Social video check failed",
    };
  }
}

export async function runAudit(
  businessName: string,
  city: string
): Promise<AuditResult> {
  const checks = await Promise.all([
    checkYouTube(businessName),
    checkYouTubeVideos(businessName),
    checkWebsiteVideo(businessName, city),
    checkSocialVideo(businessName),
  ]);

  const score = checks.filter((c) => c.found).length;
  const maxScore = checks.length;

  let summary: string;
  if (score === 0) {
    summary = `${businessName} has zero video presence. This is a high-value outreach target.`;
  } else if (score <= 1) {
    summary = `${businessName} has minimal video presence. Strong lead potential.`;
  } else if (score <= 2) {
    summary = `${businessName} has some video but gaps remain. Worth a targeted pitch.`;
  } else {
    summary = `${businessName} has decent video coverage. Lower priority lead.`;
  }

  return {
    businessName,
    city,
    score,
    maxScore,
    checks,
    summary,
    timestamp: new Date().toISOString(),
  };
}

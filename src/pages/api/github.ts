import type { APIRoute } from "astro";

const GITHUB_USERNAME = "Lennichijou";
const CONTRIBUTIONS_URL = "https://github-contributions-api.jogruber.de/v4";
const TIMEOUT_MS = 6000;
const CACHE_TTL_MS = 30 * 60 * 1000;

type Contribution = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type Body = {
  username: string;
  contributions: Contribution[];
  total: number;
};

const json = (body: unknown, status = 200, cacheControl = "public, max-age=1800") =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cacheControl,
    },
  });

let cache: { body: Body; expiresAt: number } | null = null;

export const GET: APIRoute = async () => {
  const now = Date.now();

  if (cache && cache.expiresAt > now) {
    return json(cache.body);
  }

  try {
    const response = await fetch(`${CONTRIBUTIONS_URL}/${GITHUB_USERNAME}?y=last`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = (await response.json()) as { contributions?: Contribution[] };
    if (!Array.isArray(data.contributions)) throw new Error("Unexpected response shape");

    const body: Body = {
      username: GITHUB_USERNAME,
      contributions: data.contributions,
      total: data.contributions.reduce((sum, day) => sum + day.count, 0),
    };

    cache = { body, expiresAt: now + CACHE_TTL_MS };
    return json(body);
  } catch {
    if (cache) return json(cache.body, 200, "public, max-age=60");
    return json({ error: "GitHub contributions are unavailable" }, 502, "no-store");
  }
};

import type { APIRoute } from "astro";

const WTTR_URL = "https://wttr.in/Moscow?format=j1";
const TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 10 * 60 * 1000;

type WttrEntry = { value?: string };

type WttrResponse = {
  current_condition?: {
    temp_C?: string;
    FeelsLikeC?: string;
    humidity?: string;
    windspeedKmph?: string;
    winddir16Point?: string;
    weatherCode?: string;
    weatherDesc?: WttrEntry[];
    lang_ru?: WttrEntry[];
  }[];
  nearest_area?: { areaName?: WttrEntry[] }[];
  weather?: {
    mintempC?: string;
    maxtempC?: string;
  }[];
};

type Body = {
  city: string;
  description: string;
  temp: number | null;
  feelsLike: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDir: string | null;
  code: number | null;
  min: number | null;
  max: number | null;
};

const json = (body: unknown, status = 200, cacheControl = "public, max-age=600") =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cacheControl,
    },
  });

const firstValue = (entries: WttrEntry[] | undefined) => entries?.[0]?.value?.trim() ?? null;

const toNumber = (value: string | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

let cache: { body: Body; expiresAt: number } | null = null;

export const GET: APIRoute = async () => {
  const now = Date.now();

  if (cache && cache.expiresAt > now) {
    return json(cache.body);
  }

  try {
    const response = await fetch(WTTR_URL, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { Accept: "application/json", "Accept-Language": "ru" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = (await response.json()) as WttrResponse;
    const condition = data.current_condition?.[0];
    if (!condition) throw new Error("Unexpected response shape");

    const today = data.weather?.[0];

    const body: Body = {
      city: firstValue(data.nearest_area?.[0]?.areaName) ?? "Москва",
      description: firstValue(condition.lang_ru) ?? firstValue(condition.weatherDesc) ?? "—",
      temp: toNumber(condition.temp_C),
      feelsLike: toNumber(condition.FeelsLikeC),
      humidity: toNumber(condition.humidity),
      windSpeed: toNumber(condition.windspeedKmph),
      windDir: condition.winddir16Point ?? null,
      code: toNumber(condition.weatherCode),
      min: today ? toNumber(today.mintempC) : null,
      max: today ? toNumber(today.maxtempC) : null,
    };

    cache = { body, expiresAt: now + CACHE_TTL_MS };
    return json(body);
  } catch {
    if (cache) return json(cache.body, 200, "public, max-age=60");
    return json({ error: "wttr.in weather is unavailable" }, 502, "no-store");
  }
};

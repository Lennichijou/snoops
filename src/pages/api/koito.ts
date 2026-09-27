import type { APIRoute } from "astro";

const KOITO_URL = "https://koito.lenny.wtf";
const NOW_PLAYING_URL = `${KOITO_URL}/apis/web/v1/now-playing`;
const LAST_LISTENED_URL = `${KOITO_URL}/apis/web/v1/listens?limit=1&period=all_time&page=0`;
const TIMEOUT_MS = 2500;

type KoitoTrack = {
  title: string;
  artists: { name: string }[] | null;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const fetchKoito = async (url: string, signal: AbortSignal): Promise<unknown> => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

const toTrack = (track: KoitoTrack) => ({
  title: track.title,
  artists: track.artists?.map((artist) => artist.name) ?? [],
});

export const GET: APIRoute = async () => {
  const signal = AbortSignal.timeout(TIMEOUT_MS);

  try {
    const nowPlaying = (await fetchKoito(NOW_PLAYING_URL, signal)) as {
      currently_playing: boolean;
      track: KoitoTrack | null;
    };

    if (nowPlaying.currently_playing && nowPlaying.track?.title) {
      return json({ state: "playing", track: toTrack(nowPlaying.track) });
    }

    const listens = (await fetchKoito(LAST_LISTENED_URL, signal)) as {
      items?: { track: KoitoTrack }[];
    };
    const lastPlayed = listens.items?.[0]?.track;

    if (lastPlayed?.title) {
      return json({ state: "last", track: toTrack(lastPlayed) });
    }

    return json({ state: "idle", track: null });
  } catch {
    return json({ state: "error" }, 502);
  }
};

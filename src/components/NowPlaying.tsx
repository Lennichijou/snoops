import { useCallback, useEffect, useState } from 'react';

const KOITO_URL = 'https://koito.lenny.wtf';
const API_URL = '/api/koito';
const POLL_INTERVAL_MS = 30_000;

type Track = { title: string; artists: string[] };

type Kind = 'loading' | 'playing' | 'last' | 'idle' | 'error';

type State =
  | { kind: 'loading' | 'idle' | 'error' }
  | { kind: 'playing' | 'last'; track: Track };

const formatTrack = ({ title, artists }: Track) =>
  artists.length > 0 ? `${artists.join(', ')} - ${title}` : title;

const NowPlaying = () => {
  const [state, setState] = useState<State>({ kind: 'loading' });

  const load = useCallback(async (signal: AbortSignal) => {
    try {
      const response = await fetch(API_URL, { signal });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const body = (await response.json()) as { state: Kind; track: Track | null };

      if ((body.state === 'playing' || body.state === 'last') && body.track) {
        setState({ kind: body.state, track: body.track });
        return;
      }

      setState({ kind: body.state === 'error' ? 'error' : body.state });
    } catch {
      if (!signal.aborted) setState({ kind: 'error' });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);

    const interval = setInterval(() => {
      if (!controller.signal.aborted) load(controller.signal);
    }, POLL_INTERVAL_MS);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [load]);

  const { kind } = state;
  const track = 'track' in state ? state.track : null;

  let label = 'Сейчас слушаю:';
  let text = 'Подождите...';

  if (kind === 'error') {
    label = 'Ошибка соединения:';
    text = 'не удалось связаться с Koito';
  } else if (kind === 'idle') {
    text = 'Ничего';
  } else if (track) {
    label = kind === 'last' ? 'Последнее, что у меня играло:' : 'Сейчас слушаю:';
    text = formatTrack(track);
  }

  return (
    <div className="border-2 rounded-4xl p-4 transition-transform">
      <p><b>{label}</b> {text}</p>
      <p>Powered by <a href={KOITO_URL} target="_blank" rel="noreferrer">Koito</a>.</p>
    </div>
  );
};

export default NowPlaying;

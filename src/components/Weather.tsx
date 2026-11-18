import { useCallback, useEffect, useState } from 'react';

const WTTR_URL = 'https://wttr.in/Moscow';
const API_URL = '/api/weather';
const POLL_INTERVAL_MS = 10 * 60_000;

type Weather = {
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

type State = { kind: 'loading' | 'error' } | { kind: 'ready'; weather: Weather };

const WIND_DIRS: Record<string, string> = {
  N: 'С', NNE: 'ССВ', NE: 'СВ', ENE: 'ВСВ',
  E: 'В', ESE: 'ВЮВ', SE: 'ЮВ', SSE: 'ЮЮВ',
  S: 'Ю', SSW: 'ЮЮЗ', SW: 'ЮЗ', WSW: 'ЗЮЗ',
  W: 'З', WNW: 'ЗСЗ', NW: 'СЗ', NNW: 'ССЗ',
};

// WWO weather codes wttr.in reports; anything unknown falls back to the cloud.
const ICONS: Record<number, string> = {
  113: '☀️', 116: '🌤️', 119: '☁️', 122: '☁️',
  143: '🌫️', 248: '🌫️', 260: '🌫️',
  176: '🌦️', 263: '🌦️', 266: '🌧️', 281: '🌧️', 284: '🌧️',
  293: '🌦️', 296: '🌧️', 299: '🌧️', 302: '🌧️', 308: '🌧️',
  311: '🌧️', 314: '🌧️', 317: '🌨️', 320: '🌨️',
  323: '🌨️', 326: '🌨️', 329: '🌨️', 332: '🌨️', 335: '❄️', 338: '❄️',
  350: '🌨️', 353: '🌦️', 356: '🌧️', 359: '🌧️', 362: '🌧️', 365: '🌧️',
  368: '🌨️', 371: '❄️', 374: '🌨️', 377: '🌨️',
  200: '⛈️', 386: '⛈️', 389: '⛈️', 392: '⛈️', 395: '⛈️',
};

const formatTemp = (temp: number | null) => (temp === null ? '?' : `${temp}°`);

const MoscowWeather = () => {
  const [state, setState] = useState<State>({ kind: 'loading' });

  const load = useCallback(async (signal: AbortSignal) => {
    try {
      const response = await fetch(API_URL, { signal });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setState({ kind: 'ready', weather: (await response.json()) as Weather });
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
  const weather = kind === 'ready' ? state.weather : null;

  const details = weather
    ? [
        weather.windSpeed !== null
          ? `ветер ${weather.windDir ? `${WIND_DIRS[weather.windDir] ?? weather.windDir} ` : ''}${weather.windSpeed} км/ч`
          : null,
        weather.humidity !== null ? `влажность ${weather.humidity}%` : null,
        weather.min !== null && weather.max !== null
          ? `${formatTemp(weather.min)}…${formatTemp(weather.max)} сегодня`
          : null,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
      <div className="rounded-4xl p-3 sm:p-4 border-2 min-w-0 transition-transform">
        <p>
          <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" className='weather-icon'>
	<path d="M0 0h24v24H0z" fill="none" />
	<path fill="currentColor" d="M13.002 7.009c3.168 0 4.966 2.097 5.227 4.63h.08a3.687 3.687 0 0 1 3.692 3.683a3.687 3.687 0 0 1-3.692 3.682H7.694a3.687 3.687 0 0 1-3.692-3.682a3.687 3.687 0 0 1 3.692-3.683h.08c.263-2.55 2.06-4.63 5.228-4.63M10 4c1.617 0 3.05.815 3.9 2.062a8 8 0 0 0-.898-.053c-2.994 0-5.171 1.677-5.937 4.213l-.068.24l-.058.238l-.206.039a4.68 4.68 0 0 0-3.449 3.045a3.282 3.282 0 0 1 1.812-5.881l.257-.006A4.72 4.72 0 0 1 10 4" />
</svg> <b>Погода в Москве:</b>
        </p>

        {kind === 'loading' && <p className="">подождите...</p>}
        {kind === 'error' && <p className="">не удалось получить данные с wttr.in</p>}
        {weather && (
          <>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-4xl font-bold tabular-nums">
                {ICONS[weather?.code ?? -1] ?? '☁️'} {formatTemp(weather.temp)}
              </span>
              <span className="opacity-60">{weather.description.toLowerCase()}</span>
            </p>
            {details && <p className="opacity-60">{details}</p>}
          </>
        )}

        <p className="">
          <small className="opacity-60">
            Powered by <a href={WTTR_URL} target="_blank" rel="noreferrer">wttr.in</a>.{' '}
          </small>
        </p>
      </div>
  );
};

export default MoscowWeather;

import { Fragment, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { MoscowWeatherSkeleton } from './Skeletons';

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
// Boxicons 2.1.4 has no filled cloud-drizzle/cloud-snow, those use the regular weight.
const ICONS: Record<number, string> = {
  113: 'bxs-sun',
  116: 'bxs-cloud', 119: 'bxs-cloud', 122: 'bxs-cloud',
  143: 'bxs-cloud', 248: 'bxs-cloud', 260: 'bxs-cloud',
  176: 'bx-cloud-drizzle', 263: 'bx-cloud-drizzle', 266: 'bx-cloud-drizzle',
  281: 'bx-cloud-drizzle', 284: 'bx-cloud-drizzle', 311: 'bx-cloud-drizzle',
  293: 'bxs-cloud-rain', 296: 'bxs-cloud-rain', 299: 'bxs-cloud-rain', 302: 'bxs-cloud-rain',
  308: 'bxs-cloud-rain', 314: 'bxs-cloud-rain', 317: 'bxs-cloud-rain', 320: 'bxs-cloud-rain',
  353: 'bxs-cloud-rain', 356: 'bxs-cloud-rain', 359: 'bxs-cloud-rain', 362: 'bxs-cloud-rain',
  365: 'bxs-cloud-rain', 368: 'bxs-cloud-rain',
  323: 'bx-cloud-snow', 326: 'bx-cloud-snow', 329: 'bx-cloud-snow', 332: 'bx-cloud-snow',
  335: 'bx-cloud-snow', 338: 'bx-cloud-snow', 350: 'bx-cloud-snow', 371: 'bx-cloud-snow',
  374: 'bx-cloud-snow', 377: 'bx-cloud-snow',
  200: 'bxs-cloud-lightning', 386: 'bxs-cloud-lightning', 389: 'bxs-cloud-lightning',
  392: 'bxs-cloud-lightning', 395: 'bxs-cloud-lightning',
};

const iconClass = (code: number | null) => `bx ${ICONS[code ?? -1] ?? 'bxs-cloud'} align-middle`;

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

  const details: ReactNode[] = weather
    ? [
        weather.windSpeed !== null ? (
          <>
            <i className="bx bx-wind" role="img" aria-label="ветер" />{' '}
            {weather.windDir ? `${WIND_DIRS[weather.windDir] ?? weather.windDir}` : ''}{', '}
            {weather.windSpeed} км/ч
          </>
        ) : null,
        weather.humidity !== null ? (
          <>
            <i className="bx bxs-droplet" role="img" aria-label="влажность" /> {weather.humidity}%
          </>
        ) : null,
        weather.min !== null && weather.max !== null ? (
          <>{`${formatTemp(weather.min)}…${formatTemp(weather.max)} сегодня`}</>
        ) : null,
      ].filter(Boolean)
    : [];

  if (kind === 'loading') return <MoscowWeatherSkeleton />;

  return (
      <div className="rounded-4xl p-4 border-2 min-w-0 transition-transform">
        <p>
          <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24" className="weather-icon">
	<path d="M0 0h24v24H0z" fill="none" />
	<path fill="currentColor" d="M12 2C6.49 2 2 6.49 2 12c0 .55.45 1 1 1h8v6c0 1.65 1.35 3 3 3s3-1.35 3-3v-1h-2v1c0 .55-.45 1-1 1s-1-.45-1-1v-6h8c.55 0 1-.45 1-1c0-5.51-4.49-10-10-10" />
</svg> <b>Москва: </b>
          {kind === 'error' && <span className="">не удалось получить данные с wttr.in</span>}
          {weather && (
            <span className="">
              <i className={iconClass(weather?.code ?? null)} aria-hidden="true" /> {formatTemp(weather.temp)}, {weather.description.toLowerCase()}
            </span>
          )}
        </p>
        {weather && (
          <p className="">
            <small>
              {details.map((detail, index) => (
                <Fragment key={index}>
                  {index > 0 && ', '}
                  {detail}
                </Fragment>
              ))}
            </small>
          </p>
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

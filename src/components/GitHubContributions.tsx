import { useCallback, useEffect, useState } from 'react';
import { GitHubSkeleton } from './Skeletons';

const API_URL = '/api/github';
const API_SOURCE_URL = 'https://github.com/grubersjoe/github-contributions-api';

type Contribution = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

type State =
  | { kind: 'loading' | 'error' }
  | { kind: 'ready'; username: string; contributions: Contribution[]; total: number };

type Week = { label: string; days: (Contribution | null)[] };

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const LEVEL_CLASSES = ['bg-zinc-700/40', 'bg-zinc-700', 'bg-zinc-600', 'bg-zinc-400', 'bg-zinc-200'];

const parseDate = (date: string) => new Date(`${date}T00:00:00`);

const plural = (count: number, one: string, few: string, many: string) => {
  const tens = count % 100;
  const units = count % 10;

  if (tens > 10 && tens < 20) return many;
  if (units === 1) return one;
  if (units > 1 && units < 5) return few;
  return many;
};

const formatCount = (count: number) => `${count} ${plural(count, 'вклад', 'вклада', 'вкладов')}`;

const formatDate = (date: string) =>
  parseDate(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric', year: 'numeric' });

const toWeeks = (contributions: Contribution[]): Week[] => {
  const days = [...contributions].sort((left, right) => left.date.localeCompare(right.date));
  const cells: (Contribution | null)[] = [];

  // Blank cells before the first day keep every column on the right weekday.
  if (days.length > 0) {
    for (let index = parseDate(days[0].date).getDay(); index > 0; index -= 1) cells.push(null);
  }
  cells.push(...days);

  const weeks: Week[] = [];
  let labelledMonth = -1;

  for (let index = 0; index < cells.length; index += 7) {
    const slice = cells.slice(index, index + 7);
    while (slice.length < 7) slice.push(null);

    const firstDay = slice.find((day): day is Contribution => day !== null);
    const date = firstDay ? parseDate(firstDay.date) : null;
    const month = date ? date.getMonth() : labelledMonth;

    weeks.push({
      label: date && month !== labelledMonth ? MONTHS[month] : '',
      days: slice,
    });
    labelledMonth = month;
  }

  return weeks;
};

const GitHubContributions = () => {
  const [state, setState] = useState<State>({ kind: 'loading' });

  const load = useCallback(async (signal: AbortSignal) => {
    try {
      const response = await fetch(API_URL, { signal });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const body = (await response.json()) as {
        username?: string;
        contributions?: Contribution[];
        total?: number;
      };

      if (!Array.isArray(body.contributions)) throw new Error('Unexpected response shape');

      setState({
        kind: 'ready',
        username: body.username ?? '',
        contributions: body.contributions,
        total: body.total ?? 0,
      });
    } catch {
      if (!signal.aborted) setState({ kind: 'error' });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);

    return () => controller.abort();
  }, [load]);

  // Same markup as the Suspense fallback of this island: the box does not change height.
  if (state.kind === 'loading') return <GitHubSkeleton />;

  const { kind } = state;
  const contributions = kind === 'ready' ? state.contributions : [];
  const weeks = toWeeks(contributions);

  let summary = '';

  if (kind === 'error') {
    summary = 'Не удалось получить данные с GitHub';
  } else if (kind === 'ready') {
    const first = contributions[0]?.date;
    const last = contributions[contributions.length - 1]?.date;

    summary =
      first && last
        ? `${formatDate(first)} - ${formatDate(last)}: ${formatCount(state.total)}`
        : '';
  }

  return (
    <div className="rounded-4xl p-4 border-2 min-w-0">
      <p>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24" className='github-logo'>
	        <path d="M0 0h24v24H0z" fill="none" />
	        <path fill="currentColor" d="M10.07 20.503a1 1 0 0 0-1.18-.983c-1.31.24-2.963.276-3.402-.958a5.7 5.7 0 0 0-1.837-2.415a1 1 0 0 1-.167-.11a1 1 0 0 0-.93-.645h-.005a1 1 0 0 0-1 .995c-.004.815.81 1.338 1.141 1.514a4.4 4.4 0 0 1 .924 1.36c.365 1.023 1.423 2.576 4.466 2.376l.003.098l.004.268a1 1 0 0 0 2 0l-.005-.318c-.005-.19-.012-.464-.012-1.182M20.737 5.377q.049-.187.09-.42a6.3 6.3 0 0 0-.408-3.293a1 1 0 0 0-.615-.58c-.356-.12-1.67-.357-4.184 1.25a13.9 13.9 0 0 0-6.354 0C6.762.75 5.455.966 5.102 1.079a1 1 0 0 0-.631.584a6.3 6.3 0 0 0-.404 3.357q.037.191.079.354a6.27 6.27 0 0 0-1.256 3.83a8 8 0 0 0 .043.921c.334 4.603 3.334 5.984 5.424 6.459a5 5 0 0 0-.118.4a1 1 0 0 0 1.942.479a1.7 1.7 0 0 1 .468-.878a1 1 0 0 0-.546-1.745c-3.454-.395-4.954-1.802-5.18-4.899a7 7 0 0 1-.033-.738a4.26 4.26 0 0 1 .92-2.713a3 3 0 0 1 .195-.231a1 1 0 0 0 .188-1.025a3.4 3.4 0 0 1-.155-.555a4.1 4.1 0 0 1 .079-1.616a7.5 7.5 0 0 1 2.415 1.18a1 1 0 0 0 .827.133a11.8 11.8 0 0 1 6.173.001a1 1 0 0 0 .83-.138a7.6 7.6 0 0 1 2.406-1.19a4 4 0 0 1 .087 1.578a3.2 3.2 0 0 1-.169.607a1 1 0 0 0 .188 1.025c.078.087.155.18.224.268A4.12 4.12 0 0 1 20 9.203a7 7 0 0 1-.038.777c-.22 3.056-1.725 4.464-5.195 4.86a1 1 0 0 0-.546 1.746a1.63 1.63 0 0 1 .466.908a3 3 0 0 1 .093.82v2.333c-.01.648-.01 1.133-.01 1.356a1 1 0 1 0 2 0c0-.217 0-.692.01-1.34v-2.35a5 5 0 0 0-.155-1.311a4 4 0 0 0-.116-.416a6.51 6.51 0 0 0 5.445-6.424A9 9 0 0 0 22 9.203a6.13 6.13 0 0 0-1.263-3.826" />
        </svg> <b>Активность на GitHub</b>
      </p>

      <p className="mt-1 text-[11px] leading-snug opacity-60 sm:text-xs min-h-[1.6em]">{summary}</p>

      {kind === 'ready' && (
        <div className="mt-2 min-w-0">
          <div className="flex gap-px mt-1 sm:mt-0 sm:gap-0.75">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-0.75">
                {week.days.map((day, dayIndex) =>
                  day ? (
                    <div
                      key={day.date}
                      className={`aspect-square rounded-xs ${LEVEL_CLASSES[day.level] ?? LEVEL_CLASSES[0]}`}
                      title={`${formatDate(day.date)} - ${formatCount(day.count)}`}
                    />
                  ) : (
                    <div key={`empty-${dayIndex}`} className="aspect-square" />
                  ),
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 mt-2 text-[10px]">
            <span className="opacity-60">меньше</span>
            {LEVEL_CLASSES.map((levelClass) => (
              <span key={levelClass} className={`inline-block w-2.5 h-2.5  rounded-xs ${levelClass}`} />
            ))}
            <span className="opacity-60">больше</span>
          </div>
        </div>
      )}

      <p className="mt-2">
        <small className="opacity-60">
          Powered by <a href={API_SOURCE_URL} target="_blank" rel="noreferrer">
            <i className="si-fit si-github"></i> grubersjoe/github-contributions-api
          </a>
          .{' '}
        </small>
      </p>
    </div>
  );
};

export default GitHubContributions;

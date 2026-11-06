import { useCallback, useEffect, useState } from 'react';

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

  const { kind } = state;
  const contributions = kind === 'ready' ? state.contributions : [];
  const weeks = toWeeks(contributions);

  let label = 'Активность на GitHub';
  let summary = 'Подождите...';

  if (kind === 'error') {
    summary = 'Не удалось получить данные с GitHub';
  } else if (kind === 'ready') {
    const first = contributions[0]?.date;
    const last = contributions[contributions.length - 1]?.date;

    summary =
      first && last
        ? `${formatDate(first)} — ${formatDate(last)}: ${formatCount(state.total)}`
        : '';
  }

  return (
    <div className="rounded-4xl p-3 sm:p-4 border-2 min-w-0">
      <p>
        <b>{label}</b>
      </p>

      <p className="mt-1 text-[11px] leading-snug opacity-60 sm:text-xs">{summary}</p>

      {kind === 'ready' && (
        <div className="mt-2 min-w-0">
          {/* Month names only fit once columns are wide enough; phones get the date range above. */}
          <div className="hidden sm:flex gap-0.75 text-[10px] leading-none opacity-60">
            {weeks.map((week) => (
              <div key={`label-${week.days[0]?.date ?? week.label}`} className="min-w-0 flex-1 mb-1">
                <span className="block w-0 overflow-visible whitespace-nowrap">{week.label}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-px mt-1 sm:mt-0 sm:gap-0.75">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-0.75">
                {week.days.map((day, dayIndex) =>
                  day ? (
                    <div
                      key={day.date}
                      className={`aspect-square rounded-4xl ${LEVEL_CLASSES[day.level] ?? LEVEL_CLASSES[0]}`}
                      title={`${formatDate(day.date)} — ${formatCount(day.count)}`}
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
              <span key={levelClass} className={`inline-block w-2.5 h-2.5 rounded-4xl ${levelClass}`} />
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

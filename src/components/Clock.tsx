import { useEffect, useState } from 'react';

const TIME_ZONE = 'Europe/Moscow';

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const MoscowClock = () => {
  const [now, setNow] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const instant = new Date();
      setNow(timeFormatter.format(instant));
      setDate(dateFormatter.format(instant));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-4xl p-3 sm:p-4 border-2 min-w-0">
      <p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.5em"
          height="1.5em"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className='weather-icon'
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        {' '}
        <b>Время</b>
      </p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-4xl font-bold tabular-nums">
          {now || 'Подождите...'}
        </span>
      </p>
        <p className="opacity-60">{date.replace(/^./, (char) => char.toLowerCase())}</p>
        <small className="opacity-60">{TIME_ZONE}</small>
    </div>
  );
};

export default MoscowClock;

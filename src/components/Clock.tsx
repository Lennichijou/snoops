import { useEffect, useState } from 'react';
import { MoscowClockSkeleton } from './Skeletons';

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

  if (now === '') return <MoscowClockSkeleton />;

  return (
    <div className="rounded-4xl p-4 border-2 min-w-0">
      <p>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24" className='weather-icon'>
	<path d="M0 0h24v24H0z" fill="none" />
	<path fill="currentColor" d="M12 2C6.58 2 2 6.58 2 12s4.58 10 10 10s10-4.58 10-10S17.42 2 12 2m0 18c-4.34 0-8-3.66-8-8s3.66-8 8-8s8 3.66 8 8s-3.66 8-8 8" />
	<path fill="currentColor" d="M13 7h-2v6h6v-2h-4z" />
</svg> <b>{now}</b>
      </p>
        <p className="">{date.replace(/^./, (char) => char.toLowerCase())}</p>
        <small className="opacity-60">{TIME_ZONE}</small>
    </div>
  );
};

export default MoscowClock;

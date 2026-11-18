import { lazy, Suspense } from 'react';
import { MoscowWeatherSkeleton } from '../Skeletons';

const MoscowWeather = lazy(() => import('../Weather'));

export default function MoscowWeatherIsland() {
  return (
    <Suspense fallback={<MoscowWeatherSkeleton />}>
      <MoscowWeather />
    </Suspense>
  );
}

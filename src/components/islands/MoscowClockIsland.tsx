import { lazy, Suspense } from 'react';
import { MoscowClockSkeleton } from '../Skeletons';

const MoscowClock = lazy(() => import('../Clock'));

export default function MoscowClockIsland() {
  return (
    <Suspense fallback={<MoscowClockSkeleton />}>
      <MoscowClock />
    </Suspense>
  );
}

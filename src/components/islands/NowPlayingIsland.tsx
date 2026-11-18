import { lazy, Suspense } from 'react';
import { NowPlayingSkeleton } from '../Skeletons';

const NowPlaying = lazy(() => import('../NowPlaying'));

export default function NowPlayingIsland() {
  return (
    <Suspense fallback={<NowPlayingSkeleton />}>
      <NowPlaying />
    </Suspense>
  );
}

import { lazy, Suspense } from 'react';
import { GitHubSkeleton } from '../Skeletons';

const GitHubContributions = lazy(() => import('../GitHubContributions'));

export default function GitHubContributionsIsland() {
  return (
    <Suspense fallback={<GitHubSkeleton />}>
      <GitHubContributions />
    </Suspense>
  );
}

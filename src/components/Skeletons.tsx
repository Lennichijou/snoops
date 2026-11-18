import type { ReactNode } from 'react';

const KOITO_URL = "https://koito.lenny.wtf";

type BarProps = {
  className?: string;
};

export const SkeletonBar = ({ className = 'w-24' }: BarProps) => (
  <span
    aria-hidden="true"
    className={`inline-block rounded-xs bg-current opacity-20 motion-safe:animate-pulse ${className}`}
  />
);

type FrameProps = {
  /** Same root classes the real widget uses. */
  className: string;
  children: ReactNode;
};

const Frame = ({ className, children }: FrameProps) => (
  <div className={className} role="status" aria-busy="true">
    {children}
  </div>
);

const TitleLine = ({ className = 'w-44' }: BarProps) => (
  <p>
    <SkeletonBar className={`h-[1.5em] align-middle ${className}`} />
  </p>
);

const FootLine = ({ className = 'mt-2', width = 'w-3/4' }: { className?: string; width?: string }) => (
  <p className={className}>
    <SkeletonBar className={`h-[0.9em] ${width}`} />
  </p>
);

const WEEKS = 53;
const DAYS_PER_WEEK = 7;

export const GitHubSkeleton = () => (
  <Frame className="rounded-4xl p-4 border-2 min-w-0">
    <TitleLine className="w-48" />
    <p className="mt-1 text-[11px] leading-snug opacity-60 sm:text-xs min-h-[1.6em]">
      <SkeletonBar className="h-[0.9em] w-2/3" />
    </p>
    <div className="mt-2 min-w-0">
      <div className="flex gap-px mt-1 sm:mt-0 sm:gap-0.75">
        {Array.from({ length: WEEKS }, (_, week) => (
          <div key={week} className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-0.75">
            {Array.from({ length: DAYS_PER_WEEK }, (_, day) => (
              <SkeletonBar key={day} className="w-full aspect-square rounded-xs" />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 text-[10px]">
        <SkeletonBar className="h-[1.5em] w-12" />
        <SkeletonBar className="h-2.5 w-2.5 rounded-xs" />
        <SkeletonBar className="h-2.5 w-2.5 rounded-xs" />
        <SkeletonBar className="h-2.5 w-2.5 rounded-xs" />
        <SkeletonBar className="h-2.5 w-2.5 rounded-xs" />
        <SkeletonBar className="h-[1.5em] w-12" />
      </div>
    </div>
    <FootLine />
  </Frame>
);

export const NowPlayingSkeleton = () => (
  <a href={KOITO_URL} target="_blank" rel="noreferrer" className="no-underline">
    <Frame className="rounded-4xl p-4 transition-transform koito">
      <TitleLine className="w-40" />
      <p>
        <SkeletonBar className="h-[1em] w-1/2" />
      </p>
      <FootLine className="" width="w-28" />
    </Frame>
  </a>
);

export const MoscowClockSkeleton = () => (
  <Frame className="rounded-4xl p-4 sm:p-4 border-2 min-w-0">
    <TitleLine className="w-24" />
    <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="text-4xl font-bold tabular-nums">
        <SkeletonBar className="h-[0.7em] w-36" />
      </span>
    </p>
    <p className="opacity-60">
      <SkeletonBar className="h-[1em] w-32" />
    </p>
    <small className="opacity-60">
      <SkeletonBar className="h-[0.9em] w-28" />
    </small>
  </Frame>
);

export const MoscowWeatherSkeleton = () => (
  <Frame className="rounded-4xl p-4 border-2 min-w-0 transition-transform motion-safe:animate-widget-in">
    <TitleLine className="w-40" />
    <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="text-4xl font-bold tabular-nums">
        <SkeletonBar className="h-[0.7em] w-24" />
      </span>
      <span className="opacity-60">
        <SkeletonBar className="h-[1em] w-20" />
      </span>
    </p>
    <p className="opacity-60 min-h-[3em]">
      <SkeletonBar className="h-[1em] w-3/4" />
    </p>
    <FootLine className="" width="w-32" />
  </Frame>
);

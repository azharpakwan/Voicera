import React, { useMemo } from 'react';

interface AudioWaveformProps {
  isPlaying: boolean;
  progress?: number; // 0 to 1
  height?: number;
  barCount?: number;
  accentColor?: string;
  onClickSeek?: (ratio: number) => void;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isPlaying,
  progress = 0,
  height = 40,
  barCount = 48,
  onClickSeek,
}) => {
  // Deterministic heights for a natural acoustic waveform curve
  const barHeights = useMemo(() => {
    const bars: number[] = [];
    for (let i = 0; i < barCount; i++) {
      // Combination of sines for natural audio wave shape
      const norm = i / barCount;
      const wave =
        0.35 +
        0.3 * Math.sin(norm * Math.PI * 3.5) +
        0.2 * Math.cos(norm * Math.PI * 7) +
        0.15 * Math.sin(norm * 14);
      const clamped = Math.max(0.18, Math.min(0.95, Math.abs(wave)));
      bars.push(clamped);
    }
    return bars;
  }, [barCount]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onClickSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onClickSeek(ratio);
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`relative flex items-center gap-[2px] sm:gap-[3px] w-full select-none ${
        onClickSeek ? 'cursor-pointer group' : ''
      }`}
      style={{ height: `${height}px` }}
      title={onClickSeek ? 'Click anywhere to scrub audio' : undefined}
    >
      {barHeights.map((val, idx) => {
        const barRatio = idx / barCount;
        const isPassed = barRatio <= progress;
        // Animation delay variation for when playing
        const animDelay = (idx % 6) * 0.12;

        return (
          <div
            key={idx}
            className="flex-1 flex items-center justify-center h-full"
          >
            <div
              className={`w-full rounded-full transition-all duration-150 ${
                isPassed
                  ? 'bg-indigo-600 dark:bg-indigo-400 group-hover:bg-indigo-500'
                  : 'bg-slate-300 dark:bg-slate-700/80 group-hover:bg-slate-400 dark:group-hover:bg-slate-600'
              } ${isPlaying ? 'animate-pulse' : ''}`}
              style={{
                height: `${Math.round(val * 100)}%`,
                animationDuration: isPlaying ? `${0.6 + (idx % 4) * 0.2}s` : undefined,
                animationDelay: isPlaying ? `${animDelay}s` : undefined,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

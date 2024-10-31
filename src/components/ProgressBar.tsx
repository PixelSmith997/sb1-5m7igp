import React from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  formatTime: (time: number) => string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  formatTime,
}) => (
  <div className="space-y-2">
    <div className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden">
      <div
        className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100"
        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
      />
    </div>
    <div className="flex justify-between text-xs text-white/70">
      <span>{formatTime(currentTime)}</span>
      <span>{formatTime(duration)}</span>
    </div>
  </div>
);
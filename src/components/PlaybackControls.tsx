import React from 'react';
import { Play, Pause } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  disabled: boolean;
  onPlay: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  disabled,
  onPlay,
}) => (
  <button
    onClick={onPlay}
    disabled={disabled}
    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isPlaying ? (
      <Pause className="w-6 h-6 text-white" />
    ) : (
      <Play className="w-6 h-6 text-white ml-1" />
    )}
  </button>
);
import React from 'react';
import { useAudioVisualizer } from '../hooks/useAudioVisualizer';
import { WaveformCanvas } from './WaveformCanvas';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { Download, Upload, CheckCircle2 } from 'lucide-react';

const AudioVisualizer = () => {
  const {
    isPlaying,
    duration,
    currentTime,
    audioFile,
    audioUrl,
    showSuccess,
    canvasRef,
    audioRef,
    handlePlay,
    handleFileChange,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleExportVideo,
    formatTime,
  } = useAudioVisualizer();

  return (
    <div className="w-full max-w-xl p-4 rounded-3xl bg-[#6B2FEB] shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <PlaybackControls
          isPlaying={isPlaying}
          disabled={!audioFile}
          onPlay={handlePlay}
        />
        
        <div className="flex-1">
          <WaveformCanvas ref={canvasRef} />
        </div>

        <div className="flex gap-2">
          <label className="relative w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {showSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 animate-in fade-in duration-300" />
            ) : (
              <Upload className="w-5 h-5 text-white" />
            )}
          </label>

          <button
            onClick={handleExportVideo}
            disabled={!audioFile}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        formatTime={formatTime}
      />

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => handlePlay()}
      />
    </div>
  );
};

export default AudioVisualizer;
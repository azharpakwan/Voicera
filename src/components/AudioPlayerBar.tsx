import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  X,
  Sparkles,
  FastForward,
  Rewind,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AudioWaveform } from './AudioWaveform';

export const AudioPlayerBar: React.FC = () => {
  const {
    activeAudio,
    isPlaying,
    toggleAudioPlay,
    audioCurrentTime,
    audioDuration,
    setAudioCurrentTime,
    audioVolume,
    setAudioVolume,
    playbackSpeed,
    setPlaybackSpeed,
    downloadAudioFile,
    pauseAudio,
  } = useApp();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  if (!activeAudio) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = audioDuration > 0 ? audioCurrentTime / audioDuration : 0;

  const handleSeek = (ratio: number) => {
    if (audioDuration > 0) {
      setAudioCurrentTime(ratio * audioDuration);
    }
  };

  const handleSkip = (seconds: number) => {
    const nextTime = Math.max(0, Math.min(audioDuration, audioCurrentTime + seconds));
    setAudioCurrentTime(nextTime);
  };

  const handleRestart = () => {
    setAudioCurrentTime(0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setAudioVolume(prevVolume || 1);
      setIsMuted(false);
    } else {
      setPrevVolume(audioVolume);
      setAudioVolume(0);
      setIsMuted(true);
    }
  };

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300">
      {/* Top micro progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 relative cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        handleSeek((e.clientX - rect.left) / rect.width);
      }}>
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                Voice: {activeAudio.voice}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
                {activeAudio.language}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {activeAudio.text}
            </p>
          </div>
        </div>

        {/* Center player controls & waveform */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleRestart}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
              title="Restart"
              aria-label="Restart audio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleSkip(-5)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
              title="Rewind 5s"
              aria-label="Rewind 5 seconds"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={toggleAudioPlay}
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => handleSkip(5)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
              title="Forward 5s"
              aria-label="Fast forward 5 seconds"
            >
              <FastForward className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                {playbackSpeed}x
              </button>
              {speedMenuOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-1.5 flex flex-col gap-1 z-50">
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setPlaybackSpeed(s);
                        setSpeedMenuOpen(false);
                      }}
                      className={`text-xs px-2.5 py-1 rounded text-left ${
                        playbackSpeed === s
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Time & Waveform */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-9 text-right">
              {formatTime(audioCurrentTime)}
            </span>
            <div className="flex-1">
              <AudioWaveform
                isPlaying={isPlaying}
                progress={progress}
                height={24}
                barCount={36}
                onClickSeek={handleSeek}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-9 text-left">
              {formatTime(audioDuration || activeAudio.duration)}
            </span>
          </div>
        </div>

        {/* Right side actions: Volume, Download, Dismiss */}
        <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || audioVolume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : audioVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setAudioVolume(val);
                if (val > 0 && isMuted) setIsMuted(false);
              }}
              className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              aria-label="Volume slider"
            />
          </div>

          <button
            onClick={() => downloadAudioFile(activeAudio)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 font-medium text-xs transition border border-indigo-200 dark:border-indigo-800"
            title="Download WAV audio"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={() => pauseAudio()}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            title="Close player"
            aria-label="Close audio player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

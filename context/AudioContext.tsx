import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { AudioContextType, AudioState } from '../types';

const defaultState: AudioState = {
  audioFile: null,
  audioUrl: null,
  wavesurfer: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  currentlyPlayingWordIndex: null,
};

export const AudioContext = createContext<AudioContextType>({
  ...defaultState,
  setAudioFile: () => {},
  setWavesurfer: () => {},
  play: () => {},
  pause: () => {},
  seekTo: () => {},
  playSegment: () => {},
  setCurrentlyPlayingWordIndex: () => {},
});

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioFile, _setAudioFile] = useState<File | null>(defaultState.audioFile);
  const [audioUrl, setAudioUrl] = useState<string | null>(defaultState.audioUrl);
  const [wavesurfer, setWavesurfer] = useState<any | null>(defaultState.wavesurfer);
  const [isPlaying, setIsPlaying] = useState<boolean>(defaultState.isPlaying);
  const [currentTime, setCurrentTime] = useState<number>(defaultState.currentTime);
  const [duration, setDuration] = useState<number>(defaultState.duration);
  const [currentlyPlayingWordIndex, setCurrentlyPlayingWordIndex] = useState<number | null>(defaultState.currentlyPlayingWordIndex);
  
  const segmentTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!wavesurfer) return;

    const subscriptions = [
      wavesurfer.on('play', () => setIsPlaying(true)),
      wavesurfer.on('pause', () => setIsPlaying(false)),
      wavesurfer.on('audioprocess', (time: number) => setCurrentTime(time)),
      wavesurfer.on('ready', (d: number) => setDuration(d)),
      wavesurfer.on('seek', (time: number) => setCurrentTime(time)),
    ];

    return () => {
      subscriptions.forEach(unsub => unsub());
    };
  }, [wavesurfer]);

  const setAudioFile = (file: File | null) => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    _setAudioFile(file);
    if (file) {
      setAudioUrl(URL.createObjectURL(file));
    }
  };
  
  const play = useCallback(() => wavesurfer?.play(), [wavesurfer]);
  const pause = useCallback(() => wavesurfer?.pause(), [wavesurfer]);
  const seekTo = useCallback((time: number) => wavesurfer?.seekTo(time / duration), [wavesurfer, duration]);

  const playSegment = useCallback((start: number, end: number) => {
    if (wavesurfer) {
      if (segmentTimeoutRef.current) {
        clearTimeout(segmentTimeoutRef.current);
      }
      seekTo(start);
      wavesurfer.play();
      
      const segmentDuration = (end - start) * 1000;
      segmentTimeoutRef.current = window.setTimeout(() => {
        if (wavesurfer.isPlaying()) {
            wavesurfer.pause();
        }
      }, segmentDuration);
    }
  }, [wavesurfer, seekTo]);

  const contextValue = {
    audioFile, setAudioFile,
    audioUrl,
    wavesurfer, setWavesurfer,
    isPlaying,
    currentTime,
    duration,
    currentlyPlayingWordIndex, setCurrentlyPlayingWordIndex,
    play,
    pause,
    seekTo,
    playSegment,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

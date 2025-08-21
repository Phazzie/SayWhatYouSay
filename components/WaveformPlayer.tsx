import React, { useEffect, useRef, useContext } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { AudioContext } from '../context/AudioContext';

const formWaveSurferOptions = (ref: HTMLElement) => ({
  container: ref,
  waveColor: '#6b7280', // gray-500
  progressColor: '#6366f1', // indigo-500
  cursorColor: '#f9fafb', // gray-50
  barWidth: 3,
  barRadius: 3,
  responsive: true,
  height: 100,
  normalize: true,
});

export const WaveformPlayer: React.FC = () => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const { audioUrl, setWavesurfer, wavesurfer, isPlaying, play, pause } = useContext(AudioContext);

  useEffect(() => {
    if (!waveformRef.current) return;

    const options = formWaveSurferOptions(waveformRef.current);
    const ws = WaveSurfer.create(options);
    setWavesurfer(ws);

    return () => {
      ws.destroy();
    };
  }, []); // Eslint-disable-line react-hooks/exhaustive-deps - Only run once on mount

  useEffect(() => {
    if (wavesurfer && audioUrl) {
      wavesurfer.load(audioUrl);
    }
  }, [wavesurfer, audioUrl]);
  
  if (!audioUrl) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4">
      <div id="waveform" ref={waveformRef} className="w-full" />
      <div className="flex justify-center items-center mt-4">
        <button
          onClick={isPlaying ? pause : play}
          className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

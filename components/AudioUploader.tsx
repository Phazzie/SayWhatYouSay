import React, { useCallback, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './icons/UploadIcon';
import { SERVICES } from '../constants';
import { AppContext } from '../context/AppContext';
import { AudioContext } from '../context/AudioContext';
import { useTranscription } from '../hooks/useTranscription';

export const AudioUploader: React.FC = () => {
  const { apiKeys, isTranscribing } = useContext(AppContext);
  const { audioFile, setAudioFile } = useContext(AudioContext);
  const { transcribe } = useTranscription();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setAudioFile(acceptedFiles[0]);
    }
  }, [setAudioFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.ogg'] },
    maxFiles: 1,
    multiple: false
  });

  const activeServicesCount = SERVICES.filter(s => apiKeys[s.id].trim() !== '').length;
  const canTranscribe = !!audioFile && !isTranscribing && activeServicesCount >= 2;

  const handleTranscribeClick = () => {
    if (canTranscribe && audioFile) {
      transcribe(audioFile);
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 space-y-4">
      <div 
        {...getRootProps()} 
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-indigo-500 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500'}`}
      >
        <input {...getInputProps()} />
        <UploadIcon className="h-12 w-12 text-gray-500 mb-3"/>
        {isDragActive ? (
          <p className="text-gray-300">Drop the file here ...</p>
        ) : (
          <p className="text-gray-400 text-center">Drag &apos;n&apos; drop an audio file here, or click to select</p>
        )}
        <p className="text-xs text-gray-500 mt-1">Supported: MP3, WAV, M4A, FLAC, OGG</p>
      </div>

      {audioFile && (
        <div className="text-center bg-gray-700/50 p-3 rounded-md">
          <p className="font-medium text-green-400">File Selected: <span className="font-normal text-gray-300">{audioFile.name}</span></p>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button
          onClick={handleTranscribeClick}
          disabled={!canTranscribe}
          className="w-full md:w-auto px-12 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-md shadow-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isTranscribing ? 'Processing...' : 'Transcribe & Compare'}
        </button>
      </div>
      {!canTranscribe && !isTranscribing && (
          <p className="text-center text-sm text-yellow-400 pt-2">
            Please upload an audio file and provide at least two API keys to begin.
          </p>
      )}
    </div>
  );
};
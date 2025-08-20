
import React, { useState, useCallback, useRef } from 'react';
import { ApiKeySet, Transcript, ServiceId } from './types';
import { SERVICES } from './constants';
import { Header } from './components/Header';
import { ApiKeyManager } from './components/ApiKeyManager';
import { AudioUploader } from './components/AudioUploader';
import { TranscriptionView } from './components/TranscriptionView';
import { runTranscription } from './services/transcriptionService';

const App: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeySet>({
    [ServiceId.Whisper]: '',
    [ServiceId.Google]: '',
    [ServiceId.AssemblyAI]: '',
    [ServiceId.ElevenLabs]: '',
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[] | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleTranscribe = useCallback(async () => {
    if (!audioFile) {
      setError('Please upload an audio file.');
      return;
    }
    
    const activeServices = SERVICES.filter(s => apiKeys[s.id].trim() !== '');
    if (activeServices.length < 2) {
        setError('Please provide API keys for at least two services to compare transcripts.');
        return;
    }

    setIsTranscribing(true);
    setError(null);
    setTranscripts(null);

    try {
      const results = await runTranscription(audioFile, activeServices.map(s => s.id));
      setTranscripts(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during transcription.');
    } finally {
      setIsTranscribing(false);
    }
  }, [audioFile, apiKeys]);

  const handleFileSelect = (file: File | null) => {
    setAudioFile(file);
    setTranscripts(null);
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
    }
    if (file) {
        const newUrl = URL.createObjectURL(file);
        setAudioUrl(newUrl);
    } else {
        setAudioUrl(null);
    }
  };
  
  const playAudioSegment = useCallback((start: number, end: number) => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.currentTime = start;
      audio.play();
      
      const duration = (end - start) * 1000;
      setTimeout(() => {
        if (audio.currentTime >= end) {
          audio.pause();
        }
      }, duration);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-200">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="space-y-8">
          <ApiKeyManager apiKeys={apiKeys} setApiKeys={setApiKeys} />

          <AudioUploader 
            audioFile={audioFile}
            onFileSelect={handleFileSelect}
            onTranscribe={handleTranscribe}
            isTranscribing={isTranscribing}
            apiKeys={apiKeys}
          />
          
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {isTranscribing && (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-lg text-gray-300">Transcribing audio... this may take a moment.</p>
              <p className="text-sm text-gray-400">Comparing results from multiple AI models.</p>
            </div>
          )}
          
          {transcripts && (
            <TranscriptionView 
              transcripts={transcripts}
              onWordClick={playAudioSegment}
            />
          )}

        </div>
      </main>
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
    </div>
  );
};

export default App;

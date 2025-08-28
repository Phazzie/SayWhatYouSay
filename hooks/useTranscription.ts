import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { AudioContext } from '../context/AudioContext';
import { SERVICES } from '../constants';
import { ServiceId, Transcript } from '../types';

export const useTranscription = () => {
  const {
    apiKeys,
    setError,
    setIsTranscribing,
    setTranscripts,
    clearResults,
  } = useContext(AppContext);
  const { audioFile } = useContext(AudioContext);

  const transcribe = async (file: File) => {
    if (!file) {
      setError('Please upload an audio file.');
      return;
    }

    const activeServices = SERVICES.filter(s => apiKeys[s.id].trim() !== '');
    if (activeServices.length < 2) {
        setError('Please provide API keys for at least two transcription services to compare.');
        return;
    }

    setIsTranscribing(true);
    clearResults();

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('services', activeServices.map(s => s.id).join(','));

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const results: Transcript[] = await response.json();
      setTranscripts(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during transcription.');
      setTranscripts(null); // Ensure no stale data is shown
    } finally {
      setIsTranscribing(false);
    }
  };

  return { transcribe };
};

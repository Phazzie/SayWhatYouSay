import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { SERVICES } from '../constants';
import { transcribeAudio } from '../services/transcriptionService';

export const useTranscription = () => {
  const {
    apiKeys,
    setError,
    setIsTranscribing,
    setTranscripts,
    clearResults,
  } = useContext(AppContext);

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
      const serviceIds = activeServices.map(s => s.id);
      const results = await transcribeAudio(file, serviceIds);
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

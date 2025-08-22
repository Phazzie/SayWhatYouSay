import { Transcript, ServiceId } from '../types';

export const transcribeAudio = async (file: File, services: ServiceId[]): Promise<Transcript[]> => {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('services', services.join(','));

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  const results: Transcript[] = await response.json();
  return results;
};

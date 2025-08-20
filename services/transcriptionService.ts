
import { Transcript, Word, ServiceId } from '../types';

const mockWhisperTranscript: Word[] = [
  { text: "The", start: 0.1, end: 0.3, confidence: 0.99 },
  { text: "quick", start: 0.3, end: 0.7, confidence: 0.98 },
  { text: "brown", start: 0.7, end: 1.1, confidence: 0.99 },
  { text: "fox", start: 1.1, end: 1.5, confidence: 1.0 },
  { text: "jumps", start: 1.5, end: 2.0, confidence: 0.95 },
  { text: "over", start: 2.0, end: 2.3, confidence: 0.99 },
  { text: "the", start: 2.3, end: 2.5, confidence: 0.89 },
  { text: "lazy", start: 2.5, end: 3.0, confidence: 0.97 },
  { text: "dog.", start: 3.0, end: 3.4, confidence: 0.99 },
];

const mockGoogleTranscript: Word[] = [
  { text: "The", start: 0.1, end: 0.3, confidence: 0.98 },
  { text: "quick", start: 0.3, end: 0.7, confidence: 0.99 },
  { text: "brown", start: 0.7, end: 1.1, confidence: 0.99 },
  { text: "fox", start: 1.1, end: 1.5, confidence: 1.0 },
  { text: "jumped", start: 1.5, end: 2.0, confidence: 0.88 }, // Discrepancy
  { text: "over", start: 2.0, end: 2.3, confidence: 0.99 },
  { text: "the", start: 2.3, end: 2.5, confidence: 0.92 },
  { text: "lazy", start: 2.5, end: 3.0, confidence: 0.96 },
  { text: "dog.", start: 3.0, end: 3.4, confidence: 0.99 },
];

const mockAssemblyAITranscript: Word[] = [
  { text: "The", start: 0.1, end: 0.3, confidence: 0.99 },
  { text: "quick", start: 0.3, end: 0.7, confidence: 0.98 },
  { text: "brown", start: 0.7, end: 1.1, confidence: 0.99 },
  { text: "fox", start: 1.1, end: 1.5, confidence: 1.0 },
  { text: "jumps", start: 1.5, end: 2.0, confidence: 0.96 },
  { text: "over", start: 2.0, end: 2.3, confidence: 0.99 },
  { text: "a", start: 2.3, end: 2.5, confidence: 0.75 }, // Discrepancy
  { text: "lazy", start: 2.5, end: 3.0, confidence: 0.98 },
  { text: "dog.", start: 3.0, end: 3.4, confidence: 0.99 },
];

const mockElevenLabsTranscript: Word[] = [
    { text: "The", start: 0.1, end: 0.3, confidence: 0.99 },
    { text: "quick", start: 0.3, end: 0.7, confidence: 0.98 },
    { text: "brown", start: 0.7, end: 1.1, confidence: 0.99 },
    { text: "fox", start: 1.1, end: 1.5, confidence: 1.0 },
    { text: "jumps", start: 1.5, end: 2.0, confidence: 0.97 },
    { text: "over", start: 2.0, end: 2.3, confidence: 0.99 },
    { text: "the", start: 2.3, end: 2.5, confidence: 0.91 },
    { text: "lazy", start: 2.5, end: 3.0, confidence: 0.98 },
    { text: "dog.", start: 3.0, end: 3.4, confidence: 0.99 },
  ];

const mockData: Record<ServiceId, Word[]> = {
    [ServiceId.Whisper]: mockWhisperTranscript,
    [ServiceId.Google]: mockGoogleTranscript,
    [ServiceId.AssemblyAI]: mockAssemblyAITranscript,
    [ServiceId.ElevenLabs]: mockElevenLabsTranscript,
};


export const runTranscription = (file: File, activeServices: ServiceId[]): Promise<Transcript[]> => {
  console.log(`Simulating transcription for ${file.name} with services: ${activeServices.join(', ')}`);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (file.name.includes('error')) {
        reject(new Error('Simulated transcription failed.'));
      } else {
        const results: Transcript[] = activeServices.map(serviceId => ({
            serviceId,
            words: mockData[serviceId] || [],
        }));
        resolve(results);
      }
    }, 2500); // Simulate network delay and processing time
  });
};

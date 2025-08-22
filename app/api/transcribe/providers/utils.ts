// Placeholder for shared utility functions for transcription providers.
// For example, functions to normalize different API responses into a common format.

import { Transcript, Word } from '@/types';

export const normalizeTranscript = (data: any, serviceId: string): Transcript => {
  // This is a placeholder. Each provider will need a specific normalizer
  // that understands its unique response structure and converts it to our standard Transcript type.
  console.log(`Normalizing data from ${serviceId}...`);

  // Example structure of a normalized word.
  const exampleWord: Word = {
    text: 'hello',
    start: 0.5,
    end: 1.0,
    confidence: 0.95,
  };

  return {
    serviceId: serviceId as any, // This will need proper typing
    words: [exampleWord],
    status: 'fulfilled',
  };
};

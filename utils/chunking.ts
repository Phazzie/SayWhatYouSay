import { Transcript, Chunk, ServiceId } from "../types";

/**
 * Divides multiple transcripts into synchronized chunks.
 * This is crucial for feeding manageable segments to an LLM for analysis.
 * @param transcripts - An array of Transcript objects from different services.
 * @param chunkSize - The number of words each chunk should contain.
 * @returns An array of Chunk objects.
 */
export const chunkTranscripts = (transcripts: Transcript[], chunkSize: number = 25): Chunk[] => {
  if (transcripts.length === 0) {
    return [];
  }

  // Find the transcript with the most words to determine the total number of chunks
  const maxWords = Math.max(...transcripts.map(t => t.words.length));
  const numChunks = Math.ceil(maxWords / chunkSize);
  const chunks: Chunk[] = [];

  for (let i = 0; i < numChunks; i++) {
    const wordIndexStart = i * chunkSize;
    const wordIndexEnd = wordIndexStart + chunkSize;

    const newChunk: Chunk = { wordIndexStart };
    
    transcripts.forEach(transcript => {
      // Get the slice of words for the current chunk from this specific transcript
      const wordSlice = transcript.words.slice(wordIndexStart, wordIndexEnd);
      newChunk[transcript.serviceId] = wordSlice;
    });

    chunks.push(newChunk);
  }

  return chunks;
};

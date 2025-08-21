import { chunkTranscripts } from '@/utils/chunking';
import { mockTranscripts } from '../../test-utils/index';
import { ServiceId } from '@/types';

describe('Chunking Utils', () => {
  describe('chunkTranscripts', () => {
    it('returns empty array for empty transcripts', () => {
      const result = chunkTranscripts([]);
      expect(result).toEqual([]);
    });

    it('creates single chunk for small transcripts', () => {
      const result = chunkTranscripts(mockTranscripts, 10);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('wordIndexStart', 0);
      expect(result[0]).toHaveProperty(ServiceId.Whisper);
      expect(result[0]).toHaveProperty(ServiceId.Google);
    });

    it('creates multiple chunks for large transcripts', () => {
      const longTranscripts = [
        {
          serviceId: ServiceId.Whisper,
          words: Array(50).fill(0).map((_, i) => ({
            text: `word${i}`,
            start: i,
            end: i + 1,
            confidence: 0.9
          })),
          status: 'fulfilled' as const,
        }
      ];
      
      const result = chunkTranscripts(longTranscripts, 10);
      
      expect(result).toHaveLength(5); // 50 words / 10 per chunk = 5 chunks
      expect(result[0].wordIndexStart).toBe(0);
      expect(result[1].wordIndexStart).toBe(10);
      expect(result[4].wordIndexStart).toBe(40);
    });

    it('handles transcripts with different lengths', () => {
      const unevenTranscripts = [
        {
          serviceId: ServiceId.Whisper,
          words: Array(10).fill(0).map((_, i) => ({
            text: `word${i}`,
            start: i,
            end: i + 1,
            confidence: 0.9
          })),
          status: 'fulfilled' as const,
        },
        {
          serviceId: ServiceId.Google,
          words: Array(5).fill(0).map((_, i) => ({
            text: `word${i}`,
            start: i,
            end: i + 1,
            confidence: 0.8
          })),
          status: 'fulfilled' as const,
        }
      ];
      
      const result = chunkTranscripts(unevenTranscripts, 5);
      
      expect(result).toHaveLength(2); // Based on longest transcript (10 words)
      expect(result[0][ServiceId.Whisper]).toHaveLength(5);
      expect(result[0][ServiceId.Google]).toHaveLength(5);
      expect(result[1][ServiceId.Whisper]).toHaveLength(5);
      expect(result[1][ServiceId.Google]).toHaveLength(0); // Shorter transcript ends
    });

    it('uses default chunk size when not specified', () => {
      const longTranscripts = [
        {
          serviceId: ServiceId.Whisper,
          words: Array(50).fill(0).map((_, i) => ({
            text: `word${i}`,
            start: i,
            end: i + 1,
            confidence: 0.9
          })),
          status: 'fulfilled' as const,
        }
      ];
      
      const result = chunkTranscripts(longTranscripts);
      
      expect(result).toHaveLength(2); // 50 words / 25 default chunk size = 2 chunks
    });

    it('preserves word data in chunks', () => {
      const result = chunkTranscripts(mockTranscripts, 10);
      
      const firstChunk = result[0];
      const whisperWords = firstChunk[ServiceId.Whisper];
      
      expect(whisperWords).toHaveLength(2);
      expect(whisperWords![0]).toEqual({
        text: 'Hello',
        start: 0,
        end: 0.5,
        confidence: 0.99
      });
    });
  });
});
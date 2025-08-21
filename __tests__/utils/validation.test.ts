import { validateAudioFile, AudioFileSchema, TranscribeRequestSchema } from '@/utils/validation';
import { mockAudioFile } from '../../test-utils/index';

describe('Validation Utils', () => {
  describe('AudioFileSchema', () => {
    it('validates valid audio files', () => {
      const validFile = {
        size: 1024 * 1024, // 1MB
        type: 'audio/mpeg',
      };
      
      expect(() => AudioFileSchema.parse(validFile)).not.toThrow();
    });

    it('rejects files that are too large', () => {
      const largeFile = {
        size: 26 * 1024 * 1024, // 26MB (over 25MB limit)
        type: 'audio/mpeg',
      };
      
      expect(() => AudioFileSchema.parse(largeFile)).toThrow(/file size must be less than 25mb/i);
    });

    it('rejects invalid file types', () => {
      const invalidFile = {
        size: 1024 * 1024, // 1MB
        type: 'video/mp4',
      };
      
      expect(() => AudioFileSchema.parse(invalidFile)).toThrow(/file must be a valid audio format/i);
    });

    it('accepts all supported audio formats', () => {
      const supportedFormats = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/x-wav',
        'audio/m4a',
        'audio/x-m4a',
        'audio/flac',
        'audio/ogg',
        'audio/webm',
      ];

      supportedFormats.forEach(type => {
        const file = { size: 1024, type };
        expect(() => AudioFileSchema.parse(file)).not.toThrow();
      });
    });
  });

  describe('validateAudioFile helper', () => {
    it('validates a valid audio file', () => {
      expect(() => validateAudioFile(mockAudioFile)).not.toThrow();
    });

    it('throws error for invalid file', () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      expect(() => validateAudioFile(invalidFile)).toThrow();
    });
  });

  describe('TranscribeRequestSchema', () => {
    it('validates valid service string', () => {
      expect(() => TranscribeRequestSchema.parse({ services: 'whisper,google' })).not.toThrow();
    });

    it('rejects empty service string', () => {
      expect(() => TranscribeRequestSchema.parse({ services: '' })).toThrow();
    });

    it('validates single service', () => {
      expect(() => TranscribeRequestSchema.parse({ services: 'whisper' })).not.toThrow();
    });
  });
});
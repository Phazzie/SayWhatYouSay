import { z } from 'zod';
import { ServiceId, AnalysisModelId } from '@/types';

// File upload validation
export const AudioFileSchema = z.object({
  size: z.number().max(25 * 1024 * 1024, 'File size must be less than 25MB'),
  type: z.string().refine(
    (type) => [
      'audio/mpeg',
      'audio/mp3', 
      'audio/wav',
      'audio/x-wav',
      'audio/m4a',
      'audio/x-m4a',
      'audio/flac',
      'audio/ogg',
      'audio/webm',
    ].includes(type),
    'File must be a valid audio format (MP3, WAV, M4A, FLAC, OGG, WebM)'
  ),
});

// Transcription API request validation
export const TranscribeRequestSchema = z.object({
  services: z.string().min(1, 'At least one service must be selected'),
});

// Analysis API request validation  
export const AnalyzeRequestSchema = z.object({
  provider: z.nativeEnum(AnalysisModelId),
  transcripts: z.array(z.object({
    serviceId: z.nativeEnum(ServiceId),
    words: z.array(z.object({
      text: z.string(),
      start: z.number(),
      end: z.number(), 
      confidence: z.number().min(0).max(1),
    })),
    status: z.literal('fulfilled').or(z.literal('rejected')),
    error: z.string().optional(),
  })).min(2, 'At least 2 transcripts are required for analysis'),
});

// API Key validation
export const ApiKeySchema = z.string().min(1, 'API key is required');

// Environment variables validation
export const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_SPEECH_API_KEY: z.string().optional(), 
  ASSEMBLYAI_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  NODE_ENV: z.string().default('development'),
});

// Validate environment variables on server startup
export const validateEnv = () => {
  try {
    return EnvSchema.parse(process.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
};

// Helper function to validate file uploads
export const validateAudioFile = (file: File) => {
  return AudioFileSchema.parse({
    size: file.size,
    type: file.type,
  });
};
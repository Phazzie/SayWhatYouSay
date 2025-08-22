import type { IncomingMessage, ServerResponse } from 'http';
import formidable from 'formidable';
import { SpeechClient } from '@google-cloud/speech';
import { ServiceId, Transcript, Word } from '@/types';
import fs from 'fs';

// Helper to convert Google's duration object to seconds
// Exported for testing purposes
export const durationToSeconds = (duration: { seconds?: number | null; nanos?: number | null }): number => {
  const seconds = duration.seconds || 0;
  const nanos = duration.nanos || 0;
  return seconds + nanos / 1e9;
};

// Google Cloud Speech-to-Text API Call
const transcribeWithGoogle = async (filepath: string): Promise<Transcript> => {
  const speechClient = new SpeechClient();
  const fileBuffer = fs.readFileSync(filepath);
  const audioBytes = fileBuffer.toString('base64');

  const audio = { content: audioBytes };
  const config = {
    encoding: 'LINEAR16' as const,
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
  };
  const request = { audio, config };

  try {
    const [response] = await speechClient.recognize(request);
    const words: Word[] = [];
    response.results?.forEach(result => {
      result.alternatives?.[0]?.words?.forEach(wordInfo => {
        if (wordInfo.word && wordInfo.startTime && wordInfo.endTime) {
          words.push({
            text: wordInfo.word,
            start: durationToSeconds(wordInfo.startTime),
            end: durationToSeconds(wordInfo.endTime),
            confidence: wordInfo.confidence || 0,
          });
        }
      });
    });
    return { serviceId: ServiceId.Google, words, status: 'fulfilled' };
  } catch (error) {
    console.error('Google Speech-to-Text API Error:', error);
    throw new Error(`Google API Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
};

// The main handler for the /api/transcribe route
export const transcribeApiHandler = async (req: IncomingMessage, res: ServerResponse) => {
  const form = formidable({});

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to parse form data.' }));
      return;
    }

    const servicesField = fields.services;
    const serviceIds = (Array.isArray(servicesField) ? servicesField[0] : servicesField)?.split(',') as ServiceId[] || [];
    
    const audioFile = files.audio;
    const filepath = Array.isArray(audioFile) ? audioFile[0].filepath : audioFile?.filepath;

    if (!filepath) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No audio file provided.' }));
      return;
    }

    try {
      const promises = serviceIds.map(id => {
        if (id === ServiceId.Google) {
          return transcribeWithGoogle(filepath);
        } else {
          return Promise.resolve({
            serviceId: id,
            words: [],
            status: 'rejected',
            error: 'This service is not yet implemented.',
          } as Transcript);
        }
      });

      const results = await Promise.all(promises);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process transcription request.';
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: message }));
    }
  });
};

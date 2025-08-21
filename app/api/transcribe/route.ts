import { NextRequest, NextResponse } from 'next/server';
import { ServiceId, Transcript, Word } from '@/types';

// --- MOCK DATA AND FUNCTIONS ---
// This is a "smarter" mock. It generates varied data based on the filename
// to make the demo more realistic. In a real app, you would replace this
// with actual API calls.

const BASE_TRANSCRIPT: Word[] = [
    { text: "The", start: 0.1, end: 0.3, confidence: 0.99 },
    { text: "quick", start: 0.3, end: 0.7, confidence: 0.98 },
    { text: "brown", start: 0.7, end: 1.1, confidence: 0.99 },
    { text: "fox", start: 1.1, end: 1.5, confidence: 1.0 },
    { text: "jumps", start: 1.5, end: 2.0, confidence: 0.95 },
    { text: "over", start: 2.0, end: 2.3, confidence: 0.99 },
    { text: "the", start: 2.3, end: 2.5, confidence: 0.89 },
    { text: "lazy", start: 2.5, end: 3.0, confidence: 0.97 },
    { text: "dog", start: 3.0, end: 3.4, confidence: 0.99 },
];

// A simple hash function to get a number from a string
const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

const generateMockData = (serviceId: ServiceId, filename: string): Word[] => {
    const hash = simpleHash(filename + serviceId);
    return BASE_TRANSCRIPT.map((word, index) => {
        // Introduce variations based on the hash
        if (serviceId === ServiceId.Google && index === 4 && hash % 3 === 0) {
            return { ...word, text: "jumped", confidence: 0.88 };
        }
        if (serviceId === ServiceId.AssemblyAI && index === 6 && hash % 4 === 1) {
            return { ...word, text: "a", confidence: 0.75 };
        }
        if (serviceId === ServiceId.ElevenLabs && index === 8 && hash % 4 === 2) {
             return { ...word, text: "dogs", confidence: 0.91 };
        }
        if (serviceId === ServiceId.Whisper && index === 8 && hash % 5 === 0) {
            return { ...word, text: "log", confidence: 0.85 };
        }
        return { ...word };
    });
};


// This function simulates a call to a specific transcription service API
const mockApiServiceCall = (serviceId: ServiceId, file: File): Promise<Transcript> => {
    return new Promise((resolve, reject) => {
        const delay = 1500 + Math.random() * 2000; // Simulate variable network/processing time
        setTimeout(() => {
            // Check for API keys from environment variables
            // In a real app, you'd use these keys in your API requests
            const keyMap = {
                [ServiceId.Whisper]: process.env.OPENAI_API_KEY,
                [ServiceId.Google]: process.env.GOOGLE_SPEECH_API_KEY,
                [ServiceId.AssemblyAI]: process.env.ASSEMBLYAI_API_KEY,
                [ServiceId.ElevenLabs]: process.env.ELEVENLABS_API_KEY,
            };

            // This is just a check. A real implementation would pass the key to the API client.
            if (!keyMap[serviceId]) {
                 // reject(new Error(`API key for ${serviceId} is not configured on the server.`));
                 // For demo purposes, we'll allow it to proceed with mock data even without a key.
            }
            
            // Simulate a failure for a specific service for demonstration
            if (serviceId === ServiceId.Google && file.name.includes('fail')) {
                reject(new Error('Simulated API quota exceeded.'));
            } else {
                resolve({
                    serviceId: serviceId,
                    words: generateMockData(serviceId, file.name),
                    status: 'fulfilled',
                });
            }
        }, delay);
    });
};

// --- API ROUTE HANDLER ---

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as File | null;
    const services = formData.get('services') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided.' }, { status: 400 });
    }
    if (!services) {
      return NextResponse.json({ error: 'No services specified.' }, { status: 400 });
    }

    const serviceIds = services.split(',') as ServiceId[];
    
    const transcriptionPromises = serviceIds.map(id => mockApiServiceCall(id, file));

    // Use Promise.allSettled to ensure we get results even if one API fails
    const results = await Promise.allSettled(transcriptionPromises);

    const formattedResults: Transcript[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
            ...result.value,
            status: 'fulfilled',
        };
      } else {
        return {
          serviceId: serviceIds[index],
          words: [],
          status: 'rejected',
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
        };
      }
    });

    return NextResponse.json(formattedResults, { status: 200 });

  } catch (error)
 {
    console.error('Transcription API error:', error);
    return NextResponse.json({ error: 'Failed to process transcription request.' }, { status: 500 });
  }
}
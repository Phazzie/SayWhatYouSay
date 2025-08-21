import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { AppProvider } from '@/context/AppContext';
import ErrorBoundary from '@/components/ErrorBoundary';

// Mock data for tests
export const mockTranscripts = [
  {
    serviceId: 'whisper' as const,
    words: [
      { text: 'Hello', start: 0, end: 0.5, confidence: 0.99 },
      { text: 'world', start: 0.5, end: 1.0, confidence: 0.95 },
    ],
    status: 'fulfilled' as const,
  },
  {
    serviceId: 'google' as const,
    words: [
      { text: 'Hello', start: 0, end: 0.5, confidence: 0.97 },
      { text: 'world', start: 0.5, end: 1.0, confidence: 0.92 },
    ],
    status: 'fulfilled' as const,
  },
];

export const mockAnalysisResult = {
  provider: 'openai' as const,
  chunkAnalyses: [
    {
      chunkIndex: 0,
      preferredServiceId: 'whisper' as const,
      reasoning: 'Higher confidence scores',
      discrepancies: {
        whisper: [0, 1],
        google: [0, 1],
      },
    },
  ],
};

export const mockAudioFile = new File(
  ['mock audio data'],
  'test-audio.mp3',
  { type: 'audio/mpeg' }
);

// Custom render function that includes context providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withErrorBoundary?: boolean;
}

function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <AppProvider>
        {children}
      </AppProvider>
    </ErrorBoundary>
  );
}

function WithoutErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { withErrorBoundary = true, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: withErrorBoundary ? AllTheProviders : WithoutErrorBoundary,
    ...renderOptions,
  });
}

// Mock API responses
export const mockApiResponses = {
  transcribe: {
    success: mockTranscripts,
    error: { error: 'Transcription failed' },
  },
  analyze: {
    success: mockAnalysisResult,
    error: { error: 'Analysis failed' },
  },
};

// Helper to create FormData for file uploads
export function createMockFormData(file: File, services: string = 'whisper,google') {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('services', services);
  return formData;
}

// Helper to mock fetch requests
export function mockFetch(responses: { [key: string]: any }) {
  const originalFetch = global.fetch;
  
  global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
    const urlString = url.toString();
    
    if (urlString.includes('/api/transcribe')) {
      const response = responses.transcribe || mockApiResponses.transcribe.success;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(response),
      } as Response);
    }
    
    if (urlString.includes('/api/analyze')) {
      const response = responses.analyze || mockApiResponses.analyze.success;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(response),
      } as Response);
    }
    
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    } as Response);
  });
  
  return () => {
    global.fetch = originalFetch;
  };
}

// Helper to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Custom matchers (extend these as needed)
export const customMatchers = {
  toHaveValidTranscript: (transcript: any) => {
    const pass = 
      transcript &&
      typeof transcript.serviceId === 'string' &&
      Array.isArray(transcript.words) &&
      transcript.words.every((word: any) => 
        typeof word.text === 'string' &&
        typeof word.start === 'number' &&
        typeof word.end === 'number' &&
        typeof word.confidence === 'number'
      );
    
    return {
      pass,
      message: () => pass 
        ? 'Expected transcript to be invalid'
        : 'Expected transcript to be valid with proper structure',
    };
  },
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
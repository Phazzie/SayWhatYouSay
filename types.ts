export enum ServiceId {
  Whisper = 'whisper',
  Google = 'google',
  AssemblyAI = 'assemblyai',
  ElevenLabs = 'elevenlabs',
}

export enum AnalysisModelId {
  OpenAI = 'openai',
  Gemini = 'gemini',
}

export type ApiKeySet = {
  [key in ServiceId]: string;
} & {
  gemini: string; // Specific key for Gemini analysis
};

export interface Word {
  text: string;
  start: number;
  end: number;
  confidence: number;
  isDiscrepancy?: boolean;
  isPreferredByAI?: boolean;
  isEdited?: boolean;
}

export interface Transcript {
  serviceId: ServiceId;
  words: Word[];
  status: 'fulfilled' | 'rejected';
  error?: string;
}

export interface TranscriptionService {
  id: ServiceId;
  name: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type Chunk = {
  [key in ServiceId]?: Word[];
} & {
  wordIndexStart: number;
}

export interface ChunkAnalysis {
  chunkIndex: number; 
  preferredServiceId: ServiceId | 'UNCLEAR';
  reasoning: string;
  discrepancies: {
    [key in ServiceId]?: number[];
  };
}

export interface AnalysisResult {
  provider: AnalysisModelId;
  chunkAnalyses: ChunkAnalysis[];
}


// State Management Types
export interface AppState {
    apiKeys: ApiKeySet;
    transcripts: Transcript[] | null;
    editedTranscripts: Transcript[] | null;
    isTranscribing: boolean;
    isAnalyzing: boolean;
    analysisProvider: AnalysisModelId;
    analysisResult: AnalysisResult | null;
    error: string | null;
}

export interface AppContextType extends AppState {
    setApiKeys: React.Dispatch<React.SetStateAction<ApiKeySet>>;
    setTranscripts: React.Dispatch<React.SetStateAction<Transcript[] | null>>;
    setEditedTranscripts: React.Dispatch<React.SetStateAction<Transcript[] | null>>;
    setIsTranscribing: React.Dispatch<React.SetStateAction<boolean>>;
    setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
    setAnalysisProvider: React.Dispatch<React.SetStateAction<AnalysisModelId>>;
    setAnalysisResult: React.Dispatch<React.SetStateAction<AnalysisResult | null>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    clearResults: () => void;
    updateWord: (serviceId: ServiceId, wordIndex: number, newText: string) => void;
}

export interface AudioState {
    audioFile: File | null;
    audioUrl: string | null;
    wavesurfer: any | null; // Using 'any' for WaveSurfer instance type for simplicity
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    currentlyPlayingWordIndex: number | null;
}

export interface AudioContextType extends AudioState {
    setAudioFile: (file: File | null) => void;
    setWavesurfer: (instance: any) => void;
    play: () => void;
    pause: () => void;
    seekTo: (time: number) => void;
    playSegment: (start: number, end: number) => void;
    setCurrentlyPlayingWordIndex: (index: number | null) => void;
}
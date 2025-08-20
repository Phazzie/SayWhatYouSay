
export enum ServiceId {
  Whisper = 'whisper',
  Google = 'google',
  AssemblyAI = 'assemblyai',
  ElevenLabs = 'elevenlabs',
}

export type ApiKeySet = {
  [key in ServiceId]: string;
};

export interface Word {
  text: string;
  start: number;
  end: number;
  confidence: number;
  isDiscrepancy?: boolean;
}

export interface Transcript {
  serviceId: ServiceId;
  words: Word[];
}

export interface TranscriptionService {
  id: ServiceId;
  name: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

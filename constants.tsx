import { TranscriptionService, ServiceId, AnalysisModelId } from './types';
import { OpenAIIcon } from './components/icons/OpenAIIcon';
import { GoogleCloudIcon } from './components/icons/GoogleCloudIcon';
import { AssemblyAIIcon } from './components/icons/AssemblyAIIcon';
import { ElevenLabsIcon } from './components/icons/ElevenLabsIcon';
import { GeminiIcon } from './components/icons/GeminiIcon';

export const SERVICES: TranscriptionService[] = [
  { id: ServiceId.Whisper, name: 'OpenAI Whisper', Icon: OpenAIIcon },
  { id: ServiceId.Google, name: 'Google Speech-to-Text', Icon: GoogleCloudIcon },
  { id: ServiceId.AssemblyAI, name: 'AssemblyAI', Icon: AssemblyAIIcon },
  { id: ServiceId.ElevenLabs, name: 'ElevenLabs Scribe', Icon: ElevenLabsIcon },
];

export const ANALYSIS_PROVIDERS = [
  { id: AnalysisModelId.OpenAI, name: 'OpenAI GPT-4o', Icon: OpenAIIcon },
  { id: AnalysisModelId.Gemini, name: 'Google Gemini', Icon: GeminiIcon },
];

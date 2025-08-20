
import { TranscriptionService, ServiceId } from './types';
import { OpenAIIcon } from './components/icons/OpenAIIcon';
import { GoogleCloudIcon } from './components/icons/GoogleCloudIcon';
import { AssemblyAIIcon } from './components/icons/AssemblyAIIcon';
import { ElevenLabsIcon } from './components/icons/ElevenLabsIcon';

export const SERVICES: TranscriptionService[] = [
  { id: ServiceId.Whisper, name: 'OpenAI Whisper', Icon: OpenAIIcon },
  { id: ServiceId.Google, name: 'Google Speech-to-Text', Icon: GoogleCloudIcon },
  { id: ServiceId.AssemblyAI, name: 'AssemblyAI', Icon: AssemblyAIIcon },
  { id: ServiceId.ElevenLabs, name: 'ElevenLabs Scribe', Icon: ElevenLabsIcon },
];

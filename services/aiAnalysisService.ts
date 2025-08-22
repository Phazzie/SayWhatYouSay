import { Transcript, AnalysisResult, AnalysisModelId } from '../types';

export const analyzeTranscripts = async (transcripts: Transcript[], provider: AnalysisModelId): Promise<AnalysisResult> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcripts, provider }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  const results: AnalysisResult = await response.json();
  return results;
};

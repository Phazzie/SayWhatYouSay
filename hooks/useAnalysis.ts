import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { analyzeTranscripts } from '../services/aiAnalysisService';

export const useAnalysis = () => {
  const {
    transcripts,
    analysisProvider,
    setIsAnalyzing,
    setAnalysisResult,
    setError,
  } = useContext(AppContext);

  const analyze = async () => {
    if (!transcripts) {
      setError('Cannot run analysis without transcripts.');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const results = await analyzeTranscripts(transcripts, analysisProvider);
      setAnalysisResult(results);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during AI analysis.');
    } finally {
        setIsAnalyzing(false);
    }
  };

  return { analyze };
};

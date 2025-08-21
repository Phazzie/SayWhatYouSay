import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { AnalysisResult } from '../types';

export const useAnalysis = () => {
  const {
    transcripts,
    analysisProvider,
    setIsAnalyzing,
    setAnalysisResult,
    setError,
    apiKeys,
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
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcripts, provider: analysisProvider }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const results: AnalysisResult = await response.json();
      setAnalysisResult(results);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during AI analysis.');
    } finally {
        setIsAnalyzing(false);
    }
  };

  return { analyze };
};

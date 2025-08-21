import React, { useContext } from 'react';
import { Header } from './components/Header';
import { ApiKeyManager } from './components/ApiKeyManager';
import { AudioUploader } from './components/AudioUploader';
import { TranscriptionView } from './components/TranscriptionView';
import { AnalysisController } from './components/AnalysisController';
import { AppContext } from './context/AppContext';
import { WaveformPlayer } from './components/WaveformPlayer';
import { AnalysisSummary } from './components/AnalysisSummary';

const App: React.FC = () => {
  const {
    transcripts,
    isTranscribing,
    isAnalyzing,
    error,
    analysisResult,
  } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-200">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="space-y-8">
          <ApiKeyManager />

          <AudioUploader />
          
          <WaveformPlayer />

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {isTranscribing && (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="mt-4 text-lg text-gray-300">Transcribing audio... this may take a moment.</p>
              <p className="text-sm text-gray-400">Comparing results from multiple AI models.</p>
            </div>
          )}
          
          {transcripts && !isTranscribing && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <AnalysisController />
                     {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
                            <p className="mt-4 text-lg text-gray-300">AI is analyzing discrepancies...</p>
                            <p className="text-sm text-gray-400">This may take a few moments for longer transcripts.</p>
                        </div>
                    )}
                    <TranscriptionView />
                </div>
                <div className="lg:col-span-1">
                    <AnalysisSummary />
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

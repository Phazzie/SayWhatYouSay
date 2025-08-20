
import React, { useState, useEffect } from 'react';
import { Transcript, Word } from '../types';
import { SERVICES } from '../constants';
import { PlayIcon } from './icons/PlayIcon';

interface TranscriptionViewProps {
  transcripts: Transcript[];
  onWordClick: (start: number, end: number) => void;
}

const compareAndFlagTranscripts = (transcripts: Transcript[]): Transcript[] => {
  if (transcripts.length < 2) return transcripts;

  const flaggedTranscripts: Transcript[] = JSON.parse(JSON.stringify(transcripts));
  const maxWords = Math.max(...flaggedTranscripts.map(t => t.words.length));

  for (let i = 0; i < maxWords; i++) {
    const wordsAtIndex = flaggedTranscripts.map(t => t.words[i]?.text.toLowerCase().replace(/[.,!?]/g, '') || null);
    
    // Use a Set to find unique words at this index
    const uniqueWords = new Set(wordsAtIndex.filter(w => w !== null));

    if (uniqueWords.size > 1) {
      flaggedTranscripts.forEach(t => {
        if (t.words[i]) {
          t.words[i].isDiscrepancy = true;
        }
      });
    }
  }
  return flaggedTranscripts;
};

export const TranscriptionView: React.FC<TranscriptionViewProps> = ({ transcripts, onWordClick }) => {
  const [processedTranscripts, setProcessedTranscripts] = useState<Transcript[]>([]);
  
  useEffect(() => {
    const flagged = compareAndFlagTranscripts(transcripts);
    setProcessedTranscripts(flagged);
  }, [transcripts]);
  
  const getServiceInfo = (serviceId: string) => {
    return SERVICES.find(s => s.id === serviceId) || { name: 'Unknown Service', Icon: () => null };
  };

  if (!processedTranscripts || processedTranscripts.length === 0) {
    return null;
  }
  
  const maxWords = Math.max(...processedTranscripts.map(t => t.words.length));
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
      <div className="p-6 bg-gray-700/50">
        <h2 className="text-xl font-semibold text-white">Transcription Comparison</h2>
        <p className="text-sm text-gray-400 mt-1">
            Words with discrepancies are highlighted. Click any word to play the corresponding audio segment.
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processedTranscripts.map(({ serviceId, words }) => {
            const { name, Icon } = getServiceInfo(serviceId);
            return (
              <div key={serviceId} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 h-[60vh] overflow-y-auto">
                <div className="flex items-center space-x-2 mb-4 sticky top-0 bg-gray-900/50 backdrop-blur-sm py-2 -mt-4 -mx-4 px-4 z-10 border-b border-gray-700">
                  <Icon className="h-6 w-6 text-indigo-400" />
                  <h3 className="font-bold text-lg text-gray-200">{name}</h3>
                </div>
                <div className="text-gray-300 leading-relaxed space-x-1 space-y-1">
                  {words.map((word, index) => (
                    <span 
                      key={`${serviceId}-${index}`} 
                      onClick={() => onWordClick(word.start, word.end)}
                      className={`
                        inline-block px-1.5 py-0.5 rounded-md cursor-pointer transition-all duration-200 group relative
                        ${word.isDiscrepancy
                          ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/40 ring-1 ring-yellow-600'
                          : 'hover:bg-indigo-500/20 hover:text-indigo-300'}
                      `}
                      title={`Confidence: ${(word.confidence * 100).toFixed(0)}%`}
                    >
                      {word.text}
                      <PlayIcon className="h-3 w-3 absolute top-0.5 right-0.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

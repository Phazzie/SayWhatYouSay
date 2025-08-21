import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Transcript, Word, AnalysisResult, ServiceId } from '../types';
import { SERVICES } from '../constants';
import { PlayIcon } from './icons/PlayIcon';
import { AppContext } from '../context/AppContext';
import { AudioContext } from '../context/AudioContext';

const applyAnalysisToTranscripts = (
  transcripts: Transcript[], 
  analysis: AnalysisResult | null
): Transcript[] => {
  const processed = JSON.parse(JSON.stringify(transcripts)) as Transcript[];
  
  processed.forEach(t => t.words.forEach(w => {
    w.isDiscrepancy = false;
    w.isPreferredByAI = false;
  }));

  if (!analysis) return processed;

  const transcriptMap = new Map(processed.map(t => [t.serviceId, t]));

  analysis.chunkAnalyses.forEach(chunkAnalysis => {
    // Highlight discrepancies
    for (const serviceId in chunkAnalysis.discrepancies) {
      const transcript = transcriptMap.get(serviceId as ServiceId);
      if (transcript) {
        chunkAnalysis.discrepancies[serviceId as ServiceId]?.forEach(wordIndex => {
          if (transcript.words[wordIndex]) {
            transcript.words[wordIndex].isDiscrepancy = true;
          }
        });
      }
    }
    // Flag the preferred words
    if (chunkAnalysis.preferredServiceId !== 'UNCLEAR') {
      const preferredTranscript = transcriptMap.get(chunkAnalysis.preferredServiceId);
      if (preferredTranscript) {
         const discrepancyIndices = new Set<number>();
         Object.values(chunkAnalysis.discrepancies).forEach(indices => indices?.forEach(i => discrepancyIndices.add(i)));
         
         discrepancyIndices.forEach(idx => {
           if (preferredTranscript.words[idx]) {
             preferredTranscript.words[idx].isPreferredByAI = true;
           }
         });
      }
    }
  });

  return processed;
};

const formatTimestamp = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [
    h > 0 ? h.toString().padStart(2, '0') : null,
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0'),
  ].filter(Boolean).join(':');
};

interface EditingCell {
  serviceId: ServiceId;
  wordIndex: number;
}

export const TranscriptionView: React.FC = () => {
  const { transcripts, analysisResult, editedTranscripts, updateWord } = useContext(AppContext);
  const { playSegment, seekTo, currentlyPlayingWordIndex } = useContext(AudioContext);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  const displayTranscripts = useMemo(() => {
    const source = editedTranscripts || transcripts;
    if (!source) return [];
    return applyAnalysisToTranscripts(source, analysisResult);
  }, [transcripts, editedTranscripts, analysisResult]);
  
  const getServiceInfo = (serviceId: string) => {
    return SERVICES.find(s => s.id === serviceId) || { name: 'Unknown Service', Icon: () => null };
  };

  const handleWordUpdate = (newText: string) => {
    if (editingCell) {
      updateWord(editingCell.serviceId, editingCell.wordIndex, newText);
      setEditingCell(null);
    }
  };
  
  if (!displayTranscripts || displayTranscripts.length === 0) {
    return null;
  }
  
  const longestTranscript = displayTranscripts
    .filter(t => t.status === 'fulfilled')
    .sort((a, b) => b.words.length - a.words.length)[0];

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
      <div className="p-6 bg-gray-700/50">
        <h2 className="text-xl font-semibold text-white">Transcription Comparison</h2>
        <p className="text-sm text-gray-400 mt-1">
            {analysisResult ? 'AI analysis is complete. ' : ''}
            Double-click a word to edit. Click to play the audio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 p-6">
        <div className="hidden lg:block lg:col-span-1 space-y-1 h-[60vh] overflow-y-auto">
            <div className="font-bold text-lg text-gray-200 sticky top-0 bg-gray-800 py-2 border-b border-gray-700 mb-4">Time</div>
            {longestTranscript?.words.map((word, index) => {
                const showTimestamp = index === 0 || (index % 10 === 0);
                return (
                    showTimestamp && (
                        <div key={`ts-${index}`} className="py-0.5 h-[28px] flex items-center">
                           <button onClick={() => seekTo(word.start)} className="text-xs font-mono text-indigo-400 hover:text-indigo-300 hover:underline">
                               [{formatTimestamp(word.start)}]
                           </button>
                        </div>
                    )
                );
            })}
        </div>

        <div className={`lg:col-span-11 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${displayTranscripts.length} gap-6`}>
            {displayTranscripts.map(({ serviceId, words, status, error }) => {
                const { name, Icon } = getServiceInfo(serviceId);
                const isPreferredServiceForCurrentWord = analysisResult?.chunkAnalyses.find(chunk => 
                    Object.values(chunk.discrepancies).some(indices => indices?.includes(currentlyPlayingWordIndex ?? -1))
                )?.preferredServiceId === serviceId;

                return (
                <div key={serviceId} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 h-[60vh] overflow-y-auto relative">
                    <div className={`flex items-center space-x-2 mb-4 sticky top-0 bg-gray-900/80 backdrop-blur-sm py-2 -mt-4 -mx-4 px-4 z-10 border-b border-gray-700 transition-all duration-300
                    ${isPreferredServiceForCurrentWord ? 'shadow-[0_4px_14px_0_rgba(16,185,129,0.2)]' : ''}
                    `}>
                    <Icon className={`h-6 w-6 transition-colors ${isPreferredServiceForCurrentWord ? 'text-green-400' : 'text-indigo-400'}`} />
                    <h3 className={`font-bold text-lg transition-colors ${isPreferredServiceForCurrentWord ? 'text-green-300' : 'text-gray-200'}`}>{name}</h3>
                    </div>
                    {status === 'rejected' ? (
                        <div className="text-red-400 p-4 bg-red-900/30 rounded-md">
                            <p className="font-semibold">Transcription Failed</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    ) : (
                        <div className="text-gray-300 leading-relaxed">
                            {words.map((word, index) => {
                                const isEditing = editingCell?.serviceId === serviceId && editingCell?.wordIndex === index;
                                return (
                                <span key={`${serviceId}-${index}`} className="inline-block">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            defaultValue={word.text}
                                            autoFocus
                                            onBlur={(e) => handleWordUpdate(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleWordUpdate(e.currentTarget.value);
                                                if (e.key === 'Escape') setEditingCell(null);
                                            }}
                                            className="bg-indigo-900 text-white rounded-md px-1 py-0.5 w-24 outline-none ring-2 ring-indigo-400"
                                        />
                                    ) : (
                                        <span 
                                            onClick={() => playSegment(word.start, word.end)}
                                            onDoubleClick={() => setEditingCell({ serviceId, wordIndex: index })}
                                            className={`
                                                px-1.5 py-0.5 rounded-md cursor-pointer transition-all duration-200 group relative
                                                ${word.isEdited ? 'underline decoration-blue-500 decoration-2' : ''}
                                                ${index === currentlyPlayingWordIndex ? 'bg-blue-500/40 text-blue-200' :
                                                word.isPreferredByAI ? 'bg-green-500/30 text-green-300 hover:bg-green-500/40 ring-1 ring-green-600' : 
                                                word.isDiscrepancy ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/40 ring-1 ring-yellow-600' :
                                                'hover:bg-indigo-500/20 hover:text-indigo-300'}
                                            `}
                                            title={`Confidence: ${(word.confidence * 100).toFixed(0)}%`}
                                        >
                                            {word.text}
                                            <PlayIcon className="h-3 w-3 absolute top-0.5 right-0.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </span>
                                    )}
                                    {' '}
                                </span>
                            )})}
                        </div>
                    )}
                </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
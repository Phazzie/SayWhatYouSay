import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { AudioContext } from '../context/AudioContext';
import { SERVICES } from '../constants';
import { ServiceId } from '../types';

export const AnalysisSummary: React.FC = () => {
    const { analysisResult, transcripts } = useContext(AppContext);
    const { seekTo } = useContext(AudioContext);

    if (!analysisResult) {
        return (
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 h-full">
                <h3 className="text-xl font-semibold text-white mb-2">Analysis Summary</h3>
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <p>Run AI Analysis to see a breakdown of discrepancies and suggestions.</p>
                </div>
            </div>
        );
    }
    
    const transcriptMap = new Map(transcripts?.map(t => [t.serviceId, t]));
    const discrepancyChunks = analysisResult.chunkAnalyses.filter(c => c.preferredServiceId !== 'UNCLEAR');

    if (discrepancyChunks.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 h-full">
                <h3 className="text-xl font-semibold text-white mb-2">Analysis Summary</h3>
                 <div className="flex flex-col items-center justify-center h-full text-center text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold">No Discrepancies Found!</p>
                    <p className="text-sm text-gray-400">All models are in agreement.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 h-[85vh] flex flex-col">
            <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">Analysis Summary</h3>
                <p className="text-sm text-gray-400 mt-1">Found {discrepancyChunks.length} segments with discrepancies. Click to jump to audio.</p>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
                {discrepancyChunks.map((chunk, index) => {
                    const firstDiscrepancyIndex = Object.values(chunk.discrepancies)[0]?.[0];
                    const firstWord = transcriptMap.get(ServiceId.Whisper)?.words[firstDiscrepancyIndex ?? 0];

                    return (
                        <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <button onClick={() => firstWord && seekTo(firstWord.start)} className="text-left w-full">
                                <p className="text-xs font-mono text-indigo-400 hover:underline">Timestamp: ~{new Date((firstWord?.start ?? 0) * 1000).toISOString().substr(14, 5)}</p>
                                <div className="mt-2 text-sm space-y-1">
                                    {Object.entries(chunk.discrepancies).map(([serviceId, indices]) => {
                                        const service = SERVICES.find(s => s.id === serviceId);
                                        const transcript = transcriptMap.get(serviceId as ServiceId);
                                        if (!transcript || !indices || indices.length === 0) return null;

                                        const text = indices.map(i => transcript.words[i]?.text).join(' ');
                                        const isPreferred = chunk.preferredServiceId === serviceId;

                                        return (
                                            <div key={serviceId} className={`flex items-start ${isPreferred ? 'text-green-300' : 'text-gray-400'}`}>
                                                <span className="font-semibold w-28 shrink-0">{service?.name}:</span>
                                                <span className="font-mono bg-gray-700/50 px-1 rounded">{text}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-700/50">
                                    <p className="text-xs font-semibold text-gray-400">AI Reasoning:</p>
                                    <p className="text-sm text-gray-300 italic">"{chunk.reasoning}"</p>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

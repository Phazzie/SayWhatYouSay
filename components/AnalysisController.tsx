import React, { useContext } from 'react';
import { AnalysisModelId } from '../types';
import { ANALYSIS_PROVIDERS } from '../constants';
import { AppContext } from '../context/AppContext';
import { useAnalysis } from '../hooks/useAnalysis';

export const AnalysisController: React.FC = () => {
    const { apiKeys, analysisProvider, setAnalysisProvider, isAnalyzing } = useContext(AppContext);
    const { analyze } = useAnalysis();

    const isOpenAiDisabled = !apiKeys.whisper?.trim();
    const isGeminiDisabled = !apiKeys.gemini?.trim();

    const canAnalyze = (analysisProvider === AnalysisModelId.OpenAI && !isOpenAiDisabled) || (analysisProvider === AnalysisModelId.Gemini && !isGeminiDisabled);

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 space-y-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div>
                    <h3 className="text-xl font-semibold text-white">AI-Powered Analysis</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        Use a powerful language model to analyze discrepancies and suggest the most accurate transcript.
                    </p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    {ANALYSIS_PROVIDERS.map(({ id, name, Icon }) => {
                        const isDisabled = id === AnalysisModelId.OpenAI ? isOpenAiDisabled : isGeminiDisabled;
                        return (
                            <label 
                                key={id}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-md cursor-pointer transition-colors border ${
                                    analysisProvider === id
                                        ? 'bg-indigo-600/30 border-indigo-500'
                                        : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={isDisabled ? `${name} API key not provided` : `Analyze with ${name}`}
                            >
                                <input
                                    type="radio"
                                    name="analysis-provider"
                                    value={id}
                                    checked={analysisProvider === id}
                                    onChange={() => !isDisabled && setAnalysisProvider(id)}
                                    className="hidden"
                                    disabled={isDisabled}
                                />
                                <Icon className="h-5 w-5 text-gray-300" />
                                <span className="font-medium text-gray-200">{name}</span>
                            </label>
                        )}
                    )}
                </div>
            </div>
            <div className="flex flex-col items-center pt-2">
                <button
                    onClick={analyze}
                    disabled={!canAnalyze || isAnalyzing}
                    className="w-full md:w-1/2 lg:w-1/3 px-8 py-3 text-lg font-semibold text-white bg-green-600 rounded-md shadow-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                    {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                </button>
                {!canAnalyze && !isAnalyzing && (
                    <p className="text-center text-sm text-yellow-400 pt-2">
                        Please provide an API key for the selected analysis model to proceed.
                    </p>
                )}
            </div>
        </div>
    );
};

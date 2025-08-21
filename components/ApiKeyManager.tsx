import React, { useState, useContext } from 'react';
import { ApiKeySet } from '../types';
import { SERVICES, ANALYSIS_PROVIDERS } from '../constants';
import { AppContext } from '../context/AppContext';

export const ApiKeyManager: React.FC = () => {
  const { apiKeys, setApiKeys } = useContext(AppContext);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (serviceId: keyof ApiKeySet, value: string) => {
    setApiKeys(prev => ({ ...prev, [serviceId]: value }));
  };
  
  const filledTranscriptionKeys = SERVICES.filter(s => apiKeys[s.id].trim() !== '').length;
  const filledAnalysisKeys = (apiKeys.whisper ? 1 : 0) + (apiKeys.gemini ? 1 : 0);

  const GeminiIcon = ANALYSIS_PROVIDERS[1].Icon;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
      <button 
        className="w-full px-6 py-4 text-left flex justify-between items-center bg-gray-700/50 hover:bg-gray-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-white">API Configuration</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${filledTranscriptionKeys > 1 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                  {filledTranscriptionKeys} / {SERVICES.length} Transcription Keys
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${filledAnalysisKeys > 0 ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>
                  {filledAnalysisKeys} / 2 Analysis Keys
              </span>
            </div>
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-6 w-6 text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Transcription Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.map(({ id, name, Icon }) => (
                <div key={id}>
                <label htmlFor={`${id}-key`} className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                    <Icon className="h-5 w-5" />
                    <span>{name}</span>
                </label>
                <input
                    id={`${id}-key`}
                    type="password"
                    value={apiKeys[id]}
                    onChange={(e) => handleChange(id, e.target.value)}
                    placeholder={`Enter your ${name} API key`}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-500"
                />
                </div>
            ))}
            </div>
        </div>
        <div className="p-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-1">AI Analysis Models</h3>
            <p className="text-sm text-gray-400 mb-4">Provide keys for AI models to analyze and determine the most accurate transcript. The OpenAI Whisper key is reused for OpenAI analysis.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="gemini-key" className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                        <GeminiIcon className="h-5 w-5" />
                        <span>{ANALYSIS_PROVIDERS[1].name}</span>
                    </label>
                    <input
                        id="gemini-key"
                        type="password"
                        value={apiKeys.gemini}
                        onChange={(e) => handleChange('gemini', e.target.value)}
                        placeholder={`Enter your Google Gemini API key`}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-500"
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
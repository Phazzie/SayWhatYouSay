'use client';

import React, { createContext, useState, useMemo, useEffect } from 'react';
import { AppContextType, AppState, ApiKeySet, Transcript, AnalysisModelId, AnalysisResult, ServiceId } from '../types';

const defaultState: AppState = {
  apiKeys: {
    [ServiceId.Whisper]: '',
    [ServiceId.Google]: '',
    [ServiceId.AssemblyAI]: '',
    [ServiceId.ElevenLabs]: '',
    gemini: '',
  },
  transcripts: null,
  editedTranscripts: null,
  isTranscribing: false,
  isAnalyzing: false,
  analysisProvider: AnalysisModelId.OpenAI,
  analysisResult: null,
  error: null,
};

const LOCAL_STORAGE_KEY = 'saywhat-apikeys';

const getInitialApiKeys = (): ApiKeySet => {
    try {
        const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (item) {
            return { ...defaultState.apiKeys, ...JSON.parse(item) };
        }
    } catch (error) {
        console.warn("Could not parse API keys from localStorage", error);
    }
    return defaultState.apiKeys;
};


export const AppContext = createContext<AppContextType>({
  ...defaultState,
  setApiKeys: () => {},
  setTranscripts: () => {},
  setEditedTranscripts: () => {},
  setIsTranscribing: () => {},
  setIsAnalyzing: () => {},
  setAnalysisProvider: () => {},
  setAnalysisResult: () => {},
  setError: () => {},
  clearResults: () => {},
  updateWord: () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeySet>(getInitialApiKeys);
  const [transcripts, setTranscripts] = useState<Transcript[] | null>(defaultState.transcripts);
  const [editedTranscripts, setEditedTranscripts] = useState<Transcript[] | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(defaultState.isTranscribing);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(defaultState.isAnalyzing);
  const [analysisProvider, setAnalysisProvider] = useState<AnalysisModelId>(defaultState.analysisProvider);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(defaultState.analysisResult);
  const [error, setError] = useState<string | null>(defaultState.error);

  // Persist API keys to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apiKeys));
    } catch (error) {
      console.warn("Could not save API keys to localStorage", error);
    }
  }, [apiKeys]);
  
  // When new transcripts arrive, clear any old edits
  useEffect(() => {
    if (transcripts) {
      setEditedTranscripts(JSON.parse(JSON.stringify(transcripts)));
    } else {
      setEditedTranscripts(null);
    }
  }, [transcripts]);

  const clearResults = () => {
    setTranscripts(null);
    setEditedTranscripts(null);
    setAnalysisResult(null);
    setError(null);
  };

  const updateWord = (serviceId: ServiceId, wordIndex: number, newText: string) => {
    setEditedTranscripts(prev => {
        if (!prev) return null;
        const newTranscripts = JSON.parse(JSON.stringify(prev)) as Transcript[];
        const targetTranscript = newTranscripts.find(t => t.serviceId === serviceId);
        if (targetTranscript && targetTranscript.words[wordIndex]) {
            targetTranscript.words[wordIndex].text = newText;
            targetTranscript.words[wordIndex].isEdited = true;
        }
        return newTranscripts;
    });
  };

  const contextValue = useMemo(() => ({
    apiKeys, setApiKeys,
    transcripts, setTranscripts,
    editedTranscripts, setEditedTranscripts,
    isTranscribing, setIsTranscribing,
    isAnalyzing, setIsAnalyzing,
    analysisProvider, setAnalysisProvider,
    analysisResult, setAnalysisResult,
    error, setError,
    clearResults,
    updateWord,
  }), [apiKeys, transcripts, editedTranscripts, isTranscribing, isAnalyzing, analysisProvider, analysisResult, error]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
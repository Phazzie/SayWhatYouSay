
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Polyglot <span className="text-indigo-400">Transcribe-X</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Multi-AI Transcription & Discrepancy Analysis</p>
      </div>
    </header>
  );
};

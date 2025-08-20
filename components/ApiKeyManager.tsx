
import React, { useState } from 'react';
import { ApiKeySet, ServiceId } from '../types';
import { SERVICES } from '../constants';

interface ApiKeyManagerProps {
  apiKeys: ApiKeySet;
  setApiKeys: React.Dispatch<React.SetStateAction<ApiKeySet>>;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ apiKeys, setApiKeys }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (serviceId: ServiceId, value: string) => {
    setApiKeys(prev => ({ ...prev, [serviceId]: value }));
  };
  
  const filledKeys = Object.values(apiKeys).filter(key => key.trim() !== '').length;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
      <button 
        className="w-full px-6 py-4 text-left flex justify-between items-center bg-gray-700/50 hover:bg-gray-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-white">AI Service Configuration</h2>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${filledKeys > 0 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                {filledKeys} / {SERVICES.length} Keys Provided
            </span>
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-6 w-6 text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
      )}
    </div>
  );
};

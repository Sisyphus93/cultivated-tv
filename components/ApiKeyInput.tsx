import React, { useState } from 'react';
import { Key, ArrowRight, Loader2 } from 'lucide-react';

interface ApiKeyInputProps {
  onSetKey: (key: string) => void;
  error?: string | null;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSetKey, error }) => {
  const [inputVal, setInputVal] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = inputVal.trim();
    if (key.length === 0) return;

    setIsValidating(true);
    setValidationError(null);

    try {
      // Validate Key via lightweight API call
      const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${key}`);
      
      if (response.ok) {
        onSetKey(key);
      } else {
        setValidationError('Invalid API Key. Please check your credentials.');
        setIsValidating(false);
      }
    } catch (e) {
      setValidationError('Network error. Failed to validate key.');
      setIsValidating(false);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] px-4">
      <div className="max-w-md w-full animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light tracking-tighter text-white mb-2">CULTIVATED TV</h1>
          <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">
            Access Requires TMDb Credentials
          </p>
        </div>

        <div className="bg-[#111] border border-gray-800 p-8 rounded-sm shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-mono uppercase tracking-widest flex items-center gap-2">
                <Key size={12} /> Enter API Key
              </label>
              <input 
                type="text" 
                value={inputVal}
                onChange={(e) => {
                    setInputVal(e.target.value);
                    if (validationError) setValidationError(null);
                }}
                placeholder="tmdb_api_key_..."
                className="w-full bg-black border border-gray-700 text-white p-3 font-mono text-sm focus:outline-none focus:border-white transition-colors placeholder-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
                disabled={isValidating}
              />
              {displayError && (
                <p className="text-red-500 text-xs font-mono mt-2 animate-fade-in">{displayError}</p>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={isValidating || inputVal.trim().length === 0}
              className="group bg-white text-black py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              {isValidating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Verifying...
                  </>
              ) : (
                  <>
                    Enter System
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a 
              href="https://www.themoviedb.org/settings/api" 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] text-gray-600 uppercase border-b border-gray-800 hover:text-gray-400 hover:border-gray-600 transition-all pb-0.5"
            >
              Don't have a key? Get one here.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
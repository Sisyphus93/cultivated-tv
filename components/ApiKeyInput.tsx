import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Sparkles } from 'lucide-react';

interface ApiKeyInputProps {
  onSetKey: (key: string) => void;
  onEnterDemo: () => void;
  error?: string | null;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSetKey, onEnterDemo, error }) => {
  const [inputVal, setInputVal] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const key = inputVal.trim();
    if (key.length === 0) return;

    setIsValidating(true);
    setValidationError(null);

    try {
      // Validate the key with a lightweight call before storing it
      const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${key}`);

      if (response.ok) {
        onSetKey(key);
      } else {
        setValidationError('That key was rejected by TMDb. Please check it and try again.');
        setIsValidating(false);
      }
    } catch (e) {
      setValidationError('Network error — the key could not be validated.');
      setIsValidating(false);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[240px] overflow-hidden rounded-b-[28px] bg-[#22261F]">
        <img
          src="/hero-forest.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-paper" />
      </div>

      <div className="relative w-full max-w-[460px] animate-fade-in-up">
        <div className="text-center">
          <h1 className="font-display text-[24px] tracking-[0.22em] text-ink md:text-[26px]">
            CULTIVATED TV
          </h1>
          <p className="mt-3 text-[8.5px] uppercase tracking-[0.42em] text-muted">
            Stories worth your time
          </p>
        </div>

        <div className="mt-10 rounded-[20px] border border-line bg-surface p-8 shadow-card">
          <h2 className="font-display text-[26px] leading-tight text-ink">
            A private door to great television.
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            Cultivated TV runs entirely in your browser. Add your own TMDb key — it is stored on this
            device and never sent anywhere else.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-3">
            <label className="block text-[9.5px] uppercase tracking-[0.26em] text-faint">
              TMDb API key
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-paper px-4 transition-colors focus-within:border-line-strong">
              <KeyRound size={14} className="text-faint" />
              <input
                type={revealed ? 'text' : 'password'}
                value={inputVal}
                onChange={(event) => {
                  setInputVal(event.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Paste your key…"
                autoFocus
                disabled={isValidating}
                className="h-11 w-full bg-transparent text-[13px] text-ink placeholder:text-faint focus:outline-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setRevealed((prev) => !prev)}
                aria-label={revealed ? 'Hide key' : 'Show key'}
                className="shrink-0 text-faint transition-colors hover:text-ink"
              >
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {displayError && (
              <p className="animate-fade-in text-[12px] leading-relaxed text-negative">{displayError}</p>
            )}

            <button
              type="submit"
              disabled={isValidating || inputVal.trim().length === 0}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[10.5px] font-bold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-[#2C2A26] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Verifying
                </>
              ) : (
                <>
                  Enter
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[9.5px] uppercase tracking-[0.26em] text-faint">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={onEnterDemo}
            disabled={isValidating}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line text-[10.5px] font-bold uppercase tracking-[0.2em] text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink disabled:opacity-50"
          >
            <Sparkles size={13} className="text-gold" />
            Try the demo key
          </button>

          <div className="mt-7 border-t border-line pt-5 text-center">
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-muted underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-line-strong"
            >
              Don't have a key? Get one here.
            </a>
          </div>
        </div>

        <p className="mt-7 text-center text-[9.5px] uppercase tracking-[0.26em] text-faint">
          Powered by TMDb · Client-side only
        </p>
      </div>
    </div>
  );
};

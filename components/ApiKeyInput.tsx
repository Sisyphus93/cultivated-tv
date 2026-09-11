import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Grain } from './Grain';
import { Marginalia } from './Marginalia';
import { dateline, toRoman } from '../utils/editorial';

interface ApiKeyInputProps {
  onSetKey: (key: string) => void;
  onEnterDemo: () => void;
  error?: string | null;
}

/**
 * The reader's pass. The archive is client-side only: your TMDb key never
 * leaves the browser, and we say so on the card.
 */
export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSetKey, onEnterDemo, error }) => {
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
      const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${key}`);
      if (response.ok) {
        onSetKey(key);
      } else {
        setValidationError('That key was not accepted. Check it against TMDb and try again.');
        setIsValidating(false);
      }
    } catch (err) {
      setValidationError('Could not reach the archive. Check the connection.');
      setIsValidating(false);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-[var(--margin)] py-16">
      <Grain />

      <div className="animate-rise w-full max-w-[620px]">
        <Marginalia as="p" className="mb-8">
          Issue No. {toRoman(14)} · {dateline('Berlin')}
        </Marginalia>

        <h1 className="font-display display-wonk text-[clamp(3rem,9vw,5rem)] font-light italic leading-[0.9] tracking-tighter2 text-ink">
          Cabinet
        </h1>

        <p className="mt-3 font-display text-[19px] italic leading-snug text-ink/72">
          A TV series discovery journal. Not a streaming service — a reading room with screens.
        </p>

        <span aria-hidden="true" className="ink-rule my-8 block" />

        <form onSubmit={handleSubmit} className="page-edge bg-paper p-8">
          <Marginalia as="p" className="mb-4 text-rustdeep">
            Reader&rsquo;s pass
          </Marginalia>

          <p className="mb-6 measure text-[15px] leading-relaxed text-ink/72">
            The archive is held by TMDb and the key is yours. This page is client-side
            only: what you type below is stored in your own browser and sent to TMDb
            alone — never to us, never to anyone else.
          </p>

          <label htmlFor="tmdb-key" className="label-caps mb-2 block text-ink/72">
            TMDb API key
          </label>
          <input
            id="tmdb-key"
            type="text"
            value={inputVal}
            onChange={e => {
              setInputVal(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="32 characters, as issued by TMDb"
            className="field w-full font-mono text-sm text-ink"
            autoFocus
            disabled={isValidating}
            autoComplete="off"
            spellCheck={false}
          />

          {displayError ? (
            <p role="alert" className="animate-fade-in mt-3 text-[13px] text-rustdeep">
              {displayError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isValidating || inputVal.trim().length === 0}
            className="btn-ink mt-6"
          >
            {isValidating ? (
              <>
                <Loader2 size={11} className="animate-spin" />
                Checking the pass
              </>
            ) : (
              <>
                Enter the reading room
                <ArrowRight size={11} />
              </>
            )}
          </button>

          <div className="mt-6 flex items-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-ink/15" />
            <span className="label-caps text-ink/62">or</span>
            <span aria-hidden="true" className="h-px flex-1 bg-ink/15" />
          </div>

          <button type="button" onClick={onEnterDemo} disabled={isValidating} className="btn-rule mt-6 w-full justify-center">
            Read a sample issue
          </button>

          <div className="mt-8 border-t border-ink/12 pt-5">
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noreferrer"
              className="label-caps hand-underline inline-block text-ink/72 transition-colors duration-[180ms] ease-cabinet hover:text-ink"
            >
              No key yet? TMDb issues them free
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

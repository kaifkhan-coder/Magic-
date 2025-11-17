
import React, { useState, useRef, useEffect } from 'react';
import type { AiAction } from '../types';
import { SparklesIcon } from './icons';

interface ToolbarProps {
  rect: DOMRect;
  onAction: (action: AiAction, customPrompt?: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ rect, onAction }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCustomInput) {
      inputRef.current?.focus();
    }
  }, [showCustomInput]);
  
  const handleCustomSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (customPrompt.trim()) {
          onAction('custom', customPrompt);
          setCustomPrompt('');
          setShowCustomInput(false);
      }
  };

  const top = window.scrollY + rect.top - 50;
  const left = window.scrollX + rect.left + rect.width / 2;

  const actions: { label: string; action: AiAction }[] = [
    { label: 'Improve', action: 'improve' },
    { label: 'Shorten', action: 'shorten' },
    { label: 'Expand', action: 'expand' },
    { label: 'Fix Spelling & Grammar', action: 'fix' },
  ];

  return (
    <div
      className="absolute z-10 flex items-center bg-gray-800 border border-gray-700 rounded-lg shadow-2xl transition-opacity"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {!showCustomInput ? (
        <>
          <button
            onClick={() => onAction('improve')}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-purple-300 hover:bg-gray-700 rounded-l-md"
          >
            <SparklesIcon className="w-4 h-4" />
            Improve
          </button>
          <div className="h-4 w-px bg-gray-600" />
          {actions.slice(1).map(({ label, action }) => (
            <React.Fragment key={action}>
              <button
                onClick={() => onAction(action)}
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
              >
                {label}
              </button>
              <div className="h-4 w-px bg-gray-600" />
            </React.Fragment>
          ))}
          <button
            onClick={() => setShowCustomInput(true)}
            className="px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-r-md"
          >
            ...
          </button>
        </>
      ) : (
        <form onSubmit={handleCustomSubmit} className="flex p-1">
          <input
            ref={inputRef}
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Tell AI what to do..."
            className="bg-gray-700 text-white px-2 py-1 text-sm rounded-l-md focus:outline-none focus:ring-1 focus:ring-purple-500 w-64"
          />
          <button type="submit" className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-r-md hover:bg-purple-700">
            Go
          </button>
        </form>
      )}
    </div>
  );
};

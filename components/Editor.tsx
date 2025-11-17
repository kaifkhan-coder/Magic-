
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import type { Suggestion } from '../types';

interface EditorProps {
  content: string;
  suggestions: Suggestion[];
  onContentChange: (newContent: string) => void;
  onSelectText: (text: string, rect: DOMRect) => void;
  onAcceptSuggestion: (suggestionId: string) => void;
  onRejectSuggestion: (suggestionId: string) => void;
}

// Helper to escape regex special characters
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
};

export const Editor: React.FC<EditorProps> = ({ content, suggestions, onContentChange, onSelectText, onAcceptSuggestion, onRejectSuggestion }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      onSelectText(selection.toString(), rect);
    } else {
        onSelectText('', new DOMRect());
    }
  }, [onSelectText]);

  const renderedContent = useMemo(() => {
    let html = content.replace(/\n/g, '<br>');
    suggestions.forEach(suggestion => {
        const originalTextRegex = new RegExp(escapeRegExp(suggestion.find), 'g');
        html = html.replace(originalTextRegex, 
            `<span class="suggestion-wrapper relative bg-blue-500 bg-opacity-20 rounded p-px" data-suggestion-id="${suggestion.id}">
                ${suggestion.find}
                <div class="suggestion-tooltip absolute bottom-full mb-2 w-72 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 z-20 opacity-0 pointer-events-none transition-opacity">
                    <p class="text-sm text-gray-300 font-sans">${suggestion.reason}</p>
                    <p class="mt-2 text-sm bg-gray-900 p-2 rounded-md font-serif text-blue-300">${suggestion.replaceWith}</p>
                    <div class="flex gap-2 mt-3">
                        <button class="accept-suggestion-btn text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded" data-suggestion-id="${suggestion.id}">Accept</button>
                        <button class="reject-suggestion-btn text-xs bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded" data-suggestion-id="${suggestion.id}">Reject</button>
                    </div>
                </div>
            </span>`
        );
    });
    return html;
  }, [content, suggestions]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== renderedContent) {
        editorRef.current.innerHTML = renderedContent;
    }
  }, [renderedContent]);
  
  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
      const newText = (e.target as HTMLDivElement).innerText;
      onContentChange(newText);
  }, [onContentChange]);
  
  useEffect(() => {
      const handleClick = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          const suggestionId = target.dataset.suggestionId;
          if (!suggestionId) return;

          if (target.classList.contains('accept-suggestion-btn')) {
              onAcceptSuggestion(suggestionId);
          } else if (target.classList.contains('reject-suggestion-btn')) {
              onRejectSuggestion(suggestionId);
          }
      };

      const editor = editorRef.current;
      editor?.addEventListener('click', handleClick);
      return () => editor?.removeEventListener('click', handleClick);
  }, [onAcceptSuggestion, onRejectSuggestion]);


  return (
    <div className="relative">
      <style>{`
          .suggestion-wrapper:hover .suggestion-tooltip {
              opacity: 1;
              pointer-events: auto;
          }
      `}</style>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleMouseUp}
        className="editor-serif w-full max-w-3xl mx-auto p-8 prose prose-invert prose-lg min-h-screen focus:outline-none bg-gray-900"
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

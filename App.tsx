
import React, { useState, useEffect, useCallback } from 'react';
import { generateInitialContent, iterateOnSelection, getProactiveSuggestions } from './services/geminiService';
import { Editor } from './components/Editor';
import { InitialPrompt } from './components/InitialPrompt';
import { Toolbar } from './components/Toolbar';
import { Spinner } from './components/icons';
import { useDebounce } from './hooks/useDebounce';
import type { FileAttachment, Suggestion, AiAction, SelectionInfo } from './types';

const App: React.FC = () => {
  const [documentContent, setDocumentContent] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isIterating, setIsIterating] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);

  const debouncedContent = useDebounce(documentContent, 2000);

  const handleGenerate = async (prompt: string, files: FileAttachment[]) => {
    setIsLoading(true);
    setDocumentContent('');
    const content = await generateInitialContent(prompt, files);
    setDocumentContent(content);
    setIsLoading(false);
  };

  const handleSelection = useCallback((text: string, rect: DOMRect) => {
    if (text) {
        setSelection({ text, rect });
    } else {
        setSelection(null);
    }
  }, []);

  const handleToolbarAction = async (action: AiAction, customPrompt?: string) => {
    if (!selection || !selection.text) return;

    setIsIterating(true);
    const instruction = action === 'custom' ? customPrompt : `Please ${action} this text.`;
    if (!instruction) {
        setIsIterating(false);
        return;
    }
    
    const newText = await iterateOnSelection(selection.text, instruction);
    
    setDocumentContent(prev => prev.replace(selection.text, newText));
    setSelection(null); // Hide toolbar after action
    setIsIterating(false);
  };

  const handleAcceptSuggestion = (id: string) => {
      const suggestion = suggestions.find(s => s.id === id);
      if (suggestion) {
          setDocumentContent(prev => prev.replace(suggestion.find, suggestion.replaceWith));
          setSuggestions(prev => prev.filter(s => s.id !== id));
      }
  };

  const handleRejectSuggestion = (id: string) => {
      setSuggestions(prev => prev.filter(s => s.id !== id));
  };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestions = useCallback(async (content: string) => {
      if (!content || isSuggesting) return;
      setIsSuggesting(true);
      try {
          const newSuggestionData = await getProactiveSuggestions(content);
          const newSuggestions = newSuggestionData
              .filter(s => content.includes(s.find)) // Only keep suggestions if original text still exists
              .filter(s => !suggestions.some(ex => ex.find === s.find)) // Avoid duplicate suggestions
              .map(s => ({ ...s, id: Math.random().toString(36).substr(2, 9) }));
          
          if(newSuggestions.length > 0) {
              setSuggestions(prev => [...prev, ...newSuggestions]);
          }
      } finally {
          setIsSuggesting(false);
      }
  }, [isSuggesting, suggestions]);
  
  useEffect(() => {
    if (debouncedContent) {
        fetchSuggestions(debouncedContent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent]);


  if (!documentContent && !isLoading) {
    return <InitialPrompt onGenerate={handleGenerate} isLoading={isLoading} />;
  }

  return (
    <main className="min-h-screen text-gray-300">
        {(isIterating || isSuggesting) && (
            <div className="fixed top-4 right-4 z-20 bg-gray-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                <Spinner className="w-4 h-4" />
                <span>AI is thinking...</span>
            </div>
        )}
        {selection?.text && <Toolbar rect={selection.rect} onAction={handleToolbarAction} />}
        <Editor 
            content={documentContent}
            suggestions={suggestions}
            onContentChange={setDocumentContent}
            onSelectText={handleSelection}
            onAcceptSuggestion={handleAcceptSuggestion}
            onRejectSuggestion={handleRejectSuggestion}
        />
    </main>
  );
};

export default App;

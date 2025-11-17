
import React, { useState, useCallback } from 'react';
import type { FileAttachment } from '../types';
import { SparklesIcon, UploadIcon, Spinner } from './icons';

interface InitialPromptProps {
  onGenerate: (prompt: string, files: FileAttachment[]) => void;
  isLoading: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

export const InitialPrompt: React.FC<InitialPromptProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles: FileAttachment[] = [];
    for (const file of Array.from(selectedFiles)) {
      const base64 = await fileToBase64(file);
      newFiles.push({ name: file.name, type: file.type, base64 });
    }
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };


  return (
    <div className="fixed inset-0 bg-gray-900 z-10 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl mx-auto flex flex-col gap-6"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center">
            <SparklesIcon className="w-12 h-12 text-purple-400 mx-auto mb-2" />
            <h1 className="text-4xl font-bold text-gray-100">Magic Write</h1>
            <p className="text-gray-400 mt-2">Start with a prompt and let your AI partner build the first draft.</p>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Write a blog post about the future of renewable energy..."
          className="w-full h-32 p-4 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
          disabled={isLoading}
        />

        <div className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? 'border-purple-500 bg-gray-800' : 'border-gray-700'}`}>
            <UploadIcon className="mx-auto h-10 w-10 text-gray-500" />
            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-purple-400 hover:text-purple-300">
                <span>Upload files</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={(e) => handleFileChange(e.target.files)} />
            </label>
            <p className="pl-1 text-gray-500">or drag and drop</p>
            {files.length > 0 && (
                <div className="mt-4 text-sm text-gray-400 flex flex-wrap gap-2 justify-center">
                    {files.map(f => <span key={f.name} className="bg-gray-700 px-2 py-1 rounded-md">{f.name}</span>)}
                </div>
            )}
        </div>

        <button
          onClick={() => onGenerate(prompt, files)}
          disabled={!prompt || isLoading}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <><Spinner className="w-5 h-5" /> Generating...</> : 'Start Writing'}
        </button>
      </div>
    </div>
  );
};


import React from 'react';

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, onRemove }) => {
  return (
    <div className="relative group w-full max-w-lg mx-auto animate-fade-in">
      <img src={imageUrl} alt="Preview" className="w-full h-auto rounded-lg shadow-lg object-contain max-h-[400px]" />
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

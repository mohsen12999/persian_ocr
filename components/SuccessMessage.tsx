import React from 'react';

interface SuccessMessageProps {
  title: string;
  message: string;
  onReset: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ title, message, onReset }) => {
  return (
    <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-5 rounded-lg relative animate-fade-in text-center shadow-lg" role="alert">
      <strong className="font-bold text-lg block">{title}</strong>
      <span className="block mt-1">{message}</span>
      <div className="mt-6">
        <button
          onClick={onReset}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-green-500/50"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

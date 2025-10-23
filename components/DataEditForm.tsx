import React from 'react';
import { ExtractedData } from '../types';

interface DataEditFormProps {
  data: ExtractedData;
  onDataChange: (rowIndex: number, colIndex: number, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const DataEditForm: React.FC<DataEditFormProps> = ({ data, onDataChange, onSubmit, onCancel, isSubmitting }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="w-full bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-2xl animate-fade-in">
      <h2 className="text-2xl font-semibold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Review and Edit Data
      </h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {data.rows.map((row, rowIndex) => (
          <fieldset key={rowIndex} className="border border-gray-600 rounded-lg p-4">
            <legend className="px-2 text-lg font-medium text-gray-300">Row {rowIndex + 1}</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.headers.map((header, colIndex) => (
                <div key={colIndex}>
                  <label htmlFor={`row-${rowIndex}-col-${colIndex}`} className="block text-sm font-medium text-gray-400 mb-1">
                    {header}
                  </label>
                  <input
                    type="text"
                    id={`row-${rowIndex}-col-${colIndex}`}
                    value={row[colIndex] || ''}
                    onChange={(e) => onDataChange(rowIndex, colIndex, e.target.value)}
                    dir="rtl"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
           <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex justify-center items-center bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-gray-500/50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            {isSubmitting ? 'Submitting...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

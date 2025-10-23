import React, { useState, useEffect } from 'react';

interface DataProcessingFormProps {
  headers: string[];
  currentRow: string[];
  currentRowIndex: number;
  totalRows: number;
  onSave: (dataTypes: string[]) => Promise<void>;
  onCancel: () => void;
}

export const DataProcessingForm: React.FC<DataProcessingFormProps> = ({
  headers,
  currentRow,
  currentRowIndex,
  totalRows,
  onSave,
  onCancel,
}) => {
  const [dataTypes, setDataTypes] = useState<string[]>(() => Array(headers.length).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the form when the current row changes
  useEffect(() => {
    setDataTypes(Array(headers.length).fill(''));
  }, [currentRowIndex, headers.length]);

  const handleDataTypeChange = (index: number, value: string) => {
    const newTypes = [...dataTypes];
    newTypes[index] = value;
    setDataTypes(newTypes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(dataTypes);
    } catch (error) {
      // Error is handled by the parent component, just need to stop loading state
      console.error("Submission failed for row", currentRowIndex, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-2xl animate-fade-in mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Process Row {currentRowIndex + 1} of {totalRows}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {headers.map((header, colIndex) => (
            <div key={colIndex} className="space-y-2">
              <label htmlFor={`dataType-${colIndex}`} className="block text-sm font-medium text-gray-400">
                {header}
              </label>
              <div className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-300 min-h-[42px] flex items-center" dir="rtl">
                {currentRow[colIndex] || <span className="text-gray-500 italic">empty</span>}
              </div>
              <input
                type="text"
                id={`dataType-${colIndex}`}
                placeholder="Enter data type..."
                value={dataTypes[colIndex]}
                onChange={(e) => handleDataTypeChange(colIndex, e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-700 mt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex justify-center items-center bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-gray-500/50"
          >
            Start Over
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            {isSubmitting ? 'Saving...' : 'Save and Process Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';

interface DataProcessingFormProps {
  headers: string[];
  currentRow: string[];
  currentRowIndex: number;
  totalRows: number;
  onSave: (dataTypes: string[], columnSelection: boolean[]) => Promise<void>;
  onSkip: (dataTypes: string[], columnSelection: boolean[]) => void;
  onCancel: () => void;
  initialDataTypes: string[];
  initialColumnSelection: boolean[];
}

const availableDataTypes = ['name', 'cow', 'sheep', 'goat'];

export const DataProcessingForm: React.FC<DataProcessingFormProps> = ({
  headers,
  currentRow,
  currentRowIndex,
  totalRows,
  onSave,
  onSkip,
  onCancel,
  initialDataTypes,
  initialColumnSelection,
}) => {
  const [dataTypes, setDataTypes] = useState<string[]>(() =>
    initialDataTypes.length === headers.length ? initialDataTypes : Array(headers.length).fill('')
  );
  const [columnSelection, setColumnSelection] = useState<boolean[]>(() =>
    initialColumnSelection.length === headers.length ? initialColumnSelection : Array(headers.length).fill(true)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When row changes, pre-fill with remembered types and selections
  useEffect(() => {
    setDataTypes(initialDataTypes.length === headers.length ? initialDataTypes : Array(headers.length).fill(''));
    setColumnSelection(initialColumnSelection.length === headers.length ? initialColumnSelection : Array(headers.length).fill(true));
  }, [currentRowIndex, headers.length, initialDataTypes, initialColumnSelection]);

  const handleDataTypeChange = (index: number, value: string) => {
    const newTypes = [...dataTypes];
    newTypes[index] = value;
    setDataTypes(newTypes);
  };

  const handleColumnSelectionChange = (index: number) => {
    const newSelection = [...columnSelection];
    newSelection[index] = !newSelection[index];
    setColumnSelection(newSelection);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(dataTypes, columnSelection);
    } catch (error) {
      // Error is handled by the parent component, just need to stop loading state
      console.error("Submission failed for row", currentRowIndex, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onSkip(dataTypes, columnSelection);
  };

  return (
    <div className="w-full bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-2xl animate-fade-in mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Process Row {currentRowIndex + 1} of {totalRows}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {headers.map((header, colIndex) => {
            const currentSelection = dataTypes[colIndex];
            
            return (
              <div key={colIndex} className="space-y-2 bg-gray-900/40 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor={`dataType-${colIndex}`} className="block text-sm font-medium text-gray-400">
                    {header}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`send-col-${colIndex}`}
                      checked={columnSelection[colIndex]}
                      onChange={() => handleColumnSelectionChange(colIndex)}
                      className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-600 cursor-pointer"
                    />
                    <label htmlFor={`send-col-${colIndex}`} className="ml-2 text-sm text-gray-300 cursor-pointer">
                      Send
                    </label>
                  </div>
                </div>

                <div className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-gray-300 min-h-[42px] flex items-center" dir="rtl">
                  {currentRow[colIndex] || <span className="text-gray-500 italic">empty</span>}
                </div>
                <select
                  id={`dataType-${colIndex}`}
                  value={currentSelection || ''}
                  onChange={(e) => handleDataTypeChange(colIndex, e.target.value)}
                  disabled={!columnSelection[colIndex]}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <option value="">Select a type...</option>
                  {availableDataTypes.map((type) => {
                    const isUsedElsewhere = dataTypes.includes(type) && currentSelection !== type;
                    return (
                      <option key={type} value={type} disabled={isUsedElsewhere}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
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
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full sm:w-auto flex justify-center items-center bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-yellow-500/50"
          >
            Skip Row
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
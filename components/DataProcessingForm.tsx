import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';

interface DataProcessingFormProps {
  headers: string[];
  currentRow: string[];
  users: User[];
  currentRowIndex: number;
  totalRows: number;
  onSave: (dataTypes: string[], columnSelection: boolean[], selectedUserId: number | null) => Promise<void>;
  onSkip: (dataTypes: string[], columnSelection: boolean[]) => void;
  onCancel: () => void;
  initialDataTypes: string[];
  initialColumnSelection: boolean[];
  isSaveError: boolean;
}

const availableDataTypes = ['name', 'cow', 'sheep', 'goat'];

// Levenshtein distance function
const levenshteinDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
};


export const DataProcessingForm: React.FC<DataProcessingFormProps> = ({
  headers,
  currentRow,
  users,
  currentRowIndex,
  totalRows,
  onSave,
  onSkip,
  onCancel,
  initialDataTypes,
  initialColumnSelection,
  isSaveError,
}) => {
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [columnSelection, setColumnSelection] = useState<boolean[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameColumnIndex = useMemo(() => dataTypes.findIndex(type => type === 'name'), [dataTypes]);

  // Effect to initialize or reset state when the row changes
  useEffect(() => {
    const newTypes = initialDataTypes.length === headers.length ? initialDataTypes : Array(headers.length).fill('');
    const newSelection = initialColumnSelection.length === headers.length ? initialColumnSelection : Array(headers.length).fill(true);
    setDataTypes(newTypes);
    setColumnSelection(newSelection);
    
    // Auto-select best user match for the new row
    const currentNameIndex = newTypes.findIndex(type => type === 'name');
    if (currentNameIndex !== -1 && users.length > 0) {
      const extractedName = currentRow[currentNameIndex];
      const sortedUsers = [...users].sort((a, b) => 
        levenshteinDistance(extractedName, a.name) - levenshteinDistance(extractedName, b.name)
      );
      setSelectedUser(sortedUsers[0]);
    } else {
      setSelectedUser(null);
    }
  }, [currentRowIndex, headers.length, initialDataTypes, initialColumnSelection, users, currentRow]);


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
      await onSave(dataTypes, columnSelection, selectedUser ? selectedUser.id : null);
    } catch (error) {
      // Error is handled by the parent, but we catch here to stop the submission spinner
      console.error("Submission failed for row", currentRowIndex, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onSkip(dataTypes, columnSelection);
  };
  
  const renderUserSelectionUI = (colIndex: number) => {
    if (dataTypes[colIndex] !== 'name') {
      return null;
    }
    
    const extractedName = currentRow[colIndex];
    const sortedUsers = [...users].sort((a, b) => 
        levenshteinDistance(extractedName, a.name) - levenshteinDistance(extractedName, b.name)
    );

    return (
      <div className="mt-2">
        <label className="text-xs font-semibold text-gray-400">Select Correct User (Sorted by best match)</label>
        <ul className="mt-1 max-h-32 overflow-y-auto bg-gray-900 rounded-md border border-gray-700">
          {sortedUsers.map(user => (
             <li key={user.id}>
              <button
                type="button"
                onClick={() => setSelectedUser(user)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                  selectedUser?.id === user.id 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {user.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
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
            const isNameColumn = colIndex === nameColumnIndex;
            const displayName = isNameColumn && selectedUser ? selectedUser.name : currentRow[colIndex];
            
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

                <div className={`w-full bg-gray-800 border rounded-md py-2 px-3 text-gray-300 min-h-[42px] flex items-center relative transition-colors ${isNameColumn ? 'border-blue-500' : 'border-gray-600'}`} dir="rtl">
                  {displayName || <span className="text-gray-500 italic">empty</span>}
                  {isNameColumn && selectedUser && (
                     <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full">
                       ID: {selectedUser.id}
                     </span>
                  )}
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
                {renderUserSelectionUI(colIndex)}
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
            {isSubmitting ? 'Saving...' : (isSaveError ? 'Retry Save' : 'Save and Process Next')}
          </button>
        </div>
      </form>
    </div>
  );
};

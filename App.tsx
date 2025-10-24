import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ImagePreview } from './components/ImagePreview';
import { DataTable } from './components/DataTable';
import { DataProcessingForm } from './components/DataProcessingForm';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { SuccessMessage } from './components/SuccessMessage';
import { extractDataFromImage } from './services/geminiService';
import { saveRowData } from './services/apiService';
import { fetchUsers } from './services/userService';
import { ExtractedData, User } from './types';

type AppState = 'upload' | 'review' | 'complete';

function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [dataTypeMemory, setDataTypeMemory] = useState<string[]>([]);
  const [columnSelectionMemory, setColumnSelectionMemory] = useState<boolean[]>([]);
  const [processingDate, setProcessingDate] = useState<string>('14040404');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetryableError, setIsRetryableError] = useState<boolean>(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userList = await fetchUsers();
        setUsers(userList);
      } catch (err) {
        setError("Could not load user data. Please refresh the page.");
      }
    };
    loadUsers();
  }, []);

  const resetState = useCallback(() => {
    setAppState('upload');
    setImageFile(null);
    setImageUrl(null);
    setExtractedData(null);
    setError(null);
    setIsLoading(false);
    setCurrentRowIndex(0);
    setDataTypeMemory([]);
    setColumnSelectionMemory([]);
    setIsRetryableError(false);
  }, []);
  
  const handleFileSelect = useCallback((file: File) => {
    resetState(); // Start fresh with a new file
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [resetState]);

  const handleProcessImage = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError(null);
    setIsRetryableError(false);
    setExtractedData(null);

    try {
      const result = await extractDataFromImage(imageFile);
      if (!result.rows || result.rows.length === 0) {
        setError("No data rows were extracted from the image. Please try another image.");
        return;
      }
      setExtractedData(result);
      setCurrentRowIndex(0);
      setAppState('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveAndNext = async (dataTypes: string[], columnSelection: boolean[], selectedUserId: number | null) => {
    if (!extractedData) return;

    setError(null);
    setIsRetryableError(false);
    const currentRow = extractedData.rows[currentRowIndex];
    
    // Filter data based on selection
    const filteredRow = currentRow.filter((_, index) => columnSelection[index]);
    const filteredDataTypes = dataTypes.filter((_, index) => columnSelection[index]);
    
    // Create the payload and substitute name for user_id
    const payload: (string | number | null)[] = [...filteredRow];
    const nameTypeIndex = filteredDataTypes.findIndex(type => type === 'name');

    if (nameTypeIndex !== -1) {
      payload[nameTypeIndex] = selectedUserId; // Directly use the ID passed from the form
    }

    try {
      await saveRowData(payload, filteredDataTypes, processingDate);
      setDataTypeMemory(dataTypes); // Remember selections
      setColumnSelectionMemory(columnSelection); // Remember column selection
      
      const nextIndex = currentRowIndex + 1;
      if (nextIndex < extractedData.rows.length) {
        setCurrentRowIndex(nextIndex);
      } else {
        setAppState('complete');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
      setError(errorMessage);
      setIsRetryableError(true);
    }
  };

  const handleSkip = (dataTypes: string[], columnSelection: boolean[]) => {
    if (!extractedData) return;
    setError(null);
    setIsRetryableError(false);
    setDataTypeMemory(dataTypes); // Remember selections even when skipping
    setColumnSelectionMemory(columnSelection); // Remember column selection when skipping

    const nextIndex = currentRowIndex + 1;
    if (nextIndex < extractedData.rows.length) {
      setCurrentRowIndex(nextIndex);
    } else {
      setAppState('complete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Persian OCR Data Extractor
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Extract, review, and process handwritten data row-by-row.
          </p>
        </header>

        <main className="space-y-6">
          {appState === 'upload' && (
             <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-2xl">
                {!imageUrl ? (
                  <FileUpload onFileSelect={handleFileSelect} />
                ) : (
                  <div className="space-y-4">
                    <ImagePreview imageUrl={imageUrl} onRemove={resetState} />
                    <button
                      onClick={handleProcessImage}
                      disabled={isLoading}
                      className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                    >
                      {isLoading ? 'Processing...' : 'Extract Data'}
                    </button>
                  </div>
                )}
              </div>
          )}

          {isLoading && <Loader />}
          
          {error && <ErrorMessage message={error} />}

          {appState === 'review' && extractedData && (
             <div className="animate-fade-in">
              <DataTable data={extractedData} />
              <DataProcessingForm 
                headers={extractedData.headers}
                currentRow={extractedData.rows[currentRowIndex]}
                users={users}
                currentRowIndex={currentRowIndex}
                totalRows={extractedData.rows.length}
                onSave={handleSaveAndNext}
                onSkip={handleSkip}
                onCancel={resetState}
                initialDataTypes={dataTypeMemory}
                initialColumnSelection={columnSelectionMemory}
                processingDate={processingDate}
                onProcessingDateChange={setProcessingDate}
                isSaveError={isRetryableError}
              />
            </div>
          )}

          {appState === 'complete' && (
            <SuccessMessage 
              title="Processing Complete"
              message="All data rows have been successfully saved."
              onReset={resetState}
            />
          )}

        </main>
        
        <footer className="text-center mt-12 text-sm text-gray-500">
          <p>Powered by Gemini API</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
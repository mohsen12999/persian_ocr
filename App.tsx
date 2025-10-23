import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ImagePreview } from './components/ImagePreview';
import { DataTable } from './components/DataTable';
import { DataProcessingForm } from './components/DataProcessingForm';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { SuccessMessage } from './components/SuccessMessage';
import { extractDataFromImage } from './services/geminiService';
import { saveRowData } from './services/apiService';
import { ExtractedData } from './types';

type AppState = 'upload' | 'review' | 'complete';

function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setAppState('upload');
    setImageFile(null);
    setImageUrl(null);
    setExtractedData(null);
    setError(null);
    setIsLoading(false);
    setCurrentRowIndex(0);
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
  
  const handleSaveAndNext = async (dataTypes: string[]) => {
    if (!extractedData) return;

    setError(null);
    const currentRow = extractedData.rows[currentRowIndex];
    
    try {
      await saveRowData(currentRow, dataTypes);
      
      const nextIndex = currentRowIndex + 1;
      if (nextIndex < extractedData.rows.length) {
        setCurrentRowIndex(nextIndex);
      } else {
        setAppState('complete');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
      setError(errorMessage);
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
                currentRowIndex={currentRowIndex}
                totalRows={extractedData.rows.length}
                onSave={handleSaveAndNext}
                onCancel={resetState}
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


import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ImagePreview } from './components/ImagePreview';
import { DataTable } from './components/DataTable';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { extractDataFromImage } from './services/geminiService';
import { ExtractedData } from './types';

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setImageFile(null);
    setImageUrl(null);
    setExtractedData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    resetState();
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
      setExtractedData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Persian OCR Data Extractor
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Upload an image of handwritten Persian data to see it in a table.
          </p>
        </header>

        <main className="space-y-6">
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
                  {isLoading ? 'Processing...' : 'Extract Data from Image'}
                </button>
              </div>
            )}
          </div>

          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          
          {extractedData && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4 text-center">Extracted Data</h2>
              <DataTable data={extractedData} />
            </div>
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

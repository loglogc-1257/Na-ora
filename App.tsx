import React, { useState, useCallback, ChangeEvent, useRef } from 'react';
import { ImageFile, EditedImageResult } from './types';
import { toBase64, dataURLtoFile } from './utils/fileUtils';
import { cropImage } from './utils/imageUtils';
import { editImageWithNanoBanana, generateImageFromText } from './services/geminiService';
import { BananaIcon } from './components/icons/BananaIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { LoadingSpinner } from './components/LoadingSpinner';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { ZoomableImage } from './components/ZoomableImage';
import { MaskingEditor } from './components/MaskingEditor';
import { BrushIcon } from './components/icons/BrushIcon';
import { RedoIcon } from './components/icons/RedoIcon';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('Original');
  const [editedResult, setEditedResult] = useState<EditedImageResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const [isMaskingEditorOpen, setIsMaskingEditorOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setOriginalImage({
        file,
        dataUrl: URL.createObjectURL(file),
      });
      setEditedResult(null);
      setMaskDataUrl(null); // Reset mask on new image
      setError(null);
    }
  };

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = useCallback(async () => {
    if (!prompt) {
      setError('Please provide an editing or generation prompt.');
      return;
    }

    // Image Editing Mode
    if (originalImage) {
      setIsLoading(true);
      setError(null);
      setEditedResult(null);

      try {
        let fileToProcess = originalImage.file;
        if (aspectRatio !== 'Original') {
          fileToProcess = await cropImage(originalImage.file, aspectRatio);
        }
        
        const displayUrlForOriginal = URL.createObjectURL(fileToProcess);
        const base64Image = await toBase64(fileToProcess);
        
        let maskPayload;
        if (maskDataUrl) {
            const [meta, base64Mask] = maskDataUrl.split(',');
            const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/png';
            maskPayload = { base64Data: base64Mask, mimeType };
        }

        const result = await editImageWithNanoBanana(
          base64Image,
          fileToProcess.type,
          prompt,
          maskPayload
        );
        setEditedResult({ ...result, originalDataUrl: displayUrlForOriginal });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Text-to-Image Generation Mode
      setIsLoading(true);
      setError(null);
      setEditedResult(null);

      try {
        const result = await generateImageFromText(prompt);
        setEditedResult({ ...result, originalDataUrl: null }); // No original image
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  }, [originalImage, prompt, aspectRatio, maskDataUrl]);

  const handleDownload = useCallback(() => {
    if (!editedResult?.image) return;

    const link = document.createElement('a');
    link.href = editedResult.image;
    
    // Basic logic to get extension from mime type
    const mimeType = editedResult.image.split(';')[0].split(':')[1];
    const extension = mimeType.split('/')[1] || 'png';
    link.download = `edited-image.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [editedResult]);

  const handleUseAsInput = useCallback(async () => {
    if (!editedResult?.image) return;

    try {
      const filename = originalImage ? originalImage.file.name : 'generated-image.png';
      const newFile = await dataURLtoFile(editedResult.image, filename);
      
      setOriginalImage({
        file: newFile,
        dataUrl: editedResult.image,
      });
      
      setEditedResult(null);
      setMaskDataUrl(null);
      setError(null);
      
      headerRef.current?.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to use image as input.';
      setError(errorMessage);
      console.error(err);
    }
  }, [editedResult, originalImage]);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const isButtonDisabled = !prompt || isLoading;

  return (
    <>
      {isMaskingEditorOpen && originalImage && (
        <MaskingEditor
          imageUrl={originalImage.dataUrl}
          onSave={(newMask) => {
            setMaskDataUrl(newMask);
            setIsMaskingEditorOpen(false);
          }}
          onCancel={() => setIsMaskingEditorOpen(false)}
        />
      )}
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <header ref={headerRef} className="text-center mb-8">
            <div className="flex items-center justify-center gap-4">
              <BananaIcon className="w-12 h-12 text-amber-400" />
              <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
                Nano Banana Photo Editor
              </h1>
            </div>
            <p className="mt-2 text-lg text-gray-400">
              AI-powered image editing. Just upload a photo and describe your changes.
            </p>
          </header>

          <main className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Input Column */}
                <div className="space-y-4">
                  <div>
                    <label className="text-lg font-semibold text-gray-300 block mb-2">1. Upload Image</label>
                    <div 
                      onClick={triggerFileSelect} 
                      className="relative w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-colors bg-gray-900/50"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      {originalImage ? (
                        <img src={originalImage.dataUrl} alt="Preview" className="h-full w-full object-contain rounded-md p-1" />
                      ) : (
                        <div className="text-center text-gray-500">
                          <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                          <p>Click to upload or drag & drop</p>
                          <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                    </div>
                     {originalImage && (
                        <div className="mt-3 flex items-center justify-between bg-gray-900/50 p-2 rounded-lg">
                            {maskDataUrl ? (
                                <div className="flex items-center gap-3">
                                    <img src={maskDataUrl} alt="Mask preview" className="w-10 h-10 rounded-md border-2 border-amber-400 object-contain bg-gray-800" />
                                    <span className="text-sm font-medium text-green-400">Mask applied</span>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400 pl-2">Optional: Add a mask for precise edits.</span>
                            )}
                            <div className="flex items-center gap-2">
                                {maskDataUrl && (
                                    <button
                                        onClick={() => setMaskDataUrl(null)}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-red-800/80 text-white hover:bg-red-700"
                                    >
                                        Remove
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsMaskingEditorOpen(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors bg-sky-600 text-white hover:bg-sky-500"
                                >
                                    <BrushIcon className="w-4 h-4" />
                                    {maskDataUrl ? 'Edit Mask' : 'Add Mask'}
                                </button>
                            </div>
                        </div>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="prompt" className="text-lg font-semibold text-gray-300">2. Describe Your Edit</label>
                      <div className="relative">
                         <select
                           id="aspectRatio"
                           value={aspectRatio}
                           onChange={(e) => setAspectRatio(e.target.value)}
                           disabled={isLoading}
                           aria-label="Select aspect ratio"
                           className="bg-gray-900/70 border border-gray-600 rounded-lg text-gray-200 text-sm focus:ring-amber-500 focus:border-amber-500 pl-3 pr-8 py-1.5 appearance-none"
                         >
                           <option value="Original">Original</option>
                           <option value="1:1">1:1 (Square)</option>
                           <option value="16:9">16:9 (Widescreen)</option>
                           <option value="9:16">9:16 (Portrait)</option>
                           <option value="4:3">4:3 (Landscape)</option>
                           <option value="3:4">3:4 (Portrait)</option>
                         </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                           <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                         </div>
                       </div>
                    </div>
                    <textarea
                      id="prompt"
                      value={prompt}
                      onChange={handlePromptChange}
                      placeholder="e.g., 'make the cat wear a tiny wizard hat' or 'change the background to a surreal landscape'"
                      className="w-full h-32 p-3 bg-gray-900/70 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-gray-200 placeholder-gray-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Action Column */}
                <div className="flex flex-col items-center justify-center h-full space-y-4 pt-8 md:pt-0">
                   <button
                      onClick={handleSubmit}
                      disabled={isButtonDisabled}
                      className={`
                        w-full max-w-xs px-8 py-4 text-xl font-bold rounded-lg transition-all duration-300 ease-in-out
                        flex items-center justify-center gap-2
                        ${isButtonDisabled 
                          ? 'bg-gray-600 cursor-not-allowed text-gray-400' 
                          : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30'
                        }
                      `}
                    >
                      <SparklesIcon className="w-6 h-6" />
                      Generate
                    </button>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                </div>
              </div>
            </div>

            {isLoading && <LoadingSpinner />}
            
            {editedResult && (
              <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 animate-fade-in">
                <h2 className="text-2xl font-bold mb-4 text-center text-amber-300">Result</h2>
                <div className={`grid grid-cols-1 ${editedResult.originalDataUrl ? 'md:grid-cols-2' : ''} gap-6`}>
                  {editedResult.originalDataUrl && (
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2 text-gray-400">Original</h3>
                      <ZoomableImage src={editedResult.originalDataUrl} alt="Original" />
                    </div>
                  )}
                  <div className={`text-center ${!editedResult.originalDataUrl ? 'md:col-span-1' : ''}`}>
                    <div className="flex justify-center items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-400">Edited</h3>
                      <button
                        onClick={handleUseAsInput}
                        disabled={!editedResult?.image}
                        aria-label="Use this image as the new input"
                        title="Use as Input"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors bg-sky-600 text-white hover:bg-sky-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <RedoIcon className="w-4 h-4" />
                        Edit Again
                      </button>
                      <button
                        onClick={handleDownload}
                        disabled={!editedResult?.image}
                        aria-label="Download edited image"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors bg-teal-600 text-white hover:bg-teal-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                     {editedResult.image ? (
                       <div className="border-2 border-amber-400 rounded-lg shadow-md">
                          <ZoomableImage src={editedResult.image} alt="Edited" />
                       </div>
                     ) : (
                      <div className="w-full h-96 flex items-center justify-center bg-gray-900 rounded-lg">
                        <p className="text-gray-500">No image was generated.</p>
                      </div>
                     )}
                  </div>
                </div>
                {editedResult.text && (
                   <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <h4 className="font-semibold text-amber-300 mb-1">AI's Note:</h4>
                      <p className="text-gray-300 italic">"{editedResult.text}"</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default App;
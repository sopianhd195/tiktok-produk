
import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { ProductInput } from './components/ProductInput';
import { OptionSelector } from './components/OptionSelector';
import { ImageGrid } from './components/ImageGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { MODELS, VIBES } from './constants';
import { generateAffiliateImages } from './services/geminiService';
import type { Option } from './types';

const App: React.FC = () => {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageBase64, setProductImageBase64] = useState<string | null>(null);
  const [productDescription, setProductDescription] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<Option | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<Option | null>(null);

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (file: File | null, base64: string | null) => {
    setProductImage(file);
    setProductImageBase64(base64);
  };

  const isFormComplete = useMemo(() => {
    return productDescription.trim().length > 10 && selectedModel !== null && selectedVibe !== null;
  }, [productDescription, selectedModel, selectedVibe]);

  const handleGenerateClick = useCallback(async () => {
    if (!isFormComplete || !selectedModel || !selectedVibe) {
      setError('Please complete all steps before generating images.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    let prompt: string;
    if (productImageBase64) {
      prompt = `Using the product from the provided image, create a new scene. The scene must be a professional TikTok affiliate marketing photograph, ultra-realistic, with cinematic lighting. It must feature a ${selectedModel.prompt} showcasing the product. The overall atmosphere and style is ${selectedVibe.prompt}. The product from the image should be the main focus, seamlessly integrated, clearly visible, and appealing. Ensure the final image is in a vertical 9:16 aspect ratio, highly detailed, and 8k resolution.`;
    } else {
      prompt = `A professional TikTok affiliate marketing photograph, ultra-realistic, cinematic lighting. The image features a ${selectedModel.prompt} showcasing a ${productDescription}. The overall atmosphere and style is ${selectedVibe.prompt}. The product is the main focus, clearly visible and appealing. Shot in a vertical 9:16 aspect ratio. High detail, 8k resolution.`;
    }

    try {
      const images = await generateAffiliateImages(prompt, productImageBase64);
      setGeneratedImages(images);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while generating images.');
    } finally {
      setIsLoading(false);
    }
  }, [isFormComplete, productDescription, selectedModel, selectedVibe, productImageBase64]);

  const handleReset = () => {
    setProductImage(null);
    setProductImageBase64(null);
    setProductDescription('');
    setSelectedModel(null);
    setSelectedVibe(null);
    setGeneratedImages([]);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {generatedImages.length === 0 && !isLoading && (
          <div className="space-y-12">
            <ProductInput
              image={productImage}
              onImageChange={handleImageChange}
              description={productDescription}
              onDescriptionChange={setProductDescription}
            />
            <OptionSelector
              title="Step 2: Choose a Model"
              options={MODELS}
              selectedOption={selectedModel}
              onSelectOption={setSelectedModel}
              disabled={!productDescription}
            />
            <OptionSelector
              title="Step 3: Choose a Vibe"
              options={VIBES}
              selectedOption={selectedVibe}
              onSelectOption={setSelectedVibe}
              disabled={!selectedModel}
            />
            <div className="text-center pt-4">
              <button
                onClick={handleGenerateClick}
                disabled={!isFormComplete || isLoading}
                className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105"
              >
                <SparklesIcon className="w-6 h-6 mr-3" />
                Generate 6 Images
              </button>
            </div>
          </div>
        )}

        {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8">
                 <LoadingSpinner />
                 <h2 className="text-2xl font-bold mt-6 text-purple-400">Generating Your Content...</h2>
                 <p className="mt-2 text-gray-400 max-w-md">
                    {productImageBase64
                        ? "Our AI is carefully placing your product into new scenes. This might take a bit longer."
                        : "Our creative AI is warming up. This may take a moment."
                    }
                 </p>
            </div>
        )}

        {error && (
            <div className="text-center p-8 bg-red-900/50 border border-red-700 rounded-lg">
                <h3 className="text-xl font-bold text-red-400">An Error Occurred</h3>
                <p className="mt-2 text-red-300">{error}</p>
                <button
                    onClick={handleReset}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        )}

        {generatedImages.length > 0 && !isLoading && (
            <div>
                <ImageGrid images={generatedImages} />
                 <div className="text-center mt-12">
                    <button
                        onClick={handleReset}
                        className="px-8 py-3 bg-gray-700 text-white font-bold rounded-full hover:bg-gray-600 transition-colors"
                    >
                        Start Over
                    </button>
                </div>
            </div>
        )}
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;

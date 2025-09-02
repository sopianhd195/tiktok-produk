
import React, { useState, useCallback, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ProductInputProps {
  image: File | null;
  onImageChange: (file: File | null, base64: string | null) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


export const ProductInput: React.FC<ProductInputProps> = ({ image, onImageChange, description, onDescriptionChange }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Keep imageUrl in sync with parent component's image prop
  useEffect(() => {
    if (!image) {
      setImageUrl(null);
    } else if (image && !imageUrl) { // When image is set initially
       const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(image);
    }
  }, [image]);

  const processFile = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageUrl(base64);
        onImageChange(file, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [onImageChange]);

  const handleRemoveImage = () => {
      setImageUrl(null);
      onImageChange(null, null);
      // Reset the file input so the same file can be re-selected
      const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
      if (input) {
          input.value = '';
      }
  };


  return (
    <div className="bg-gray-800/50 p-8 rounded-2xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-purple-300 text-center">Step 1: Describe Your Product</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col items-center">
            <p className="text-center text-gray-400 mb-4">Upload a reference image (optional)</p>
            <label 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="relative w-full aspect-[3/4] max-w-sm cursor-pointer bg-gray-700/50 border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-300 transition-colors"
            >
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              {imageUrl ? (
                <>
                    <img src={imageUrl} alt="Product Preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                        onClick={(e) => {
                            e.preventDefault(); // Prevent file dialog from opening
                            handleRemoveImage();
                        }}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors z-10"
                        aria-label="Remove image"
                    >
                       <CloseIcon className="w-4 h-4" />
                    </button>
                </>
              ) : (
                <div className="text-center p-4">
                    <UploadIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>Drag & drop or click to upload</p>
                </div>
              )}
            </label>
        </div>

        <div className="flex flex-col h-full">
            <p className="text-gray-400 mb-4">Describe your product for the AI <span className="text-red-500">*</span></p>
            <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="e.g., A stylish, noise-cancelling wireless headphone in matte black with gold accents."
                className="w-full flex-grow bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition min-h-[200px] md:min-h-0"
                rows={8}
            />
            <p className="text-xs text-gray-500 mt-2">Be descriptive! The more detail you provide, the better the result.</p>
        </div>
      </div>
    </div>
  );
};

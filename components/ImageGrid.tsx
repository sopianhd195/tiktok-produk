import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImageGridProps {
  images: string[];
}

const DownloadButton: React.FC<{ imageUrl: string; index: number }> = ({ imageUrl, index }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `gambar-afiliasi-tiktok-${index + 1}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button 
            onClick={handleDownload}
            className="absolute bottom-3 right-3 bg-black/50 p-2 rounded-full text-white hover:bg-purple-600 transition-all duration-200 transform hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Unduh gambar"
        >
            <DownloadIcon className="w-5 h-5" />
        </button>
    );
};


export const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  return (
    <div className="text-center">
        <h2 className="text-3xl font-bold mb-8 text-purple-300">Gambar yang Dihasilkan</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {images.map((imgSrc, index) => (
                <div key={index} className="relative aspect-[9/16] rounded-lg overflow-hidden shadow-lg group border-2 border-gray-700">
                    <img src={imgSrc} alt={`Konten yang dihasilkan ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <DownloadButton imageUrl={imgSrc} index={index} />
                </div>
            ))}
        </div>
    </div>
  );
};
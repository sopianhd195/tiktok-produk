
import React from 'react';
import type { Option } from '../types';

interface OptionSelectorProps {
  title: string;
  options: Option[];
  selectedOption: Option | null;
  onSelectOption: (option: Option) => void;
  disabled?: boolean;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({ title, options, selectedOption, onSelectOption, disabled = false }) => {
  return (
    <div className={`bg-gray-800/50 p-8 rounded-2xl shadow-lg border border-gray-700 transition-opacity duration-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <h2 className="text-2xl font-bold mb-6 text-purple-300 text-center">{title}</h2>
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 ${disabled ? 'pointer-events-none' : ''}`}>
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => onSelectOption(option)}
            className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all duration-200 ease-in-out transform hover:-translate-y-1 group
              ${selectedOption?.id === option.id ? 'border-purple-500 shadow-purple-500/30 shadow-lg' : 'border-gray-600 hover:border-purple-400'}
            `}
          >
            <div className="relative aspect-[3/4]">
              <img src={option.image} alt={option.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
            </div>
            <p className={`font-bold p-3 text-center text-sm truncate transition-colors
              ${selectedOption?.id === option.id ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 group-hover:bg-purple-900/50'}`
            }>
              {option.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

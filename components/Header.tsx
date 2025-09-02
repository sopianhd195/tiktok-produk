
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-6 border-b border-gray-700/50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-center text-center">
            <SparklesIcon className="w-8 h-8 mr-3 text-purple-400" />
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                TikTok Affiliate Content Generator
            </h1>
        </div>
      </div>
    </header>
  );
};

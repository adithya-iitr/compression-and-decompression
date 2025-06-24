import React from 'react';
import { Zap, Repeat, Database } from 'lucide-react';
import { CompressionAlgorithm } from '../../../types';

interface AlgorithmSelectorProps {
  algorithms: CompressionAlgorithm[];
  selectedAlgorithm: string;
  onAlgorithmSelect: (algorithm: string) => void;
}

const algorithmIcons: Record<string, React.ComponentType<any>> = {
  huffman: Zap,
  rle: Repeat,
  lz77: Database,
};

export function AlgorithmSelector({ algorithms, selectedAlgorithm, onAlgorithmSelect }: AlgorithmSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Compression Algorithm</h3>
      
      <div className="grid gap-4">
        {algorithms.map((algorithm) => {
          const Icon = algorithmIcons[algorithm.key] || Zap;
          const isSelected = selectedAlgorithm === algorithm.key;
          
          return (
            <div
              key={algorithm.key}
              onClick={() => onAlgorithmSelect(algorithm.key)}
              className={`
                p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${
                  isSelected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {algorithm.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {algorithm.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-medium">Best for:</span> {algorithm.bestFor}
                  </p>
                </div>
                
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
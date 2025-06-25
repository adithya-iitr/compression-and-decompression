import React, { useEffect, useState } from 'react';

export default function ModeToggle() {
  const [mode, setMode] = useState<'compress' | 'decompress'>('compress');

  useEffect(() => {
    const savedMode = localStorage.getItem('mode');
    if (savedMode === 'decompress') setMode('decompress');
  }, []);

  const toggleMode = () => {
    const newMode = mode === 'compress' ? 'decompress' : 'compress';
    setMode(newMode);
    localStorage.setItem('mode', newMode);
    window.location.reload(); // Reloads UI to reflect new mode (optional)
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">{mode === 'compress' ? 'Compression' : 'Decompression'}</span>
      <button
        onClick={toggleMode}
        className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
          mode === 'compress' ? 'bg-green-500' : 'bg-blue-500'
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
            mode === 'compress' ? 'translate-x-0' : 'translate-x-6'
          }`}
        ></div>
      </button>
    </div>
  );
}

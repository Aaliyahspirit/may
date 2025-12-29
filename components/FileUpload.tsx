import React, { useCallback, useState } from 'react';

interface FileUploadProps {
  label: string;
  required?: boolean;
  accept?: string;
  guidelines?: React.ReactNode;
  footerText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, required, accept, guidelines, footerText }) => {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const names = Array.from(e.target.files).map(f => f.name);
      setFileNames(names);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // In a real scenario, handle files here
  }, []);

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col mb-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1 select-none">
            {label}
            {required && <span className="text-red-500">*</span>}
        </label>

        {guidelines && (
            <button 
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[10px] text-primary/50 hover:text-primary transition-colors flex items-center gap-1 mt-0.5 w-fit focus:outline-none"
            >
                <span className="border-b border-primary/20 hover:border-primary/50 transition-colors">
                    {isExpanded ? 'Hide accepted documents' : 'View accepted documents'}
                </span>
                <svg 
                  className={`w-2.5 h-2.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
        )}
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
         {guidelines && (
            <div className="text-[11px] text-primary/70 bg-[#FCF8F5] p-3 rounded border border-primary/10">
                {guidelines}
            </div>
         )}
      </div>

      <div 
        className={`border border-dashed rounded-lg p-5 text-center transition-colors duration-200 relative bg-white ${
          isDragging ? 'border-primary bg-secondary' : 'border-gray-300 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            
            <label className="px-6 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-sm cursor-pointer hover:bg-primary/90 transition-all shadow-sm">
                Choose File
                <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    accept={accept}
                    onChange={handleFileChange}
                />
            </label>

            {footerText && <p className="text-[10px] text-primary/40 leading-tight max-w-xs">{footerText}</p>}

            {fileNames.length > 0 && (
                <div className="mt-2 w-full text-center border-t border-gray-100 pt-2">
                    <p className="text-[10px] font-bold text-primary mb-1">Selected:</p>
                    <ul className="text-[10px] text-primary/70 inline-block text-left list-disc pl-3">
                        {fileNames.map((name, idx) => (
                            <li key={idx}>{name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
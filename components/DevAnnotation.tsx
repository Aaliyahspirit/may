import React from 'react';

interface DevAnnotationProps {
  children: React.ReactNode;
  label: string;
  note?: string;
  visible: boolean;
  condition?: string; // e.g. "Hidden if role === 'general'"
  className?: string;
}

export const DevAnnotation: React.FC<DevAnnotationProps> = ({ 
  children, 
  label, 
  note, 
  visible, 
  condition,
  className = "" 
}) => {
  if (!visible) return <>{children}</>;

  return (
    <div className={`relative group ${className}`}>
      {/* The actual UI component */}
      {children}

      {/* The Annotation Overlay */}
      <div className="absolute inset-0 border-2 border-dashed border-cyan-500/50 pointer-events-none z-50 rounded bg-cyan-50/5">
        {/* Label Badge */}
        <div className="absolute -top-3 left-4 bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider flex items-center gap-2">
            <span>{label}</span>
            {condition && (
                <span className="bg-black/20 px-1.5 rounded text-cyan-100 font-mono text-[9px] border border-white/10">
                    {condition}
                </span>
            )}
        </div>
        
        {/* Note Tooltip (Visible on Hover of the component) */}
        {note && (
           <div className="absolute bottom-2 right-2 max-w-[200px] bg-cyan-800/90 backdrop-blur text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
               <p className="font-semibold mb-1 text-cyan-200 text-[10px] uppercase">Logic Spec:</p>
               {note}
           </div>
        )}
      </div>
    </div>
  );
};
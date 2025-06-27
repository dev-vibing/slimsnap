import React from 'react';

interface AdPlaceholderProps {
  id: string;
  width: number;
  height: number;
  className?: string;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  id,
  width,
  height,
  className = ''
}) => {
  return (
    <div
      id={id}
      className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      Ad Space ({width}x{height})
    </div>
  );
};
import React, { useState, useRef, MouseEvent, WheelEvent } from 'react';
import { ResetIcon } from './icons/ResetIcon';

interface ZoomableImageProps {
  src: string;
  alt: string;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const newScale = e.deltaY > 0 ? scale * (1 - zoomIntensity) : scale * (1 + zoomIntensity);
    const clampedScale = Math.max(1, Math.min(newScale, 10)); // Clamp scale between 1x and 10x

    if (clampedScale === scale) return;

    const rect = imageRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - position.x) * (clampedScale / scale);
    const newY = mouseY - (mouseY - position.y) * (clampedScale / scale);

    setScale(clampedScale);
    setPosition({ x: newX, y: newY });
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (scale === 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || scale === 1) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const cursorClass = scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default';

  return (
    <div
      ref={imageRef}
      className={`relative w-full h-96 rounded-lg overflow-hidden bg-gray-900 group ${cursorClass}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
    >
      <img
        src={src}
        alt={alt}
        className="absolute top-0 left-0 h-full w-full object-contain transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          willChange: 'transform',
        }}
        draggable="false"
      />
      {scale > 1 && (
         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
                onClick={handleReset}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Reset zoom and pan"
            >
                <ResetIcon className="w-5 h-5" />
            </button>
         </div>
      )}
       {scale === 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/50 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          Scroll to zoom
        </div>
      )}
    </div>
  );
};

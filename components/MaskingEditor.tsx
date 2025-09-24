import React, { useRef, useEffect, useState, MouseEvent } from 'react';
import { BrushIcon } from './icons/BrushIcon';
import { EraserIcon } from './icons/EraserIcon';

interface MaskingEditorProps {
  imageUrl: string;
  onSave: (maskDataUrl: string) => void;
  onCancel: () => void;
}

export const MaskingEditor: React.FC<MaskingEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(40);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const image = imageRef.current;
      const container = containerRef.current;
      // Ensure all elements are available and image is loaded before proceeding
      if (canvas && image && container && image.complete && image.naturalHeight !== 0) {
        const imageRect = image.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Set canvas dimensions to match the displayed image
        canvas.width = imageRect.width;
        canvas.height = imageRect.height;

        // Position canvas directly over the image, accounting for container's padding/position
        canvas.style.top = `${imageRect.top - containerRect.top}px`;
        canvas.style.left = `${imageRect.left - containerRect.left}px`;
      }
    };

    const image = imageRef.current;
    if (image) {
      // Handle cached images that might already be loaded
      if (image.complete) {
        handleResize();
      } else {
        image.addEventListener('load', handleResize);
      }
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (image) {
        image.removeEventListener('load', handleResize);
      }
    };
  }, [imageUrl]);

  const getMousePos = (e: MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const draw = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const pos = getMousePos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !pos) return;

    ctx.beginPath();
    if (lastPosRef.current) {
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    } else {
        // For a single click, this ensures a dot is drawn
        ctx.moveTo(pos.x - 0.1, pos.y);
    }
    
    ctx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
    // When using destination-out, color doesn't matter, but for source-over it does for user feedback
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.7)'; // amber-400 with opacity
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    lastPosRef.current = pos;
  };
  
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    lastPosRef.current = getMousePos(e);
    draw(e);
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    draw(e);
  };
  
  const handleMouseUp = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const handleSave = () => {
    const screenCanvas = canvasRef.current;
    const image = imageRef.current;
    if (screenCanvas && image && image.naturalWidth > 0) {
      // Create a new canvas with the original image's full resolution
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = image.naturalWidth;
      finalCanvas.height = image.naturalHeight;
      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        // Draw the (potentially smaller) screen canvas onto the full-resolution canvas,
        // scaling the mask to match the original image dimensions.
        ctx.drawImage(screenCanvas, 0, 0, finalCanvas.width, finalCanvas.height);
        
        // Save the full-resolution mask
        onSave(finalCanvas.toDataURL('image/png'));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div 
        ref={containerRef}
        className="relative w-full h-[calc(100%-120px)] max-w-6xl flex items-center justify-center"
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Image to mask"
          className="max-w-full max-h-full object-contain select-none"
          draggable="false"
        />
        <canvas
          ref={canvasRef}
          className="absolute cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded-xl shadow-2xl flex items-center justify-center gap-4 border border-gray-700">
        <div className="flex items-center gap-2">
            <button
                onClick={() => setTool('brush')}
                aria-label="Select brush tool"
                className={`p-3 rounded-lg transition-colors ${tool === 'brush' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
                <BrushIcon className="w-6 h-6" />
            </button>
            <button
                onClick={() => setTool('eraser')}
                aria-label="Select eraser tool"
                className={`p-3 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
                <EraserIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="flex items-center gap-3">
            <label htmlFor="brushSize" className="text-sm font-medium text-gray-300">Size</label>
            <input
                id="brushSize"
                type="range"
                min="5"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
        </div>

        <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
             <button
                onClick={onCancel}
                className="px-6 py-2 text-sm font-bold rounded-lg transition-colors bg-gray-600 hover:bg-gray-500 text-white"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                className="px-6 py-2 text-sm font-bold rounded-lg transition-colors bg-teal-600 hover:bg-teal-500 text-white"
            >
                Apply Mask
            </button>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';

const messages = [
  "Peeling the banana...",
  "Slicing the pixels...",
  "Consulting the banana oracle...",
  "Adding a touch of magic...",
  "Generating awesomeness...",
  "This is taking a moment, but good things come to those who wait!",
  "Almost there, polishing the final image..."
];

export const LoadingSpinner: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-gray-800/50 rounded-lg">
      <div className="w-12 h-12 border-4 border-t-amber-400 border-gray-600 rounded-full animate-spin"></div>
      <p className="text-amber-300 font-medium text-center">{message}</p>
    </div>
  );
};

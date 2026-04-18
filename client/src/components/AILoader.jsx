import React, { useState, useEffect } from "react";

const AILoader = () => {
  const messages = [
    "Vectorizing your business idea...",
    "Scanning Indian startup compliance laws...",
    "Analyzing relevant contextual documents...",
    "Drafting your customized legal advice..."
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
      <div className="relative flex items-center justify-center w-12 h-12">
        <div className="absolute w-full h-full border-4 border-blue-500 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute w-full h-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <span className="text-xl">✨</span>
      </div>
      <p className="text-lg font-medium text-gray-700 animate-pulse text-center">
        {messages[messageIndex]}
      </p>
    </div>
  );
};

export default AILoader;
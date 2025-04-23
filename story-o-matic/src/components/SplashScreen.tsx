import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const handleAgree = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <img
          src="/images/image(1).jpg"
          alt="Story O'Matic Logo"
          className="mx-auto rounded-lg shadow-xl transform transition-transform hover:scale-105 max-h-[50vh] object-cover object-center scale-90"
        />
         <div className="mt-8 space-y-4 text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            <p>
              All story content is generated in real-time using Google's Gemini AI. We have no control over or responsibility for the generated content.
            </p>
            <p>
              The content may be unpredictable and could potentially include mature themes, unexpected plot developments, or content that might not be suitable for all audiences.
            </p>
            <p>
              By continuing, you acknowledge that you understand and accept these terms. For more information about Gemini AI, please review{' '}
              <a 
                href="https://ai.google.dev/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-story-600/75 hover:underline"
              >
                Google's AI Terms of Service
              </a>.
            </p>
          </div>
          <div className="mt-4 pb-8">
            <button
              onClick={handleAgree}
              className="mt-6 px-6 py-2 bg-story-600 text-white rounded-md hover:bg-story-700 
                       transition-colors duration-200 text-sm font-medium w-full sm:w-auto"
            >
              Alright. Let’s get started.
            </button>
          </div>
      </div>
    </div>
  );
}
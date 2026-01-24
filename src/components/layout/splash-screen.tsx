import React from 'react';
import Lanyard from '../fancy/lanyard';

interface SplashScreenProps {
  onClose?: () => void;
}

export default function SplashScreen({ onClose }: SplashScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full h-full max-w-4xl max-h-screen flex flex-col items-center justify-center p-8">
        {/* Lanyard Component */}
        <div className="w-full h-96 mb-8">
          <Lanyard position={[0, 0, 24]} gravity={[0, -40, 0]} />
        </div>

        {/* Thank You Message */}
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Thank You for Participating!
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-gray-300">
            Your registration has been successfully submitted.
          </p>
          <p className="text-lg md:text-xl text-gray-400 mb-8">
            Your email would have been sent to you. Kindly follow the instructions mentioned.
          </p>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="px-8 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
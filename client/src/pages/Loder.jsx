// components/common/LoadingScreen.jsx
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <img src="./assets/black-logo-1.svg" alt="Site Logo" className="w-72 h-72" />
      </div>
    </div>
  );
};

export default LoadingScreen;

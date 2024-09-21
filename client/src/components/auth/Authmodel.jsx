import React, { useState } from 'react';
import Signup from './Signup';
import Signin from './Signin';

const AuthModal = ({ onClose, isSignup: initialIsSignup }) => {
  const [isSignup, setIsSignup] = useState(initialIsSignup);

  const handleSwitchToSignin = () => {
    setIsSignup(false);
  };

  const handleSwitchToSignup = () => {
    setIsSignup(true);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-[#6B7280] bg-opacity-50">
      <div className="bg-white p-[50px] rounded-[20px] shadow-md border w-[500px] h-[600px] relative">
        {isSignup ? (
          <Signup onClose={onClose} onSwitchToSignin={handleSwitchToSignin} />
        ) : (
          <Signin onClose={onClose} onSwitchToSignup={handleSwitchToSignup} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;

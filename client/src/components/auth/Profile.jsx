import React, { useEffect, useRef, useState } from 'react';
import { FaAngleRight, FaBox, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios'; // Import Axios for making HTTP requests
import SigninPopup from '../auth/Signin';
import SignupPopup from './Signup';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const Popup = ({ onClose, onSignup }) => {
  const [isSigninOpen, setIsSigninOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const popupRef = useRef(null);
  const navigate = useNavigate();

  const handleOpenSignin = () => {
    setIsSigninOpen(true);
    setIsSignupOpen(false);
    setIsAddressOpen(false);
    toast.info("Opening Sign In");
  };

  const handleOpenSignup = () => {
    setIsSignupOpen(true);
    setIsSigninOpen(false);
    setIsAddressOpen(false);
    toast.info("Opening Sign Up");
  };

  const handleRedirect = (path) => {
    if (isLoggedIn || isSignup) {
      navigate(path);
      onClose();
    } 
  };

  const handleLogin = async (user) => {
    //console.log('User data received:', user);
    if (user && user.name) {
      localStorage.setItem('user', JSON.stringify(user));
      setUserName(user.name);
      setIsLoggedIn(true);
      setIsSigninOpen(false); // Close signin popup upon successful login
    } else {
      toast.error('User name not found');
    }
  };
  
  const handleSignup = async (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    setUserName(user.name);
    setIsSignup(true);
    setIsSignupOpen(false); // Close signin popup upon successful login
  };

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.post(`${apiUrl}/api/users/logout`); // Adjust URL as per your backend endpoint
      localStorage.removeItem('user');
      setUserName('');
      setIsLoggedIn(false);
      setIsSignup(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserName(user.name);
      setIsLoggedIn(true);
      setIsSignup(true);
    }
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed top-14 right-8 font-urbanist w-80 z-50" ref={popupRef}>
      <div className="bg-white rounded-lg shadow-md">
        {!isSigninOpen && !isSignupOpen && !isAddressOpen && (
          <div>
            <div className="text-left">
              <img className='flex pl-6 pt-6' src='/assets/profile.svg' alt="Profile"/>
              <p className="mt-2 pl-6 text-md font-medium text-black sm:text-[20px]">
                {userName ? `Hi ${userName}, welcome to iGalaxy` : "Hi there, welcome to iGalaxy"}
              </p>
              {!userName && (
                <p className="text-base pl-6 text-gray-500 leading-7 text-[25px]">
                  Looks like you are new to iGalaxy
                </p>
              )}
              
              <div className="pl-5 pt-3 flex items-center gap-x-3">
                {!isLoggedIn && !isSignup ? (
                  <>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full border border-black px-6 py-2 text-[15px] font-normal text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                      onClick={handleOpenSignin}
                    >
                      Sign in
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center bg-blue-600 rounded-full border border-blue px-6 py-2 text-[15px] font-normal text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                      onClick={handleOpenSignup}
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center bg-blue-600 rounded-full border border-blue px-6 py-2 text-[15px] font-normal text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                )}
              </div>

              <ul className="mt-0 divide-y-2 ">
                <li onClick={() => handleRedirect('/order')} className="flex cursor-pointer hover:bg-slate-50 p-6 items-center">
                  <FaBox className="mr-4" /> 
                  <button className="flex-grow text-left">
                    Orders
                  </button>
                  <FaAngleRight />
                </li>
                {/* <li onClick={() => handleRedirect('/address')} className="flex cursor-pointer hover:bg-slate-50 items-center p-6">
                  <FaMapMarkerAlt className="mr-4" />
                  <button className="flex-grow text-left">
                    Address
                  </button>
                  <FaAngleRight />
                </li> */}
              </ul>
            </div>
          </div>
        )}
        {isSigninOpen && <SigninPopup onClose={() => setIsSigninOpen(false)} onLogin={handleLogin} />}
        {isSignupOpen && <SignupPopup onClose={() => setIsSignupOpen(false)} onSignup={handleSignup} />}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Popup;
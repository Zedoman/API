import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signin = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async () => {
    if (email && password) {
      setLoading(true);
      setError('');
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.post(`${apiUrl}/api/users/login`, { email, password });
        
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user data in local storage
        onLogin(user);
        toast.success('Login Successful', { onClose });
        //console.log(response.data);
      } catch (error) {
        setLoading(false);
        console.error('Error logging in:', error.response ? error.response.data : error.message);
        if (error.response && error.response.data.message === 'User not found') {
          setError('User not found. Please sign up first.');
        } else if (error.response && error.response.data.message === 'Invalid credentials') {
          setError('Invalid credentials. Please try again.');
        } else {
          setError('Error logging in');
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please provide both email and password');
    }
  };
  

  const handleForgotPassword = async (e) => {
    if (forgotEmail) {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        await axios.post(`${apiUrl}/api/users/reset-password`, { email: forgotEmail });
        toast.success('Reset link sent to your email!');
        setShowForgotPassword(false);
      } catch (error) {
        console.error('Error sending reset link:', error.response ? error.response.data : error.message);
        toast.error('Error sending reset link. Please try again.');
      }
    } else {
      toast.error('Please provide your email address');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  

  return (
    <div className="py-2">
      <div className="text-left">
        <div className="flex justify-between items-center">
          <p className="mt-2 text-[18px] font-normal text-black sm:text-2xl">
            Sign in to iGalaxy
          </p>
          <button
            type="button"
            className="text-black focus:outline-none"
            onClick={onClose}
          >
            {/* Close button SVG */}
          </button>
        </div>
        <p className="mt-1 text-base leading-7 text-gray-600 text-[25px]">
          Sign in with your email and password to continue
        </p>

        {error && <p className="text-red-500">{error}</p>}

        <div className="mt-6">
          <label className="text-[17px] font-normal text-black">Email</label>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown} 
            className="mt-2 w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-4">
          <label className="text-[17px] font-normal text-black">Password</label>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown} 
            className="mt-2 w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="text-blue-700 font-normal text-base focus:outline-none"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </button>
        </div>

        {showForgotPassword && (
          <div className="mt-6">
            <label className="text-[17px] font-normal text-black">Enter your email for reset link</label>
            <input
              type="email"
              placeholder="Enter Email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="mt-2 w-full p-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              className="mt-2 inline-flex items-center px-3 py-2 rounded-full text-white bg-blue-700"
              onClick={handleForgotPassword}
            >
              Send Reset Link
            </button>
            <button
              type="button"
              className="mt-2 inline-flex items-center px-3 py-2 rounded-full text-gray-600"
              onClick={() => setShowForgotPassword(false)}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="mt-[30px] flex gap-4">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 rounded-full text-white bg-blue-700"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className='flex justify-between gap-5'>
            <p className="text-gray-600 mt-2">New user?</p>
            <button
              type="button"
              className="text-blue-700 font-normal text-base focus:outline-none"
              onClick={() => onClose(false)}
            >
              Signup
            </button>
          </div>
        </div>
        <a href="https://api-cqq1.onrender.com/api/users/google">
          <button className="inline-flex items-center rounded-full px-4 py-2 text-white bg-red-900 relative top-1">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
              alt="Google logo"
              className="w-10 h-4 mr-5"
            />
            signin with Google
          </button>
        </a>
      </div>
      <ToastContainer/>
    </div>
  );
};

const SigninPopup = ({ onClose, onSignin, onLogin }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-[#6B7280] bg-opacity-50">
      <div className="bg-white p-[50px] rounded-[20px] shadow-md border w-[500px] h-auto relative">
      <Signin onClose={onClose} onSignin={onSignin} onLogin={onLogin} />
      </div>
    </div>
  );
};

export default SigninPopup;

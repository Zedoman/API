import React, { useState, useEffect } from "react";
import { FaBox, FaAngleRight, FaMapMarkerAlt } from "react-icons/fa";
import axios from 'axios'; // Import Axios for making HTTP requests
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'react-toastify/dist/ReactToastify.css';
import { Link } from "react-router-dom";

const Profile1 = () => {
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch user data from localStorage and check if logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserName(user.name);
      setIsLoggedIn(true);
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.post(`${apiUrl}/api/users/logout`); // Adjust URL as per your backend endpoint
      localStorage.removeItem('user');
      setUserName('');
      setIsLoggedIn(false);
      toast.success('Logged out successfully');
      navigate('/'); // Redirect to the main page
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="w-96 h-[228px] pt-4 bg-white border-2 rounded-3xl">
      <div className="text-left w-full divide-y">

        <div className="flex gap-6 px-4">
          <img className="object-contain" src="profileImg.png" alt="Profile" />
          <div className="">
            <p className="mt-2 text-lg font-medium text-black sm:text-[20px]">
              Hi {userName || 'Guest'}
            </p>
            {isLoggedIn && (
              <button
                className="text-blue-500 hover:border-b hover:border-b-blue-600 hover:text-blue-700 mb-4"
                onClick={handleLogout}
              >
                Sign out
              </button>
            )}
          </div>
        </div>

        <ul className="font-urbanist items-center justify-center">
          <Link to="/order" className="flex  cursor-pointer items-center border-b hover:bg-slate-100 justify-center p-5">
            <FaBox className="mr-4" />
            <Link to="/order">Orders</Link>
            <FaAngleRight className="ml-auto" />
          </Link>
          {/* <Link to="/address" className="flex cursor-pointer items-center hover:bg-slate-100 hover:rounded-b-2xl justify-center p-5">
            <FaMapMarkerAlt className="mr-4" />
            <Link to="/address">Address</Link>
            <FaAngleRight className="ml-auto" />
          </Link> */}
        </ul>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Profile1;

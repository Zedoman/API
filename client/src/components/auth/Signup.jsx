import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReCAPTCHA from "react-google-recaptcha";

const Signup = ({ onClose, onSignup }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const handleSignup = async () => {
    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA.");
      return;
    }

    if (!name || !email || !password) {
      setError("Please fill out all fields");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const data = {
        name,
        email,
        password,
        recaptchaToken, // Include the reCAPTCHA token in the payload
      };

      const response = await axios.post(`${apiUrl}/api/users/`, data);
      toast.success("Signup successful", {
        onClose: onClose,
      });
      setLoading(false);
      onSignup(response.data);
    } catch (error) {
      setLoading(false);
      console.error(
        "Error during signup:",
        error.response ? error.response.data : error.message
      );
      setError("Failed to sign up");
    }
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token); // Set the reCAPTCHA token when it's successfully validated
  };

  return (
    <div className="py-2">
      <div className="text-left">
        <div className="flex justify-between items-center">
          <p className="mt-2 text-[18px] font-normal text-black sm:text-2xl">
            Create an account on iGalaxy
          </p>
          <button
            type="button"
            className="text-black focus:outline-none"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p className="mt-1 text-base leading-7 text-gray-600 text-[25px]">
          Sign up with your email to get started
        </p>

        {error && <p className="text-red-500">{error}</p>}

        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
        />

        <input
          type="text"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
        />

        <ReCAPTCHA
          sitekey="6LfpdkgqAAAAACY5BMJrXXeVWiSP05e2csZNPBOz" // Use your reCAPTCHA site key here
          onChange={handleRecaptchaChange}
        />

        <div className="mt-[30px] flex gap-4">
          <button
            type="button"
            className="inline-flex rounded-full px-3 py-2 text-white bg-blue-700"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>
        </div>
        <a href="http://localhost:5001/api/users/google">
          <button className="inline-flex items-center rounded-full px-4 py-2 text-white bg-red-900 relative top-1">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
              alt="Google logo"
              className="w-10 h-4 mr-5"
            />
            Login with Google
          </button>
        </a>
      </div>
      <ToastContainer />
    </div>
  );
};

const SignupPopup = ({ onClose, onSignup, onLogin }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-[#6B7280] bg-opacity-50">
      <div className="bg-white p-[50px] rounded-[20px] shadow-md border w-[500px] h-[600px] relative">
        <Signup onClose={onClose} onSignup={onSignup} onLogin={onLogin} />
      </div>
    </div>
  );
};

export default SignupPopup;

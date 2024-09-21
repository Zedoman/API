import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token'); // Extract token from URL

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://54.80.9.36/api/users/reset-password-confirm', {
        token,
        newPassword
      });
      //console.log("klk",{ token, newPassword });


      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>

      {/* Message display */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPasswordPage;

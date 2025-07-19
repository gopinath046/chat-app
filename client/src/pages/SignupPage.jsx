import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!username || !password) {
      alert('Please fill all fields');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', {
        username,
        password,
      });

      if (res.status === 201 || res.status === 200) {
        alert('Signup successful! Please login.');
        navigate('/');
      } else {
        alert('Unexpected response. Try again.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 tracking-tight">
          Create Your Account 📝
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Choose a Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          />
          <input
            type="password"
            placeholder="Create a Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          />
        </div>

        <button
          onClick={handleSignup}
          className="mt-6 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow transition-all duration-200"
        >
          Signup
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/" className="text-blue-600 hover:underline font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

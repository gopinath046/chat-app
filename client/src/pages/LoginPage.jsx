import React, { useState } from 'react';
import axios from 'axios';
import socket from '../utils/socket';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const loginUser = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });

      // ✅ Store essential data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.user.username);
      localStorage.setItem('userId', res.data.user._id);

      // ✅ Register user with socket (send user ID)
      socket.emit('add-user', res.data.user._id);

      // ✅ Navigate to dynamic chat route
      navigate(`/${res.data.user.username}/chat`);
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 tracking-tight">
          Welcome Back 👋
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>

        <button
          onClick={loginUser}
          className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all duration-200"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline font-medium">
            Signup
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

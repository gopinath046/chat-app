import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import SignupPage from './pages/SignupPage';

const App = () => {
  const storedUsername = localStorage.getItem('username');

  return (
    <BrowserRouter>
      <Routes>
        {/* Default Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 🔁 Only allow /:username/chat */}
        <Route path="/chat" element={
          storedUsername ? <Navigate to={`/${storedUsername}/chat`} /> : <Navigate to="/" />
        } />

        <Route path="/:username/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

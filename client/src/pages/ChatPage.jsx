import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../utils/socket';
import './ChatPage.css';

const ChatPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const chatEndRef = useRef(null);

  const currentUsername = localStorage.getItem('username');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users');
        const otherUsers = res.data.filter(user => user.username !== currentUsername);
        setUsers(otherUsers);
      } catch (err) {
        console.error('User list fetch error:', err);
      }
    };
    fetchUsers();
  }, [currentUsername]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentUserId) return;

    socket.emit('add-user', currentUserId);

    socket.on('msg-receive', ({ from, message }) => {
      if (from === selectedUser?._id) {
        setMessages(prev => [...prev, { from, text: message }]);
        socket.emit('message-seen', { from: currentUserId, to: from });
      }
    });

    socket.on('typing', (from) => {
      if (from === selectedUser?._id) {
        setTypingUser(selectedUser.username);
        setTimeout(() => setTypingUser(null), 2000);
      }
    });

    socket.on('msg-status', ({ to, status }) => {
      setStatusMap(prev => ({ ...prev, [to]: status }));
    });

    return () => {
      socket.off('msg-receive');
      socket.off('typing');
      socket.off('msg-status');
    };
  }, [selectedUser, currentUserId]);

  const handleSendMessage = () => {
    if (messageInput && selectedUser) {
      const newMsg = {
        from: currentUserId,
        to: selectedUser._id,
        message: messageInput,
      };
      setMessages(prev => [...prev, { from: currentUserId, text: messageInput }]);
      socket.emit('send-msg', newMsg);
      setStatusMap(prev => ({ ...prev, [selectedUser._id]: 'sent' }));
      setMessageInput('');
    }
  };

  const handleTyping = () => {
    if (selectedUser) {
      socket.emit('typing', { from: currentUserId, to: selectedUser._id });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="user-avatar">
              {currentUsername?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <h3 className="username">{currentUsername}</h3>
              <span className="status-online">Online</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
        
        <div className="chats-section">
          <h4 className="chats-title">Chats</h4>
          <div className="users-list">
            {users.map(user => (
              <div
                key={user._id}
                className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                onClick={async () => {
                  setSelectedUser(user);
                  setMessages([]);
                  setTypingUser(null);
                  try {
                    const res = await axios.get(`http://localhost:5000/api/messages/${currentUserId}/${user._id}`);
                    setMessages(res.data.map(m => ({ from: m.sender, text: m.message })));
                  } catch (err) {
                    console.error('Failed to load messages', err);
                  }
                }}
              >
                <div className="user-avatar small">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <span className="user-name">{user.username}</span>
                  {statusMap[user._id] && (
                    <span className={`message-status ${statusMap[user._id]}`}>
                      {statusMap[user._id]}
                    </span>
                  )}
                </div>
                <div className="online-indicator"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="user-avatar small">
                  {selectedUser.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="chat-username">{selectedUser.username}</h3>
                  <span className="last-seen">Last seen recently</span>
                </div>
              </div>
              <div className="chat-actions">
                <button className="action-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </button>
                <button className="action-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="messages-container">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-wrapper ${msg.from === currentUserId ? 'sent' : 'received'}`}>
                  <div className="message-bubble">
                    <span className="message-text">{msg.text}</span>
                    <div className="message-meta">
                      <span className="message-time">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.from === currentUserId && (
                        <span className={`status-icon ${statusMap[selectedUser?._id] || 'sent'}`}>
                          {(statusMap[selectedUser?._id] === 'seen' || statusMap[selectedUser?._id] === 'delivered') ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {typingUser && (
                <div className="typing-indicator">
                  <div className="typing-avatar">
                    {typingUser.charAt(0).toUpperCase()}
                  </div>
                  <div className="typing-bubble">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              <div className="input-wrapper">
                <button className="emoji-btn">
                  😊
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <button className="attachment-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
                  </svg>
                </button>
              </div>
              <button 
                className={`send-btn ${messageInput.trim() ? 'active' : ''}`}
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="welcome-message">
              <div className="welcome-icon">💬</div>
              <h2>Welcome to ChatApp</h2>
              <p>Select a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
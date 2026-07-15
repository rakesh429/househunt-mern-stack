import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, User as UserIcon } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const locationObj = useLocation();

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  // Parse receiverId query param (if coming from "Chat with Owner" listing button)
  useEffect(() => {
    fetchContactsAndSetupReceiver();
  }, [locationObj.search]);

  // Keep messages scrolled to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Poll messages every 4 seconds for a simple real-time effect
  useEffect(() => {
    let interval;
    if (activeContact) {
      interval = setInterval(() => {
        fetchMessages(activeContact._id);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [activeContact]);

  const fetchContactsAndSetupReceiver = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/messages/users');
      const contactList = res.data.data;
      setContacts(contactList);

      const params = new URLSearchParams(locationObj.search);
      const receiverId = params.get('receiverId');

      if (receiverId) {
        // Check if receiver is already in contact list
        const existing = contactList.find((c) => c._id === receiverId);
        if (existing) {
          handleSelectContact(existing);
        } else {
          // Fetch new target user profile details to add as draft contact
          const userRes = await axios.get('/auth/me'); // simple bypass: fetch specific user
          const mockUserRes = await axios.get('/admin/users'); // query all users
          const targetUser = mockUserRes.data.data.find((u) => u._id === receiverId);
          if (targetUser) {
            const newContact = {
              _id: targetUser._id,
              name: targetUser.name,
              email: targetUser.email,
              avatar: targetUser.avatar,
              role: targetUser.role,
              unreadCount: 0,
              lastMessage: '',
            };
            setContacts((prev) => [newContact, ...prev]);
            handleSelectContact(newContact);
          }
        }
      } else if (contactList.length > 0) {
        handleSelectContact(contactList[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = async (contact) => {
    setActiveContact(contact);
    await fetchMessages(contact._id);
    // Mark notifications/unread counts as zero locally
    setContacts((prev) =>
      prev.map((c) => (c._id === contact._id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await axios.get(`/messages/${userId}`);
      setMessages(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeContact) return;

    try {
      const res = await axios.post('/messages', {
        receiverId: activeContact._id,
        message: text,
      });
      setMessages((prev) => [...prev, res.data.data]);
      setText('');
      
      // Update contact list with last message snippet
      setContacts((prev) =>
        prev.map((c) =>
          c._id === activeContact._id ? { ...c, lastMessage: text } : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="container py-5 text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Chat room...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in">
      <div className="card glass-panel border overflow-hidden shadow-sm rounded-4" style={{ height: '75vh' }}>
        <div className="row g-0 h-100">
          
          {/* Chat Contacts List */}
          <div className="col-md-4 border-end h-100 d-flex flex-column bg-light bg-opacity-25">
            <div className="p-3 border-bottom bg-light">
              <h5 className="fw-bold m-0 text-dark">Conversations</h5>
            </div>
            <div className="flex-fill" style={{ overflowY: 'auto' }}>
              {contacts.length === 0 ? (
                <p className="text-secondary text-center py-5 small">No chats initiated.</p>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => handleSelectContact(c)}
                    className={`p-3 d-flex align-items-center gap-3 border-bottom cursor-pointer transition-all ${activeContact?._id === c._id ? 'bg-primary text-white bg-opacity-75' : 'hover-bg-light text-dark'}`}
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                  >
                    <img
                      src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt="avatar"
                      className="rounded-circle border"
                      style={{ width: '40px', height: '40px' }}
                    />
                    <div className="flex-fill min-w-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold m-0 text-truncate" style={{ fontSize: '0.9rem' }}>{c.name}</h6>
                        {c.unreadCount > 0 && (
                          <span className="badge bg-danger rounded-pill px-2" style={{ fontSize: '0.65rem' }}>
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="small text-truncate m-0 opacity-75" style={{ fontSize: '0.75rem' }}>
                        {c.lastMessage || 'Click to read messages'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Chat Conversation Bubble Thread */}
          <div className="col-md-8 h-100 d-flex flex-column">
            {activeContact ? (
              <>
                {/* Header */}
                <div className="p-3 border-bottom bg-white d-flex align-items-center gap-2">
                  <img
                    src={activeContact.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                    alt="active avatar"
                    className="rounded-circle"
                    style={{ width: '35px', height: '35px' }}
                  />
                  <div>
                    <h6 className="fw-bold m-0 text-dark">{activeContact.name}</h6>
                    <span className="text-secondary small uppercase" style={{ fontSize: '0.7rem' }}>
                      {activeContact.role}
                    </span>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-fill p-4" style={{ overflowY: 'auto', backgroundColor: '#f8fafc' }}>
                  <div className="d-flex flex-column gap-3">
                    {messages.map((msg) => {
                      const isMe = msg.sender === user.id || msg.sender?._id === user.id;
                      return (
                        <div key={msg._id} className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                          <div
                            className={`p-3 rounded-4 shadow-sm max-w-75 ${isMe ? 'bg-primary text-white' : 'bg-white text-dark border'}`}
                            style={{ maxWidth: '70%', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px' }}
                          >
                            <div style={{ fontSize: '0.9rem' }}>{msg.message}</div>
                            <div className="text-end opacity-75 mt-1" style={{ fontSize: '0.65rem' }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Controls */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-top d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control rounded-pill px-4"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <Send size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-fill d-flex flex-column align-items-center justify-content-center bg-light bg-opacity-25">
                <span className="fs-1 mb-2">💬</span>
                <h5 className="fw-bold">Your Conversations</h5>
                <p className="text-secondary small">Select a tenant or owner contact from the side panel to initiate chatting.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Chat;

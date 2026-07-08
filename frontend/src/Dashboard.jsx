import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, Send, Recycle, TrendingUp, ArrowUpRight, ArrowDownRight, Users, X, Upload, LogOut, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import useSocket from './hooks/useSocket';
import { searchScraps, addScrap } from './api/scrap';
import { getChats, getMessages, createChat } from './api/chat';
import { uploadImages } from './api/upload';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const socketRef = useSocket(true);

  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    quantity: '',
    images: [],
  });

  const selectedChatRef = useRef(null);
  const userId = user?._id;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Load the user's chats on mount.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getChats();
        setChats(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load chats:', error.response?.data || error.message);
      }
    })();
  }, []);

  // Subscribe to incoming real-time messages once.
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;

    const handleReceive = (msg) => {
      const activeId = selectedChatRef.current;
      if (activeId && String(msg.chatId) === String(activeId)) {
        setMessages((prev) => {
          if (msg._id && prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('receive_message', handleReceive);
    return () => socket.off('receive_message', handleReceive);
  }, [socketRef]);

  const otherMember = (chat) =>
    chat?.members?.find((m) => String(m._id) !== String(userId)) || null;

  const openChat = async (chat) => {
    setSelectedChat(chat);
    selectedChatRef.current = chat._id;
    setSearchQuery('');
    setSearchResults([]);
    try {
      const { data } = await getMessages(chat._id);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load messages:', error.response?.data || error.message);
      setMessages([]);
    }
    socketRef.current?.emit('join_chat', chat._id);
  };

  const closeChat = () => {
    setSelectedChat(null);
    selectedChatRef.current = null;
    setMessages([]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !selectedChat) return;

    socketRef.current?.emit('send_message', {
      chatId: selectedChat._id,
      sender: userId,
      text,
    });
    setMessage('');
  };

  // Debounced search against the real API.
  useEffect(() => {
    if (selectedChat) return undefined;
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return undefined;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await searchScraps(query);
        setSearchResults(data.scraps || []);
      } catch (error) {
        console.error('Search failed:', error.response?.data || error.message);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedChat]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewProduct((prev) => ({
            ...prev,
            images: [...prev.images, reader.result],
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (savingProduct) return;
    setSavingProduct(true);
    try {
      let imageUrls = newProduct.images;
      if (imageUrls.length > 0) {
        const { data } = await uploadImages(imageUrls);
        imageUrls = data.urls || imageUrls;
      }

      await addScrap({
        name: newProduct.name,
        description: newProduct.description,
        quantity: Number(newProduct.quantity),
        images: imageUrls,
      });

      setNewProduct({ name: '', description: '', quantity: '', images: [] });
      setShowAddProduct(false);
      alert('Product added successfully!');
    } catch (error) {
      console.error('Add product failed:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to add product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const messageSeller = async (seller) => {
    if (!seller?._id) return;
    if (String(seller._id) === String(userId)) {
      alert('This is your own listing.');
      return;
    }
    try {
      const { data: chat } = await createChat(seller._id);
      setChats((prev) => {
        if (prev.some((c) => c._id === chat._id)) return prev;
        return [chat, ...prev];
      });
      await openChat(chat);
    } catch (error) {
      console.error('Failed to start chat:', error.response?.data || error.message);
      alert('Could not start a conversation with this seller.');
    }
  };

  const StatCard = ({ title, value, icon: Icon, trendValue, bgColor = 'bg-white', compact = false }) => {
    const isNegative = trendValue.includes('-');
    return (
      <div className={`${bgColor} ${compact ? 'p-3' : 'p-6'} rounded-lg shadow-sm`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-medium text-gray-600`}>{title}</h3>
          <Icon className={`${compact ? 'h-4 w-4' : 'h-6 w-6'} ${selectedChat ? 'text-green-600' : 'text-gray-600'}`} />
        </div>
        <p className={`${compact ? 'text-lg' : 'text-3xl'} font-bold text-gray-900 mb-2`}>{value}</p>
        <p className={`text-sm ${isNegative ? 'text-red-600' : 'text-green-600'} flex items-center`}>
          {isNegative ? <ArrowDownRight className="h-4 w-4 mr-1" /> : <ArrowUpRight className="h-4 w-4 mr-1" />}
          {trendValue}
        </p>
      </div>
    );
  };

  const stats = useMemo(
    () => [
      { title: 'Total Sales', value: '$128,400', icon: TrendingUp, trendValue: '+12% vs last month' },
      { title: 'Scrap Exported', value: '245 tons', icon: ArrowUpRight, trendValue: '+8% increase' },
      { title: 'Scrap Imported', value: '180 tons', icon: ArrowDownRight, trendValue: '-5% decrease' },
      { title: 'Active Partners', value: '24', icon: Users, trendValue: '+3 new this month' },
    ],
    []
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <Recycle className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">ReScrapIt</h1>
        </div>

        <button
          onClick={() => setShowAddProduct(true)}
          className="w-full bg-green-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors mb-6"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) closeChat();
            }}
            placeholder="Search scrap materials..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Conversations</div>
        <div className="space-y-2 overflow-auto flex-1">
          {chats.length === 0 && (
            <p className="text-sm text-gray-400 px-2">No conversations yet. Search a listing and message a seller.</p>
          )}
          {chats.map((chat) => {
            const contact = otherMember(chat);
            const name = contact?.name || 'User';
            return (
              <button
                key={chat._id}
                onClick={() => openChat(chat)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                  selectedChat?._id === chat._id ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{name}</div>
                  <div className="text-xs text-gray-500">{contact?.email || ''}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar with Logout */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <span className="text-gray-600">{user ? `Welcome, ${user.name}` : ''}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>Logout</span>
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        {selectedChat ? (
          <>
            {/* Chat Area */}
            <div className="flex-1 flex">
              <div className="flex-1 flex flex-col bg-white">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {(otherMember(selectedChat)?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{otherMember(selectedChat)?.name || 'User'}</h2>
                      <p className="text-sm text-gray-500">{otherMember(selectedChat)?.email || ''}</p>
                    </div>
                  </div>
                  <button onClick={closeChat} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm">No messages yet. Say hello!</p>
                  )}
                  {messages.map((msg, index) => {
                    const mine = String(msg.sender) === String(userId);
                    const time = msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <div key={msg._id || index} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs ${mine ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`p-3 rounded-lg ${
                              mine ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <div className={`text-xs text-gray-500 mt-1 ${mine ? 'text-right' : 'text-left'}`}>
                            {time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="bg-green-600 text-white rounded-lg p-2 hover:bg-green-700 transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        ) : searchQuery ? (
          // Search Results View
          <div className="flex-1 flex flex-col overflow-auto">
            <div className="flex-1 p-6">
              <h2 className="text-xl font-semibold mb-4">
                {searchLoading ? 'Searching…' : `Search Results for "${searchQuery}"`}
              </h2>
              {!searchLoading && searchResults.length === 0 && (
                <p className="text-gray-500">No listings match your search.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((result) => (
                  <div key={result._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
                    {result.images?.[0] && (
                      <img
                        src={result.images[0]}
                        alt={result.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-lg mb-1">{result.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{result.description}</p>
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                      <span>Quantity: {result.quantity}</span>
                      <span>{result.seller?.name || 'Seller'}</span>
                    </div>
                    <button
                      onClick={() => messageSeller(result.seller)}
                      className="mt-auto flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-green-700 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message Seller
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Default Stats View
          <div className="flex-1 p-8 bg-white overflow-auto">
            <div className="grid grid-cols-2 gap-6">
              {stats.map((s) => (
                <StatCard key={s.title} title={s.title} value={s.value} icon={s.icon} trendValue={s.trendValue} bgColor="bg-gray-50" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Product</h2>
              <button onClick={() => setShowAddProduct(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="space-y-4">
                {/* Multiple Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                  <div className="mt-1 flex flex-col gap-4">
                    {newProduct.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {newProduct.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img src={image} alt={`Product preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                          >
                            <span>Upload files</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                >
                  {savingProduct ? 'Saving…' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

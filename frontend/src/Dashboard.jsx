import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, Send, Recycle, TrendingUp, ArrowUpRight, ArrowDownRight, Users, X, MessageSquare, Package, LogOut, Paperclip, Ban } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import useSocket from './hooks/useSocket';
import { searchScraps } from './api/scrap';
import { getChats, getMessages, createChat, markSeen, blockUser } from './api/chat';
import { getMyAnalytics } from './api/analytics';
import { formatPrice } from './constants';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const socketRef = useSocket(true);

  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const selectedChatRef = useRef(null);
  const userId = user?._id;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
    } catch {
      setMessages([]);
    }
    socketRef.current?.emit('join_chat', chat._id);
    socketRef.current?.emit('mark_seen', { chatId: chat._id, reader: userId });
    markSeen(chat._id).catch(() => {});
    setChats((prev) => prev.map((c) => (c._id === chat._id ? { ...c, unread: 0 } : c)));
  };

  const handleBlock = async () => {
    const other = otherMember(selectedChat);
    if (!other || !window.confirm(`Block ${other.name}? You won't be able to message each other.`)) return;
    try {
      await blockUser(other._id);
      alert('User blocked.');
      closeChat();
    } catch {
      alert('Could not block user.');
    }
  };

  const handleAttach = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      socketRef.current?.emit('send_message', { chatId: selectedChat._id, sender: userId, media: reader.result, text: '' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const closeChat = () => {
    setSelectedChat(null);
    selectedChatRef.current = null;
    setMessages([]);
  };

  // Load chats on mount; optionally auto-open a chat passed via navigation state.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getChats();
        const list = Array.isArray(data) ? data : [];
        setChats(list);
        const openId = location.state?.openChatId;
        if (openId) {
          const target = list.find((c) => c._id === openId);
          if (target) openChat(target);
        }
      } catch (error) {
        console.error('Failed to load chats:', error.response?.data || error.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time messages.
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;
    const handleReceive = (msg) => {
      if (selectedChatRef.current && String(msg.chatId) === String(selectedChatRef.current)) {
        setMessages((prev) => (msg._id && prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
      }
    };
    socket.on('receive_message', handleReceive);
    return () => socket.off('receive_message', handleReceive);
  }, [socketRef]);

  // Load real dashboard analytics.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyAnalytics();
        setAnalytics(data.analytics);
      } catch { /* ignore */ }
    })();
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !selectedChat) return;
    socketRef.current?.emit('send_message', { chatId: selectedChat._id, sender: userId, text });
    setMessage('');
  };

  // Debounced quick search.
  useEffect(() => {
    if (selectedChat) return undefined;
    const query = searchQuery.trim();
    if (!query) { setSearchResults([]); return undefined; }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await searchScraps(query);
        setSearchResults(data.scraps || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedChat]);

  const messageSeller = async (seller) => {
    if (!seller?._id || String(seller._id) === String(userId)) return;
    try {
      const { data: chat } = await createChat(seller._id);
      setChats((prev) => (prev.some((c) => c._id === chat._id) ? prev : [chat, ...prev]));
      await openChat(chat);
    } catch {
      alert('Could not start a conversation with this seller.');
    }
  };

  const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-600">{title}</h3>
        <Icon className="h-6 w-6 text-green-600" />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  const stats = useMemo(() => {
    if (!analytics) return [];
    return [
      { title: 'Revenue (seller)', value: `₹${(analytics.revenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp },
      { title: 'Active Listings', value: analytics.activeListings ?? 0, icon: ArrowUpRight },
      { title: 'Tons Sold', value: analytics.tonsSold ?? 0, icon: Package },
      { title: 'Active Orders', value: analytics.activeOrders ?? 0, icon: ArrowDownRight },
      { title: 'Conversion Rate', value: `${analytics.conversionRate ?? 0}%`, icon: TrendingUp },
      { title: 'Savings (buyer)', value: `₹${(analytics.savings || 0).toLocaleString('en-IN')}`, icon: Users },
    ];
  }, [analytics]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <Recycle className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">ReScrapIt</h1>
        </div>

        <Link
          to="/my-listings/new"
          className="w-full bg-green-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors mb-3"
        >
          <Plus className="h-5 w-5" /> Add Product
        </Link>

        <div className="flex gap-2 mb-2">
          <Link to="/browse" className="flex-1 text-center text-sm border rounded-lg py-1.5 text-gray-600 hover:bg-gray-50">Browse</Link>
          <Link to="/my-listings" className="flex-1 text-center text-sm border rounded-lg py-1.5 text-gray-600 hover:bg-gray-50">Listings</Link>
        </div>
        <div className="flex gap-2 mb-4">
          <Link to="/offers" className="flex-1 text-center text-sm border rounded-lg py-1.5 text-gray-600 hover:bg-gray-50">Offers</Link>
          <Link to="/orders" className="flex-1 text-center text-sm border rounded-lg py-1.5 text-gray-600 hover:bg-gray-50">Orders</Link>
          <Link to="/transactions" className="flex-1 text-center text-sm border rounded-lg py-1.5 text-gray-600 hover:bg-gray-50">Txns</Link>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) closeChat(); }}
            placeholder="Search scrap materials..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Conversations</div>
        <div className="space-y-2 overflow-auto flex-1">
          {chats.length === 0 && (
            <p className="text-sm text-gray-400 px-2">No conversations yet. Browse a listing and message a seller.</p>
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
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{name}</div>
                  <div className="text-xs text-gray-500 truncate">{chat.lastMessage?.text || contact?.email || 'No messages yet'}</div>
                </div>
                {chat.unread > 0 && (
                  <span className="bg-green-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">{chat.unread}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <span className="text-gray-600">{user ? `Welcome, ${user.name}` : ''}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <span>Logout</span> <LogOut className="h-5 w-5" />
          </button>
        </div>

        {selectedChat ? (
          <div className="flex-1 flex">
            <div className="flex-1 flex flex-col bg-white">
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
                <div className="flex items-center gap-1">
                  <button onClick={handleBlock} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500" title="Block user">
                    <Ban className="h-5 w-5" />
                  </button>
                  <button onClick={closeChat} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.length === 0 && <p className="text-center text-gray-400 text-sm">No messages yet. Say hello!</p>}
                {messages.map((msg, index) => {
                  const mine = String(msg.sender) === String(userId);
                  const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <div key={msg._id || index} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs ${mine ? 'order-2' : 'order-1'}`}>
                        <div className={`p-3 rounded-lg ${mine ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          {msg.media && <img src={msg.media} alt="attachment" className="rounded mb-1 max-h-40 object-cover" />}
                          {msg.text}
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${mine ? 'text-right' : 'text-left'}`}>{time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <label className="p-2 text-gray-500 hover:text-green-600 cursor-pointer" title="Attach image">
                    <Paperclip className="h-5 w-5" />
                    <input type="file" className="sr-only" accept="image/*" onChange={handleAttach} />
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button type="submit" className="bg-green-600 text-white rounded-lg p-2 hover:bg-green-700 transition-colors">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : searchQuery ? (
          <div className="flex-1 flex flex-col overflow-auto">
            <div className="flex-1 p-6">
              <h2 className="text-xl font-semibold mb-4">{searchLoading ? 'Searching…' : `Search Results for "${searchQuery}"`}</h2>
              {!searchLoading && searchResults.length === 0 && <p className="text-gray-500">No listings match your search.</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((result) => (
                  <div key={result._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
                    <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {result.images?.[0] ? <img src={result.images[0]} alt={result.name} className="w-full h-full object-cover" /> : <Package className="h-8 w-8 text-gray-300" />}
                    </div>
                    <Link to={`/listing/${result._id}`} className="font-semibold text-lg mb-1 hover:underline">{result.name}</Link>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{result.description}</p>
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                      <span>{formatPrice(result.price, result.priceUnit)}</span>
                      <span>{result.seller?.name || 'Seller'}</span>
                    </div>
                    <button
                      onClick={() => messageSeller(result.seller)}
                      className="mt-auto flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-green-700 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" /> Message Seller
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-8 bg-white overflow-auto">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((s) => <StatCard key={s.title} title={s.title} value={s.value} icon={s.icon} />)}
            </div>
            {!analytics && <p className="text-gray-400 mt-6">Loading your stats…</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

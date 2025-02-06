import React, { useState } from 'react';
import { Search, Plus, Send, Recycle, TrendingUp, ArrowUpRight, ArrowDownRight, Users, X, Upload, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    quantity: '',
    images: []
  });

  const handleLogout = () => {
    console.log('Logging out...');
    navigate("/");
  };

  const [chatMessages, setChatMessages] = useState({
    'John Smith': [
      { text: "Hi! I'm interested in your metal scraps.", sender: 'other', time: '09:30' },
      { text: "Sure, I have 2 tons of aluminum scrap available.", sender: 'user', time: '09:32' }
    ],
    'Sarah Chen': [
      { text: "Do you have any copper waste?", sender: 'other', time: '10:15' },
      { text: "Yes, about 500kg from our recent project.", sender: 'user', time: '10:20' }
    ],
    'Mike Johnson': []
  });

  const searchResults = [
    { id: 1, name: 'Aluminum Scrap', quantity: '2.5 tons', type: 'Metal' },
    { id: 2, name: 'Copper Wire', quantity: '500 kg', type: 'Metal' },
    { id: 3, name: 'Steel Sheets', quantity: '1.2 tons', type: 'Metal' },
    { id: 4, name: 'Electronic Waste', quantity: '800 kg', type: 'E-waste' }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChat) {
      const newMessage = { text: message, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatMessages(prev => ({
        ...prev,
        [selectedChat]: [...prev[selectedChat], newMessage]
      }));
      setMessage('');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewProduct(prev => ({
            ...prev,
            images: [...prev.images, reader.result]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    console.log('New Product:', newProduct);
    setNewProduct({ name: '', description: '', quantity: '', images: [] });
    setShowAddProduct(false);
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, bgColor = 'bg-white', compact = false }) => {
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scrap materials..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          {Object.keys(chatMessages).map(contact => (
            <button
              key={contact}
              onClick={() => setSelectedChat(contact)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                selectedChat === contact ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {contact.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{contact}</div>
                <div className="text-xs text-gray-500">
                  {chatMessages[contact].length > 0
                    ? chatMessages[contact][chatMessages[contact].length - 1].text.slice(0, 20) + '...'
                    : 'No messages yet'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar with Logout */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-end">
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
            {/* Compact Stats Header when chat is open */}
            <header className="bg-white border-b border-gray-200 p-6">
              <div className="grid grid-cols-4 gap-4">
                <StatCard
                  title="Total Sales"
                  value="$128,400"
                  icon={TrendingUp}
                  trendValue="+12% vs last month"
                  bgColor="bg-white"
                />
                <StatCard
                  title="Scrap Exported"
                  value="245 tons"
                  icon={ArrowUpRight}
                  trendValue="+8% increase"
                  bgColor="bg-white"
                />
                <StatCard
                  title="Scrap Imported"
                  value="180 tons"
                  icon={ArrowDownRight}
                  trendValue="-5% decrease"
                  bgColor="bg-white"
                />
                <StatCard
                  title="Active Partners"
                  value="24"
                  icon={Users}
                  trendValue="+3 new this month"
                  bgColor="bg-white"
                />
              </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 flex">
              <div className="flex-1 flex flex-col bg-white">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {selectedChat.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedChat}</h2>
                      <p className="text-sm text-gray-500">Active now</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {chatMessages[selectedChat].map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            msg.sender === 'user'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${
                          msg.sender === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
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
          // Search Results View with Compact Stats
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard
                  title="Total Sales"
                  value="$128,400"
                  icon={TrendingUp}
                  trendValue="+12% vs last month"
                  bgColor="bg-white"
                  compact={true}
                />
                <StatCard
                  title="Scrap Exported"
                  value="245 tons"
                  icon={ArrowUpRight}
                  trendValue="+8% increase"
                  bgColor="bg-white"
                  compact={true}
                />
                <StatCard
                  title="Scrap Imported"
                  value="180 tons"
                  icon={ArrowDownRight}
                  trendValue="-5% decrease"
                  bgColor="bg-white"
                  compact={true}
                />
                <StatCard
                  title="Active Partners"
                  value="24"
                  icon={Users}
                  trendValue="+3 new this month"
                  bgColor="bg-white"
                  compact={true}
                />
              </div>
            </div>
            <div className="flex-1 p-6">
              <h2 className="text-xl font-semibold mb-4">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(result => (
                  <div key={result.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-lg mb-2">{result.name}</h3>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Quantity: {result.quantity}</span>
                      <span>Type: {result.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Default Stats View
          <div className="flex-1 p-8 bg-white">
            <div className="grid grid-cols-2 gap-6">
              <StatCard
                title="Total Sales"
                value="$128,400"
                icon={TrendingUp}
                trendValue="+12% vs last month"
                bgColor="bg-gray-50"
              />
              <StatCard
                title="Scrap Exported"
                value="245 tons"
                icon={ArrowUpRight}
                trendValue="+8% increase"
                bgColor="bg-gray-50"
              />
              <StatCard
                title="Scrap Imported"
                value="180 tons"
                icon={ArrowDownRight}
                trendValue="-5% decrease"
                bgColor="bg-gray-50"
              />
              <StatCard
                title="Active Partners"
                value="24"
                icon={Users}
                trendValue="+3 new this month"
                bgColor="bg-gray-50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Product</h2>
              <button
                onClick={() => setShowAddProduct(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="space-y-4">
                {/* Multiple Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Images
                  </label>
                  <div className="mt-1 flex flex-col gap-4">
                    {/* Image Preview Grid */}
                    {newProduct.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {newProduct.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Product preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
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
                    
                    {/* Upload Area */}
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
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
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
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
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
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
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
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { 
  RecycleIcon, 
  Factory, 
  Building2,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function AuthModal({ isOpen, onClose, type }) {
  const navigate = useNavigate(); // Get navigate function from react-router-dom
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  if (type === 'signup') {
    navigate('/signup'); // Use navigate instead of window.location.href
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/auth/login', { email, password });
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>
        
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Don't have an account? <a onClick={() => navigate("/signup")} className="text-green-600 hover:underline">Sign up</a></p>
        </div>
      </div>
    </div>
  );
}


function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authType, setAuthType] = useState('signin');

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RecycleIcon className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold">ReScrapIt</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setAuthType('signin');
                  setIsAuthOpen(true);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign In
              </button>
              <a 
                href="/signup"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div 
        className="relative h-screen flex items-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1530983822321-fcac2d3c0f06?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-white mb-6">
              Transforming Industrial Waste into Valuable Resources
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Connect with industries to exchange waste materials, reduce environmental impact, and create sustainable value chains.
            </p>
            <a 
              href="/signup"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center gap-2 transition-all inline-flex"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        type={authType}
      />
{/* Stats Section */}
<div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
              <p className="text-gray-600">Waste Reduction</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">200+</div>
              <p className="text-gray-600">Partner Industries</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">50K</div>
              <p className="text-gray-600">Tons Recycled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Factory className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">List Your Materials</h3>
              <p className="text-gray-600">Register your industrial waste materials on our platform</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Match with Industries</h3>
              <p className="text-gray-600">Our system matches your waste with industries that need it</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <RecycleIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Create Value</h3>
              <p className="text-gray-600">Transform waste into valuable resources and reduce costs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Environmental Impact</h3>
                <p className="text-gray-600">Reduce landfill waste and minimize environmental footprint</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Cost Savings</h3>
                <p className="text-gray-600">Lower waste management costs and find cheaper raw materials</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">New Revenue Streams</h3>
                <p className="text-gray-600">Turn waste into profit by selling to industries that need it</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Regulatory Compliance</h3>
                <p className="text-gray-600">Meet environmental regulations and sustainability goals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-green-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Ready to Transform Your Waste Management?</h2>
          <a 
            href="/signup"
            className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all inline-block"
          >
            Join the Network
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RecycleIcon className="w-8 h-8" />
              <span className="text-xl font-bold">ReScrapIt</span>
            </div>
            <div className="text-gray-400">
              ©️ 2025 ReScrapIt. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        type={authType}
      />
    </div>
  );
}

export default App;
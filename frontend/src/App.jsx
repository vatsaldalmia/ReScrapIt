import React, { useState } from 'react';
import { 
  RecycleIcon, 
  Factory, 
  Building2,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';

function AuthModal({ isOpen, onClose, type, onAuthenticated }) {
  if (!isOpen) return null;

  const handleSignIn = (event) => {
    event.preventDefault();
    
    // Simulate authentication
    const email = event.target.email.value;
    const password = event.target.password.value;

    // Here, you would check the credentials (email, password) with an API or other logic.
    if (email === "user@example.com" && password === "password123") {
      // Call the onAuthenticated function to indicate successful sign-in
      onAuthenticated();
      onClose();
    } else {
      alert("Invalid credentials");
    }
  };

  if (type === 'signup') {
    window.location.href = '/signup';
    return null;
  }

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
        
        <form className="space-y-4" onSubmit={handleSignIn}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your password"
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
          <p>Don't have an account? <a href="/signup" className="text-green-600 hover:underline">Sign up</a></p>
        </div>
      </div>
    </div>
  );
}


  if (type === 'signup') {
    window.location.href = '/signup';
    return null;
  }

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
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your password"
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
          <p>Don't have an account? <a href="/signup" className="text-green-600 hover:underline">Sign up</a></p>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;

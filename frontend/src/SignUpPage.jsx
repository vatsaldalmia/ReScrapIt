import React, { useState } from 'react';
import { RecycleIcon, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function InputField({
  label,
  type,
  name,
  value,
  onChange,
  error,
  placeholder,
  maxLength,
  isTextArea = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {isTextArea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={3}
          className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
          placeholder={placeholder}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function SignUpPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    panCard: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.panCard) newErrors.panCard = 'PAN Card number is required';
    else if (!/[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(formData.panCard)) newErrors.panCard = 'Invalid PAN Card format';

    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';

    if (!formData.address) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    const response = await axios.post("http://localhost:3000/auth/signup", {
      name: formData.username,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phone,
      address: formData.address,
      pan: formData.panCard,
    });

    if (response.status === 201 || response.data.success) {
      navigate("/dashboard");
    }
    else {
      throw new Error(response.data.message || "Signup failed");
    }
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Signup failed. Try again.");
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RecycleIcon className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold">ReScrapIt</span>
            </div>
            <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Create Your Account</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Username *"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Enter your username"
            />
            <InputField
              label="Email Address *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
            />
            <InputField
              label="Password *"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Create a password"
            />
            <InputField
              label="Confirm Password *"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
            />
            <InputField
              label="PAN Card Number *"
              type="text"
              name="panCard"
              value={formData.panCard}
              onChange={handleChange}
              error={errors.panCard}
              placeholder="Enter PAN Card number"
              maxLength={10}
            />
            <InputField
              label="Phone Number *"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="Enter phone number"
              maxLength={10}
            />
            <InputField
              label="Address *"
              isTextArea
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Enter your complete address"
            />

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors font-semibold"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/" className="text-green-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;

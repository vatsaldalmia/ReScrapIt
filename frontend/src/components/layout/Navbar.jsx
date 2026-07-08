import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Recycle, LogOut, Search, Package, MessageSquare, LayoutDashboard, HandCoins, ShoppingBag, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
          <Recycle className="h-7 w-7 text-green-600" />
          <span className="text-xl font-bold text-gray-800">ReScrapIt</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link to="/browse" className={linkClass('/browse')}>
            <Search className="h-4 w-4" /> Browse
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={linkClass('/dashboard')}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link to="/my-listings" className={linkClass('/my-listings')}>
                <Package className="h-4 w-4" /> My Listings
              </Link>
              <Link to="/offers" className={linkClass('/offers')}>
                <HandCoins className="h-4 w-4" /> Offers
              </Link>
              <Link to="/orders" className={linkClass('/orders')}>
                <ShoppingBag className="h-4 w-4" /> Orders
              </Link>
              <Link to="/dashboard" className={linkClass('/messages')}>
                <MessageSquare className="h-4 w-4" /> Messages
              </Link>
              {isAdmin && (
                <Link to="/admin" className={linkClass('/admin')}>
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link to="/settings" className="p-2 text-gray-600 hover:text-gray-900" title="Settings">
                <Settings className="h-5 w-5" />
              </Link>
              <span className="text-sm text-gray-600 hidden sm:inline">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link
                to="/signup"
                className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

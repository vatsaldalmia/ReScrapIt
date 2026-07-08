import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import SignUpPage from './SignUpPage.jsx';
import './index.css';
import Dashboard from './Dashboard.jsx';
import Browse from './pages/Browse.jsx';
import ListingDetail from './pages/ListingDetail.jsx';
import SellerProfile from './pages/SellerProfile.jsx';
import MyListings from './pages/MyListings.jsx';
import ListingEditor from './pages/ListingEditor.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/browse',
    element: <Browse />,
  },
  {
    path: '/listing/:id',
    element: <ListingDetail />,
  },
  {
    path: '/seller/:id',
    element: <SellerProfile />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-listings',
    element: (
      <ProtectedRoute>
        <MyListings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-listings/new',
    element: (
      <ProtectedRoute>
        <ListingEditor />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-listings/:id/edit',
    element: (
      <ProtectedRoute>
        <ListingEditor />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);

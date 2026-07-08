import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Recycle } from 'lucide-react';
import { resetPassword } from '../api/auth';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <Link to="/" className="flex items-center gap-2 mb-6">
        <Recycle className="w-8 h-8 text-green-600" />
        <span className="text-2xl font-bold">ReScrapIt</span>
      </Link>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Set a new password</h1>
        {done ? (
          <p className="text-green-700">Password reset! Redirecting to sign in…</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <div className="text-sm bg-red-50 text-red-600 px-3 py-2 rounded-lg">{error}</div>}
            {!token && <div className="text-sm bg-yellow-50 text-yellow-800 px-3 py-2 rounded-lg">Missing reset token in the URL.</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500" />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">Reset password</button>
          </form>
        )}
      </div>
    </div>
  );
}

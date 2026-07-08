import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Recycle } from 'lucide-react';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await forgotPassword(email);
      setSent(true);
      if (data.devToken) setDevToken(data.devToken);
    } catch {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <Link to="/" className="flex items-center gap-2 mb-6">
        <Recycle className="w-8 h-8 text-green-600" />
        <span className="text-2xl font-bold">ReScrapIt</span>
      </Link>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Reset your password</h1>
        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">If that email exists, we've sent a reset link.</p>
            {devToken && (
              <div className="text-sm bg-yellow-50 text-yellow-800 px-3 py-2 rounded-lg">
                Dev mode: <Link className="underline text-green-700" to={`/reset-password?token=${devToken}`}>use this reset link</Link>
              </div>
            )}
            <Link to="/login" className="text-green-600 hover:underline text-sm">Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500" />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">Send reset link</button>
          </form>
        )}
      </div>
    </div>
  );
}

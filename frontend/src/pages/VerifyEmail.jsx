import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Recycle, BadgeCheck, XCircle } from 'lucide-react';
import { confirmEmailVerification } from '../api/auth';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    (async () => {
      if (!token) return setStatus('error');
      try {
        await confirmEmailVerification(token);
        setStatus('ok');
      } catch {
        setStatus('error');
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <Link to="/" className="flex items-center gap-2 mb-6">
        <Recycle className="w-8 h-8 text-green-600" />
        <span className="text-2xl font-bold">ReScrapIt</span>
      </Link>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        {status === 'verifying' && <p className="text-gray-600">Verifying your email…</p>}
        {status === 'ok' && (
          <>
            <BadgeCheck className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h1 className="text-xl font-bold mb-2">Email verified!</h1>
            <Link to="/settings" className="text-green-600 hover:underline">Go to settings</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h1 className="text-xl font-bold mb-2">Invalid or expired link</h1>
            <Link to="/settings" className="text-green-600 hover:underline">Request a new one</Link>
          </>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage({ type: 'error', text: 'Invalid or expired recovery link. Please request a new one.' });
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    } else {
      alert('Password updated successfully!');
      router.push('/dashboard');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-emerald-500">Reset Password</h2>
          <p className="text-slate-400 mt-2">Enter your new master password below.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {message.text && (
            <p className={`text-sm text-center ${message.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
              {message.text}
            </p>
          )}

          <button
            disabled={loading || message.type === 'error'}
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </main>
  );
}
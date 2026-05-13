"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard'); // We'll create this next!
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage('Check your email for the confirmation link!');
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-emerald-500">Access the Vault</h2>
          <p className="text-slate-400 mt-2">Enter your credentials to manage inventory.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300">Email Address</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {message && <p className="text-sm text-amber-400 text-center">{message}</p>}

          <div className="flex flex-col gap-3">
            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Don't have an account? Sign Up
            </button>
          </div>
        </form>
        
        <Link href="/" className="block text-center text-xs text-slate-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
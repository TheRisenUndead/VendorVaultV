"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Success! Check your email for a confirmation link.' });
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-emerald-500">Create Account</h2>
          <p className="text-slate-400 mt-2">Join Vendor Vault to start tracking inventory.</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
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

          {message.text && (
            <p className={`text-sm text-center ${message.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
              {message.text}
            </p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-emerald-500 hover:underline">Login</Link>
        </p>
      </div>
    </main>
  );
}
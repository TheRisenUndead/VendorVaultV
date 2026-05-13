"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [router]);

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) alert(error.message);
    else alert('Password reset email sent!');
  };

  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  // Determine User Plan
  const isAdmin = user.email === 'kenulas@hotmail.com';
  const planName = isAdmin ? 'Admin (Full Access)' : 'Free Plan';

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Profile Settings</h2>
          <p className="text-slate-400 mt-1">Manage your account details and subscription.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400">Current Plan</p>
              <p className={`text-xl font-bold ${isAdmin ? 'text-amber-400' : 'text-emerald-500'}`}>
                {planName}
              </p>
            </div>
            {!isAdmin && (
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold transition-all">
                Upgrade to Pro
              </button>
            )}
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
              <div className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-slate-200">
                {user.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">User ID</label>
              <div className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-slate-400 font-mono text-xs">
                {user.id}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
              <div className="flex gap-4">
                <div className="flex-1 rounded-lg bg-slate-800 border border-slate-700 p-3 text-slate-400 tracking-widest">
                  ••••••••••••
                </div>
                <button 
                  onClick={handlePasswordReset}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-sm transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
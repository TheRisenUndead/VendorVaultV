"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CollectionsPage() {
  const [user, setUser] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserAndCollections = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      await fetchCollections(user.id);
    };
    
    getUserAndCollections();
  }, [router]);

  const fetchCollections = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching collections:", error);
    } else {
      setCollections(data || []);
    }
    setLoading(false);
  };

  const handleCreateCollection = async () => {
    const newName = prompt("Enter Collection Name (e.g., 'Modern Hits Binder'):");
    if (!newName || !newName.trim()) return;

    const { data, error } = await supabase
      .from('collections')
      .insert([
        { 
          name: newName.trim(), 
          user_id: user.id 
        }
      ])
      .select();

    if (error) {
      alert("Error creating collection: " + error.message);
    } else if (data) {
      // Add the new collection to the top of our state list
      setCollections([data[0], ...collections]);
    }
  };

  if (!user || loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Vault...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50">
        <Link href="/dashboard" className="text-xl font-bold text-emerald-500 hover:opacity-80 transition-opacity">
          Vendor Vault
        </Link>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-100">Your Collections</h2>
            <p className="text-slate-400 mt-1">Organize your inventory by binders, boxes, or cases.</p>
          </div>
          <button 
            onClick={handleCreateCollection}
            className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all"
          >
            + New Collection
          </button>
        </header>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div key={col.id} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors rounded-2xl p-6 group cursor-pointer flex flex-col justify-between h-48">
              
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-slate-200 group-hover:text-emerald-400 transition-colors truncate pr-2">
                  {col.name}
                </h3>
              </div>

              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Cards</p>
                    {/* Hardcoded 0s for now until we build the cards table! */}
                    <p className="font-mono text-xl">0</p> 
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Est. Value</p>
                    <p className="font-mono text-xl text-emerald-500">$0.00</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-sm font-semibold transition-all">
                    View Cards
                  </button>
                  <button className="flex-1 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-600 hover:text-white py-2 rounded-lg text-sm font-semibold border border-emerald-800/50 transition-all">
                    Scan to Here
                  </button>
                </div>
              </div>

            </div>
          ))}

          {/* Empty State */}
          {collections.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-400 mb-4">No collections found.</p>
              <button 
                onClick={handleCreateCollection}
                className="text-emerald-500 font-semibold hover:underline"
              >
                Create your first binder
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
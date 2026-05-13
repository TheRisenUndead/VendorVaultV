import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6">
      <div className="max-w-4xl text-center space-y-10">
        
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Vendor <span className="text-emerald-500">Vault</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
            Stop digging through binders. Scan, price, and track your TCG inventory in milliseconds.
          </p>
        </div>

        {/* Call to Action / Login */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/login" 
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 w-full sm:w-auto"
          >
            Vendor Login
          </Link>
          <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-200 w-full sm:w-auto">
            Learn More
          </button>
        </div>
        
        {/* Features Teaser */}
        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-slate-800/50 mt-12">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="text-emerald-500 mb-3 text-2xl">📷</div>
            <h3 className="font-bold text-lg text-slate-100 mb-2">Live Scanning</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Instantly identify cards with your camera. Pause, confirm, and vault it.
            </p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="text-emerald-500 mb-3 text-2xl">📈</div>
            <h3 className="font-bold text-lg text-slate-100 mb-2">Real-Time Pricing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pull live market data and last-sold prices so you never misprice a hit.
            </p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="text-emerald-500 mb-3 text-2xl">🗄️</div>
            <h3 className="font-bold text-lg text-slate-100 mb-2">Smart Tracking</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Know exactly which binder, box, or display case every card is located in.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
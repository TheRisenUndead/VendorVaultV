"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AutoScannerPage() {
  const webcamRef = useRef(null);
  const isProcessingRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionId = searchParams.get('collectionId') || ''; // Grabs the target binder ID
  
  const [user, setUser] = useState(null);
  const [scanStatus, setScanStatus] = useState('searching'); // searching, found, error
  const [loadingMsg, setLoadingMsg] = useState('Looking for a card...');

  // 1. Check Permissions
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      
      const isAdmin = user.email === 'kenulas@hotmail.com';
      if (!isAdmin) {
        alert("Scanner requires a Pro Plan or Admin Access.");
        return router.push('/dashboard');
      }
      setUser(user);
    };
    checkAccess();
  }, [router]);

  // 2. The Auto-Scan Engine
  const runAutoScan = useCallback(async () => {
    if (isProcessingRef.current || scanStatus === 'found') return;
    if (!webcamRef.current || !webcamRef.current.getScreenshot) return;

    const imageSrc = webcamRef.current.getScreenshot();
    
    // OBS VIRTUAL CAMERA FIX: Check if the buffer returned empty
    if (!imageSrc || imageSrc.length < 500) {
      console.warn("OBS returned an empty frame. Skipping...");
      return;
    }

    isProcessingRef.current = true;

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc })
      });

      const data = await response.json();

      if (data.cardDetected && data.cardId) {
        // CARD FOUND!
        setScanStatus('found');
        setLoadingMsg(`Identified: ${data.metadata?.name}! Routing...`);
        
        // Push to the details page, and carry the collection ID with us
        setTimeout(() => {
          router.push(`/card/${data.cardId}?collectionId=${collectionId}`);
        }, 1500);
      } else {
        // No card seen, unlock for the next frame
        isProcessingRef.current = false;
      }

    } catch (error) {
      console.error("Scan API Error:", error);
      isProcessingRef.current = false; 
    }
  }, [scanStatus, router, collectionId]);

  // 3. The Continuous Loop (3 seconds prevents hitting free tier rate limits)
  useEffect(() => {
    if (scanStatus === 'found' || !user) return;
    const interval = setInterval(() => { runAutoScan(); }, 3000);
    return () => clearInterval(interval);
  }, [runAutoScan, scanStatus, user]);

  if (!user) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Verifying Access...</div>;

  return (
    <main className="flex flex-col min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="p-4 flex justify-between items-center z-10 bg-slate-950/80 backdrop-blur-md absolute top-0 w-full">
        <h2 className="font-bold text-emerald-500">Auto-Scanner Active</h2>
        <Link href={collectionId ? `/collections/${collectionId}` : "/dashboard"} className="text-slate-400 hover:text-white">
          Cancel
        </Link>
      </div>

      {/* Camera Area */}
      <div className="relative flex-grow flex items-center justify-center overflow-hidden bg-black pt-16">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          screenshotQuality={1} // Fixes blurry virtual camera output
          forceScreenshotSourceSize={true} // Bypasses browser CSS scaling
          videoConstraints={{ 
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }}
          className={`absolute min-w-full min-h-full object-cover transition-opacity duration-500 ${scanStatus === 'found' ? 'opacity-40' : 'opacity-100'}`}
        />
        
        {/* Targeting Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className={`w-[75vw] h-[55vh] max-w-sm border-2 rounded-xl relative overflow-hidden transition-colors duration-300 ${scanStatus === 'found' ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/40'}`}>
            {scanStatus === 'searching' && (
              <div className="w-full h-0.5 bg-emerald-500 absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
            )}
          </div>
          
          <div className="mt-8 flex flex-col items-center">
            {scanStatus === 'found' ? (
              <div className="bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-full text-lg shadow-lg shadow-emerald-500/50 flex items-center gap-2">
                <span>✓</span> {loadingMsg}
              </div>
            ) : (
              <p className="text-white font-mono text-sm bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                Hold card steady in frame...
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
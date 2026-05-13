"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AutoScannerPage() {
  const webcamRef = useRef(null);
  const isProcessingRef = useRef(false); // Prevents overlapping API calls
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [scanStatus, setScanStatus] = useState('searching'); // searching, found, error
  const [loadingMsg, setLoadingMsg] = useState('Looking for a card...');

  // 1. Permission Check
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const isAdmin = user.email === 'kenulas@hotmail.com';
      if (!isAdmin) {
        alert("Scanner requires a Pro Plan or Admin Access.");
        router.push('/dashboard');
        return;
      }
      setUser(user);
    };
    checkAccess();
  }, [router]);

  // 2. The Auto-Scan Engine
  const runAutoScan = useCallback(async () => {
    // If we are already processing a frame, or already found a card, stop.
    if (isProcessingRef.current || scanStatus === 'found') return;
    
    // Ensure webcam is ready
    if (!webcamRef.current || !webcamRef.current.getScreenshot) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    isProcessingRef.current = true;

    try {
      // Send the frame silently to our AI backend
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc })
      });

      const data = await response.json();

      if (data.cardDetected && data.cardId) {
        // CARD FOUND! Stop the loop and transition the UI.
        setScanStatus('found');
        setLoadingMsg(`Identified! Routing to vault...`);
        
        // Pause briefly so the user sees the success state, then redirect
        setTimeout(() => {
          router.push(`/card/${data.cardId}`);
        }, 1500);
      } else {
        // No card detected, unlock and let the next loop run
        isProcessingRef.current = false;
      }

    } catch (error) {
      console.error("Scan error:", error);
      isProcessingRef.current = false; // Unlock on error so it keeps trying
    }
  }, [scanStatus, router]);

  // 3. The Continuous Loop Trigger (Fires every 1.5 seconds)
  useEffect(() => {
    if (scanStatus === 'found' || !user) return;

    const interval = setInterval(() => {
      runAutoScan();
    }, 1500);

    return () => clearInterval(interval); // Cleanup when page closes
  }, [runAutoScan, scanStatus, user]);

  if (!user) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Verifying Access...</div>;

  return (
    <main className="flex flex-col min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="p-4 flex justify-between items-center z-10 bg-slate-950/80 backdrop-blur-md absolute top-0 w-full">
        <h2 className="font-bold text-emerald-500">Auto-Scanner Active</h2>
        <Link href="/dashboard" className="text-slate-400 text-sm hover:text-white">Cancel</Link>
      </div>

      {/* Camera Area */}
      <div className="relative flex-grow flex items-center justify-center overflow-hidden bg-black pt-16">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
          className={`absolute min-w-full min-h-full object-cover transition-opacity duration-500 ${scanStatus === 'found' ? 'opacity-40' : 'opacity-100'}`}
        />
        
        {/* Targeting Overlay with Scanning Laser Animation */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className={`w-[75vw] h-[55vh] max-w-sm border-2 rounded-xl relative overflow-hidden transition-colors duration-300 ${scanStatus === 'found' ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/40'}`}>
            
            {/* The animated scanning laser line */}
            {scanStatus === 'searching' && (
              <div className="w-full h-0.5 bg-emerald-500 absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
            )}

            {/* Corner brackets */}
            <div className={`absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg ${scanStatus === 'found' ? 'border-emerald-400' : 'border-white'}`}></div>
            <div className={`absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg ${scanStatus === 'found' ? 'border-emerald-400' : 'border-white'}`}></div>
            <div className={`absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg ${scanStatus === 'found' ? 'border-emerald-400' : 'border-white'}`}></div>
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 rounded-br-lg ${scanStatus === 'found' ? 'border-emerald-400' : 'border-white'}`}></div>
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
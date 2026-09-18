// src/app/qr-card/page.tsx
"use client";

import Image from "next/image";

export default function QRCardPage() {
  const votingUrl = "https://voting-app-pi-two.vercel.app/voting";

  return (
    <div className="min-h-screen bg-[#faf8f5] p-6 md:p-10 flex flex-col items-center justify-center font-sans">
      
      {/* Control Panel (Print လုပ်တဲ့အခါ အလိုအလျောက် ပုန်းနေမည်) */}
      <div className="mb-8 text-center print:hidden">
        <h1 className="text-2xl font-serif font-bold text-[#760000] mb-2 tracking-wide">
          Official Voting QR Card
        </h1>
        <p className="text-xs text-stone-500 mb-4 tracking-wider uppercase">
          Strategy First International College • Fresher's Welcome 2026
        </p>
        <button 
          onClick={() => window.print()}
          className="px-8 py-3 bg-[#760000] hover:bg-[#5a0000] text-[#f4d03f] font-bold text-xs tracking-[0.2em] uppercase rounded-xl shadow-lg transition-all duration-300 cursor-pointer border border-[#c5a059]/40"
        >
          🖨️ Print Official Ballot Card
        </button>
      </div>

      {/* Single Card Layout */}
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-[#c5a059] p-8 shadow-2xl flex flex-col items-center text-center relative print:shadow-none print:border-2 print:m-0">
        
        {/* Brand Header Banner */}
        <div className="w-full bg-[#760000] text-white py-3.5 px-5 rounded-2xl mb-6 flex items-center justify-between border border-[#c5a059]/50 shadow-md">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-[0.25em] font-black text-[#f4d03f] block">
              Strategy First
            </span>
            <span className="text-[9px] text-stone-200 tracking-wider font-light">International College</span>
          </div>
          <span className="text-xs font-serif font-bold text-[#f4d03f] tracking-wide border-l border-white/20 pl-4">
            2026
          </span>
        </div>

        {/* Title */}
        <h2 className="font-serif text-2xl font-bold text-[#760000] mb-1 tracking-wide">
          King & Queen Ballot
        </h2>
        <p className="text-[11px] text-[#8a6d2b] font-semibold tracking-[0.2em] uppercase mb-6">
          Official Voting Pass & Emergency Stub
        </p>

        {/* QR Frame with Brand Accents */}
        <div className="relative w-52 h-52 bg-[#faf8f5] p-3 rounded-2xl border-2 border-[#760000]/20 shadow-inner mb-6 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent("https://voting-app-pi-two.vercel.app/voting")}`} 
            alt="Voting QR Code" 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>

        <p className="text-xs font-mono font-bold text-[#760000] bg-[#760000]/5 px-5 py-1.5 rounded-full border border-[#760000]/15 mb-6 tracking-wide">
          Scan to Cast Your Vote
        </p>

        {/* Offline Emergency Stub */}
        <div className="w-full bg-[#faf8f5] p-4 rounded-2xl border border-[#c5a059]/40 text-left mb-6">
          <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-1.5">
            <span className="text-[10px] font-bold text-[#760000] uppercase tracking-wider">
              Emergency Offline Ballot
            </span>
            <span className="text-[9px] text-stone-400 font-mono">Use only if offline</span>
          </div>
          <div className="space-y-2 text-xs text-stone-700">
            <div className="flex justify-between border-b border-dashed border-stone-300 pb-1">
              <span className="font-medium">Student ID:</span>
              <span className="font-mono font-bold text-stone-400">..............................</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-stone-300 pb-1">
              <span className="font-medium">King Selection (#):</span>
              <span className="font-mono font-bold text-stone-400">..............................</span>
            </div>
            <div className="flex justify-between pb-0.5">
              <span className="font-medium">Queen Selection (#):</span>
              <span className="font-mono font-bold text-stone-400">..............................</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-stone-400 border-t border-stone-100 pt-3 w-full flex justify-between uppercase tracking-wider font-medium">
          <span>Strictly 1 Vote / ID</span>
          <span>Strategy First Mandalar</span>
        </div>
      </div>
    </div>
  );
}
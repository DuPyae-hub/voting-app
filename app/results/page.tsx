// src/app/results/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

const RESULT_TIME = new Date("2026-09-30T18:00:00").getTime();

const shuffleArray = (array: any[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function ResultsPage() {
  const [kings, setKings] = useState<any[]>([]);
  const [queens, setQueens] = useState<any[]>([]);
  
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const schoolSongRef = useRef<HTMLAudioElement | null>(null);
  const drumrollRef = useRef<HTMLAudioElement | null>(null);
  const grandTadaRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    schoolSongRef.current = new Audio("/school-song.mp3");
    schoolSongRef.current.loop = true;

    drumrollRef.current = new Audio("/drumroll.mp3");
    grandTadaRef.current = new Audio("/grand-tada.mp3");

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = RESULT_TIME - now;

      if (distance < 0 && step === 0) {
        setStep(1);
        schoolSongRef.current?.play().catch(e => console.log("Audio play blocked:", e));
      } else if (distance >= 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(
          `${days.toString().padStart(2, '0')}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`
        );
      }
    }, 1000);

    const fetchResults = async () => {
      const { data } = await supabase.from("candidates").select("*").order("vote_count", { ascending: false });
      if (data) {
        const allKings = data.filter((c) => c.type === "king");
        const allQueens = data.filter((c) => c.type === "queen");

        if (step === 1) {
          setKings(shuffleArray(allKings));
          setQueens(shuffleArray(allQueens));
        } else {
          setKings(allKings);
          setQueens(allQueens);
        }
      }
    };

    fetchResults();
    const refreshInterval = setInterval(fetchResults, 5000);
    
    return () => {
      clearInterval(timer);
      clearInterval(refreshInterval);
      schoolSongRef.current?.pause();
      drumrollRef.current?.pause();
      grandTadaRef.current?.pause();
    };
  }, [step]);

  const handleNextStep = () => {
    if (step < 7 && !isRevealing) {
      if (step >= 1 && step < 6) {
        setIsRevealing(true);
        if (drumrollRef.current) {
          drumrollRef.current.currentTime = 0;
          drumrollRef.current.play().catch(err => console.log("Drumroll error:", err));
        }

        setTimeout(() => {
          drumrollRef.current?.pause();
          if (grandTadaRef.current) {
            grandTadaRef.current.currentTime = 0;
            grandTadaRef.current.play().catch(err => console.log("Tada error:", err));
          }
          setStep((prev) => prev + 1);
          setIsRevealing(false);
        }, 2200);
      } else {
        setStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1 && !isRevealing) setStep((prev) => prev - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        handleNextStep();
      }
      if (e.key === 'ArrowLeft') {
        handlePrevStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, isRevealing]);

  if (!isClient) return null;

  const DuoReveal = ({ title, boy, girl }: { title: string, boy: any, girl: any }) => (
    <div className="flex-grow flex flex-col items-center justify-center p-6 animate-[majesticFade_1.5s_cubic-bezier(0.16,1,0.3,1)] relative z-20">
      <div className="text-center mb-10">
        <span className="text-[#F7D070] text-xs font-bold tracking-[0.4em] uppercase block mb-2">Royal Announcement</span>
        <h3 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-widest drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h3>
        <div className="w-40 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4"></div>
      </div>
      <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
        {boy && (
          <div className="w-80 bg-[#1a0306]/90 p-5 rounded-3xl border border-[#D4AF37]/50 backdrop-blur-xl shadow-[0_0_50px_rgba(128,0,16,0.3)] animate-[royalSlideLeft_1.2s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="relative aspect-[4/3] bg-[#0a0103] rounded-2xl overflow-hidden flex items-center justify-center p-2 mb-4 border border-[#D4AF37]/20 shadow-inner">
              <Image src={boy.image_url} alt={boy.name} fill sizes="350px" className="object-contain p-1" />
              <div className="absolute top-3 left-3 bg-[#800010] text-[#F7D070] px-3.5 py-1 rounded-full text-xs font-bold shadow-lg">
                {boy.candidate_number}
              </div>
            </div>
            <div className="text-center pb-2">
              <h4 className="font-bold text-2xl text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{boy.name}</h4>
              <p className="text-[#D4AF37] text-xs tracking-widest uppercase">Honored Finalist</p>
            </div>
          </div>
        )}
        <span className="text-5xl italic text-[#D4AF37] animate-[pulseSlow_3s_infinite]" style={{ fontFamily: "'Playfair Display', serif" }}>✦</span>
        {girl && (
          <div className="w-80 bg-[#1a0306]/90 p-5 rounded-3xl border border-[#D4AF37]/50 backdrop-blur-xl shadow-[0_0_50px_rgba(128,0,16,0.3)] animate-[royalSlideRight_1.2s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="relative aspect-[4/3] bg-[#0a0103] rounded-2xl overflow-hidden flex items-center justify-center p-2 mb-4 border border-[#D4AF37]/20 shadow-inner">
              <Image src={girl.image_url} alt={girl.name} fill sizes="350px" className="object-contain p-1" />
              <div className="absolute top-3 left-3 bg-[#800010] text-[#F7D070] px-3.5 py-1 rounded-full text-xs font-bold shadow-lg">
                {girl.candidate_number}
              </div>
            </div>
            <div className="text-center pb-2">
              <h4 className="font-bold text-2xl text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{girl.name}</h4>
              <p className="text-[#D4AF37] text-xs tracking-widest uppercase">Honored Finalist</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const SoloReveal = ({ title, candidate }: { title: string, candidate: any }) => (
    <div className="flex-grow flex flex-col items-center justify-center p-6 animate-[majesticFade_1.5s_cubic-bezier(0.16,1,0.3,1)] relative z-20">
      <div className="text-center mb-8">
        <span className="text-[#F7D070] text-xs font-bold tracking-[0.5em] uppercase block mb-2">Supreme Crown</span>
        <h3 className="text-5xl md:text-7xl font-bold text-[#D4AF37] uppercase tracking-widest drop-shadow-[0_0_40px_rgba(212,175,55,0.6)] animate-[textGlow_4s_infinite]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h3>
        <div className="w-56 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4"></div>
      </div>
      {candidate && (
        <div className="w-96 bg-[#1a0306]/95 p-7 rounded-[2.5rem] border-2 border-[#D4AF37] backdrop-blur-3xl shadow-[0_0_80px_rgba(128,0,16,0.6)] animate-[royalZoom_1.4s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="relative aspect-[4/3] bg-[#0a0103] rounded-2xl overflow-hidden flex items-center justify-center p-3 mb-5 border border-[#D4AF37]/30 shadow-2xl">
            <Image src={candidate.image_url} alt={candidate.name} fill sizes="400px" className="object-contain p-1" />
            <div className="absolute top-4 left-4 bg-[#800010] text-[#F7D070] px-4 py-1.5 rounded-full text-sm font-bold shadow-2xl border border-[#D4AF37]/50 animate-bounce">
              👑 {candidate.candidate_number}
            </div>
          </div>
          <div className="text-center">
            <h4 className="font-bold text-3xl text-white mb-2 drop-shadow-md" style={{ fontFamily: "'Playfair Display', serif" }}>{candidate.name}</h4>
            <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-xs font-bold">Strategy First 2026 Sovereign</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#120205] text-[#F7D070] flex flex-col relative overflow-hidden selection:bg-[#800010] selection:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Background Animated Orbs */}
      <div className="absolute top-[-10%] left-[10%] w-[35rem] h-[35rem] bg-[#800010]/15 rounded-full blur-[140px] animate-[floatGlow1_10s_infinite_ease-in-out] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[5%] w-[45rem] h-[45rem] bg-[#D4AF37]/10 rounded-full blur-[160px] animate-[floatGlow2_12s_infinite_ease-in-out] pointer-events-none"></div>

      {/* Suspense Overlay */}
      {isRevealing && (
        <div className="fixed inset-0 z-50 bg-[#120205]/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-[majesticFade_0.4s_ease-out]">
          <div className="relative w-28 h-28 rounded-full border border-[#D4AF37]/30 flex items-center justify-center mb-6 animate-pulse">
            <div className="absolute inset-0 rounded-full border-t-2 border-[#D4AF37] animate-spin"></div>
            <span className="text-4xl">👑</span>
          </div>
          <h2 className="text-3xl md:text-5xl text-[#D4AF37] tracking-[0.35em] uppercase animate-pulse text-center drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            Awaiting the Sovereign...
          </h2>
          <p className="text-[#F7D070]/60 text-xs tracking-[0.3em] uppercase mt-4">Orchestral Suspense in Progress</p>
        </div>
      )}

      {/* Header */}
      <div className="pt-8 pb-6 flex flex-col items-center border-b border-[#D4AF37]/10 bg-[#120205]/80 backdrop-blur-md z-10 shadow-2xl relative">
        <div className="flex items-center gap-4 mb-1">
          <div className="relative w-14 h-14 md:w-16 md:h-16 bg-[#800010]/20 p-2 rounded-2xl border border-[#800010]">
            <Image src="https://qnupslgliykfalnchsfg.supabase.co/storage/v1/object/public/Candidates/Untitled%20design-6.png" alt="SF Logo" fill sizes="64px" className="object-contain p-2" priority />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-lg md:text-xl font-light tracking-[0.35em] uppercase text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Strategy First</h1>
            <p className="text-xs md:text-sm text-[#D4AF37] tracking-[0.25em] uppercase font-bold">Fresher's Welcome 2026</p>
          </div>
        </div>
      </div>

      {/* Screen 0: Countdown */}
      {step === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center z-20 relative">
          <div className="bg-[#1a0306]/60 backdrop-blur-md p-12 md:p-24 rounded-[2.5rem] border border-[#D4AF37]/30 shadow-[0_0_80px_rgba(128,0,16,0.4)] max-w-4xl w-full">
            <span className="text-5xl mb-6 block animate-[pulseSlow_3s_infinite]">👑</span>
            <h3 className="text-2xl md:text-4xl text-[#D4AF37] mb-6 uppercase tracking-[0.3em] font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Grand Reveal Begins In
            </h3>
            <div className="text-5xl md:text-7xl lg:text-8xl font-mono font-bold text-white tracking-wider animate-[textGlow_3s_infinite]">
              {timeLeft}
            </div>
            <p className="mt-8 text-[#F7D070]/50 text-xs tracking-[0.4em] uppercase">Please take your seats • Royal Ceremony</p>
          </div>
        </div>
      )}

      {/* Screen 1 & 7: Leaderboard */}
      {(step === 1 || step === 7) && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 w-full flex-grow animate-[majesticFade_1s_ease-out] z-20 relative">
          <div className="col-span-full text-center mb-2">
             <span className="text-[#F7D070] text-xs font-bold tracking-[0.3em] uppercase">Ceremony Hall</span>
             <h2 className="text-4xl md:text-6xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {step === 1 ? "Official Nominees" : "Final Voting Results"}
             </h2>
          </div>
          
          {/* Kings Leaderboard */}
          <div className="bg-[#1a0306]/80 p-6 md:p-8 rounded-3xl border border-[#D4AF37]/20 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-bold text-center text-[#D4AF37] mb-6 border-b border-[#D4AF37]/20 pb-3 uppercase tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>
              👑 Kings Leaderboard
            </h3>
            <div className="space-y-3.5">
              {kings.map((king, index) => (
                <div key={king.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-700 ${step === 7 && index === 0 ? "bg-[#800010] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-105" : "bg-[#120205] border-[#D4AF37]/10"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-[#D4AF37] text-[#120205]" : "bg-[#1a0306] text-[#F7D070]"}`}>
                      #{index + 1}
                    </div>
                    <div className="relative w-14 h-14 bg-[#0a0103] rounded-xl overflow-hidden border border-[#D4AF37]/10 flex-shrink-0">
                       <Image src={king.image_url} alt={king.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-base md:text-lg">{king.name}</div>
                      <div className="text-xs text-[#D4AF37] font-mono">{king.candidate_number}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono text-[#F7D070]">
                    {step === 1 ? "???" : `${king.vote_count}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Queens Leaderboard */}
          <div className="bg-[#1a0306]/80 p-6 md:p-8 rounded-3xl border border-[#D4AF37]/20 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-bold text-center text-[#D4AF37] mb-6 border-b border-[#D4AF37]/20 pb-3 uppercase tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>
              👑 Queens Leaderboard
            </h3>
            <div className="space-y-3.5">
              {queens.map((queen, index) => (
                <div key={queen.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-700 ${step === 7 && index === 0 ? "bg-[#800010] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-105" : "bg-[#120205] border-[#D4AF37]/10"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-[#D4AF37] text-[#120205]" : "bg-[#1a0306] text-[#F7D070]"}`}>
                      #{index + 1}
                    </div>
                    <div className="relative w-14 h-14 bg-[#0a0103] rounded-xl overflow-hidden border border-[#D4AF37]/10 flex-shrink-0">
                       <Image src={queen.image_url} alt={queen.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-base md:text-lg">{queen.name}</div>
                      <div className="text-xs text-[#D4AF37] font-mono">{queen.candidate_number}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono text-[#F7D070]">
                    {step === 1 ? "???" : `${queen.vote_count}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen Reveals */}
      {step === 2 && <DuoReveal title="Mr. & Ms. Popular" boy={kings[2]} girl={queens[2]} />}
      {step === 3 && <DuoReveal title="Prince & Princess" boy={kings[1]} girl={queens[1]} />}
      {step === 4 && <SoloReveal title="Queen of 2026" candidate={queens[0]} />}
      {step === 5 && <SoloReveal title="King of 2026" candidate={kings[0]} />}
      {step === 6 && <DuoReveal title="The King & Queen of 2026" boy={kings[0]} girl={queens[0]} />}

      {/* Presentation Controls */}
      {step > 0 && step < 7 && (
        <div className="fixed bottom-6 right-6 flex gap-3 z-50">
          <button onClick={handlePrevStep} disabled={isRevealing} className="px-5 py-2.5 bg-[#1a0306] hover:bg-[#120205] rounded-xl text-[#F7D070] border border-[#D4AF37]/30 transition-all text-xs font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50">
            ⬅️ Prev
          </button>
          <button onClick={handleNextStep} disabled={isRevealing} className="px-7 py-3 bg-[#800010] hover:bg-[#a30015] text-[#F7D070] rounded-xl transition-all text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(128,0,16,0.5)] cursor-pointer disabled:opacity-50 flex items-center gap-2">
            <span>Next Royal Reveal</span> <span>✨</span>
          </button>
        </div>
      )}

      {/* Global Font Injection & Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap');
        @keyframes majesticFade { 0% { opacity: 0; transform: scale(0.95) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes royalSlideLeft { 0% { opacity: 0; transform: translateX(-40px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes royalSlideRight { 0% { opacity: 0; transform: translateX(40px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes royalZoom { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes floatGlow1 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; } 50% { transform: translate(30px, -30px) scale(1.1); opacity: 0.25; } }
        @keyframes floatGlow2 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; } 50% { transform: translate(-30px, 40px) scale(1.15); opacity: 0.2; } }
        @keyframes pulseSlow { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.02); } }
        @keyframes textGlow { 0%, 100% { text-shadow: 0 0 10px rgba(212,175,55,0.2); } 50% { text-shadow: 0 0 25px rgba(212,175,55,0.6), 0 0 5px rgba(212,175,55,0.4); } }
      `}} />
    </div>
  );
}
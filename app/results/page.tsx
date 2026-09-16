// src/app/results/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// 🔴 ဤနေရာတွင် Result ကြေညာမည့်အချိန်ကို ပြင်ပါ 🔴
const RESULT_TIME = new Date("2026-09-13T17:47:00").getTime();

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
    <div className="flex-grow flex flex-col items-center justify-center p-6 animate-[majesticFade_1.5s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="text-center mb-10">
        <span className="text-[#f4d03f] text-xs font-bold tracking-[0.4em] uppercase block mb-2">Royal Announcement</span>
        <h3 className="text-4xl md:text-6xl font-serif font-bold text-white uppercase tracking-widest drop-shadow-[0_0_40px_rgba(244,208,63,0.8)]">
          {title}
        </h3>
        <div className="w-40 h-1 bg-gradient-to-r from-transparent via-[#f4d03f] to-transparent mx-auto mt-4"></div>
      </div>
      <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
        {boy && (
          <div className="w-80 bg-white/10 p-4 rounded-3xl border-2 border-[#f4d03f] backdrop-blur-2xl shadow-[0_0_60px_rgba(244,208,63,0.3)] animate-[royalSlideLeft_1.2s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="relative aspect-[4/3] bg-stone-900 rounded-2xl overflow-hidden flex items-center justify-center p-2 mb-4 border border-white/20 shadow-inner">
              <Image src={boy.image_url} alt={boy.name} fill sizes="350px" className="object-contain p-1" />
              <div className="absolute top-3 left-3 bg-[#760000] text-[#f4d03f] px-3.5 py-1 rounded-full text-xs font-extrabold shadow-lg border border-[#f4d03f]/40">
                {boy.candidate_number}
              </div>
            </div>
            <div className="text-center pb-2">
              <h4 className="font-serif font-bold text-2xl text-white mb-1">{boy.name}</h4>
              <p className="text-[#f4d03f] text-xs tracking-widest uppercase font-semibold">Honored Finalist</p>
            </div>
          </div>
        )}
        <span className="text-5xl font-serif italic text-[#f4d03f] animate-pulse">✦</span>
        {girl && (
          <div className="w-80 bg-white/10 p-4 rounded-3xl border-2 border-[#f4d03f] backdrop-blur-2xl shadow-[0_0_60px_rgba(244,208,63,0.3)] animate-[royalSlideRight_1.2s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="relative aspect-[4/3] bg-stone-900 rounded-2xl overflow-hidden flex items-center justify-center p-2 mb-4 border border-white/20 shadow-inner">
              <Image src={girl.image_url} alt={girl.name} fill sizes="350px" className="object-contain p-1" />
              <div className="absolute top-3 left-3 bg-[#760000] text-[#f4d03f] px-3.5 py-1 rounded-full text-xs font-extrabold shadow-lg border border-[#f4d03f]/40">
                {girl.candidate_number}
              </div>
            </div>
            <div className="text-center pb-2">
              <h4 className="font-serif font-bold text-2xl text-white mb-1">{girl.name}</h4>
              <p className="text-[#f4d03f] text-xs tracking-widest uppercase font-semibold">Honored Finalist</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const SoloReveal = ({ title, candidate }: { title: string, candidate: any }) => (
    <div className="flex-grow flex flex-col items-center justify-center p-6 animate-[majesticFade_1.5s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="text-center mb-8">
        <span className="text-[#f4d03f] text-xs font-bold tracking-[0.5em] uppercase block mb-2">Supreme Crown</span>
        <h3 className="text-5xl md:text-7xl font-serif font-bold text-[#f4d03f] uppercase tracking-widest drop-shadow-[0_0_50px_rgba(244,208,63,0.9)]">
          {title}
        </h3>
        <div className="w-56 h-1 bg-gradient-to-r from-transparent via-[#f4d03f] to-transparent mx-auto mt-4"></div>
      </div>
      {candidate && (
        <div className="w-96 bg-gradient-to-b from-white/25 to-white/5 p-6 rounded-[2.5rem] border-4 border-[#f4d03f] backdrop-blur-2xl shadow-[0_0_120px_rgba(244,208,63,0.7)] animate-[royalZoom_1.4s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="relative aspect-[4/3] bg-stone-900 rounded-2xl overflow-hidden flex items-center justify-center p-3 mb-5 border-2 border-[#f4d03f] shadow-2xl">
            <Image src={candidate.image_url} alt={candidate.name} fill sizes="400px" className="object-contain p-1" />
            <div className="absolute top-4 left-4 bg-[#760000] text-[#f4d03f] px-4 py-1.5 rounded-full text-sm font-black shadow-2xl border-2 border-[#f4d03f] animate-bounce">
              👑 {candidate.candidate_number}
            </div>
          </div>
          <div className="text-center">
            <h4 className="font-serif font-bold text-3xl text-white mb-2 drop-shadow-md">{candidate.name}</h4>
            <p className="text-[#f4d03f] tracking-[0.3em] uppercase text-xs font-bold">Strategy First 2026 Sovereign</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    // 💡 Strategy First ၏ တရားဝင် Brand Color (Deep Red / #760000) သို့ အတိအကျ ချိန်ညှိထားသည်
    <div className="min-h-screen bg-gradient-to-b from-[#760000] via-[#520000] to-[#300000] text-white font-sans flex flex-col relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f4d03f]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#760000]/30 rounded-full blur-[140px] animate-pulse"></div>
      </div>

      {/* Majestic Suspense Overlay */}
      {isRevealing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-center animate-[majesticFade_0.4s_ease-out]">
          <div className="relative w-28 h-28 rounded-full border-4 border-[#f4d03f]/30 flex items-center justify-center mb-6 animate-pulse">
            <div className="absolute inset-0 rounded-full border-t-4 border-[#f4d03f] animate-spin"></div>
            <span className="text-4xl">👑</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl text-[#f4d03f] tracking-[0.35em] uppercase animate-pulse text-center drop-shadow-lg">
            Awaiting the Sovereign...
          </h2>
          <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mt-4">Orchestral Suspense in Progress</p>
        </div>
      )}

      {/* Top Header */}
      <div className="pt-8 pb-6 flex flex-col items-center border-b border-[#f4d03f]/20 bg-[#520000]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4 mb-1">
          <div className="relative w-14 h-14 md:w-16 md:h-16 bg-white/5 p-2 rounded-2xl border border-[#f4d03f]/40 shadow-2xl">
            <Image src="https://qnupslgliykfalnchsfg.supabase.co/storage/v1/object/public/Candidates/Untitled%20design-6.png" alt="SF Logo" fill className="object-contain p-2" priority />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-lg md:text-xl font-light tracking-[0.35em] uppercase text-white">Strategy First</h1>
            <p className="text-xs md:text-sm text-[#f4d03f] tracking-[0.25em] uppercase font-bold">Fresher's Welcome 2026</p>
          </div>
        </div>
      </div>

      {/* Screen 0: Countdown */}
      {step === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="bg-black/50 p-12 md:p-24 rounded-[2.5rem] border-2 border-[#f4d03f]/50 backdrop-blur-2xl shadow-[0_0_90px_rgba(0,0,0,0.9)] max-w-4xl w-full">
            <span className="text-5xl mb-6 block animate-bounce">👑</span>
            <h3 className="text-2xl md:text-4xl font-serif text-[#f4d03f] mb-6 uppercase tracking-[0.3em] font-light">
              The Grand Reveal Begins In
            </h3>
            <div className="text-5xl md:text-7xl lg:text-8xl font-mono font-bold text-white tracking-wider drop-shadow-[0_0_35px_rgba(244,208,63,0.7)]">
              {timeLeft}
            </div>
            <p className="mt-8 text-stone-400 text-xs tracking-[0.4em] uppercase">Please take your seats • Royal Ceremony</p>
          </div>
        </div>
      )}

      {/* Screen 1 & 7: Leaderboard */}
      {(step === 1 || step === 7) && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 w-full flex-grow animate-[majesticFade_1s_ease-out] z-10">
          <div className="col-span-full text-center mb-2">
             <span className="text-[#f4d03f] text-xs font-bold tracking-[0.3em] uppercase">Ceremony Hall</span>
             <h2 className="text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-lg mt-1">
                {step === 1 ? "Official Nominees" : "Final Voting Results"}
             </h2>
          </div>
          
          {/* Kings Leaderboard */}
          <div className="bg-black/30 p-6 md:p-8 rounded-3xl border border-[#f4d03f]/20 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-center text-[#f4d03f] mb-6 border-b border-[#f4d03f]/30 pb-3 uppercase tracking-widest">
              👑 Kings Leaderboard
            </h3>
            <div className="space-y-3.5">
              {kings.map((king, index) => (
                <div key={king.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-700 ${step === 7 && index === 0 ? "bg-gradient-to-r from-[#760000] to-[#520000] border-[#f4d03f] shadow-[0_0_35px_rgba(244,208,63,0.7)] scale-105" : "bg-white/5 border-white/10"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-[#f4d03f] text-[#760000]" : "bg-white/10 text-white"}`}>
                      #{index + 1}
                    </div>
                    <div className="relative w-14 h-14 bg-stone-900 rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
                       <Image src={king.image_url} alt={king.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-base md:text-lg">{king.name}</div>
                      <div className="text-xs text-[#f4d03f] font-mono">{king.candidate_number}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono text-[#f4d03f]">
                    {step === 1 ? "???" : `${king.vote_count}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Queens Leaderboard */}
          <div className="bg-black/30 p-6 md:p-8 rounded-3xl border border-[#f4d03f]/20 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-center text-[#f4d03f] mb-6 border-b border-[#f4d03f]/30 pb-3 uppercase tracking-widest">
              👑 Queens Leaderboard
            </h3>
            <div className="space-y-3.5">
              {queens.map((queen, index) => (
                <div key={queen.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-700 ${step === 7 && index === 0 ? "bg-gradient-to-r from-[#760000] to-[#520000] border-[#f4d03f] shadow-[0_0_35px_rgba(244,208,63,0.7)] scale-105" : "bg-white/5 border-white/10"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-[#f4d03f] text-[#760000]" : "bg-white/10 text-white"}`}>
                      #{index + 1}
                    </div>
                    <div className="relative w-14 h-14 bg-stone-900 rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
                       <Image src={queen.image_url} alt={queen.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-base md:text-lg">{queen.name}</div>
                      <div className="text-xs text-[#f4d03f] font-mono">{queen.candidate_number}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono text-[#f4d03f]">
                    {step === 1 ? "???" : `${queen.vote_count}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen 2: Mr & Ms Popular */}
      {step === 2 && <DuoReveal title="Mr. & Ms. Popular" boy={kings[2]} girl={queens[2]} />}
      
      {/* Screen 3: Prince & Princess */}
      {step === 3 && <DuoReveal title="Prince & Princess" boy={kings[1]} girl={queens[1]} />}
      
      {/* Screen 4: Queen Solo */}
      {step === 4 && <SoloReveal title="Queen of 2026" candidate={queens[0]} />}
      
      {/* Screen 5: King Solo */}
      {step === 5 && <SoloReveal title="King of 2026" candidate={kings[0]} />}
      
      {/* Screen 6: King & Queen Duo */}
      {step === 6 && <DuoReveal title="The King & Queen of 2026" boy={kings[0]} girl={queens[0]} />}

      {/* Presentation Controls */}
      {step > 0 && step < 7 && (
        <div className="fixed bottom-6 right-6 flex gap-3 z-50">
          <button onClick={handlePrevStep} disabled={isRevealing} className="px-5 py-2.5 bg-black/60 hover:bg-black/90 rounded-full text-white backdrop-blur-md transition-all text-xs font-bold uppercase tracking-widest border border-white/20 cursor-pointer disabled:opacity-50">
            ⬅️ Prev
          </button>
          <button onClick={handleNextStep} disabled={isRevealing} className="px-7 py-3 bg-[#f4d03f] hover:bg-[#ffe477] text-[#760000] rounded-full transition-all text-sm font-black uppercase tracking-widest shadow-[0_0_35px_rgba(244,208,63,0.7)] cursor-pointer disabled:opacity-50 flex items-center gap-2">
            <span>Next Royal Reveal</span> <span>✨</span>
          </button>
        </div>
      )}

      {/* Custom Majestic Animations CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes majesticFade {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes royalSlideLeft {
          0% { opacity: 0; transform: translateX(-60px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes royalSlideRight {
          0% { opacity: 0; transform: translateX(60px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes royalZoom {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1.05); }
        }
      `}} />
    </div>
  );
}
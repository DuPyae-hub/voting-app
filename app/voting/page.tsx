// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getDeviceFingerprint } from "@/lib/fingerprint";

const VOTING_DEADLINE = new Date("2026-10-30T15:00:00").getTime();

export default function VotePage() {
  const [studentId, setStudentId] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedKing, setSelectedKing] = useState("");
  const [selectedQueen, setSelectedQueen] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [isVotingClosed, setIsVotingClosed] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = VOTING_DEADLINE - now;

      if (distance < 0) {
        setIsVotingClosed(true);
        setTimeLeft("00:00:00:00");
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeLeft(
          `${days.toString().padStart(2, '0')}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`
        );
      }
    }, 1000);

    const fetchCandidates = async () => {
      const { data } = await supabase.from("candidates").select("*").order("candidate_number");
      if (data) setCandidates(data);
    };
    
    fetchCandidates();
    return () => clearInterval(timer);
  }, []);

  const kings = candidates.filter((c) => c.type === "king");
  const queens = candidates.filter((c) => c.type === "queen");
  const isReadyToSubmit = studentId.length >= 4 && selectedKing && selectedQueen;

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVotingClosed) return;
    
    setLoading(true);
    setMessage(null);

    try {
      if (!isReadyToSubmit) throw new Error("Student ID နှင့် King, Queen နှစ်ဦးလုံးကို ရွေးချယ်ပေးပါ။");
      const deviceFingerprint = await getDeviceFingerprint();
      const { data, error } = await supabase.rpc("submit_vote", {
        p_student_id: studentId,
        p_king_id: selectedKing,
        p_queen_id: selectedQueen,
        p_device_fingerprint: deviceFingerprint,
      });

      if (error) throw new Error("Server error ဖြစ်နေပါသည်။ ခေတ္တစောင့်ဆိုင်းပြီး ပြန်စမ်းကြည့်ပါ။");
      if (typeof data === "string" && data.startsWith("ERROR:")) throw new Error(data.replace("ERROR: ", ""));

      setMessage({ type: "success", text: `Vote Successfully Cast! ကျေးဇူးတင်ပါတယ်။ (Student: ${studentId})` });
      setStudentId(""); setSelectedKing(""); setSelectedQueen("");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [message]);

  if (!isClient) return null;

  return (
    <div className="bg-[#120205] text-[#F7D070] font-sans antialiased min-h-screen flex flex-col relative selection:bg-[#800010] selection:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Pop-up Modal Window */}
      {message && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#120205]/90 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#120205] border border-[#D4AF37]/50 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(212,175,55,0.15)] transform animate-[zoomIn_0.3s_cubic-bezier(0.16,1,0.3,1)] text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${message.type === "success" ? "bg-[#D4AF37]" : "bg-[#800010]"}`}></div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 mt-2 border ${message.type === "success" ? "bg-[#D4AF37]/10 border-[#D4AF37]/30" : "bg-[#800010]/10 border-[#800010]/30"}`}>
               <span className="text-3xl">{message.type === "success" ? "👑" : "⚠️"}</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#D4AF37]" style={{ fontFamily: "'Playfair Display', serif" }}>
               {message.type === "success" ? "Crown Secured!" : "Notice"}
            </h3>
            <p className="text-[#F7D070]/70 mb-8 leading-relaxed text-sm">
              {message.text}
            </p>
            <button
              onClick={() => setMessage(null)}
              className="w-full py-3.5 bg-[#800010] hover:bg-[#a30015] text-[#F7D070] font-bold uppercase tracking-[0.2em] text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#120205]/95 backdrop-blur-md border-b border-[#D4AF37]/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#800010]/20 border border-[#800010] flex items-center justify-center p-2 relative">
              <Image src="https://qnupslgliykfalnchsfg.supabase.co/storage/v1/object/public/Candidates/Untitled%20design-6.png" alt="Logo" fill sizes="50px" className="object-contain p-1" priority />
            </div>
            <div>
              <span className="text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#D4AF37] block">Strategy First</span>
              <span className="text-[9px] md:text-[10px] text-[#F7D070]/60 tracking-wider">International College</span>
            </div>
          </div>
          <div className="text-xs font-semibold px-4 py-1.5 rounded-full bg-[#800010]/20 text-[#F7D070] border border-[#800010]/40 flex items-center gap-2">
            {!isVotingClosed && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span></span>}
            {isVotingClosed ? "Voting Closed" : "Live Royal Ballot"}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="py-16 md:py-24 px-4 text-center relative overflow-hidden border-b border-[#D4AF37]/10">
        <div className="absolute top-[-10%] left-[10%] w-[25rem] h-[25rem] bg-[#800010]/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[10%] w-[35rem] h-[35rem] bg-[#D4AF37]/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-[#800010]/20 border border-[#800010]/50 mb-8">
            <span className="text-[#D4AF37] text-[10px] md:text-xs font-black tracking-[0.4em] uppercase">
              Selection Announcement
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-wide text-white mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Freshers' Welcome <span className="italic font-light text-[#D4AF37]">2026</span>
          </h1>
          
          <h2 className="text-5xl md:text-[5.5rem] uppercase mb-12 text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" style={{ fontFamily: "'Playfair Display', serif" }}>
            King & Queen
          </h2>
          
          {!isVotingClosed && (
            <div className="relative bg-[#120205] border border-[#D4AF37]/30 px-10 py-6 md:py-8 rounded-3xl shadow-[0_0_30px_rgba(128,0,16,0.3)] flex flex-col items-center">
              <p className="text-xs text-[#F7D070] uppercase tracking-[0.4em] font-black opacity-80 mb-3">Voting Closes In</p>
              <p className="text-3xl md:text-5xl font-bold text-white tracking-[0.15em]">
                {timeLeft}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Main Form */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-12 w-full relative z-20 flex-grow">
        {isVotingClosed ? (
          <div className="bg-[#120205] rounded-3xl p-10 md:p-20 shadow-2xl border border-[#D4AF37]/40 max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-[#800010]/20 border border-[#800010] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">👑</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Voting is now Closed!</h2>
            <p className="text-[#F7D070]/70 text-sm tracking-wider uppercase">Thank you to everyone who participated. <br/> Please look forward to the grand royal announcement.</p>
          </div>
        ) : (
          <form onSubmit={handleVote} className="space-y-16">
            
            {/* Student ID Box */}
            <div className="bg-[#1a0306] rounded-3xl p-8 shadow-2xl border border-[#D4AF37]/20 max-w-xl mx-auto text-center">
              <h3 className="text-sm font-extrabold text-[#D4AF37] mb-2 uppercase tracking-[0.3em]">Step 01 : Official Student ID</h3>
              <p className="text-xs text-[#F7D070]/60 mb-6">Please enter your matriculation identification number.</p>
              <input
                type="text"
                placeholder="e.g. 2023B2023"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                className="w-full bg-[#120205] px-5 py-4 rounded-2xl border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 text-center text-xl font-bold tracking-widest text-white outline-none transition-all uppercase shadow-inner"
                required
              />
            </div>

            {/* Kings Section */}
            <div>
              <div className="mb-8 border-b border-[#D4AF37]/20 pb-4 flex justify-between items-end">
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Choose Your <span className="text-[#D4AF37]">King</span>
                </h3>
                <span className="text-xs text-[#800010] bg-[#D4AF37] px-3 py-1 rounded-full uppercase tracking-widest font-bold">Select 1</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {kings.map((king) => (
                  <CandidateCard key={king.id} candidate={king} selected={selectedKing === king.id} onSelect={() => setSelectedKing(king.id)} />
                ))}
              </div>
            </div>

            {/* Queens Section */}
            <div>
              <div className="mb-8 border-b border-[#D4AF37]/20 pb-4 flex justify-between items-end">
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Choose Your <span className="text-[#D4AF37]">Queen</span>
                </h3>
                <span className="text-xs text-[#800010] bg-[#D4AF37] px-3 py-1 rounded-full uppercase tracking-widest font-bold">Select 1</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {queens.map((queen) => (
                  <CandidateCard key={queen.id} candidate={queen} selected={selectedQueen === queen.id} onSelect={() => setSelectedQueen(queen.id)} />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="max-w-md mx-auto pt-8">
              <button
                type="submit"
                disabled={loading || !isReadyToSubmit}
                className={`w-full py-5 px-8 rounded-2xl font-bold text-xs tracking-[0.3em] uppercase transition-all duration-300 shadow-2xl border ${
                  loading || !isReadyToSubmit 
                    ? "bg-[#1a0306] border-[#1a0306] text-[#F7D070]/30 cursor-not-allowed" 
                    : "bg-[#800010] border-[#800010] text-[#F7D070] hover:bg-[#a30015] hover:scale-[1.02] cursor-pointer"
                }`}
              >
                {loading ? "Securing Ballot..." : "Submit Royal Ballot"}
              </button>
            </div>
          </form>
        )}
      </main>
      
      <footer className="bg-[#0a0103] text-[#F7D070]/40 py-8 text-center text-xs mt-auto border-t border-[#D4AF37]/10 tracking-wider">
        Strategy First International College • Fresher's Welcome 2026
      </footer>

      {/* Global Font Injection & Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}} />
    </div>
  );
}

function CandidateCard({ candidate, selected, onSelect }: { candidate: any; selected: boolean; onSelect: () => void; }) {
  return (
    <div 
      onClick={onSelect} 
      className={`group bg-[#1a0306] rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${
        selected 
          ? "border-[#D4AF37] ring-1 ring-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.15)] bg-[#800010]/20" 
          : "border-[#D4AF37]/10 hover:border-[#D4AF37]/50 shadow-lg"
      }`}
    >
      <div className="relative aspect-[4/3] bg-[#0a0103] flex items-center justify-center p-3">
        <Image src={candidate.image_url} alt={candidate.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
        <div className={`absolute top-4 left-4 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg border ${selected ? "bg-[#800010] text-[#F7D070] border-[#800010]" : "bg-[#120205]/80 text-[#D4AF37] border-[#D4AF37]/20"}`}>
          {candidate.candidate_number}
        </div>
        <div className={`absolute top-4 right-4 w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${selected ? "bg-[#F7D070] border-[#F7D070] text-[#120205]" : "bg-[#120205]/40 border-[#D4AF37]/20 text-transparent"}`}>
          <span className="font-extrabold text-sm">✓</span>
        </div>
      </div>
      <div className="p-5 flex flex-col items-center text-center border-t border-[#D4AF37]/10">
        <h4 className="font-bold text-xl tracking-wide text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{candidate.name}</h4>
        <span className="text-[10px] tracking-widest uppercase text-[#F7D070]/60 mt-1">Official Finalist</span>
      </div>
    </div>
  );
}
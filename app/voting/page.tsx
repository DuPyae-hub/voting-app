// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getDeviceFingerprint } from "@/lib/fingerprint";

// 🔴 ဒီနေရာမှာ မဲပေးခြင်း ပိတ်မည့် အချိန်ကို ပြင်ပါ 🔴
const VOTING_DEADLINE = new Date("2026-09-30T15:00:00").getTime();

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

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (message) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [message]);

  if (!isClient) return null;

  return (
    <div className="bg-[#faf8f5] text-stone-900 font-sans antialiased min-h-screen flex flex-col relative">
      
      {/* 🔴 Pop-up Modal Window for Messages 🔴 */}
      {message && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform animate-[zoomIn_0.3s_cubic-bezier(0.16,1,0.3,1)] text-center relative overflow-hidden">
            {/* Top Color Accent */}
            <div className={`absolute top-0 left-0 w-full h-2 ${message.type === "success" ? "bg-emerald-500" : "bg-[#760000]"}`}></div>
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 mt-2 ${message.type === "success" ? "bg-emerald-100" : "bg-red-50"}`}>
               <span className="text-3xl">{message.type === "success" ? "✅" : "⚠️"}</span>
            </div>
            
            <h3 className={`text-xl font-bold mb-3 ${message.type === "success" ? "text-emerald-700" : "text-[#760000]"}`}>
               {message.type === "success" ? "Success!" : "Notice"}
            </h3>
            
            <p className="text-stone-600 mb-8 leading-relaxed font-medium">
              {message.text}
            </p>
            
            <button
              onClick={() => setMessage(null)}
              className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors duration-300 ${
                message.type === "success" 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                  : "bg-[#760000] hover:bg-[#520000] text-white"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#760000] flex items-center justify-center p-2 relative shadow-md">
              <Image src="https://qnupslgliykfalnchsfg.supabase.co/storage/v1/object/public/Candidates/Untitled%20design-6.png" alt="Logo" fill className="object-contain p-1" />
            </div>
            <div>
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-[#760000] block">Strategy First</span>
              <span className="text-[10px] md:text-xs text-stone-500 font-medium">International College</span>
            </div>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 flex items-center gap-2">
            {!isVotingClosed && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
            {isVotingClosed ? "Voting Closed" : "Live Ballot"}
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-[#760000] to-[#520000] text-white py-12 md:py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-3xl md:text-5xl font-semibold tracking-wide text-[#f4d03f] mb-3">Fresher's Welcome 2026</h1>
          <h2 className="text-xl md:text-3xl font-light tracking-widest uppercase mb-4">King & Queen Finalists</h2>
          {!isVotingClosed && (
            <div className="mt-6 inline-block bg-black/20 backdrop-blur-sm border border-[#f4d03f]/20 px-6 py-2 rounded-xl">
              <p className="text-xs text-[#f4d03f] uppercase tracking-[0.2em] mb-1 font-bold">Voting Closes In</p>
              <p className="text-xl md:text-2xl font-mono font-light tracking-wider">{timeLeft}</p>
            </div>
          )}
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10 w-full -mt-8 relative z-10 flex-grow">
        {isVotingClosed ? (
          <div className="bg-white rounded-3xl p-10 md:p-20 shadow-2xl border border-stone-200 max-w-2xl mx-auto text-center mt-10">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔒</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#760000] mb-4">Voting is now Closed!</h2>
            <p className="text-stone-500 text-lg">Thank you to everyone who participated. <br/> Please look forward to the live result announcement.</p>
          </div>
        ) : (
          <form onSubmit={handleVote} className="space-y-12">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-stone-200 max-w-xl mx-auto text-center">
              <h3 className="text-lg font-bold text-[#760000] mb-2 uppercase tracking-widest">Step 01 : Student ID</h3>
              <p className="text-xs text-stone-500 mb-4">Please enter your official Strategy First Student ID.</p>
              <input
                type="text"
                placeholder="e.g. 2023B2023"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                className="w-full bg-stone-50 px-4 py-4 rounded-xl border border-stone-300 focus:border-[#760000] focus:ring-2 focus:ring-[#760000]/20 text-center text-lg font-bold tracking-widest outline-none transition-all uppercase"
                required
              />
            </div>

            <div>
              <div className="mb-6 border-b border-stone-200 pb-3 flex justify-between items-end">
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-stone-900">Choose Your <span className="text-[#760000]">King</span></h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {kings.map((king) => (
                  <CandidateCard key={king.id} candidate={king} selected={selectedKing === king.id} onSelect={() => setSelectedKing(king.id)} />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-6 border-b border-stone-200 pb-3 flex justify-between items-end">
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-stone-900">Choose Your <span className="text-[#760000]">Queen</span></h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {queens.map((queen) => (
                  <CandidateCard key={queen.id} candidate={queen} selected={selectedQueen === queen.id} onSelect={() => setSelectedQueen(queen.id)} />
                ))}
              </div>
            </div>

            <div className="max-w-md mx-auto pt-6">
              <button
                type="submit"
                disabled={loading || !isReadyToSubmit}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm tracking-[0.2em] uppercase transition-all duration-300 shadow-lg ${
                  loading || !isReadyToSubmit ? "bg-stone-200 text-stone-400 cursor-not-allowed" : "bg-[#760000] text-[#f4d03f] hover:bg-[#520000] hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                {loading ? "Processing..." : "Submit Official Ballot"}
              </button>
            </div>
          </form>
        )}
      </main>
      
      <footer className="bg-[#300000] text-stone-400 py-6 text-center text-xs mt-auto border-t border-[#520000]">
        Strategy First International College © 2026
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}

function CandidateCard({ candidate, selected, onSelect }: { candidate: any; selected: boolean; onSelect: () => void; }) {
  return (
    <div onClick={onSelect} className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${selected ? "border-[#760000] ring-2 ring-[#760000] shadow-xl scale-[1.02]" : "border-stone-200 hover:border-[#760000]/40 shadow-sm hover:shadow-md"}`}>
      <div className="relative aspect-[4/3] bg-stone-100 flex items-center justify-center p-2">
        <Image src={candidate.image_url} alt={candidate.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-md text-xs font-bold shadow-sm ${selected ? "bg-[#760000] text-[#f4d03f]" : "bg-white text-stone-800"}`}>
          {candidate.candidate_number}
        </div>
        <div className={`absolute top-3 right-3 w-7 h-7 rounded-full border flex items-center justify-center transition-all ${selected ? "bg-[#760000] border-[#760000]" : "bg-white/80 border-stone-300"}`}>
          {selected && <span className="text-[#f4d03f] font-bold text-sm">✓</span>}
        </div>
      </div>
      <div className={`p-4 flex flex-col items-center text-center border-t transition-colors ${selected ? "bg-[#520000] border-transparent" : "bg-white border-stone-100"}`}>
        <h4 className={`font-bold text-lg ${selected ? "text-[#f4d03f]" : "text-stone-900"}`}>{candidate.name}</h4>
      </div>
    </div>
  );
}
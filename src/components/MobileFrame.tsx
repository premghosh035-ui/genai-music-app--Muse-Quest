import React, { useState, useEffect } from "react";
import { Battery, Wifi, Signal, Clock } from "lucide-react";

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-0 md:p-6 text-white overflow-hidden relative font-sans selection:bg-[#CCFF00] selection:text-black">
      {/* Background ambient accents in theme colors */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-tr from-[#CCFF00]/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-tr from-[#CCFF00]/5 to-transparent blur-[140px] pointer-events-none" />
      
      {/* Phone container style overlay on desktop, full-screen on mobile */}
      <div 
        id="phone_outer_wrapper"
        className="w-full h-screen md:h-[840px] md:w-[390px] md:rounded-3xl md:border-4 md:border-white/10 md:shadow-[0_0_80px_-10px_rgba(204,255,0,0.15)] bg-black flex flex-col overflow-hidden relative md:ring-1 md:ring-[#CCFF00]/10"
      >
        {/* Notch / Dynamic Island */}
        <div className="hidden md:flex absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#0F0F0F] rounded-full z-50 items-center justify-center border border-white/5">
          <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full border border-neutral-800/40 ml-auto mr-3 flex items-center justify-center">
            <div className="w-1 h-1 bg-[#CCFF00]/40 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-11 px-6 pt-2 flex justify-between items-center bg-black text-xs font-semibold z-45 shrink-0 select-none border-b border-white/5">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span id="mobile_clock_display" className="font-mono text-zinc-100 font-bold tracking-tight">{time || "12:00 PM"}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Signal className="w-3.5 h-3.5 text-[#CCFF00]" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-[#CCFF00] font-mono tracking-tighter">92%</span>
              <Battery className="w-4 h-4 text-[#CCFF00] rotate-0" />
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden relative bg-[#0F0F0F]">
          {children}
        </div>

        {/* Home software bar spacer */}
        <div className="h-4 w-full bg-[#0F0F0F] flex items-center justify-center shrink-0 select-none pb-1 border-t border-white/5">
          <div className="w-24 h-1 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

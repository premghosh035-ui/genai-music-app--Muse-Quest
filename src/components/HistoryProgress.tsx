import React, { useState } from "react";
import { Song, Badge } from "../data";
import BrandLogo from "./BrandLogo";
import { 
  Award, Clock, History, Flame, Trophy, CheckCircle, 
  HelpCircle, Star, Zap, Compass, Play, Share2, Check, AlertCircle 
} from "lucide-react";

interface HistoryProgressProps {
  listeningHistory: { song: Song; playedAt: string }[];
  badges: Badge[];
  claimBadge: (badgeId: string) => void;
  earnedPoints: number;
  claimedBadgeIds?: string[];
  setActiveTab?: (tab: string) => void;
  onPlaySong?: (song: Song) => void;
  forceUnlockBadge?: (badgeId: string) => void;
  addPoints?: (val: number) => void;
}

export default function HistoryProgress({
  listeningHistory,
  badges,
  claimBadge,
  earnedPoints,
  setActiveTab,
  onPlaySong,
  forceUnlockBadge,
  addPoints
}: HistoryProgressProps) {
  const [successAnimation, setSuccessAnimation] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const calculateMilestoneLevel = () => {
    if (earnedPoints < 300) return { title: "SONIC WANDERER", nextAt: 300, pct: (earnedPoints / 300) * 100, rank: 1 };
    if (earnedPoints < 600) return { title: "RHYTHM NOVICE", nextAt: 600, pct: ((earnedPoints - 300) / 300) * 100, rank: 2 };
    if (earnedPoints < 1000) return { title: "HARMONY CARTOGRAPHER", nextAt: 1000, pct: ((earnedPoints - 600) / 400) * 100, rank: 3 };
    return { title: "GREAT POLYRHYTHMIC SAGE", nextAt: 3000, pct: Math.min((earnedPoints / 3000) * 100, 100), rank: 4 };
  };

  const levelInfo = calculateMilestoneLevel();

  const handleClaimReward = (badgeId: string, pts: number, name: string) => {
    claimBadge(badgeId);
    setSuccessAnimation(name);
    setTimeout(() => {
      setSuccessAnimation(null);
    }, 2800);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Pre-defined complex tracks for quick matching
  const complexTrack: Song = {
    id: "s3",
    title: "Fractured Logic Gate",
    artist: "Code Transient",
    album: "Recursive Glitch",
    genre: "Neo-Classical IDM",
    bpm: 140,
    duration: "2:58",
    coverColor: "from-emerald-500 via-teal-700 to-neutral-900",
    emoji: "💾",
    songKey: "cyber_glitch",
    vibeText: "Intricate electronic breakbeats that slice up the regular measures into beautiful syncopated rhythmic bursts."
  };

  const grooveTrack: Song = {
    id: "s1",
    title: "Neon Horizon 1988",
    artist: "Retro-Luminance",
    album: "Chronostatic Drives",
    genre: "Outrun Synthwave",
    bpm: 118,
    duration: "3:34",
    coverColor: "from-pink-500 via-purple-600 to-indigo-700",
    emoji: "🌅",
    songKey: "neon_horizon",
    vibeText: "Powered by deep compressed synthesizers that pump with every physical beat, giving you a nostalgic outrun energy of night highways."
  };

  // Play IDM
  const handlePlayIDM = () => {
    if (onPlaySong) {
      onPlaySong(complexTrack);
      triggerToast("💾 Loaded 'Fractured Logic Gate' to populate progressive logging!");
    }
  };

  // Play Groove
  const handlePlayGroove = () => {
    if (onPlaySong) {
      onPlaySong(grooveTrack);
      triggerToast("🌅 Playing 'Neon Horizon'. Launching sync tap game!");
    }
  };

  // Simulated sharing dispatch
  const handleShareDispatch = (badgeId: string) => {
    const copyText = `📡 Muse Quest dispatch // I am listening to futuristic audio streams at Muse Quest! Join my sonic channel.`;
    navigator.clipboard.writeText(copyText);
    triggerToast("📡 Postcard dispatched to clipboard! Social Curator unlocked.");
    
    // Automatically flag as unlocked
    if (forceUnlockBadge) {
      forceUnlockBadge(badgeId);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-4 py-3 scrollbar-none relative bg-[#0F0F0F]">
      
      {/* Toast congrats overlay */}
      {successAnimation && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#CCFF00] border border-black text-black text-[11px] font-black uppercase tracking-wider px-4 py-3 rounded-none shadow-2xl flex flex-col items-center gap-1 animate-bounce">
          <div className="flex items-center gap-1.5 font-bold">
            <Trophy className="w-4 h-4 text-black" />
            <span>ACHIEVEMENT UNLOCKED & CLAIMED!</span>
          </div>
          <span className="text-[10px] text-black">Unlocked: {successAnimation}</span>
        </div>
      )}

      {/* Floating dynamic info toast */}
      {toastMessage && (
        <div className="fixed bottom-16 left-4 right-4 z-50 bg-black border border-[#CCFF00] text-zinc-200 text-[10px] font-mono uppercase tracking-wider px-3.5 py-3 rounded-none shadow-xl flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Achievement Scoreboard */}
      <div className="bg-black p-4 border border-white/10 mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 bg-[#CCFF00] text-black text-[8px] font-black uppercase font-mono px-3">
          DISCOVERY MATRIX STATUS
        </div>
        
        {/* Tier level title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-none bg-zinc-900 border border-white/20 flex items-center justify-center text-xl shadow shrink-0 text-[#CCFF00]">
            {levelInfo.rank === 1 && "🧭"}
            {levelInfo.rank === 2 && "⚡"}
            {levelInfo.rank === 3 && "🌌"}
            {levelInfo.rank === 4 && "👑"}
          </div>
          <div>
            <span className="text-[9px] text-[#CCFF00] uppercase font-mono tracking-[0.2em] font-bold block">LEVEL {levelInfo.rank} ARCHETYPE</span>
            <h3 className="text-lg font-black uppercase italic text-white tracking-tighter mt-0.5">{levelInfo.title}</h3>
            <p className="text-[9px] text-zinc-400 font-mono mt-1">{earnedPoints} accumulated exploration points</p>
          </div>
        </div>

        {/* Meter progress bar */}
        <div className="mt-4 pt-2 border-t border-white/5">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
            <span>Points to Next Level</span>
            <span className="text-white font-bold">{earnedPoints} / {levelInfo.nextAt} PTS</span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-none overflow-hidden border border-white/5 relative">
            <div 
              className="bg-[#CCFF00] h-full transition-all duration-500" 
              style={{ width: `${levelInfo.pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Cabinet */}
      <div className="mb-5">
        <h4 className="text-[10px] font-black text-[#CCFF00] uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#CCFF00]" /> Milestone Cabinet
        </h4>

        {/* Informative Header */}
        <div className="bg-zinc-950 p-2.5 border border-white/5 mb-3 text-[9px] font-mono text-zinc-400 flex items-start gap-2 uppercase leading-relaxed">
          <AlertCircle className="w-4 h-4 text-[#CCFF00] shrink-0" />
          <span>Click interactive goals on locked milestones to complete tasks, or claim unlocked bonuses!</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {badges.map((badge) => {
            const hasClaimed = !!badge.claimed;
            const isUnlocked = !!badge.unlocked && !hasClaimed;
            const isLocked = !badge.unlocked && !hasClaimed;

            return (
              <div 
                key={badge.id}
                className={`p-3.5 rounded-none border transition-all flex flex-col justify-between text-left relative ${
                  hasClaimed 
                    ? "bg-zinc-950 border-white/5 text-zinc-500" 
                    : isUnlocked
                      ? "bg-zinc-900 border-[#CCFF00] text-white shadow-[0_0_12px_rgba(204,255,0,0.15)] animate-[pulse_3s_infinite]" 
                      : "bg-zinc-950/40 border-white/10 text-white"
                }`}
              >
                {/* Visual Glow Status */}
                {isUnlocked && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full bg-[#CCFF00] opacity-75"></span>
                    <span className="relative inline-flex rounded-none h-2 w-2 bg-[#CCFF00]"></span>
                  </span>
                )}
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl w-10 h-10 rounded-none flex items-center justify-center shadow-lg ${
                      hasClaimed ? "bg-zinc-900 border border-white/5 grayscale" : "bg-black border border-white/15"
                    }`}>
                      {badge.emoji}
                    </span>
                    <span className="text-[8px] font-mono uppercase bg-black px-1.5 py-0.5 text-zinc-400 border border-white/5">
                      +{badge.points} PTS
                    </span>
                  </div>

                  <span className={`text-[11px] font-black uppercase tracking-tight block ${
                    hasClaimed ? "text-zinc-500 line-through" : "text-white"
                  }`}>
                    {badge.name}
                  </span>
                  
                  <span className="text-[10px] text-zinc-400 font-sans mt-1 leading-snug block">
                    {badge.description}
                  </span>

                  <div className="mt-2 text-[8.5px] font-mono text-zinc-500 uppercase">
                    Requirement: <span className="text-zinc-300">{badge.requirement}</span>
                  </div>
                </div>

                {/* Interactive Functional Buttons Area */}
                <div className="mt-4 pt-3 border-t border-white/5">
                  {hasClaimed ? (
                    <div className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-zinc-900/40 border border-white/5 text-[9px] text-[#CCFF00]/60 font-mono font-bold select-none uppercase">
                      <CheckCircle className="w-3.5 h-3.5 text-[#CCFF00]/60" /> Claimed & Secured
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleClaimReward(badge.id, badge.points, badge.name)}
                      className="w-full py-2 bg-[#CCFF00] hover:bg-white text-black font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1.5 border border-black shadow-lg"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      CLAIM +{badge.points} XP NOW!
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      {/* Action Guide Buttons based on Badge ID */}
                      {badge.id === "b1" && (
                        <button
                          onClick={() => {
                            if (setActiveTab) setActiveTab("quest");
                          }}
                          className="w-full py-2 bg-zinc-900 hover:bg-[#CCFF00] hover:text-black text-[#CCFF00] font-mono uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-1.5 border border-white/10"
                        >
                          <Compass className="w-3 h-3" />
                          👉 GO RUN TASTE QUIZ
                        </button>
                      )}

                      {badge.id === "b2" && (
                        <button
                          onClick={handlePlayGroove}
                          className="w-full py-2 bg-zinc-900 hover:bg-[#CCFF00] hover:text-black text-[#CCFF00] font-mono uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-1.5 border border-white/10"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          👉 PLAY & SYNC BEAT
                        </button>
                      )}

                      {badge.id === "b3" && (
                        <button
                          onClick={handlePlayIDM}
                          className="w-full py-2 bg-zinc-900 hover:bg-[#CCFF00] hover:text-black text-[#CCFF00] font-mono uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-1.5 border border-white/10"
                        >
                          <Zap className="w-3 h-3" />
                          👉 PLAY COMPLEX IDM
                        </button>
                      )}

                      {badge.id === "b4" && (
                        <button
                          onClick={() => handleShareDispatch(badge.id)}
                          className="w-full py-2 bg-zinc-900 hover:bg-[#CCFF00] hover:text-black text-[#CCFF00] font-mono uppercase text-[9px] tracking-wider transition-all flex items-center justify-center gap-1.5 border border-white/10"
                        >
                          <Share2 className="w-3 h-3" />
                          👉 DISPATCH POSTCARD
                        </button>
                      )}

                      {/* Force system override cheat code block */}
                      <button
                        onClick={() => {
                          if (forceUnlockBadge) {
                            forceUnlockBadge(badge.id);
                            triggerToast(`🔋 Telemetry override: ${badge.name} unlocked!`);
                          }
                        }}
                        className="w-full py-1 bg-black hover:bg-red-950/40 text-rose-500 font-mono text-[7.5px] uppercase tracking-wider transition-colors border border-white/5 opacity-55 hover:opacity-100 flex items-center justify-center gap-1"
                      >
                        ⚡ BYPASS UNLOCK REQUIREMENT
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Listening History List */}
      <div>
        <h4 className="text-[10px] font-black text-[#CCFF00] uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
          <History className="w-4 h-4 text-[#CCFF00]" /> Recent Listening Logs
        </h4>

        {listeningHistory.length === 0 ? (
          <div className="p-6 bg-black border border-dashed border-white/10 rounded-none text-center">
            <Clock className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400 font-mono uppercase">LOGGER UNINITIATED</p>
            <p className="text-[10px] text-zinc-500 mt-1">Play any track wave-frequencies to log values.</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
            {listeningHistory.map((item, idx) => (
              <div 
                key={idx}
                className="p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-white/10 rounded-none flex justify-between items-center transition-all"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`w-7 h-7 rounded-none bg-gradient-to-tr ${item.song.coverColor} flex items-center justify-center text-xs shadow-inner`}>
                    <span>{item.song.emoji}</span>
                  </div>
                  <div className="truncate text-left leading-tight">
                    <strong className="text-[11px] block text-white font-black uppercase truncate">{item.song.title}</strong>
                    <span className="text-[9px] text-zinc-400 font-mono truncate block">{item.song.artist} • {item.song.bpm}BPM</span>
                  </div>
                </div>
                
                <span className="text-[9px] text-zinc-500 font-mono shrink-0">
                  {item.playedAt}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official MuseQuest Branding & Certification Card */}
      <div id="muse_quest_certification" className="mt-8 p-5 bg-zinc-950 border border-amber-500/20 rounded-none text-center relative overflow-hidden shadow-2xl select-none">
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,176,65,0.08)_0%,transparent_70%)] pointer-events-none" />
        <BrandLogo size="lg" showText={true} withGlow={true} className="mx-auto mb-3" />
        <p className="text-[9px] font-mono tracking-[0.2em] text-[#CCFF00] uppercase font-black">Sonic Academy Certified Partner</p>
        <p className="text-[10.5px] text-zinc-300 mt-2.5 max-w-xs mx-auto leading-relaxed">
          This certifies that your custom soundwave engine utilizes state-of-the-art neural music synthesis and waveform analysis provided by the official MUSEQUEST sound environment.
        </p>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[8px] font-mono text-amber-500/80 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Verified Cryptographic Engine Active</span>
        </div>
      </div>

    </div>
  );
}

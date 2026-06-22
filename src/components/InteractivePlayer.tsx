import React, { useState, useEffect, useRef } from "react";
import { Song, Playlist } from "../data";
import AudioVisualizer from "./AudioVisualizer";
import { 
  Play, Pause, SkipForward, SkipBack, Share2, 
  HelpCircle, Volume2, Flame, RefreshCcw, 
  Clock, AlertCircle, Check, Music, ChevronDown 
} from "lucide-react";

interface InteractivePlayerProps {
  song: Song;
  onClose: () => void;
  isPlaying: boolean;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  addPoints: (val: number) => void;
  earnedPoints: number;
  bgEngine: "lyria" | "procedural" | "none";
  isBgLoading: boolean;
  bgVolume: number;
  setBgVolume: (val: number) => void;
}

interface AIInsight {
  interactiveness: string;
  challengeTitle: string;
  challengeDescription: string;
  backdropDescription: string;
}

export default function InteractivePlayer({
  song,
  onClose,
  isPlaying,
  togglePlay,
  playNext,
  playPrevious,
  addPoints,
  earnedPoints,
  bgEngine,
  isBgLoading,
  bgVolume,
  setBgVolume
}: InteractivePlayerProps) {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [trackSeconds, setTrackSeconds] = useState(0);
  const [feedbackEffect, setFeedbackEffect] = useState(false);
  const [tapCounter, setTapCounter] = useState(0);
  const [activeLyricsLine, setActiveLyricsLine] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareConfirmed, setShareConfirmed] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerActive, setSleepTimerActive] = useState(false);

  // Parse duration string e.g. "3:34" to seconds
  const totalSeconds = () => {
    const parts = song.duration.split(":");
    return parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : 200;
  };

  // Sound play counter updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTrackSeconds(prev => {
          if (prev >= totalSeconds()) {
            playNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, song]);

  // Load interactive AI insight from server API
  useEffect(() => {
    const loadAiInsight = async () => {
      setIsInsightLoading(true);
      setInsight(null);
      try {
        const res = await fetch("/api/music/interactive-insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            songTitle: song.title,
            artist: song.artist,
            genre: song.genre
          })
        });
        if (!res.ok) throw new Error("API call error");
        const data = await res.json();
        setInsight(data);
      } catch (err) {
        console.error("AI Insight fetch failed, running mock synthesis", err);
      } finally {
        setIsInsightLoading(false);
      }
    };

    setTrackSeconds(0);
    setTapCounter(0);
    loadAiInsight();
  }, [song]);

  // Handle sleep timer countdown
  useEffect(() => {
    if (sleepTimerActive && sleepTimerMinutes !== null && isPlaying) {
      const timer = setInterval(() => {
        setSleepTimerMinutes(prev => {
          if (prev !== null && prev <= 1) {
            setSleepTimerActive(false);
            togglePlay(); // pause!
            return null;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 60000); // subtract minute
      return () => clearInterval(timer);
    }
  }, [sleepTimerActive, sleepTimerMinutes, isPlaying]);

  // Feed active lyric based on progress percentage
  useEffect(() => {
    if (!song.lyrics || song.lyrics.length === 0) {
      setActiveLyricsLine("");
      return;
    }
    const ratio = trackSeconds / totalSeconds();
    const index = Math.min(Math.floor(ratio * song.lyrics.length), song.lyrics.length - 1);
    setActiveLyricsLine(song.lyrics[index]);
  }, [trackSeconds, song]);

  const progressPercent = (trackSeconds / totalSeconds()) * 100;

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // Rhythm tapping mini-game
  const handleTapAlong = () => {
    addPoints(15);
    setTapCounter(prev => prev + 1);
    setFeedbackEffect(true);
    setTimeout(() => setFeedbackEffect(false), 200);
  };

  const sharePlaylist = () => {
    const shareText = `🎵 Join Quest: I am playing "${song.title}" on Muse Quest! Beat Syncing points: ${tapCounter * 15} pts. Reveal your Sonic Instinct at the shared profile url.`;
    navigator.clipboard.writeText(shareText);
    setShareConfirmed(true);
    addPoints(50);
    setTimeout(() => {
      setShareConfirmed(false);
      setShowShareModal(false);
    }, 1800);
  };

  const handleSetSleepTimer = (minutes: number) => {
    setSleepTimerMinutes(minutes);
    setSleepTimerActive(true);
  };

  return (
    <div className="absolute inset-0 bg-[#0F0F0F] z-50 flex flex-col min-h-0 select-none overflow-y-auto pb-4 scrollbar-none">
      
      {/* Top Navigation */}
      <div className="h-14 px-4 flex items-center justify-between shrink-0 border-b border-white/10 bg-black sticky top-0 backdrop-blur-md z-10">
        <button 
          onClick={onClose}
          className="text-zinc-400 hover:text-[#CCFF00] p-2"
        >
          <ChevronDown className="w-5 h-5 animate-pulse" />
        </button>
        <div className="text-center">
          <span className="text-[8px] uppercase tracking-[0.25em] text-[#CCFF00] font-mono block">NOW REVERBERATING</span>
          <h4 className="text-xs font-black uppercase text-white mt-0.5 max-w-[200px] truncate leading-none">
            {song.album}
          </h4>
        </div>
        <button 
          onClick={() => setShowShareModal(true)}
          className="text-zinc-400 hover:text-[#CCFF00] p-2"
          title="Share song postcard"
        >
          <Share2 className="w-4 h-4 text-[#CCFF00]" />
        </button>
      </div>

      {/* Main Column */}
      <div className="flex-1 px-4 py-4 flex flex-col justify-between items-center gap-4">
        
        {/* Rotating disc cover with matching glow */}
        <div className="my-auto relative flex items-center justify-center">
          {/* Ambient Glow behind cover */}
          <div className={`absolute w-[220px] h-[220px] bg-gradient-to-tr ${song.coverColor} opacity-20 blur-[30px] rounded-none`} />
          
          <div className={`w-[210px] h-[210px] bg-zinc-950 p-1 flex items-center justify-center relative shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8)] border border-white/20 ${
            isPlaying ? "animate-[spin_16s_linear_infinite]" : ""
          }`}>
            {/* Inner vinyl styling ridges */}
            <div className="absolute inset-2 border border-white/10 pointer-events-none" />
            <div className="absolute inset-8 border border-white/5 pointer-events-none" />
            <div className="absolute inset-14 border border-white/5 pointer-events-none" />
            
            {/* Disc Center Label */}
            <div className="w-[84px] h-[84px] bg-black flex flex-col items-center justify-center text-center p-2 relative border border-[#CCFF00]/40 z-10">
              <span className="text-2xl mb-1">{song.emoji}</span>
              <span className="text-[7px] font-mono tracking-widest text-[#CCFF00] uppercase font-bold overflow-hidden whitespace-nowrap text-ellipsis max-w-[70px]">
                {song.genre.split(" ")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Title and artist details */}
        <div className="w-full text-center">
          <h3 className="text-lg font-black uppercase tracking-tight text-white leading-none">{song.title}</h3>
          <p className="text-xs text-zinc-400 mt-2 font-mono uppercase tracking-wider">{song.artist}</p>
        </div>

        {/* Interactive lyrics caption box */}
        {activeLyricsLine && (
          <div className="w-full min-h-[44px] bg-black border border-white/10 p-3 rounded-none text-center">
            <span className="text-[8px] tracking-[0.25em] text-[#CCFF00] font-mono block mb-1.5 uppercase font-bold">SONIC TRANSCRIPTION (REALTIME)</span>
            <p className="text-[11px] text-zinc-200 font-mono tracking-wide italic leading-normal">
              "{activeLyricsLine}"
            </p>
          </div>
        )}

        {/* Interactive Audio Visualizer block */}
        <div className="w-full">
          <AudioVisualizer isPlaying={isPlaying} coverGradient={song.coverColor} intensity={isPlaying ? 65 : 10} />
        </div>

        {/* Progress scrub mechanics */}
        <div className="w-full px-1">
          <div className="relative w-full bg-zinc-900 h-1 rounded-none cursor-pointer overflow-hidden border border-white/5">
            <div 
              className={`bg-[#CCFF00] h-full transition-all`} 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mt-2 select-none uppercase">
            <span>{formatTime(trackSeconds)}</span>
            <span>{song.duration}</span>
          </div>
        </div>

        {/* Media controls */}
        <div className="flex items-center justify-between w-full max-w-[280px] my-1 shrink-0">
          <button 
            onClick={playPrevious}
            className="p-3 bg-zinc-900 text-white hover:text-[#CCFF00] transition-colors border border-white/10"
          >
            <SkipBack className="w-4 h-4 text-zinc-350" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="p-4 bg-[#CCFF00] hover:bg-white text-black text-center shadow-lg transition-colors border border-black"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-black text-black" /> : <Play className="w-5 h-5 fill-black text-black ml-0.5" />}
          </button>

          <button 
            onClick={playNext}
            className="p-3 bg-zinc-900 text-white hover:text-[#CCFF00] transition-colors border border-white/10"
          >
            <SkipForward className="w-4 h-4 text-zinc-350" />
          </button>
        </div>

        {/* Lyria 3 Music Background Layer control dashboard */}
        <div id="lyria3_background_layer" className="w-full bg-[#111111] border border-white/10 rounded-none p-4 text-left relative">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs leading-none">📡</span>
              <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.15em] text-white">LYRIA 3 BACKGROUND SPACE</h4>
            </div>
            {isBgLoading ? (
              <span className="text-[9px] text-[#CCFF00] font-mono animate-pulse uppercase">// HARMONIZING...</span>
            ) : bgEngine === "lyria" ? (
              <span className="text-[9px] bg-[#CCFF00] text-black font-mono px-2 py-0.5 font-bold uppercase tracking-tight">AI RESONANCE ACTIVE</span>
            ) : (
              <span className="text-[9px] bg-zinc-800 text-zinc-400 font-mono px-2 py-0.5 font-bold uppercase tracking-tight">SYNTH ACTIVE</span>
            )}
          </div>

          {isBgLoading ? (
            <div className="space-y-2 py-1 animate-pulse">
              <div className="h-3 bg-zinc-950 rounded-none w-[80%]" />
              <div className="h-2 bg-zinc-950 rounded-none w-full" />
              <div className="text-[8px] font-mono text-zinc-500 uppercase mt-2">Connecting wave channels to Google Lyria 3 clip framework...</div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-300 font-black uppercase">
                  {bgEngine === "lyria" ? "📻 Lyria 3 Background Audio" : "🎹 Browser Synthesizer (Zero-Latency)"}
                </span>
                <span className="text-[9px] text-[#CCFF00] font-mono bg-black px-1.5 py-0.2 border border-white/10">BPM {song.bpm}</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal">
                {bgEngine === "lyria" 
                  ? "Lyria 3 has successfully synthesized a customized 30s background chord loop and layered it parallel with your active song stream." 
                  : "The Lyria 3 engine did not detect a paid API key. Initiating local, dynamic low-pass synth pad & tempo-synced arpeggios."}
              </p>

              {/* Volume Slider */}
              <div className="bg-black p-2.5 border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[9px] text-zinc-400 font-mono uppercase tracking-wider">
                  <span>Background Layer Volume</span>
                  <span className="text-white font-bold">{Math.round(bgVolume * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={bgVolume} 
                    onChange={(e) => setBgVolume(parseFloat(e.target.value))}
                    className="flex-1 accent-[#CCFF00] cursor-pointer h-1 bg-zinc-800 rounded-none appearance-none"
                    style={{ background: `linear-gradient(to right, #CCFF00 ${bgVolume*100}%, rgba(255,255,255,0.1) ${bgVolume*100}%)` }}
                  />
                </div>
              </div>

              {/* Hint badge about GEMINI_API_KEY */}
              {bgEngine !== "lyria" && (
                <div className="text-[8.5px] font-mono text-zinc-500 tracking-tight leading-snug flex items-start gap-1 p-1.5 bg-black/40 border border-[#CCFF00]/10">
                  <AlertCircle className="w-3 h-3 text-[#CCFF00] shrink-0 mt-0.5" />
                  <span>
                    To experience real machine-synthesized Lyria 3 waves, declare a valid paid <strong className="text-zinc-400 font-bold">GEMINI_API_KEY</strong> in your AI Studio secrets panel.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive AI Curation / Insight Card */}
        <div className="w-full bg-black border border-white/10 rounded-none p-4 text-left relative">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs leading-none">🧠</span>
              <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.15em] text-white">GEMINI WAVELENGTH MATRIX</h4>
            </div>
            {isInsightLoading ? (
              <span className="text-[9px] text-[#CCFF00] font-mono animate-pulse uppercase">// COGNITION...</span>
            ) : (
              <span className="text-[9px] bg-[#CCFF00] text-black font-mono px-2 py-0.5 font-bold uppercase tracking-tight">SYNTHESIZED</span>
            )}
          </div>

          {isInsightLoading ? (
            <div className="space-y-2 py-1 animate-pulse">
              <div className="h-3 bg-zinc-900 rounded-none w-[90%]" />
              <div className="h-3 bg-zinc-900 rounded-none w-[60%]" />
              <div className="h-2 bg-zinc-900 rounded-none w-full mt-3" />
            </div>
          ) : insight ? (
            <div className="space-y-4">
              <p className="text-[10px] text-zinc-300 font-sans leading-relaxed">
                {insight.interactiveness}
              </p>
              
              {/* Challenge Box */}
              <div className="p-3 bg-zinc-950 border border-white/15">
                <span className="text-[8px] text-[#CCFF00] font-mono block uppercase font-bold tracking-widest">// ACTIVE RHYTHM REACTION</span>
                <span className="text-[11px] font-black uppercase text-white mt-1 block tracking-tight leading-snug">{insight.challengeTitle}</span>
                <p className="text-[10px] text-zinc-400 mt-1 font-sans">{insight.challengeDescription}</p>

                {/* Engagement tapping trigger */}
                <button
                  onClick={handleTapAlong}
                  className={`w-full mt-3 py-2.5 px-3 rounded-none font-black font-sans text-[10px] uppercase text-center transition-all flex items-center justify-center gap-1.5 border border-black ${
                    feedbackEffect 
                      ? "bg-emerald-500 text-white scale-95" 
                      : "bg-[#CCFF00] hover:bg-white text-black shadow-md"
                  }`}
                >
                  <RefreshCcw className={`w-3.5 h-3.5 text-black ${feedbackEffect ? "animate-spin" : ""}`} />
                  SYNC BEAT TAP (+15 XP)
                </button>
                {tapCounter > 0 && (
                  <div className="text-center text-[10px] font-mono font-black text-[#CCFF00] mt-2 animate-bounce uppercase tracking-wide">
                    💎 Tapped {tapCounter} times ({tapCounter * 15} XP generated!)
                  </div>
                )}
              </div>

              {/* Sleep timer trigger */}
              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-3 border-t border-white/10 uppercase font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#CCFF00]" /> SLEEP TIMER SYNAPSE:
                </span>
                <div className="flex gap-1.5">
                  {[5, 10, 15].map(min => (
                    <button
                      key={min}
                      onClick={() => handleSetSleepTimer(min)}
                      className={`px-2 py-0.5 rounded-none text-[9px] font-mono transition-all font-black ${
                        sleepTimerMinutes === min && sleepTimerActive
                          ? "bg-[#CCFF00] text-black"
                          : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {min}M
                    </button>
                  ))}
                  {sleepTimerMinutes !== null && (
                    <button 
                      onClick={() => { setSleepTimerMinutes(null); setSleepTimerActive(false); }}
                      className="text-red-400 font-bold ml-1 hover:underline text-[9px] uppercase font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              {sleepTimerActive && sleepTimerMinutes !== null && (
                <p className="text-[9px] text-[#CCFF00] italic font-mono text-right uppercase">
                  Sleep protocol active. Synapse terminates in {sleepTimerMinutes}m...
                </p>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-zinc-500 italic font-mono uppercase">Frequency calibration unready.</p>
          )}
        </div>
      </div>

      {/* Sharing Postcard Dialog Overlay */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0F0F0F] border border-[#CCFF00] rounded-none p-5 text-center max-w-[320px] shadow-2xl relative overflow-hidden">
            <div className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-tr ${song.coverColor} opacity-20 blur-xl rounded-none`} />
            
            <span className="text-3xl text-center block mb-2">📡</span>
            <h3 className="text-sm font-black uppercase text-white tracking-tight">Waveform Dispatcher</h3>
            <p className="text-[10px] text-zinc-400 font-sans mt-1.5 mb-4 leading-normal">
              Copy this digital postcard coordinates to your matrix clipboard to earn discovery credits!
            </p>

            {/* Simulated Postcard container */}
            <div className="p-3 bg-black border border-white/10 rounded-none text-left mb-5 relative font-mono text-[9px] text-zinc-300">
              <span className="text-[#CCFF00] text-[8px] uppercase tracking-widest block mb-1 font-bold">MUSE QUEST // WAVEFORM TRANSMISSION</span>
              <strong className="text-white block uppercase tracking-tight truncate">{song.title}</strong>
              <span className="text-zinc-400 block truncate">Artist: {song.artist}</span>
              <span className="text-zinc-500 block">Tempo: {song.bpm} BPM</span>
              <span className="text-[#CCFF00] block italic mt-1.5 line-clamp-1">"{song.vibeText}"</span>
              <div className="w-12 h-12 bg-white flex items-center justify-center absolute bottom-2.5 right-2.5 rounded-none shadow p-0.5">
                {/* QR code square mockup */}
                <div className="w-full h-full bg-black flex flex-wrap gap-[1px]">
                  {Array(16).fill(0).map((_, i) => (
                    <div key={i} className={`w-2 h-2 ${i % 3 === 0 ? "bg-[#CCFF00]" : "bg-black"}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-2 bg-zinc-900 text-zinc-400 hover:text-white font-mono uppercase text-[10px] tracking-wider transition-colors border border-white/10"
              >
                Dismiss
              </button>
              <button
                onClick={sharePlaylist}
                className="flex-1 py-2 bg-[#CCFF00] text-black font-black uppercase text-[10px] tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-1.5 border border-black"
              >
                {shareConfirmed ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {shareConfirmed ? "Shared!" : "Copy Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

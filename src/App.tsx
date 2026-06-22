/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import MobileFrame from "./components/MobileFrame";
import DiscoveryDashboard from "./components/DiscoveryDashboard";
import QuizSection from "./components/QuizSection";
import InteractivePlayer from "./components/InteractivePlayer";
import HistoryProgress from "./components/HistoryProgress";
import BrandLogo from "./components/BrandLogo";
import { INITIAL_BADGES, INITIAL_SONGS, Song, Playlist, Badge } from "./data";
import { Compass, Sparkles, Trophy, Play, Pause, SkipForward, ArrowRightLeft, Music, Activity } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"discover" | "quest" | "profile">("discover");
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  
  // Background Audio and Synth States
  const [bgAudioUrl, setBgAudioUrl] = useState<string | null>(null);
  const [isBgLoading, setIsBgLoading] = useState(false);
  const [bgEngine, setBgEngine] = useState<"lyria" | "procedural" | "none">("none");
  const [bgVolume, setBgVolume] = useState(0.4);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Gamification tracking
  const [earnedPoints, setEarnedPoints] = useState(120); // start with warm metrics
  const [archetypeData, setArchetypeData] = useState<any | null>(null);
  const [listeningHistory, setListeningHistory] = useState<{ song: Song; playedAt: string }[]>([]);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [aiCurationList, setAiCurationList] = useState<Song[]>([]);
  const [aiPlaylistName, setAiPlaylistName] = useState<string>("");

  // Automatically load the first song so the player has starting content
  useEffect(() => {
    if (INITIAL_SONGS.length > 0 && !activeSong) {
      setActiveSong(INITIAL_SONGS[0]);
    }
  }, [activeSong]);

  // Load background music layer (Lyria or procedural)
  const loadBackgroundMusic = async (song: Song) => {
    setIsBgLoading(true);
    setBgEngine("none");
    setBgAudioUrl(null);
    
    // Stop any preceding procedural synth
    const { stopProceduralBackground, startProceduralBackground } = await import("./lib/backgroundSynth");
    stopProceduralBackground();

    try {
      const res = await fetch("/api/music/generate-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songTitle: song.title,
          artist: song.artist,
          genre: song.genre,
          bpm: song.bpm
        })
      });

      if (!res.ok) throw new Error("API call error");
      const data = await res.json();

      if (data.source === "lyria" && data.audioBase64) {
        // Decode base64 to Blob URL
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType || "audio/wav" });
        const url = URL.createObjectURL(blob);
        setBgAudioUrl(url);
        setBgEngine("lyria");
        addPoints(30); // Reward exploration point for real AI synthesis!
      } else {
        // Fall back to local procedural synthesizer
        setBgEngine("procedural");
        if (isPlaying) {
          startProceduralBackground(song.songKey, song.bpm, bgVolume);
        }
      }
    } catch (err) {
      console.warn("Generating background failed, switching to procedural:", err);
      setBgEngine("procedural");
      if (isPlaying) {
        startProceduralBackground(song.songKey, song.bpm, bgVolume);
      }
    } finally {
      setIsBgLoading(false);
    }
  };

  // Load bg loop when activeSong changes
  useEffect(() => {
    if (activeSong) {
      loadBackgroundMusic(activeSong);
    }
  }, [activeSong]);

  // Sync Lyria audio ref
  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
    }
    
    if (bgAudioUrl) {
      const audio = new Audio(bgAudioUrl);
      audio.loop = true;
      audio.volume = bgVolume;
      bgAudioRef.current = audio;
      if (isPlaying) {
        audio.play().catch(e => console.log("Bg audio autoplay blocked:", e));
      }
    }
    
    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
      }
    };
  }, [bgAudioUrl]);

  // Sync Playback states and procedural synthesis
  useEffect(() => {
    if (bgAudioRef.current) {
      if (isPlaying) {
        bgAudioRef.current.play().catch(e => console.log("Bg audio play blocked:", e));
      } else {
        bgAudioRef.current.pause();
      }
    }

    if (bgEngine === "procedural" && activeSong) {
      import("./lib/backgroundSynth").then(({ startProceduralBackground, stopProceduralBackground }) => {
        if (isPlaying) {
          startProceduralBackground(activeSong.songKey, activeSong.bpm, bgVolume);
        } else {
          stopProceduralBackground();
        }
      });
    } else {
      import("./lib/backgroundSynth").then(({ stopProceduralBackground }) => {
        if (bgEngine !== "procedural") {
          stopProceduralBackground();
        }
      });
    }
  }, [isPlaying, bgEngine, activeSong]);

  // Sync volumes when slider maps actions
  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = bgVolume;
    }
    if (bgEngine === "procedural") {
      import("./lib/backgroundSynth").then(({ updateProceduralVolume }) => {
        updateProceduralVolume(bgVolume);
      });
    }
  }, [bgVolume, bgEngine]);

  // Sync / check badge milestones whenever stats update
  useEffect(() => {
    setBadges(prev => {
      return prev.map(badge => {
        if (badge.unlocked) return badge; // already unlocked

        let shouldUnlock = false;
        if (badge.id === "b1" && archetypeData !== null) {
          shouldUnlock = true;
        } else if (badge.id === "b2" && earnedPoints >= 350) {
          // completed some player challenges and reached points threshold
          shouldUnlock = true;
        } else if (badge.id === "b3" && listeningHistory.length >= 3) {
          shouldUnlock = true;
        } else if (badge.id === "b4" && earnedPoints >= 250) {
          // shared playlist and earned some points
          shouldUnlock = true;
        }

        if (shouldUnlock) {
          return { ...badge, unlocked: true };
        }
        return badge;
      });
    });
  }, [archetypeData, earnedPoints, listeningHistory]);

  const addPoints = (val: number) => {
    setEarnedPoints(prev => prev + val);
  };

  const claimBadge = (badgeId: string) => {
    setBadges(prev => 
      prev.map(badge => {
        if (badge.id === badgeId) {
          if (!badge.claimed) {
            addPoints(badge.points);
          }
          return { ...badge, unlocked: true, claimed: true };
        }
        return badge;
      })
    );
  };

  const forceUnlockBadge = (badgeId: string) => {
    setBadges(prev => 
      prev.map(badge => {
        if (badge.id === badgeId) {
          return { ...badge, unlocked: true };
        }
        return badge;
      })
    );
  };

  const handlePlaySongDirectly = (song: Song, playlistContext?: Playlist) => {
    setActiveSong(song);
    setIsPlaying(true);
    
    // Add to listening history list
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setListeningHistory(prev => [
      { song, playedAt: timestamp },
      ...prev.slice(0, 19) // preserve last 20 listens
    ]);

    // Give some discovery XP points for playing a track
    addPoints(10);
  };

  const handlePlayNext = () => {
    if (!activeSong) return;
    const allTracks = [...aiCurationList, ...INITIAL_SONGS];
    const currentIndex = allTracks.findIndex(t => t.id === activeSong.id);
    const nextIndex = (currentIndex + 1) % allTracks.length;
    handlePlaySongDirectly(allTracks[nextIndex]);
  };

  const handlePlayPrevious = () => {
    if (!activeSong) return;
    const allTracks = [...aiCurationList, ...INITIAL_SONGS];
    const currentIndex = allTracks.findIndex(t => t.id === activeSong.id);
    const prevIndex = (currentIndex - 1 + allTracks.length) % allTracks.length;
    handlePlaySongDirectly(allTracks[prevIndex]);
  };

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col min-h-0 bg-[#0F0F0F] text-white font-sans">
        
        {/* Sleek App Branding Bar */}
        <div id="muse_quest_branding" className="h-14 px-4 flex items-center justify-between border-b border-white/10 bg-black shrink-0 select-none">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} withGlow={true} className="shrink-0" />
            <div>
              <h1 className="text-sm font-black tracking-tight font-sans italic text-white uppercase leading-none">
                MUSE QUEST
              </h1>
              <span className="text-[7px] font-mono tracking-[0.2em] block leading-none text-amber-400 font-black uppercase mt-1">
                SONIC EXPLORATION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.55">
            <span className="text-[8px] bg-amber-400 text-black font-black px-2 py-0.5 rounded-none border-none flex items-center gap-1 uppercase tracking-wider select-none">
              <Activity className="w-2.5 h-2.5 text-black animate-pulse" /> Live Sound Flow
            </span>
          </div>
        </div>

        {/* Dynamic Viewport Container */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-[#0F0F0F]">
          {activeTab === "discover" && (
            <DiscoveryDashboard 
              onPlaySong={handlePlaySongDirectly}
              currentSong={activeSong}
              isPlaying={isPlaying}
              earnedPoints={earnedPoints}
              addPoints={addPoints}
              archetypeData={archetypeData}
              aiCurationList={aiCurationList}
              setAiCurationList={setAiCurationList}
              aiPlaylistName={aiPlaylistName}
              setAiPlaylistName={setAiPlaylistName}
              onStartQuiz={() => setActiveTab("quest")}
            />
          )}

          {activeTab === "quest" && (
            <QuizSection 
              onQuizCompleted={(data) => {
                setArchetypeData(data);
                setActiveTab("discover"); // route back
              }}
              earnedPoints={earnedPoints}
              addPoints={addPoints}
            />
          )}

          {activeTab === "profile" && (
            <HistoryProgress 
              listeningHistory={listeningHistory}
              badges={badges}
              claimBadge={claimBadge}
              earnedPoints={earnedPoints}
              setActiveTab={setActiveTab}
              onPlaySong={handlePlaySongDirectly}
              forceUnlockBadge={forceUnlockBadge}
              addPoints={addPoints}
            />
          )}
        </div>

        {/* Sticky Minimizer / Bottom Player strip (Spotify-aligned) */}
        {activeSong && (
          <div 
            id="bottom_minimize_soundbar"
            className="h-14 bg-zinc-950 border-t border-white/10 px-3 flex items-center justify-between shrink-0 cursor-pointer relative overflow-hidden group select-none"
          >
            {/* Ambient sliding progress indicator background bar - Vibrant lime theme */}
            <div className="absolute bottom-0 left-0 h-[2.5px] bg-[#CCFF00] animate-pulse w-full pointer-events-none opacity-90" />
            
            {/* Hot link to full screen player */}
            <div 
              className="flex items-center gap-2.5 flex-1 min-w-0"
              onClick={() => setShowFullPlayer(true)}
            >
              <div className={`w-8 h-8 rounded-none bg-gradient-to-tr ${activeSong.coverColor} flex items-center justify-center text-sm shadow relative overflow-hidden`}>
                <span className={isPlaying ? "animate-bounce" : ""}>{activeSong.emoji}</span>
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="flex gap-0.5 items-end h-3 w-4">
                      <div className="w-0.5 bg-[#CCFF00] h-2.5 animate-[pulse_0.8s_infinite]" />
                      <div className="w-0.5 bg-white h-1.5 animate-[pulse_1.1s_infinite_0.2s]" />
                      <div className="w-0.5 bg-[#CCFF00] h-2 animate-[pulse_0.9s_infinite_0.4s]" />
                    </div>
                  </div>
                )}
              </div>
              <div className="min-w-0 text-left">
                <h4 className="text-[11px] font-black uppercase tracking-tight text-white truncate group-hover:text-[#CCFF00] transition-colors leading-tight">
                  {activeSong.title}
                </h4>
                <p className="text-[9px] text-[#CCFF00] font-mono tracking-tight uppercase block truncate leading-none mt-0.5">{activeSong.artist}</p>
              </div>
            </div>

            {/* Minor quick actions */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 text-zinc-300 hover:text-white"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white text-white" /> : <Play className="w-4 h-4 fill-white text-white ml-0.5" />}
              </button>
              <button 
                onClick={handlePlayNext}
                className="p-2 text-zinc-300 hover:text-white"
                title="Next Song"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Global Bottom Tab Bar */}
        <div id="footer_tabs_navigation" className="h-14 bg-black border-t border-white/10 flex shrink-0 items-center select-none pb-0.5">
          <button 
            onClick={() => setActiveTab("discover")}
            className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === "discover" ? "text-[#CCFF00] font-black" : "text-zinc-500 hover:text-zinc-300 font-medium"
            }`}
          >
            <Compass className="w-4.5 h-4.5" />
            <span className="text-[9px] font-sans uppercase tracking-[0.12em]">Discover</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("quest")}
            className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === "quest" ? "text-[#CCFF00] font-black" : "text-zinc-500 hover:text-zinc-300 font-medium"
            }`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span className="text-[9px] font-sans uppercase tracking-[0.12em]">Aura Quest</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("profile")}
            className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === "profile" ? "text-[#CCFF00] font-black" : "text-zinc-500 hover:text-zinc-300 font-medium"
            }`}
          >
            <Trophy className="w-4.5 h-4.5" />
            <span className="text-[9px] font-sans uppercase tracking-[0.12em]">Academy</span>
          </button>
        </div>

      </div>

      {/* Fullscreen Immersive Audio Player Slideover Drawer */}
      {showFullPlayer && activeSong && (
        <InteractivePlayer 
          song={activeSong}
          onClose={() => setShowFullPlayer(false)}
          isPlaying={isPlaying}
          togglePlay={() => setIsPlaying(!isPlaying)}
          playNext={handlePlayNext}
          playPrevious={handlePlayPrevious}
          addPoints={addPoints}
          earnedPoints={earnedPoints}
          bgEngine={bgEngine}
          isBgLoading={isBgLoading}
          bgVolume={bgVolume}
          setBgVolume={setBgVolume}
        />
      )}
    </MobileFrame>
  );
}

import React, { useState, useEffect } from "react";
import { INITIAL_PLAYLISTS, INITIAL_SONGS, Playlist, Song } from "../data";
import { Sparkles, Heart, Search, Play, Music, Flame, ThumbsUp, Send, User, ChevronRight, Zap } from "lucide-react";

// Robust high-fidelity real-time search match highlighting function
const highlightText = (text: string, query: string) => {
  if (!query.trim()) return <span>{text}</span>;
  const trimmed = query.trim();
  const escaped = trimmed.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark key={i} className="bg-amber-400 text-black px-0.5 rounded-none font-bold select-all">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

interface DiscoveryDashboardProps {
  onPlaySong: (song: Song, playlistContext?: Playlist) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  earnedPoints: number;
  addPoints: (val: number) => void;
  archetypeData: any | null; // loaded from Quiz
  aiCurationList: Song[];
  setAiCurationList: (songs: Song[]) => void;
  aiPlaylistName: string;
  setAiPlaylistName: (name: string) => void;
  onStartQuiz: () => void;
}

export default function DiscoveryDashboard({
  onPlaySong,
  currentSong,
  isPlaying,
  earnedPoints,
  addPoints,
  archetypeData,
  aiCurationList,
  setAiCurationList,
  aiPlaylistName,
  setAiPlaylistName,
  onStartQuiz
}: DiscoveryDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [notification, setNotification] = useState<string | null>(null);

  // Suggestions for AI Prompt
  const promptSuggestions = [
    "High-BPM focus tracks for coding",
    "Melancholic acoustic folk for rainy evenings",
    "Hyper-interactive synth drop tracks",
    "Wobbly lofi beats to rest under"
  ];

  const handleGenerateAiPlaylist = async (promptToUse?: string) => {
    const textToSubmit = promptToUse || aiPrompt;
    if (!textToSubmit.trim()) return;
    
    setIsAiLoading(true);
    setNotification("Summoning Gemini Music Intelligence...");

    try {
      const res = await fetch("/api/curation/recommend-songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: textToSubmit,
          stylePreferences: archetypeData ? archetypeData.archetype : "general"
        })
      });

      if (!res.ok) throw new Error("Curation error");
      const data = await res.json();
      
      if (data.recommendedSongs && Array.isArray(data.recommendedSongs)) {
        // Convert to Song structures
        const structured: Song[] = data.recommendedSongs.map((s: any, idx: number) => ({
          id: `ai_${idx}_${Date.now()}`,
          title: s.title,
          artist: s.artist,
          album: "AI Generated Curation",
          genre: s.genre,
          bpm: s.bpm || 100,
          duration: s.duration || "3:30",
          coverColor: idx % 2 === 0 ? "from-indigo-600 via-pink-600 to-purple-800" : "from-cyan-500 via-indigo-600 to-purple-800",
          emoji: "✨",
          songKey: s.songKey || "neon_horizon",
          vibeText: s.vibeText || "A track custom engineered to match your requested tone structure."
        }));

        setAiPlaylistName(textToSubmit);
        setAiCurationList(structured);
        setActiveCategory("Personalized"); // Switch folder directly to show it!
        addPoints(75); // Award points for discovering AI curation
        showTemporaryNotification("✨ AI Playlist Curation Loaded (+75 Pts)!");
      }
    } catch (e) {
      console.error(e);
      showTemporaryNotification("⚠️ Error connecting to Gemini proxy. Using Offline Curation Engine.");
    } finally {
      setIsAiLoading(false);
      setAiPrompt("");
    }
  };

  // Automatically summon fresh AI recommendations matching the archetype config when first set!
  useEffect(() => {
    if (archetypeData && aiCurationList.length === 0) {
      handleGenerateAiPlaylist(`Curate custom high fidelity waves for a ${archetypeData.archetype} featuring elements of ${archetypeData.dominantStyle}`);
    }
    if (archetypeData) {
      setActiveCategory("Personalized");
    }
  }, [archetypeData]);

  const showTemporaryNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleLikeSong = (songId: string) => {
    const isCurrentlyLiked = likedSongs[songId];
    setLikedSongs(prev => ({ ...prev, [songId]: !isCurrentlyLiked }));
    if (!isCurrentlyLiked) {
      addPoints(15);
      showTemporaryNotification("❤️ Song Saved to Library! (+15 pts)");
    }
  };

  const handleSharePlaylist = (playlist: Playlist) => {
    const shareText = `📡 Muse Quest Playlist Link Created! Play "${playlist.name}" - ${playlist.description}. Unveil your music persona now!`;
    navigator.clipboard.writeText(shareText);
    addPoints(50);
    showTemporaryNotification("🔗 Share link copied to clipboard! (+50 pts)");
  };

  const currentLocalHour = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Morning";
    if (hr < 18) return "Afternoon";
    return "Evening";
  };

  // Dynamic compilation of playlists, including general, personal archetype waves, and custom AI Generations
  const getPlaylists = () => {
    const list = [...INITIAL_PLAYLISTS];

    // 1. Prepend custom AI prompt playlist if the user has successfully run curated generations
    if (aiCurationList.length > 0) {
      list.unshift({
        id: "ai_custom_flow",
        name: aiPlaylistName ? `${aiPlaylistName.toUpperCase()}` : "AI SYNTHESIS WAVE",
        description: `Custom artificial sound intelligence wave compiled for: "${aiPlaylistName || "Your Mood"}".`,
        coverGradient: "from-pink-650 via-indigo-900 to-teal-950",
        emoji: "✨",
        category: "Personalized",
        tracks: aiCurationList,
        isCuratedByAi: true
      });
    }

    // 2. Prepend the quiz personal archetype wave if they loaded their taste profile
    if (archetypeData) {
      let personalizedTracks: Song[] = [];
      const archLower = archetypeData.archetype.toLowerCase();
      if (archLower.includes("dreamweaver") || archLower.includes("introspective") || archLower.includes("ambient")) {
        personalizedTracks = INITIAL_SONGS.filter(s => s.id === "s2" || s.id === "s5");
      } else if (archLower.includes("voyager") || archLower.includes("neon") || archLower.includes("groove")) {
        personalizedTracks = INITIAL_SONGS.filter(s => s.id === "s1" || s.id === "s5");
      } else {
        // polyrhythmic / alchemist
        personalizedTracks = INITIAL_SONGS.filter(s => s.id === "s3" || s.id === "s4");
      }

      // Layer in additional tracks from curation if matches beautifully!
      if (aiCurationList.length > 0) {
        personalizedTracks = [...personalizedTracks, ...aiCurationList.slice(0, 2)];
      }

      list.unshift({
        id: "personal_aura_flow",
        name: `${archetypeData.archetype.toUpperCase()} WAVE`,
        description: `Bespoke sonoral frequencies aligned with your dominant style: ${archetypeData.dominantStyle}.`,
        coverGradient: "from-[#CCFF00] via-teal-950 to-black",
        emoji: "🧬",
        category: "Personalized",
        tracks: personalizedTracks,
        isCuratedByAi: true
      });
    }

    return list;
  };

  const playlists = getPlaylists();
  const query = searchQuery.trim().toLowerCase();

  // Apply Search & Category filters over Playlists
  const filteredPlaylists = playlists.filter(playlist => {
    const catMatches = activeCategory === "All" || playlist.category === activeCategory;
    if (!catMatches) return false;
    if (!query) return true;
    return (
      playlist.name.toLowerCase().includes(query) ||
      playlist.description.toLowerCase().includes(query) ||
      playlist.category.toLowerCase().includes(query) ||
      playlist.tracks.some(track => 
        track.title.toLowerCase().includes(query) || 
        track.artist.toLowerCase().includes(query) ||
        track.genre.toLowerCase().includes(query) ||
        (track.album && track.album.toLowerCase().includes(query))
      )
    );
  });

  const queryNumber = parseFloat(query);
  const isBpmQuery = !isNaN(queryNumber) && queryNumber > 40 && queryNumber < 250;

  // Apply Search filtering over songs with lyric checks, album checks, and BPM calculations
  const filteredAiSongs = aiCurationList.filter(song => {
    if (!query) return true;
    const lyricMatch = song.lyrics ? song.lyrics.some(l => l.toLowerCase().includes(query)) : false;
    const bpmMatch = isBpmQuery && Math.abs(song.bpm - queryNumber) <= 12;
    return (
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.genre.toLowerCase().includes(query) ||
      (song.album && song.album.toLowerCase().includes(query)) ||
      song.vibeText.toLowerCase().includes(query) ||
      lyricMatch ||
      bpmMatch
    );
  });

  const filteredSongs = INITIAL_SONGS.filter(song => {
    if (!query) return true;
    const lyricMatch = song.lyrics ? song.lyrics.some(l => l.toLowerCase().includes(query)) : false;
    const bpmMatch = isBpmQuery && Math.abs(song.bpm - queryNumber) <= 12;
    return (
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.genre.toLowerCase().includes(query) ||
      (song.album && song.album.toLowerCase().includes(query)) ||
      song.vibeText.toLowerCase().includes(query) ||
      lyricMatch ||
      bpmMatch
    );
  });
  
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-4 py-3 scrollbar-none bg-[#0F0F0F]">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#CCFF00] border border-black text-black text-[11px] font-black uppercase tracking-wider px-4 py-3 rounded-none shadow-2xl flex items-center gap-2 animate-bounce">
          <Zap className="w-3.5 h-3.5 text-black fill-black" />
          <span>{notification}</span>
        </div>
      )}

      {/* Greeting Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="text-[9px] text-[#CCFF00] font-mono tracking-[0.25em] font-black uppercase block">MUSE QUEST // DISCOVER</span>
          <h2 className="text-3xl font-black italic uppercase leading-none tracking-tighter mt-1 text-white">
            Happy {currentLocalHour()}
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-black px-3 py-1.5 border border-[#CCFF00] shadow">
          <Flame className="w-3.5 h-3.5 text-[#CCFF00]" />
          <span className="text-[10px] font-mono font-black text-[#CCFF00] tracking-tight">{earnedPoints} XP</span>
        </div>
      </div>

      {/* Interactive Search Bar Panel with Clickable Instant-Filters */}
      <div className="mb-5">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#CCFF00] shrink-0" />
          </div>
          <input
            id="music_search_bar"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, artist, genre, vibe, lyrics or BPM..."
            className="w-full bg-zinc-950 text-xs text-white border border-white/10 rounded-none pl-9 pr-24 py-2.5 focus:outline-none focus:border-[#CCFF00] font-sans placeholder:text-zinc-600 transition-colors"
          />
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[9px] text-[#CCFF00] hover:text-white uppercase font-mono font-bold"
              >
                clear
              </button>
            )}
            <span className="text-[8px] bg-zinc-900 border border-white/15 px-1.5 py-0.5 text-zinc-400 font-mono uppercase tracking-widest leading-none">
              {filteredSongs.length + filteredAiSongs.length} paths
            </span>
          </div>
        </div>
        
        {/* Instant filter query tag badges */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none select-none">
          <span className="text-[8px] text-zinc-500 uppercase font-mono mr-1">Quick Tags:</span>
          {[
            { text: "Ambient", icon: "🌌" },
            { text: "Synth", icon: "⚡" },
            { text: "Lofi", icon: "🍵" },
            { text: "IDM", icon: "⚙️" },
            { text: "Guitar", icon: "🎸" },
            { text: "BPM", textVal: "125" }
          ].map((tagItem) => {
            const actualVal = tagItem.textVal || tagItem.text;
            const active = searchQuery.toLowerCase() === actualVal.toLowerCase();
            return (
              <button
                key={tagItem.text}
                type="button"
                onClick={() => setSearchQuery(active ? "" : actualVal)}
                className={`text-[9px] flex items-center gap-1 px-2.5 py-1 border transition-all rounded-none uppercase font-mono leading-none font-black ${
                  active 
                    ? "bg-[#CCFF00] text-black border-black" 
                    : "bg-zinc-950 text-zinc-450 border-white/10 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {tagItem.icon && <span>{tagItem.icon}</span>}
                <span>{tagItem.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quiz Archetype Presets / Teaser with Bold Theme */}
      <div className="mb-5">
        {archetypeData ? (
          <div className="p-3 bg-zinc-900 border-l-[4px] border-[#CCFF00] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 bg-[#CCFF00] text-black text-[8px] font-black uppercase font-mono px-3">
              PRESET ACTIVE
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <span className="text-[8px] uppercase tracking-[0.15em] text-[#CCFF00] font-mono font-black block">SONORAL SOUL CONFIG</span>
                <h4 className="text-sm font-black uppercase tracking-tight text-white mt-0.5">{archetypeData.archetype}</h4>
                <p className="text-[9px] text-zinc-400 font-mono leading-none mt-1">{archetypeData.dominantStyle}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#CCFF00] text-black flex items-center justify-between shadow-md relative">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🧪</span>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight leading-none">Unveil Your Sound Soul</h4>
                <p className="text-[10px] text-black font-medium mt-1 leading-normal max-w-[180px]">Run the 3-minute instinct questionnaire to unlock specialized AI sound waves.</p>
              </div>
            </div>
            <span 
              onClick={onStartQuiz}
              className="text-[9px] bg-black text-[#CCFF00] font-black px-3 py-2 shrink-0 tracking-wider uppercase border border-black hover:bg-white hover:text-black hover:border-white cursor-pointer transition-all"
            >
              START
            </span>
          </div>
        )}
      </div>

      {/* AI Custom Prompt Curation Box (Bold Minimalist Blueprint) */}
      <div className="mb-5 bg-black p-4 border border-white/10 relative">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#CCFF00]" />
          <h3 className="text-[10px] font-black font-sans text-[#CCFF00] uppercase tracking-[0.2em]">
            GEMINI SONIC ARCHITECT
          </h3>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            disabled={isAiLoading}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe your requested mood wave..."
            className="flex-1 bg-zinc-900 text-[11px] border border-white/10 rounded-none px-3 py-2 focus:outline-none focus:border-[#CCFF00] text-white disabled:opacity-50 placeholder:text-zinc-600"
          />
          <button
            onClick={() => handleGenerateAiPlaylist()}
            disabled={isAiLoading || !aiPrompt.trim()}
            className="bg-[#CCFF00] hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 text-black p-2.5 rounded-none border border-black shadow font-black transition-colors flex items-center justify-center shrink-0"
          >
            {isAiLoading ? (
              <span className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-black" />
            )}
          </button>
        </div>

        {/* Dynamic Prompt Suggestions with sharp tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {promptSuggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => { setAiPrompt(s); handleGenerateAiPlaylist(s); }}
              className="text-[9px] text-zinc-400 bg-zinc-900/60 hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] px-2.5 py-1 rounded-none border border-white/5 font-mono uppercase tracking-[0.05em] transition-all"
            >
              #{s.slice(0, 16)}...
            </button>
          ))}
        </div>
      </div>

      {/* Playlists Horizontal Row containing custom categorical headers */}
      <div className="mb-5">
        <div className="flex justify-between items-end mb-3 pb-1 border-b border-white/10">
          <h3 className="text-[10px] font-black text-[#CCFF00] uppercase tracking-[0.2em]">Recommended Waves</h3>
          <div className="flex gap-1 text-[8px] font-mono">
            {["All", "Interactive", "Relaxing", "Adventure", ...((archetypeData || aiCurationList.length > 0) ? ["Personalized"] : [])].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`cursor-pointer px-2 py-0.5 uppercase tracking-wider transition-all font-bold ${
                  activeCategory === cat ? "bg-[#CCFF00] text-black font-black" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll Box with sharp grid aesthetics */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {filteredPlaylists.map((playlist) => (
            <div 
              key={playlist.id}
              className={`w-40 bg-zinc-950 rounded-none p-3 border transition-colors shrink-0 group relative overflow-hidden ${
                playlist.category === "Personalized" ? "border-[#CCFF00]" : "border-white/10 hover:border-[#CCFF00]"
              }`}
            >
              <div className={`w-full h-24 rounded-none bg-gradient-to-tr ${playlist.coverGradient} flex items-center justify-center text-4xl shadow-inner relative transition-transform`}>
                <span>{playlist.emoji}</span>
                {/* Floating Play Button overlay with sharp flat hover */}
                {playlist.tracks && playlist.tracks.length > 0 && (
                  <div 
                    onClick={() => onPlaySong(playlist.tracks[0], playlist)}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-none bg-black text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black flex items-center justify-center border border-[#CCFF00] shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                )}
              </div>
              <h4 className="text-xs font-black uppercase tracking-tight text-white mt-3.5 truncate">{playlist.name}</h4>
              <p className="text-[9px] text-[#CCFF00] font-mono uppercase block mt-0.5 tracking-tight">{playlist.category}</p>
              
              <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-white/10">
                <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-mono">
                  {playlist.tracks ? playlist.tracks.length : 0} track paths
                </span>
                <button 
                  onClick={() => handleSharePlaylist(playlist)}
                  className="text-[9px] font-black uppercase tracking-wider text-white hover:text-[#CCFF00] transition-colors"
                >
                  Share Link
                </button>
              </div>
            </div>
          ))}
          {filteredPlaylists.length === 0 && (
            <div className="w-full text-center py-6 text-zinc-500 text-xs italic font-mono uppercase">
              No wave categories found.
            </div>
          )}
        </div>
      </div>

      {/* Suggested Music Feed (Sharp high-contrast layout, bold lines) */}
      <div className="mb-4">
        <h3 className="text-[10px] font-black text-[#CCFF00] uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
          <Music className="w-4 h-4 text-[#CCFF00]" /> Daily Discovery Feed
        </h3>

        {/* AI Curated dynamic items if any */}
        {filteredAiSongs.length > 0 && (
          <div className="mb-4 bg-zinc-950 p-3.5 border-l-2 border-[#CCFF00] relative">
            <span className="absolute top-2 right-2 flex items-center gap-1 text-[8px] bg-[#CCFF00] text-black font-mono px-2 py-0.5 uppercase font-bold tracking-tight">
              <Sparkles className="w-2.5 h-2.5" /> Intelligent Matrix
            </span>
            <h4 className="text-[11px] font-mono uppercase text-zinc-400 mb-2.5">Gemini AI Synthesis</h4>
            
            <div className="space-y-1.5">
              {filteredAiSongs.map((song) => (
                <div 
                  key={song.id}
                  className={`p-2 rounded-none flex items-center justify-between transition-colors ${
                    currentSong?.id === song.id ? "bg-zinc-900 border border-[#CCFF00]" : "bg-black/40 hover:bg-zinc-900"
                  }`}
                >
                  <div className="min-w-0" onClick={() => onPlaySong(song)}>
                    <div className="w-8 h-8 rounded-none bg-[#CCFF00] flex items-center justify-center text-sm shadow cursor-pointer text-black">
                      <span>{song.emoji}</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-[11px] font-black uppercase text-white truncate">
                        {highlightText(song.title, searchQuery)}
                      </h5>
                      <p className="text-[9px] text-zinc-400 truncate">
                        {highlightText(song.artist, searchQuery)} • <span className="font-mono text-[#CCFF00]">{highlightText(song.genre, searchQuery)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart 
                      className={`w-3.5 h-3.5 cursor-pointer transition-colors ${
                        likedSongs[song.id] ? "text-[#CCFF00] fill-[#CCFF00]" : "text-zinc-500 hover:text-[#CCFF00]"
                      }`}
                      onClick={() => handleLikeSong(song.id)}
                    />
                    <div 
                      onClick={() => onPlaySong(song)}
                      className="w-6 h-6 rounded-none bg-[#CCFF00] text-black flex items-center justify-center cursor-pointer hover:bg-white hover:scale-105 transition-all"
                    >
                      <Play className="w-3 h-3 fill-black ml-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Static curation list */}
        {filteredSongs.length > 0 ? (
          <div className="space-y-1.5">
            {filteredSongs.map((song) => (
              <div 
                key={song.id}
                className={`p-2 rounded-none border flex items-center justify-between transition-all ${
                  currentSong?.id === song.id 
                    ? "bg-zinc-950 border-[#CCFF00] shadow" 
                    : "bg-zinc-900/30 border-white/5 hover:bg-zinc-900/60"
                }`}
              >
                <div 
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                  onClick={() => onPlaySong(song)}
                >
                  <div className={`w-8 h-8 rounded-none bg-gradient-to-tr ${song.coverColor} flex items-center justify-center text-sm shadow`}>
                    <span>{song.emoji}</span>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[11px] font-black uppercase text-white tracking-tight leading-tight truncate">
                      {highlightText(song.title, searchQuery)}
                    </h5>
                    <p className="text-[9px] text-zinc-400 truncate">
                      {highlightText(song.artist, searchQuery)} • <span className="font-mono text-[8.5px] bg-[#CCFF00]/15 text-amber-300 border border-amber-500/20 px-1 py-0.2 rounded-none uppercase tracking-wide">{highlightText(song.genre, searchQuery)}</span> • <span className="font-mono text-[8px] text-black bg-[#CCFF00] px-1 py-0.2 rounded-none font-bold uppercase tracking-wider">{song.bpm}BPM</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Heart 
                    className={`w-3.5 h-3.5 cursor-pointer transition-all ${
                      likedSongs[song.id] ? "text-[#CCFF00] fill-[#CCFF00] scale-110" : "text-zinc-500 hover:text-[#CCFF00]"
                    }`}
                    onClick={() => handleLikeSong(song.id)}
                  />
                  <div 
                    onClick={() => onPlaySong(song)}
                    className="w-6 h-6 rounded-none bg-zinc-800 text-white hover:bg-[#CCFF00] hover:text-black flex items-center justify-center cursor-pointer transition-colors border border-white/5"
                  >
                    <Play className="w-3 h-3 ml-0.5 fill-current" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAiSongs.length === 0 ? (
          <div className="p-6 bg-zinc-950 border border-dashed border-white/5 rounded-none text-center">
            <Search className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400 font-mono uppercase">No tracks matched your query</p>
            <p className="text-[10px] text-zinc-500 mt-1">Try keywords like &quot;Neon&quot;, &quot;Oceanwave&quot;, or &quot;Logic&quot;.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

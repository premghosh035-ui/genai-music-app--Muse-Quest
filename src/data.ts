export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  bpm: number;
  duration: string;
  coverColor: string; // Tailwinds bg gradient e.g. "from-indigo-600 to-purple-600"
  emoji: string;
  songKey: string; // matching server key or custom
  vibeText: string;
  sourceUrl?: string;
  lyrics?: string[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverGradient: string;
  emoji: string;
  category: "Dynamic" | "Interactive" | "Relaxing" | "Adventure" | "Personalized";
  tracks: Song[];
  isCuratedByAi?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: {
    text: string;
    description: string;
    value: string; // score value e.g. "1" (ambient), "2" (groove), "3" (complex)
    emoji: string;
  }[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  unlocked: boolean;
  emoji: string;
  points: number;
  claimed?: boolean;
}

export const INITIAL_SONGS: Song[] = [
  {
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
    vibeText: "Powered by deep compressed synthesizers that pump with every physical beat, giving you a nostalgic outrun energy of night highways.",
    lyrics: [
      "Cruising past the wireframe grid...",
      "Indigo sunset bleeding on the screen...",
      "We trace valleys where computers dream...",
      "Felt the sidechain suction on our heels...",
      "Only neon is real."
    ]
  },
  {
    id: "s2",
    title: "Aquasphere Delays",
    artist: "Tidal Symmetries",
    album: "Hydro-Acoustics",
    genre: "Ambient Oceanwave",
    bpm: 78,
    duration: "4:12",
    coverColor: "from-cyan-400 via-teal-500 to-blue-600",
    emoji: "🌊",
    songKey: "ambient_tides",
    vibeText: "Delightfully slow piano delays that float precisely between left and right airwaves, mimicking gentle currents of an ocean.",
    lyrics: [
      "Soft tides washing overhead...",
      "Echoes bouncing in a liquid bed...",
      "Hear the hydro-piano speak in waves...",
      "Sinking lower, feeling fully saved...",
      "In the deep aquasphere."
    ]
  },
  {
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
    vibeText: "Intricate electronic breakbeats that slice up the regular measures into beautiful syncopated rhythmic bursts.",
    lyrics: [
      "Zeroes compiling into binary dust...",
      "In the quartz oscillator we place our trust...",
      "Snap the grid, break the feedback loop...",
      "Let the microtones play in a syncopated scoop...",
      "Compile... execute..."
    ]
  },
  {
    id: "s4",
    title: "Tectonic Slap Odyssey",
    artist: "Grand Resonance",
    album: "Math Rock Oasis",
    genre: "Progressive Funk Rock",
    bpm: 105,
    duration: "3:51",
    coverColor: "from-amber-400 via-orange-600 to-red-700",
    emoji: "🎸",
    songKey: "funk_elevation",
    vibeText: "Fast live percussion combined with physical, snappy bass octaves that accent the first count of every bar.",
    lyrics: [
      "Slap the wood, tap the pickup wire...",
      "Five-four rhythm setting grids on fire...",
      "Fretless sweeps sliding down the neck...",
      "Keep the tempo rolling, never double-deck...",
      "Rocking the tectonic rift."
    ]
  },
  {
    id: "s5",
    title: "Velvet Dust & Vinyl",
    artist: "Lofi Celestial",
    album: "Whispering Antiques",
    genre: "Jazz Chill-hop",
    bpm: 85,
    duration: "3:10",
    coverColor: "from-amber-700 via-rose-800 to-stone-900",
    emoji: "🍵",
    songKey: "jazz_odyssey",
    vibeText: "Wobbly warmth of dusty vinyl loops, paired with a laid-back piano trio that invites serene focused productivity.",
    lyrics: [
      "Raindrops beating on the study sash...",
      "Vinyl scratch playing on a dusty cache...",
      "Mellow chords drift like autumn leaves...",
      "The warm cassette tape breathes...",
      "Slow down, let the dust settle."
    ]
  },
  {
    id: "s6",
    title: "Cyberpunk Velocity",
    artist: "Gridrunner-99",
    album: "Neon Accelerant",
    genre: "Cybersynth",
    bpm: 125,
    duration: "3:42",
    coverColor: "from-red-600 via-rose-700 to-neutral-950",
    emoji: "🏍️",
    songKey: "cyberpunk_drive",
    vibeText: "High-octane analogue drive with razor-sharp baseline transients and aggressive gate patterns.",
    lyrics: [
      "Plunging past the virtual gate...",
      "Gears shifting at terminal rate...",
      "Gridrunner burning on the dark fiber floor...",
      "Give me electricity, give me more...",
      "Accelerate... bypass!"
    ]
  },
  {
    id: "s7",
    title: "Starlight Resonance",
    artist: "Stella Nova",
    album: "Astral Horizons",
    genre: "Cinematic Ambient",
    bpm: 70,
    duration: "4:55",
    coverColor: "from-violet-900 via-purple-950 to-indigo-950",
    emoji: "✨",
    songKey: "cosmic_drifter",
    vibeText: "Ultra-wide, sweeping cosmic pads and shimmering star bells that feel completely weightless.",
    lyrics: [
      "Weightless in the stellar sea...",
      "Dust of dead stars surrounding me...",
      "Distant pulsars ticking slow...",
      "Let the cosmic solar wind blow..."
    ]
  },
  {
    id: "s8",
    title: "Recursive Glitch Tap",
    artist: "Neural Slice",
    album: "Polycoded Tides",
    genre: "IDM Breakcore",
    bpm: 145,
    duration: "3:15",
    coverColor: "from-lime-600 via-emerald-800 to-zinc-950",
    emoji: "⚙️",
    songKey: "quantum_glitch",
    vibeText: "Unconventional, highly mathematical glitch taps layered on top of pristine acoustic piano lines.",
    lyrics: [
      "Stack trace overflow...",
      "Recursion goes deep, watch the logic grow...",
      "Glitch the segment, reverse the stream...",
      "Is this memory or just a machine dream?"
    ]
  },
  {
    id: "s9",
    title: "Desert Solar Dust",
    artist: "Mirage Static",
    album: "Oasis Relics",
    genre: "Organic Desert Wave",
    bpm: 92,
    duration: "3:48",
    coverColor: "from-amber-500 via-orange-600 to-yellow-950",
    emoji: "🌵",
    songKey: "desert_mirage",
    vibeText: "Warm wooden flutes, dusty shaker rhythms and warm sun-bleached basslines running in constant space delays.",
    lyrics: [
      "Heat waves shimmer on the clay...",
      "Echoes of flutes fading away...",
      "Shifting dunes under dual suns...",
      "The ancient solar engine runs..."
    ]
  },
  {
    id: "s10",
    title: "Chilled Espresso Loops",
    artist: "The Barista Sound",
    album: "Caffeine Chords",
    genre: "Cafe Lofi",
    bpm: 80,
    duration: "2:50",
    coverColor: "from-yellow-950 via-amber-900 to-stone-950",
    emoji: "☕",
    songKey: "cafe_afternoon",
    vibeText: "Cozy mug clinks, smooth upright bass, and double-brushed snare strokes that create the ultimate focus environment.",
    lyrics: [
      "Steam rises from the heavy ceramic rim...",
      "Rain tapping, lights grow dim...",
      "Rhodes chords warming up the cold shop...",
      "Let the looping focus never stop..."
    ]
  },
  {
    id: "s11",
    title: "Kinetic Fretboard",
    artist: "Stratus Project",
    album: "Tapped Horizons",
    genre: "Progressive Math Jazz",
    bpm: 112,
    duration: "4:05",
    coverColor: "from-sky-600 via-indigo-750 to-zinc-950",
    emoji: "🎸",
    songKey: "math_jazz_tapped",
    vibeText: "Complex dual guitar lines that weave tapping melodies across constantly shifting polyrhythms.",
    lyrics: [
      "Time shifts in a 7/8 frame...",
      "Two fingers tapping a syncopated game...",
      "Chord progressions scaling high...",
      "Watch the soundwaves painting the sky..."
    ]
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: "p1",
    name: "Groove Outrun",
    description: "Infectious analog rhythms, neon grids, and physical synthetics to energize drive.",
    coverGradient: "from-pink-500 to-indigo-700",
    emoji: "⚡",
    category: "Interactive",
    tracks: [INITIAL_SONGS[0], INITIAL_SONGS[3], INITIAL_SONGS[5]]
  },
  {
    id: "p2",
    name: "Submersion Sanctuary",
    description: "Deep oceanic ambiences, slow reverb delays, and spatial piano spaces.",
    coverGradient: "from-cyan-400 to-blue-800",
    emoji: "🐬",
    category: "Relaxing",
    tracks: [INITIAL_SONGS[1], INITIAL_SONGS[4], INITIAL_SONGS[6], INITIAL_SONGS[9]]
  },
  {
    id: "p3",
    name: "Polyrhythmic Grid",
    description: "Complex math signatures, glitch beats, and virtual instruments for explorers.",
    coverGradient: "from-emerald-400 to-stone-900",
    emoji: "🌀",
    category: "Adventure",
    tracks: [INITIAL_SONGS[2], INITIAL_SONGS[3], INITIAL_SONGS[7], INITIAL_SONGS[10]]
  }
];

export const CONFLICT_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    question: "When you put on headphones, what is your subconscious mind hunting for first?",
    subtitle: "Focus on your gut physical response.",
    options: [
      { text: "A peaceful sanctuary", description: "Soft, expanding horizons that dissolve my spatial anxiety.", value: "1", emoji: "🧘" },
      { text: "A physical engine", description: "A steady, punchy pulse that locks my feet and hands into a groove.", value: "2", emoji: "🏃" },
      { text: "A cerebral architecture", description: "Complex patterns, odd-times, or glitch textures that keep me guessing.", value: "3", emoji: "🧠" }
    ]
  },
  {
    id: "q2",
    question: "Pick an absolute aesthetic setting that corresponds to your mental rhythm:",
    subtitle: "Close your eyes: what environment sparkles?",
    options: [
      { text: "Warm organic cabin", description: "Rain crackling on a glass screen, vintage wood, and tea steam.", value: "1", emoji: "🌧️" },
      { text: "An endless retro highway", description: "Vibrant neon-cyan grids of high speed driving under sunset arches.", value: "2", emoji: "🚗" },
      { text: "A matrix waterfall", description: "Infinite cascading numbers and wireframe geometric rings in a dark room.", value: "3", emoji: "📟" }
    ]
  },
  {
    id: "q3",
    question: "How do you typically interact physically with a song?",
    subtitle: "What is your body's natural response?",
    options: [
      { text: "Closing eyes & deep breathing", description: "Feeling the temperature and spaciousness of the mix.", value: "1", emoji: "🌬️" },
      { text: "Tapping fingers & nodding head", description: "Locking on strictly to the steady 4/4 drum kicks.", value: "2", emoji: "🥁" },
      { text: "Tracing individual stems", description: "Following an elusive secondary percussion line or odd keyboard run.", value: "3", emoji: "🔍" }
    ]
  },
  {
    id: "q4",
    question: "If your current mood was an instrument, it would express as:",
    subtitle: "The timbre that calls your name right now.",
    options: [
      { text: "A heavily reverberated felt piano", description: "Soft, warm, organic, slightly dusty keys.", value: "1", emoji: "🎹" },
      { text: "A sweeping, distorted analog synthesizer", description: "Sizzling, futuristic, full of drive and filtered voltage.", value: "2", emoji: "⚡" },
      { text: "A clean math-rock electric guitar", description: "Bright, snappy, dancing across odd syncopated intervals.", value: "3", emoji: "🎸" }
    ]
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: "b1",
    name: "Sonic Explorer",
    description: "Take the Sonic Archetype Quiz to unlock your personal profile.",
    requirement: "Complete Taste Quiz",
    unlocked: false,
    emoji: "🧪",
    points: 150
  },
  {
    id: "b2",
    name: "Active Groove Tracker",
    description: "Complete an interactive listening challenge inside the Music Player.",
    requirement: "Complete 1 Active Challenge",
    unlocked: false,
    emoji: "🎯",
    points: 200
  },
  {
    id: "b3",
    name: "Syncopation Sage",
    description: "Play are or discover complex tracks with higher technical ratings.",
    requirement: "Listen to 3 Progressive tracks",
    unlocked: false,
    emoji: "🧙",
    points: 300
  },
  {
    id: "b4",
    name: "Social Curator",
    description: "Share a playlist recommendation with a friend using the share feature.",
    requirement: "Share 1 track/playlist outline",
    unlocked: false,
    emoji: "📡",
    points: 150
  }
];

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily if key exists
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables. Falling back to mock behaviors.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Check if API key is real and valid to decide whether to fall back to simulated intelligence
const isApiKeyValid = () => {
  const key = process.env.GEMINI_API_KEY;
  return key && key !== "MY_GEMINI_API_KEY" && key.trim().length > 10;
};

// API: Generate Lyria 3 parallel background track layers
app.post("/api/music/generate-background", async (req, res) => {
  const { songTitle, artist, genre, bpm } = req.body;
  if (!songTitle) {
    res.status(400).json({ error: "songTitle is required" });
    return;
  }

  try {
    if (isApiKeyValid()) {
      const ai = getGeminiClient();
      const prompt = `Generate a 30-second futuristic instrumental background music layer or electronic synth pad loop that harmonizes perfectly as a backing audio with the song: "${songTitle}" by "${artist || "Unknown"}" (Genre: ${genre || "Any"}, Tempo: ${bpm || 100} BPM). Respond ONLY with the audio modality. Do not speak or add narration.`;
      
      const responseStream = await ai.models.generateContentStream({
        model: "lyria-3-clip-preview",
        contents: prompt,
      });

      let audioBase64 = "";
      let mimeType = "audio/wav";

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;

        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
        }
      }

      if (audioBase64) {
        res.json({
          audioBase64,
          mimeType,
          source: "lyria",
          message: `Generated 30s background track successfully via Lyria 3 for "${songTitle}"`
        });
        return;
      }
    }
  } catch (error: any) {
    console.error("Lyria background wave synthesis failed:", error);
  }

  // Soft fallback trigger for client-side procedural synth engine
  res.json({
    audioBase64: null,
    source: "procedural",
    message: "Lyria API key is inactive or did not respond. Handing over to browser synthesizer loop."
  });
});

// API: Get music insights (why is it interactive, listening game/challenge)
app.post("/api/music/interactive-insight", async (req, res) => {
  const { songTitle, artist, genre } = req.body;
  if (!songTitle) {
    res.status(400).json({ error: "songTitle is required" });
    return;
  }

  try {
    if (isApiKeyValid()) {
      const ai = getGeminiClient();
      const prompt = `Give interactive musical listening insights for the track "${songTitle}" by "${artist || "Unknown Artist"}" (Genre: ${genre || "Any"}).
Identify:
1. What makes this track highly interactive or dynamic? (e.g. rhythmic drops, tempo shifts, spatial stereo panning, overlapping vocal syncopations)
2. Interactive listening challenge/activity: An active exercise for the listener while playing this track (e.g. "Tap the off-beat triple snaps during the chorus," or "Follow the low-end sub-bass filter sweep").
3. Aesthetic visual backdrop description (e.g. neon-teal waves, vintage wireframe solar sunset) to display while playing.
Explain this back in clean JSON matching this structure:
{
  "interactiveness": "Summary of active musical components",
  "challengeTitle": "A catchy title for the mini-listening-game",
  "challengeDescription": "Step-by-step description of an action the listener can perform right now to interact with the music",
  "backdropDescription": "A poetic description of the aesthetic background style"
}`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              interactiveness: { type: Type.STRING },
              challengeTitle: { type: Type.STRING },
              challengeDescription: { type: Type.STRING },
              backdropDescription: { type: Type.STRING },
            },
            required: ["interactiveness", "challengeTitle", "challengeDescription", "backdropDescription"]
          }
        }
      });

      const responseText = aiResponse.text;
      if (responseText) {
        res.json(JSON.parse(responseText));
        return;
      }
    }
  } catch (error: any) {
    console.error("Gemini interactiveness insight failed, falling back to mock:", error);
  }

  // Fallback high-quality responses
  const fallbackInsights: Record<string, any> = {
    "neon_horizon": {
      interactiveness: "Built on sweeping sidechain compressed analog synthesizers that duck precisely with the 120BPM four-on-the-floor kick, creating a rhythmic 'push and pull' physical sensation.",
      challengeTitle: "The Off-Beat Sidechain Bounce",
      challengeDescription: "Nod your head ONLY during the swells (the space between the kick drums) to physically sync with the synth envelope. Feel the musical breathing room!",
      backdropDescription: "A retro-futuristic synthwave grid tinted in violet-orange sunset hues, with distant low-poly neon mountain peaks."
    },
    "ambient_tides": {
      interactiveness: "Features dynamic spatial stereo panning, where delicate hydro-acoustic piano notes ebb and flow sequentially between the left and right stereo field, simulating oceanic waves.",
      challengeTitle: "Stereo-Field Tracking",
      challengeDescription: "Close your eyes or focus strictly on the center. Physically tilt your head slightly left or right towards the ear where you hear the current high note sparkle.",
      backdropDescription: "A soft, organic liquid fluid field shifting in aquatic and cyan gradients, generating gentle ripples that react to low sound frequencies."
    },
    "cyber_glitch": {
      interactiveness: "A flurry of micro-edited IDM breakbeats that slice up standard 4/4 meter into syncopated tuplets, combined with sudden high-pass frequency sweeps that mimic digital friction.",
      challengeTitle: "Pitched Frequency Tracking",
      challengeDescription: "Listen closely for the metallic ring modulator sounds. Try to tap your index finger to the glitch clicks while tapping your foot to the steady sub-bass pulses.",
      backdropDescription: "An infinite digital waterfall of cascading terminal green characters and wireframe geometric rings that expand on sharp transients."
    },
    "jazz_odyssey": {
      interactiveness: "Features a rich call-and-response dialog between a syncopated Rhodes electric piano and a fluid, improvisational fretless double bass, constantly challenging the conventional harmonic progression.",
      challengeTitle: "Bass Line Counterpoint",
      challengeDescription: "Hum the bass motif under your breath. Notice how the pianist purposefully drops chords in the empty spaces left behind by the bass sweeps.",
      backdropDescription: "Warm sepia tones blended with abstract geometric golden brass plates, gently floating over velvet-black coffee gradients."
    },
    "funk_elevation": {
      interactiveness: "Anchored by a highly tactile slap-bass octave pattern and tight brass staccato pops, which work together to accent the 'One' of every single measure, keeping your body perpetually in motion.",
      challengeTitle: "Lock Onto The One",
      challengeDescription: "Snap your index fingers on the downbeat ('The One') of each bar, then remain perfectly still during the subsequent complex syncopations until the next downbeat sweeps in.",
      backdropDescription: "Vibrant yellow-magenta dynamic halftone circles that pulse outwards asynchronously with every slap-bass transient."
    }
  };

  const key = songTitle.toLowerCase().replace(/[^a-z0-str]/g, "_");
  const fallback = fallbackInsights[key] || {
    interactiveness: `A brilliant arrangement blending acoustic resonances with electronic textures, utilizing a rich dynamic range that expands dramatically during transitions.`,
    challengeTitle: "Dynamic Transient Echo",
    challengeDescription: `Listen for the subtle high-frequency percussion layers. Tap your fingers to the snare fills while maintaining a slow, steady alternate foot tap to the master tempo.`,
    backdropDescription: "Ethereal auroral waves of emerald-tinted light, drifting peacefully across a clean, high-contrast dark sky canvas."
  };

  res.json(fallback);
});

// API: Analyze Quiz and Generate Taste Profile
app.post("/api/quiz/analyze", async (req, res) => {
  const { answers } = req.body; // Array of objects containing { questionId, selectedOptionText, optionValue }
  if (!answers || !Array.isArray(answers)) {
    res.status(400).json({ error: "Answers array is required" });
    return;
  }

  try {
    if (isApiKeyValid()) {
      const ai = getGeminiClient();
      const summaryText = answers.map((a: any, i: number) => `Q${i+1}: Option "${a.selectedOptionText}" (Value: ${a.optionValue})`).join("\n");
      const prompt = `You are a visionary musicologist and sonic archetype strategist. Analyze these listener choices from a music quiz:\n${summaryText}\n
Based on this raw input, generate their unique personalized music persona.
Return a structured JSON object conforming EXACTLY to the following schema:
{
  "archetype": "Sonic Alchemist / Neon Wanderer / Rhythmic Shaman / etc. (Give a creative 2-3 word archetype)",
  "vibeDescription": "A poetic, deeply engaging 3-sentence description of what sounds resonate with them and why.",
  "dominantStyle": "The primary style, e.g. Vaporwave Fusion / Progressive Math Rock / Future Jazz / Dark Ambient Folk",
  "secondaryStyle": "The secondary style/exploration style",
  "metrics": {
    "adventure": 85, // out of 100
    "rhythmFocus": 70, // out of 100
    "harmonyVibe": 90, // out of 100
    "technicalComplexity": 60 // out of 100
  },
  "roadMapAdvice": "A paragraph giving them custom guidance on how to expand their listening universe, naming exactly what specific textures or structural setups they should scout for next.",
  "explorationTasks": [
    {
      "taskName": "Name of task, e.g. Discover the Microtonal Shift",
      "taskVibe": "e.g. Listen for instruments tuned outside the 12-tone western scale.",
      "genreTarget": "e.g. Anatolian Psychedelic Rock"
    },
    {
      "taskName": "e.g. Master the Poly-pulse",
      "taskVibe": "e.g. Sync your breathing with a 5/4 syncopated high-hat signature.",
      "genreTarget": "e.g. Contemporary Jazz Noir"
    },
    {
      "taskName": "e.g. Immerse in the Dust Vinyl Crackle",
      "taskVibe": "e.g. Focus exclusively on organic noise floors underlying clean synth solos.",
      "genreTarget": "e.g. Lo-Fi Chill Hop Beats"
    }
  ]
}`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              archetype: { type: Type.STRING },
              vibeDescription: { type: Type.STRING },
              dominantStyle: { type: Type.STRING },
              secondaryStyle: { type: Type.STRING },
              metrics: {
                type: Type.OBJECT,
                properties: {
                  adventure: { type: Type.NUMBER },
                  rhythmFocus: { type: Type.NUMBER },
                  harmonyVibe: { type: Type.NUMBER },
                  technicalComplexity: { type: Type.NUMBER }
                },
                required: ["adventure", "rhythmFocus", "harmonyVibe", "technicalComplexity"]
              },
              roadMapAdvice: { type: Type.STRING },
              explorationTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    taskName: { type: Type.STRING },
                    taskVibe: { type: Type.STRING },
                    genreTarget: { type: Type.STRING }
                  },
                  required: ["taskName", "taskVibe", "genreTarget"]
                }
              }
            },
            required: [
              "archetype", "vibeDescription", "dominantStyle", "secondaryStyle",
              "metrics", "roadMapAdvice", "explorationTasks"
            ]
          }
        }
      });

      const responseText = aiResponse.text;
      if (responseText) {
        res.json(JSON.parse(responseText));
        return;
      }
    }
  } catch (error: any) {
    console.error("Gemini quiz analysis failed, falling back to mock:", error);
  }

  // Fallback high quality archetype based on aggregate quiz score values
  let sumScore = 0;
  answers.forEach((ans: any) => {
    const val = parseInt(ans.optionValue);
    if (!isNaN(val)) sumScore += val;
  });

  let archetypeData;
  if (sumScore <= 6) {
    // Ambient / Introspective choice
    archetypeData = {
      archetype: "Introspective Dreamweaver",
      vibeDescription: "You seek sonic havens—spaces where gentle, rich organic sound floors and analog synth echoes create room for internal wanderlust. You appreciate details in stillness, texture over simple bombastic rhythms, and spacious reverbs.",
      dominantStyle: "Cinematic Organic Ambient",
      secondaryStyle: "Minimalist Acoustic Folk & Neo-Classical Glitch",
      metrics: { adventure: 65, rhythmFocus: 45, harmonyVibe: 95, technicalComplexity: 55 },
      roadMapAdvice: "To branch out further, strive to listen to music that introduces micro-tonal accents or delicate polyrhythmic layers. This maintains your preference for soft acoustic spaces while gently building rhythmic awareness.",
      explorationTasks: [
        { taskName: "Trace the Hydro-Acoustic Echo", taskVibe: "Listen for wet piano delays floating precisely between alternate channels.", genreTarget: "Neo-Classical Ambient Piano" },
        { taskName: "Identify the Wooden String Friction", taskVibe: "Listen so closely you can hear the finger sliding over wound nickel acoustic strings.", genreTarget: "Indie Acoustic Folk Noir" },
        { taskName: "Embrace the Vapor Dust", taskVibe: "Settle into lo-fi vinyl distortion patches mimicking rainfall backdrops.", genreTarget: "Lo-Fi Vintage Beatscapes" }
      ]
    };
  } else if (sumScore <= 11) {
    // Retro / Groovy choice
    archetypeData = {
      archetype: "Neon Groove Voyager",
      vibeDescription: "You thrive on nostalgic groove structures, retro analog drum loops, and high-energy synthesizers. Music for you is a kinetic kinetic engine—fueling drives, productivity, and physical expression with infectious rhythms.",
      dominantStyle: "Retro Synthwave & Electro Funk",
      secondaryStyle: "Future Disco & City Pop",
      metrics: { adventure: 75, rhythmFocus: 85, harmonyVibe: 70, technicalComplexity: 60 },
      roadMapAdvice: "Challenge yourself by diving into math rock or fusion genres that swap computerized 4/4 synthetic drums for complex, odd-meter live drum fills, bridging the synthesizer energy with manual virtuosity.",
      explorationTasks: [
        { taskName: "Isolate the Slap-Bass Octave Bounce", taskVibe: "Follow the rhythmic thumb slaps accentuating the start of every measure.", genreTarget: "Retro-Funk Revival" },
        { taskName: "Chart the Analog Filter Sweep", taskVibe: "Focus on the sweeping synthesizer oscillators transitioning from muffled warmth to a bright digital ring.", genreTarget: "Mid-Tempo Cyberwave" },
        { taskName: "Sync to the Four-On-The-Floor", taskVibe: "Perform a double hand snap specifically during the silent eighth-note spaces between kick drums.", genreTarget: "French Touch House" }
      ]
    };
  } else {
    // Complex / Adventurous explorer
    archetypeData = {
      archetype: "Polyrhythmic Alchemist",
      vibeDescription: "You seek mechanical prowess, complex odd meters, and adventurous architectural compositions. Simple choruses bore you—you want shifting time signatures, technical drum sweeps, and bold stylistic combinations.",
      dominantStyle: "Progressive Math Rock & Avant-Garde Fusion",
      secondaryStyle: "Neo-Classical IDM & Post-Jazz",
      metrics: { adventure: 95, rhythmFocus: 85, harmonyVibe: 65, technicalComplexity: 90 },
      roadMapAdvice: "As an advanced listener, seek out tribal world percussion systems or electronic artists who compose strictly without repeating bars, challenging you to recognize continuous organic transformation.",
      explorationTasks: [
        { taskName: "Decode the 7/8 Odd-Meter Loop", taskVibe: "Count consecutive beats in seven-eighths time. Locate the skipped pulse in each measure.", genreTarget: "Math Rock Oasis" },
        { taskName: "Chase the Microtonal Flat-Five", taskVibe: "Scout for unexpected melodic intervals nestled between Standard major/minor patterns.", genreTarget: "Ethio-Jazz & Anatolian Psychedelia" },
        { taskName: "Deconstruct the Glitched Breakbeat", taskVibe: "Separate live organic drums from computer-controlled sample stutter cuts in real time.", genreTarget: "IDM & Electro-Jazz Breakbeat" }
      ]
    };
  }

  res.json(archetypeData);
});

// API: Generate Custom Playlist or song recommendation based on a requested mood/style
app.post("/api/curation/recommend-songs", async (req, res) => {
  const { mood, genre, stylePreferences } = req.body;

  try {
    if (isApiKeyValid()) {
      const ai = getGeminiClient();
      const prompt = `Act as a legendary music recommendation assistant. Give me 4 recommended songs with creative fictional descriptions and genuine music attributes matching mood="${mood || "General"}", genre="${genre || "Any"}", stylePreferences="${stylePreferences || "None"}".
Return the results in JSON matching exactly:
{
  "recommendedSongs": [
    {
      "title": "Creative Track Title",
      "artist": "Creative Artist Name or Project Name",
      "genre": "Precise Genre Label",
      "bpm": 112,
      "vibeText": "Fascinating description of the track and what makes it fit this specific energy.",
      "duration": "3:45",
      "interactiveValue": "high",
      "songKey": "neon_horizon" // unique camelCase dummy key to coordinate artwork/effects
    }
  ]
}`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedSongs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    artist: { type: Type.STRING },
                    genre: { type: Type.STRING },
                    bpm: { type: Type.NUMBER },
                    vibeText: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    interactiveValue: { type: Type.STRING },
                    songKey: { type: Type.STRING }
                  },
                  required: ["title", "artist", "genre", "bpm", "vibeText", "duration", "interactiveValue", "songKey"]
                }
              }
            },
            required: ["recommendedSongs"]
          }
        }
      });

      const responseText = aiResponse.text;
      if (responseText) {
        res.json(JSON.parse(responseText));
        return;
      }
    }
  } catch (error: any) {
    console.error("Gemini song recommendation failed, falling back to mock:", error);
  }

  // Fallback items based on mood or genre
  const catalog = [
    {
      title: "Solitary Waveguide",
      artist: "Tidal Symmetries",
      genre: "Ambient Oceanwave",
      bpm: 78,
      vibeText: "A slow-tempo acoustic sanctuary combining organic marine sounds with soft analog pad delays.",
      duration: "4:12",
      interactiveValue: "focused",
      songKey: "ambient_tides"
    },
    {
      title: "Grid runner 1988",
      artist: "Retro-Luminance",
      genre: "Outrun Synthwave",
      bpm: 118,
      vibeText: "Driven by iconic sidechained pads and a thunderous Linn-style 80s snare drum. Full acceleration.",
      duration: "3:34",
      interactiveValue: "high",
      songKey: "neon_horizon"
    },
    {
      title: "Fractured Logic",
      artist: "Code Transient",
      genre: "Glitch Breakbeat",
      bpm: 140,
      vibeText: "Fast IDM breakbeats slicing standard rhythmic counts into fascinating micro-increments.",
      duration: "2:58",
      interactiveValue: "intricate",
      songKey: "cyber_glitch"
    },
    {
      title: "Tectonic Slattery",
      artist: "Grand Resonance",
      genre: "Acoustic Math Funk",
      bpm: 105,
      vibeText: "Dynamic live percussion loaded with acoustic slap strings and odd-meter fills that test your timing.",
      duration: "3:51",
      interactiveValue: "virtuoso",
      songKey: "funk_elevation"
    }
  ];

  res.json({ recommendedSongs: catalog });
});

// Setup development or production environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Express dev mode with Vite middeleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serves static production files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Muse Quest application is active on http://0.0.0.0:${PORT}`);
  });
}

startServer();

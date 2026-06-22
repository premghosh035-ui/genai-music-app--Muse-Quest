// Procedural Background Synthesizer using Web Audio API
// Generates high-fidelity parallel backing chords, drones, and ambient washes matching the track signature

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
let intervals: NodeJS.Timeout[] = [];
let noiseNode: AudioBufferSourceNode | null = null;

// Scale/Chords Helper Frequencies matching the mood keys
const TRACK_SCALES: Record<string, number[]> = {
  "neon_horizon": [110, 137.5, 165, 220, 275, 330], // A Major synth drive (A2, C#3, E3, A3, C#4, E4)
  "ambient_tides": [73.4, 110, 146.8, 196, 220, 293.7], // D Major ocean waves (D2, A2, D3, G3, A3, D4)
  "cyber_glitch": [65.4, 98, 130.8, 155.6, 196, 261.6], // C Minor recursive logic (C2, G2, C3, Eb3, G3, C4)
  "funk_elevation": [82.4, 123.5, 164.8, 196, 246.9, 329.6], // E Minor funk snap (E2, B2, E3, G3, B3, E4)
  "jazz_odyssey": [98, 146.8, 196, 233.1, 293.7, 349.2] // G Minor vinyl jazz (G2, D3, G3, Bb3, D4, F4)
};

function getAudioContext() {
  if (!audioCtx) {
    // Standard AudioContext initialization
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function startProceduralBackground(songKey: string, bpm: number, volume: number) {
  try {
    stopProceduralBackground();
    
    const ctx = getAudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime); // keep background layer soft
    masterGain.connect(ctx.destination);

    const freqs = TRACK_SCALES[songKey] || [110, 165, 220, 330]; // default pentatonic A

    // 1. Deep Sub-Bass drone to support the weight
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = "sawtooth";
    bassOsc.frequency.setValueAtTime(freqs[0] * 0.5, ctx.currentTime); // one octave lower sub-bass
    
    // Smooth filter sweep on bass
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = "lowpass";
    bassFilter.frequency.setValueAtTime(120, ctx.currentTime); // warm and muffled
    
    bassGain.gain.setValueAtTime(0.5, ctx.currentTime);
    
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(masterGain);
    
    bassOsc.start();
    oscillators.push({ osc: bassOsc, gain: bassGain });

    // 2. Warm Pad Layer - slow swelling waves playing chords
    freqs.slice(1, 4).forEach((freq, idx) => {
      const padOsc = ctx.createOscillator();
      const padGain = ctx.createGain();
      
      padOsc.type = songKey === "neon_horizon" ? "sawtooth" : "triangle";
      padOsc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Detune slightly for lush chorusing effect
      padOsc.detune.setValueAtTime((idx - 1) * 8, ctx.currentTime);
      
      padGain.gain.setValueAtTime(0, ctx.currentTime);
      // Sweeping slow volume swell
      padGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 3);
      
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.setValueAtTime(450 + (idx * 50), ctx.currentTime);
      
      padOsc.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(masterGain);
      
      padOsc.start();
      oscillators.push({ osc: padOsc, gain: padGain });

      // Slowly sweep filter cutoff with LFO simulation
      const lfoInterval = setInterval(() => {
        if (!audioCtx) return;
        const cutoff = 400 + Math.sin(Date.now() / 4000) * 200;
        padFilter.frequency.linearRampToValueAtTime(cutoff, audioCtx.currentTime + 1.5);
      }, 2000);
      (padOsc as any).lfoInterval = lfoInterval;
    });

    // 3. Ambient Arpeggiator / Plucks synchronized to the song tempo
    const beatIntervalMs = (60 / bpm) * 1000;
    const notesToArp = freqs.slice(2); // Mid-high range notes
    let arpIdx = 0;

    const arpTimer = setInterval(() => {
      if (!ctx || ctx.state === "suspended") return;
      const pluckOsc = ctx.createOscillator();
      const pluckGain = ctx.createGain();
      
      pluckOsc.type = "sine";
      pluckOsc.frequency.setValueAtTime(notesToArp[arpIdx % notesToArp.length] * (songKey === "cyber_glitch" ? 2 : 1), ctx.currentTime);
      
      pluckGain.gain.setValueAtTime(0, ctx.currentTime);
      pluckGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02);
      pluckGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      const delay = ctx.createDelay();
      delay.delayTime.setValueAtTime(beatIntervalMs * 0.75 / 1000, ctx.currentTime); // dotted eighth note delay
      const delayGain = ctx.createGain();
      delayGain.gain.setValueAtTime(0.35, ctx.currentTime);
      
      pluckOsc.connect(pluckGain);
      pluckGain.connect(masterGain!);
      
      // Delay line routing
      pluckGain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(masterGain!);
      
      pluckOsc.start();
      pluckOsc.stop(ctx.currentTime + 1.2);
      
      arpIdx++;
    }, songKey === "cyber_glitch" ? beatIntervalMs * 0.5 : beatIntervalMs); // Faster tempo for glitch tracks
    
    intervals.push(arpTimer);

    // 4. Cozy Vinyl Crackle for Lofi/Jazz
    if (songKey === "jazz_odyssey" || songKey === "ambient_tides") {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      // Generate soothing noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 1000;
      noiseFilter.Q.value = 1.0;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.05, ctx.currentTime);

      noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseNode.start();
    }

  } catch (err) {
    console.warn("Could not start procedural Web Audio engine:", err);
  }
}

export function stopProceduralBackground() {
  // Clear arpeggiator intervals
  intervals.forEach(clearInterval);
  intervals = [];

  // Halt active generators
  oscillators.forEach(item => {
    try {
      if ((item.osc as any).lfoInterval) {
        clearInterval((item.osc as any).lfoInterval);
      }
      item.osc.stop();
    } catch (e) {}
  });
  oscillators = [];

  if (noiseNode) {
    try {
      noiseNode.stop();
    } catch (e) {}
    noiseNode = null;
  }

  masterGain = null;
}

export function updateProceduralVolume(volume: number) {
  if (masterGain && audioCtx) {
    masterGain.gain.linearRampToValueAtTime(volume * 0.15, audioCtx.currentTime + 0.1);
  }
}

import React, { useState } from "react";
import { CONFLICT_QUIZ, QuizQuestion } from "../data";
import { Sparkles, BarChart2, Flame, Orbit, Compass, CheckCircle2, RotateCcw, ChevronRight } from "lucide-react";

interface QuizSectionProps {
  onQuizCompleted: (archetypeData: any) => void;
  earnedPoints: number;
  addPoints: (val: number) => void;
}

export default function QuizSection({ onQuizCompleted, earnedPoints, addPoints }: QuizSectionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, { optionText: string; value: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});

  const activeQuestion: QuizQuestion = CONFLICT_QUIZ[currentStep];

  const handleSelectOption = (optionText: string, value: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: { optionText, value }
    }));
  };

  const handleNext = () => {
    if (currentStep < CONFLICT_QUIZ.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      triggerAnalysis();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const triggerAnalysis = async () => {
    setIsLoading(true);
    
    const logs = [
      "Analyzing micro-rhythmic vectors...",
      "Matching tempo nostalgic coefficients...",
      "Filtering low-pass harmonic anomalies...",
      "Mapping acoustic timbre coordinates...",
      "Generating strategic Sonic Profile..."
    ];

    let logIdx = 0;
    setLoadingMessage(logs[0]);
    const interval = setInterval(() => {
      logIdx++;
      if (logIdx < logs.length) {
        setLoadingMessage(logs[logIdx]);
      }
    }, 900);

    const formattedAnswers = CONFLICT_QUIZ.map(q => {
      const selected = selectedAnswers[q.id];
      return {
        questionId: q.id,
        selectedOptionText: selected?.optionText || q.options[0].text,
        optionValue: selected?.value || q.options[0].value
      };
    });

    try {
      const res = await fetch("/api/quiz/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers })
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      
      clearInterval(interval);
      setTimeout(() => {
        setQuizResult(data);
        setIsLoading(false);
      }, 500);

    } catch (e) {
      console.error(e);
      clearInterval(interval);
      setTimeout(() => {
        let sum = 0;
        formattedAnswers.forEach(ans => sum += parseInt(ans.optionValue));
        let mockData;
        if (sum <= 6) {
          mockData = {
            archetype: "Introspective Dreamweaver",
            vibeDescription: "You seek sonic havens—spaces where gentle, rich organic sound floors and analog synth echoes create room for internal wanderlust. You appreciate details in stillness and spacious reverbs.",
            dominantStyle: "Cinematic Organic Ambient",
            secondaryStyle: "Minimalist Acoustic Folk",
            metrics: { adventure: 65, rhythmFocus: 45, harmonyVibe: 95, technicalComplexity: 55 },
            roadMapAdvice: "To branch out further, strive to listen to music that introduces microtonal accents or polyrhythmic sweeps. Try following the rhythmic spaces.",
            explorationTasks: [
              { taskName: "Trace the Hydro-Acoustic Echo", taskVibe: "Listen for dynamic alternate delays panning", genreTarget: "Neo-Classical Piano" },
              { taskName: "Identify the Wooden String Friction", taskVibe: "Listen so closely you hear the fingers sliding", genreTarget: "Indie Acoustic Folk" },
              { taskName: "Embrace the Vapor Dust", taskVibe: "Focus on texture fields over pure beats", genreTarget: "Lofi Ambient Beatscapes" }
            ]
          };
        } else if (sum <= 11) {
          mockData = {
            archetype: "Neon Groove Voyager",
            vibeDescription: "You thrive on nostalgic groove structures, retro analog drum loops, and high-energy synthesizers. Music to you is a physical, kinetic engine driving production and movement.",
            dominantStyle: "Retro Synthwave & Electro",
            secondaryStyle: "City Pop & Disco Fusion",
            metrics: { adventure: 75, rhythmFocus: 85, harmonyVibe: 70, technicalComplexity: 60 },
            roadMapAdvice: "Challenge yourself by transitioning to math rock or post-jazz fusion which swap computerized layouts for syncopated live drums.",
            explorationTasks: [
              { taskName: "Isolate the Slap-Bass Octave", taskVibe: "Follow the snappy string triggers on the downbeat", genreTarget: "Retro-Funk" },
              { taskName: "Chart the Analog Filter Sweep", taskVibe: "Track synthesizer frequencies oscillating", genreTarget: "Mid-Tempo Cyberwave" },
              { taskName: "France Touch Syncopation", taskVibe: "Snap fingers during high-hat clicks only", genreTarget: "French House" }
            ]
          };
        } else {
          mockData = {
            archetype: "Polyrhythmic Alchemist",
            vibeDescription: "You seek mechanical prowess, complex odd meters, and adventurous compositions. Shifting time signatures, virtuoso drum solos and bold combinations excite your ears.",
            dominantStyle: "Progressive Math Rock",
            secondaryStyle: "Neo-Classical IDM & Post-Jazz",
            metrics: { adventure: 95, rhythmFocus: 85, harmonyVibe: 65, technicalComplexity: 90 },
            roadMapAdvice: "Seek out world percussion loops or modular synthesizer patches that compose strictly without repetitive choruses.",
            explorationTasks: [
              { taskName: "Decode the 7/8 Odd-Meter Loop", taskVibe: "Count consecutive counts of seven, locating the skipped beat", genreTarget: "Math Rock Oasis" },
              { taskName: "Chase the Microtonal Flat-Five", taskVibe: "Track melodic tones that sit precisely between standard key layouts", genreTarget: "Ethio-Jazz" },
              { taskName: "Deconstruct the Glitched Breakbeat", taskVibe: "Isolate live acoustic hits from computerized stutters", genreTarget: "Advanced IDM Fusion" }
            ]
          };
        }
        setQuizResult(mockData);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleApplyProfile = () => {
    if (quizResult) {
      onQuizCompleted(quizResult);
      addPoints(150);
    }
  };

  const handleToggleTask = (idx: number, pointsValue: number) => {
    if (completedTasks[idx]) return;
    setCompletedTasks(prev => ({ ...prev, [idx]: true }));
    addPoints(pointsValue);
  };

  const handleReset = () => {
    setQuizResult(null);
    setCurrentStep(0);
    setSelectedAnswers({});
    setCompletedTasks({});
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0F0F0F] text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-none border-4 border-[#CCFF00] border-t-transparent animate-spin" />
          <Sparkles className="w-6 h-6 text-[#CCFF00] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="text-lg font-black uppercase italic tracking-tight text-white font-sans">Deconstructing Sonic Profile</h3>
        <p className="text-xs text-[#CCFF00] font-mono mt-2 pr-2 uppercase font-bold tracking-wider">{loadingMessage}</p>
        <div className="w-48 bg-zinc-900 h-2 rounded-none mt-6 overflow-hidden border border-white/10">
          <div className="bg-[#CCFF00] h-full w-[80%] animate-pulse" />
        </div>
      </div>
    );
  }

  if (quizResult) {
    return (
      <div id="quiz_results_panel" className="flex-1 overflow-y-auto px-4 py-5 scrollbar-none bg-[#0F0F0F]">
        <div className="text-center mb-6">
          <span className="bg-[#CCFF00]/10 text-[#CCFF00] text-[9px] uppercase font-mono font-black tracking-[0.2em] px-3 py-1.5 border border-[#CCFF00]/30 inline-block">
            Aura Profile Analyzed
          </span>
          <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter mt-4">Your Sonic Archetype</h2>
          <p className="text-xl font-mono text-[#CCFF00] font-bold uppercase tracking-tight mt-1">
            [{quizResult.archetype}]
          </p>
        </div>

        {/* Narrative Box */}
        <div className="bg-zinc-950 rounded-none p-4 mb-5 border-l-4 border-[#CCFF00]">
          <p className="text-xs text-zinc-300 leading-relaxed font-mono">
            {quizResult.vibeDescription}
          </p>
          <div className="flex flex-col gap-1.5 mt-4 pt-3 border-t border-white/5 text-[10px] uppercase font-mono font-bold tracking-wider">
            <div>
              <span className="text-zinc-500">// Dominant style:</span>{" "}
              <strong className="text-white text-[11px] font-black">{quizResult.dominantStyle}</strong>
            </div>
            <div>
              <span className="text-zinc-500">// Secondary style:</span>{" "}
              <strong className="text-[#CCFF00] text-[11px] font-black">{quizResult.secondaryStyle}</strong>
            </div>
          </div>
        </div>

        {/* Metric bars */}
        <div className="bg-zinc-900/40 rounded-none p-4 mb-5 border border-white/15">
          <h4 className="text-[10px] font-black text-white tracking-[0.15em] uppercase mb-4 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-[#CCFF00]" /> STYLE METRIC SPECTRO_
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1 uppercase">
                <span>Adventure Coefficient</span>
                <span className="text-white font-black">{quizResult.metrics.adventure}%</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-none overflow-hidden">
                <div className="bg-[#CCFF00] h-full" style={{ width: `${quizResult.metrics.adventure}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1 uppercase">
                <span>Rhythm Attack Focus</span>
                <span className="text-white font-black">{quizResult.metrics.rhythmFocus}%</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-none overflow-hidden">
                <div className="bg-[#CCFF00] h-full" style={{ width: `${quizResult.metrics.rhythmFocus}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1 uppercase">
                <span>Harmony Resonance</span>
                <span className="text-white font-black">{quizResult.metrics.harmonyVibe}%</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-none overflow-hidden">
                <div className="bg-[#CCFF00] h-full" style={{ width: `${quizResult.metrics.harmonyVibe}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1 uppercase">
                <span>Algorithmic Complexity</span>
                <span className="text-white font-black">{quizResult.metrics.technicalComplexity}%</span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-none overflow-hidden">
                <div className="bg-[#CCFF00] h-full" style={{ width: `${quizResult.metrics.technicalComplexity}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Advice */}
        <div className="bg-black rounded-none p-4 mb-5 border border-white/10 text-[10px] leading-relaxed font-mono text-zinc-300">
          <h4 className="font-black text-white uppercase tracking-[0.15em] flex items-center gap-1.5 mb-2 text-xs">
            <Orbit className="w-4 h-4 text-[#CCFF00]" /> RADICAL GROWTH ROADMAP
          </h4>
          <p>{quizResult.roadMapAdvice}</p>
        </div>

        {/* Active exploration tasks */}
        <div className="bg-zinc-950 p-4 mb-6 border border-[#CCFF00]/20">
          <h4 className="text-[10px] font-black text-white tracking-[0.15em] uppercase mb-4 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#CCFF00]" /> ACTIVE TASTE DEPLOYMENTS
          </h4>
          <div className="space-y-3">
            {quizResult.explorationTasks.map((t: any, idx: number) => (
              <div 
                key={idx}
                className={`p-3 rounded-none border flex items-start gap-3 transition-colors ${
                  completedTasks[idx] 
                    ? "bg-zinc-900/30 border-white/5 text-zinc-500" 
                    : "bg-black border-white/10 text-white hover:border-[#CCFF00]"
                }`}
              >
                <div className="mt-0.5">
                  <CheckCircle2 
                    className={`w-4 h-4 cursor-pointer transition-colors ${
                      completedTasks[idx] ? "text-[#CCFF00]" : "text-zinc-600 hover:text-[#CCFF00]"
                    }`}
                    onClick={() => handleToggleTask(idx, 100)}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-1">
                    <span className={`text-[11px] font-black uppercase tracking-tight ${completedTasks[idx] ? "line-through text-zinc-500" : ""}`}>
                      {t.taskName}
                    </span>
                    <span className="text-[8px] bg-zinc-900 px-2 py-0.5 rounded-none text-[#CCFF00] font-mono uppercase tracking-wider shrink-0 border border-white/5">
                      {t.genreTarget}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 font-sans leading-relaxed">{t.taskVibe}</p>
                  {!completedTasks[idx] && (
                    <button 
                      onClick={() => handleToggleTask(idx, 100)}
                      className="text-[9px] text-[#CCFF00] hover:underline font-mono uppercase mt-2 w-full text-left flex items-center gap-1"
                    >
                      <Flame className="w-3.5 h-3.5 text-[#CCFF00]" /> Deploy complete track feedback (+100 XP)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Actions */}
        <div className="flex gap-2 pb-5">
          <button
            onClick={handleApplyProfile}
            className="flex-1 py-3 px-4 bg-[#CCFF00] hover:bg-white text-black font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-black fill-black" /> LOAD PERSONAL PALETTE (+150 XP)
          </button>
          <button
            onClick={handleReset}
            className="p-3 bg-zinc-900 hover:bg-white hover:text-black border border-white/10 text-zinc-400 transition-colors"
            title="Retake Quiz"
          >
            <RotateCcw className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto px-4 py-4 scrollbar-none bg-[#0F0F0F]">
      {/* Quiz Intro Header */}
      <div className="mb-4">
        <span className="text-[9px] font-mono font-black tracking-[0.2em] text-[#CCFF00] bg-black border border-[#CCFF00]/30 px-3 py-1.5 inline-block">
          SONIC ARCHETYPE EXPERI_
        </span>
        <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-white mt-4">
          Map Your Listening Aura
        </h2>
        <p className="text-[11px] text-zinc-400 font-sans mt-2 leading-relaxed">
          Unlock highly specialized recommendation algorithms, sonoral maps, and dynamic metric coordinates.
        </p>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 mt-5">
          {CONFLICT_QUIZ.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 flex-1 transition-all duration-300 rounded-none ${
                idx === currentStep 
                  ? "bg-[#CCFF00] w-6" 
                  : idx < currentStep 
                  ? "bg-zinc-200" 
                  : "bg-zinc-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="my-auto bg-zinc-950 p-4 border border-white/10 relative overflow-hidden">
        <span className="text-[9px] font-mono font-black tracking-[0.1em] text-zinc-500 uppercase block">
          METRIC WAVEFORM {currentStep + 1} // {CONFLICT_QUIZ.length}
        </span>
        <h3 className="text-base font-black text-white uppercase tracking-tight mt-2 leading-snug">
          {activeQuestion.question}
        </h3>
        <p className="text-[10px] leading-normal italic text-zinc-400 mt-1 font-mono">
          "{activeQuestion.subtitle}"
        </p>

        <div className="space-y-2 mt-5">
          {activeQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[activeQuestion.id]?.optionText === option.text;
            return (
              <div 
                key={idx}
                id={`quiz_opt_${idx}`}
                onClick={() => handleSelectOption(option.text, option.value)}
                className={`p-3 rounded-none border cursor-pointer transition-colors flex items-center justify-between group ${
                  isSelected 
                    ? "bg-zinc-900 border-[#CCFF00] text-white" 
                    : "bg-black border-white/5 text-zinc-350 hover:bg-zinc-900/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg bg-zinc-950 p-1 rounded-none border border-white/10 w-8 h-8 flex items-center justify-center">
                    {option.emoji}
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-tight block">{option.text}</span>
                    <span className="text-[10px] text-zinc-400 leading-snug line-clamp-1">{option.description}</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-none border flex items-center justify-center ${
                  isSelected ? "border-[#CCFF00] bg-[#CCFF00]" : "border-zinc-700"
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 bg-black rounded-none" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`px-4 py-2 font-mono uppercase font-black text-[10px] tracking-wider ${
            currentStep === 0 
              ? "text-zinc-600 cursor-not-allowed" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!selectedAnswers[activeQuestion.id]}
          className={`py-2 px-5 font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-1.5 ${
            selectedAnswers[activeQuestion.id]
              ? "bg-[#CCFF00] text-black hover:bg-white"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          {currentStep === CONFLICT_QUIZ.length - 1 ? "Analyze Sync" : "Continue"}{" "}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

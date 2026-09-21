import React from 'react';
import { Music, User, Sparkles, Play, Flame, Star, CheckCircle } from 'lucide-react';
import { SONG_PRESETS } from '../data/presets';

interface LandingViewProps {
  onSelectMode: (mode: 'song' | 'character') => void;
  onQuickDemo: (presetId: string) => void;
  onSelectRepurpose?: () => void;
  onSelectChordPipeline?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSelectMode,
  onQuickDemo,
  onSelectRepurpose,
  onSelectChordPipeline,
}) => {
  const worshipPreset = SONG_PRESETS[0]; // "You Found Me in the Silence"

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Cinematic Lyric Video Studio</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3 font-cinzel">
          Make Captions Look Like High-End Lyric Videos
        </h2>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Create radiant golden worship captions, ethereal volumetric light rays, kinetic typography, 
          and synchronized performer avatars driven by Gemini & Veo neural pipelines.
        </p>
      </div>

      {/* Featured Banner: Chord Sheet OCR & Timestamped Lyrics Pipeline */}
      {onSelectChordPipeline && (
        <div
          onClick={onSelectChordPipeline}
          className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-gray-900 to-indigo-950/60 border-2 border-amber-500/40 hover:border-amber-400 cursor-pointer transition-all duration-300 shadow-2xl hover:shadow-amber-500/15 flex flex-col md:flex-row items-center justify-between gap-5 group"
        >
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider border border-amber-500/30">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>Dedicated YouTube Music Producer Feature</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition">
              Chord Sheet Screenshot/PDF OCR & Whisper Timestamps
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Upload your audio, paste plain lyrics, get Whisper timestamps, and upload a chord screenshot or PDF.
              Outputs <code className="text-amber-300 font-mono">[00:00.00] (Chord)Lyrics</code> with automatic Intro card & 10-second Thank You outro screen!
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectChordPipeline();
            }}
            className="shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-black text-xs sm:text-sm px-5 py-3.5 rounded-2xl transition shadow-lg shadow-amber-500/30 flex items-center gap-2"
          >
            <span>Open Chords Pipeline</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Primary Options Grid */}
      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        {/* Option 1: Song & Lyrics Only */}
        <div
          onClick={() => onSelectMode('song')}
          className="group relative bg-gradient-to-b from-gray-900/90 to-gray-950 border border-gray-800 hover:border-amber-500/80 p-6 sm:p-7 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
        >
          <div>
            <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl font-bold mb-5 group-hover:scale-105 transition">
              <Music className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-white group-hover:text-amber-300 transition">
                Song & Lyrics Only
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Worship Video Look
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mt-2">
              Upload your song and lyrics. Generates divine light shafts, golden luminous text bloom, and synchronized word-by-word worship captions.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Golden radiance typography & volumetric God rays</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Multi-line depth-of-field display with upcoming preview</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Audio-reactive particles and real video export</span>
              </li>
            </ul>
          </div>

          <button className="mt-6 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-sm py-3 rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
            <span>Create Song & Lyrics Video</span>
            <span>→</span>
          </button>
        </div>

        {/* Option 2: Song, Lyrics + Character */}
        <div
          onClick={() => onSelectMode('character')}
          className="group relative bg-gradient-to-b from-gray-900/90 to-gray-950 border border-gray-800 hover:border-pink-500/80 p-6 sm:p-7 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 flex flex-col justify-between"
        >
          <div>
            <div className="w-13 h-13 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center text-2xl font-bold mb-5 group-hover:scale-105 transition">
              <User className="w-6 h-6 text-pink-400" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-white group-hover:text-pink-300 transition">
                Song, Lyrics + Character
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
                Avatar Performer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mt-2">
              Upload a character photo, vocal track, and lyrics. Synthesizes an identity vector with cinematic rim lighting and lip sync animation.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-pink-400" />
                <span>Facial embedding with breathing & audio-reactive aura</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-pink-400" />
                <span>Simulated phoneme lip sync timed to vocals</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-pink-400" />
                <span>Full studio controls for camera motion and lighting</span>
              </li>
            </ul>
          </div>

          <button className="mt-6 w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm py-3 rounded-xl transition shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2">
            <span>Create with Character Photo</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Repurpose Hub Feature Banner */}
      {onSelectRepurpose && (
        <div
          onClick={onSelectRepurpose}
          className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-gray-900 to-amber-950/40 border border-rose-500/30 hover:border-rose-500/70 cursor-pointer transition shadow-lg hover:shadow-rose-500/10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-extrabold uppercase tracking-wider border border-rose-500/30">
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span>New Feature • YouTube & TikTok Repurpose Hub</span>
            </div>
            <h3 className="text-lg font-black text-white">
              Repurpose Any YouTube or TikTok Video with AI
            </h3>
            <p className="text-xs text-gray-400 max-w-xl">
              Paste a link to extract viral hooks, high-ranking SEO tags, and descriptions. Layer your background song, add customizable call-to-actions, and export ready-to-upload short-form videos.
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectRepurpose();
            }}
            className="whitespace-nowrap px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-gray-950 font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-rose-500/20 flex items-center gap-2 cursor-pointer"
          >
            <span>Open Repurpose Hub</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Highlighted Preset Banner: Reference Style Videos */}
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-amber-950/50 via-gray-900 to-amber-950/50 border border-amber-500/40 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Reference Style 1 • Golden Worship Glow ("You Found Me in the Silence")</span>
            </div>
            <h4 className="font-bold text-lg text-white font-cinzel">
              "{worshipPreset.title}"
            </h4>
            <p className="text-xs text-gray-400 max-w-xl italic">
              "You found me in the silence, When the world was loud and blind. You reached into my darkness, And gave me peace I couldn’t find..."
            </p>
          </div>

          <button
            onClick={() => onQuickDemo('silence_worship')}
            className="whitespace-nowrap px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md shadow-amber-500/30 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Worship Video</span>
          </button>
        </div>

        {/* Reference Style 2: How to Save a Life with chords & clean centered layout */}
        <div className="bg-gradient-to-r from-amber-950/30 via-gray-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>Reference Style 2 • Warm Ballad with Chords & Centered Typography</span>
            </div>
            <h4 className="font-bold text-lg text-white font-sans">
              "How to Save a Life" (The Fray Style)
            </h4>
            <p className="text-xs text-gray-400 max-w-xl italic">
              "Step one, you say we need to talk... Where did I go wrong? I lost a friend somewhere along in the bitterness..."
            </p>
          </div>

          <button
            onClick={() => onQuickDemo('how_to_save_a_life')}
            className="whitespace-nowrap px-6 py-3 bg-amber-400 hover:bg-amber-300 text-gray-950 font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch "How to Save a Life"</span>
          </button>
        </div>
      </div>

      {/* Other Quick Presets */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-xs text-gray-400">
        <span className="font-semibold text-gray-500">Other Styles:</span>
        {SONG_PRESETS.slice(1).map((preset) => (
          <button
            key={preset.id}
            onClick={() => onQuickDemo(preset.id)}
            className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Flame className="w-3 h-3 text-pink-400" />
            <span>{preset.title} ({preset.genre})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Sparkles, PlusCircle, Film, Music, ShieldCheck, User, Key } from 'lucide-react';

interface HeaderProps {
  onNewCreation: () => void;
  activeView: string;
  onSelectView?: (view: 'landing' | 'build_song' | 'chord_pipeline' | 'studio' | 'veo_studio' | 'repurpose_hub') => void;
  onOpenAccountSettings?: () => void;
  creatorName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNewCreation,
  activeView,
  onSelectView,
  onOpenAccountSettings,
  creatorName = 'James Ussery',
}) => {
  return (
    <header className="border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onNewCreation}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-amber-500/20">
            V
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">VeoStudio</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                AI Studio Suite
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400 inline" />
              <span>Gemini 2.5 + Google Veo 3 Video Suite</span>
            </p>
          </div>
        </div>

        {/* Mode Switcher: Lyric Video Pipeline vs Standalone Video Editor vs Repurpose Hub */}
        <div className="hidden md:flex items-center bg-gray-900 border border-gray-800 p-1 rounded-2xl shadow-inner gap-1">
          <button
            onClick={() => onSelectView && onSelectView('chord_pipeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === 'chord_pipeline'
                ? 'bg-amber-500 text-gray-950 shadow-md font-black'
                : 'text-amber-300 hover:text-white bg-amber-500/10'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Chords & Lyrics OCR</span>
            <span className="text-[9px] bg-amber-400/30 text-amber-200 px-1.5 py-0.2 rounded font-mono">
              NEW
            </span>
          </button>

          <button
            onClick={() => onSelectView && onSelectView('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === 'landing' || activeView === 'build_song'
                ? 'bg-gray-800 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lyric Director</span>
          </button>

          <button
            onClick={() => onSelectView && onSelectView('veo_studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === 'veo_studio'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-amber-300" />
            <span>Veo 3 Video Studio</span>
          </button>

          <button
            onClick={() => onSelectView && onSelectView('repurpose_hub')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === 'repurpose_hub'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Repurpose Hub</span>
            <span className="text-[9px] bg-rose-400/30 text-rose-200 px-1.5 py-0.5 rounded-full font-mono font-black">
              YouTube/TikTok
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Creator Account & BYOK Keys Button */}
          {onOpenAccountSettings && (
            <button
              onClick={onOpenAccountSettings}
              className="flex items-center space-x-1.5 text-xs font-semibold bg-gray-900 hover:bg-gray-850 text-amber-300 hover:text-white px-3 py-2 rounded-xl border border-amber-500/30 hover:border-amber-500/60 transition shadow-sm cursor-pointer"
              title="Manage Creator Profile, 8 Streaming Links, and API Keys"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="max-w-[110px] truncate hidden sm:inline">{creatorName}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                KEYS & LINKS
              </span>
            </button>
          )}

          <button
            onClick={onNewCreation}
            className="flex items-center space-x-1.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-gray-200 hover:text-white px-3.5 py-2 rounded-xl border border-gray-700/80 transition shadow-sm hover:border-gray-600 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>New Creation</span>
          </button>
        </div>
      </div>
    </header>
  );
};


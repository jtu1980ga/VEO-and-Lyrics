import React, { useState } from 'react';
import {
  Sparkles,
  Music,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  Wand2,
  Type,
  Palette,
  Sun,
  Loader2,
  Check
} from 'lucide-react';
import { CaptionStyle, LightingMood, FontFamily, VideoSettings } from '../types';
import { SONG_PRESETS } from '../data/presets';
import { PexelsAssetSelector } from './PexelsAssetSelector';

interface BuildSongViewProps {
  mode: 'song' | 'character';
  onBack: () => void;
  onSelectChordPipeline?: () => void;
  onLaunchStudio: (data: {
    lyrics: string;
    audioFile: File | null;
    audioFileName: string | null;
    characterPhotoUrl: string | null;
    characterPhotoName: string | null;
    bgImageUrl: string | null;
    settings: VideoSettings;
  }) => void;
}

export const BuildSongView: React.FC<BuildSongViewProps> = ({
  mode,
  onBack,
  onSelectChordPipeline,
  onLaunchStudio,
}) => {
  const defaultPreset = SONG_PRESETS[0];

  const [selectedPresetId, setSelectedPresetId] = useState<string>('silence_worship');
  const [lyricsText, setLyricsText] = useState(defaultPreset.lyrics);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);

  const [characterPhotoUrl, setCharacterPhotoUrl] = useState<string | null>(null);
  const [characterPhotoName, setCharacterPhotoName] = useState<string | null>(null);

  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);

  // Styling & Directing parameters
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('golden_worship');
  const [lightingMood, setLightingMood] = useState<LightingMood>('divine_sanctuary');
  const [fontFamily, setFontFamily] = useState<FontFamily>('Cinzel');
  const [glowColor, setGlowColor] = useState<string>('#f59e0b');
  const [cameraMotion, setCameraMotion] = useState<'dolly_push' | 'orbital_drift' | 'slow_pan' | 'breathing_cam'>('dolly_push');
  const [showLinesCount, setShowLinesCount] = useState<1 | 2 | 3>(3);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [textUppercase, setTextUppercase] = useState(false);
  const [bouncingSparkle, setBouncingSparkle] = useState(true);

  // AI Generation Loading States
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [aiDirectorStatus, setAiDirectorStatus] = useState<string | null>(null);

  // Load a preset
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = SONG_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setLyricsText(found.lyrics);
      setCaptionStyle(found.defaultStyle);
      setLightingMood(found.defaultMood);
      setFontFamily(found.defaultFont);
      setGlowColor(found.defaultColor);
    }
  };

  // Upload Character Photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCharacterPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = () => setCharacterPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Upload Song Audio
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioFileName(file.name);
    }
  };

  // Upload Custom Background Image
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setBgImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // AI: Generate Lyrics with Gemini
  const handleAIGenerateLyrics = async () => {
    setIsGeneratingLyrics(true);
    setAiDirectorStatus("Gemini: Writing emotional worship / poetic lyrics...");
    try {
      const res = await fetch("/api/director/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: lightingMood === 'synthwave_neon' ? 'synthwave' : 'worship',
          theme: 'redemption, peace, and finding light in silence',
          referenceLyrics: lyricsText,
        }),
      });
      const data = await res.json();
      if (data.lyrics) {
        setLyricsText(data.lyrics);
        setAiDirectorStatus("Gemini: Lyrics synthesized successfully!");
      }
    } catch (err) {
      console.error(err);
      setAiDirectorStatus("Fallback lyrics applied.");
    } finally {
      setIsGeneratingLyrics(false);
      setTimeout(() => setAiDirectorStatus(null), 3500);
    }
  };

  // Submit to Studio
  const handleLaunch = () => {
    const chordsInput = document.getElementById('show-chords-checkbox') as HTMLInputElement | null;
    const showChords = chordsInput ? chordsInput.checked : true;

    onLaunchStudio({
      lyrics: lyricsText,
      audioFile,
      audioFileName,
      characterPhotoUrl,
      characterPhotoName,
      bgImageUrl,
      settings: {
        aspectRatio,
        captionStyle,
        lightingMood,
        cameraMotion,
        fontFamily,
        glowColor,
        fontSize: aspectRatio === '9:16' ? 42 : 36,
        showLinesCount,
        showSingerAvatar: mode === 'character',
        avatarType: mode === 'character' ? (characterPhotoUrl ? 'photo' : 'silhouette') : 'none',
        textUppercase,
        bouncingSparkle,
        particlesEnabled: true,
        showChords,
        cta: {
          enabled: true,
          text: 'Listen on Spotify & Apple Music',
          subtext: 'Official Worship Lyric Video • Share with Friends',
          position: 'bottom',
          badgeColor: '#f59e0b',
          icon: 'music',
        },
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white mb-5 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Selection</span>
      </button>

      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-cinzel">
              {mode === 'character' ? 'Configure Song, Lyrics & Character' : 'Configure Song & Cinematic Lyrics'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Customize the volumetric worship captions, lighting atmosphere, and typography.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-xl border border-gray-800 self-start">
            {SONG_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition ${
                  selectedPresetId === preset.id
                    ? 'bg-amber-500 text-gray-950 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {preset.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Character Photo Upload (if character mode) */}
        {mode === 'character' && (
          <div className="bg-gray-950/60 border border-gray-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Character Portrait Photo</span>
              </label>
              <span className="text-[10px] text-gray-500">Avatar face embedding</span>
            </div>

            <div className="flex items-center gap-4">
              {characterPhotoUrl ? (
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pink-500 shrink-0">
                  <img src={characterPhotoUrl} alt="Character" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700 cursor-pointer"
                />
                {characterPhotoName && (
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Selected: {characterPhotoName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Song Audio File Selection */}
        <div className="bg-gray-950/60 border border-gray-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" />
              <span>Song Audio (MP3 / WAV / M4A)</span>
            </label>
            <span className="text-[10px] text-emerald-400 font-medium">
              {audioFile ? 'Custom audio' : 'Built-in worship track active'}
            </span>
          </div>

          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700 cursor-pointer"
          />
          {audioFileName ? (
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <Check className="w-3 h-3" /> Audio loaded: {audioFileName}
            </p>
          ) : (
            <p className="text-[11px] text-gray-500 mt-1">
              *Optional: If no file is uploaded, the real-time harmonious piano & worship synthesizer plays automatically!
            </p>
          )}
        </div>

        {/* Pexels Cinematic Visuals / Background Asset Picker */}
        <PexelsAssetSelector
          selectedUrl={bgImageUrl}
          onSelectAsset={(url, type, title) => {
            setBgImageUrl(url);
          }}
        />

        {/* Chord Sheet OCR Quick Switcher */}
        {onSelectChordPipeline && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Music className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-200">
                Want to upload a <strong>Chord Sheet Screenshot or PDF</strong> and align with <strong>Whisper</strong>?
              </span>
            </div>
            <button
              type="button"
              onClick={onSelectChordPipeline}
              className="text-xs font-bold text-amber-300 hover:text-amber-200 underline whitespace-nowrap"
            >
              Open Chords Pipeline →
            </button>
          </div>
        )}

        {/* Lyrics Editor with AI Assistant */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-amber-400" />
              <span>Lyrics (Timestamp & Burn Ready)</span>
            </label>

            <button
              onClick={handleAIGenerateLyrics}
              disabled={isGeneratingLyrics}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-lg transition disabled:opacity-50"
            >
              {isGeneratingLyrics ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5" />
              )}
              <span>✨ Gemini Lyricist</span>
            </button>
          </div>

          <textarea
            rows={6}
            value={lyricsText}
            onChange={(e) => setLyricsText(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3.5 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-500 font-mono leading-relaxed transition resize-y"
            placeholder="Type or paste lyrics line by line..."
          />

          {aiDirectorStatus && (
            <p className="text-xs text-amber-400 animate-pulse font-medium">{aiDirectorStatus}</p>
          )}
        </div>

        {/* Captions Style & Typography Presets */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
              Caption Visual Style
            </label>
            <select
              value={captionStyle}
              onChange={(e) => setCaptionStyle(e.target.value as CaptionStyle)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="how_to_save_a_life">🎹 How to Save a Life (Warm Clean Centered + Chords)</option>
              <option value="golden_worship">⭐ Golden Worship Radiance (Reference Style)</option>
              <option value="celestial_kinetic">✨ Celestial Kinetic Bloom</option>
              <option value="karaoke_wipe">🎤 Karaoke Dual-Color Sweep</option>
              <option value="bouncing_ember">🌟 Bouncing Celestial Ember</option>
              <option value="minimalist_subtitle">💬 Minimalist Studio Subtitle</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
              Atmosphere & God Rays
            </label>
            <select
              value={lightingMood}
              onChange={(e) => setLightingMood(e.target.value as LightingMood)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="warm_cinematic">☕ Warm Cinematic Ballad (How to Save a Life Style)</option>
              <option value="divine_sanctuary">☀️ Divine Sanctuary (Golden Rays & Haze)</option>
              <option value="twilight_horizon">🌄 Twilight Mountain Horizon</option>
              <option value="synthwave_neon">🌆 Neon Cyber City / Retro Grid</option>
              <option value="concert_spotlight">💡 Volumetric Concert Spotlights</option>
            </select>
          </div>
        </div>

        {/* Typography & Accent Color */}
        <div className="grid sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
              Typography Font
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as FontFamily)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Cinzel">Cinzel (Regal Worship Serif)</option>
              <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
              <option value="Montserrat">Montserrat (Modern Heavy Sans)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta (Clean Geometric)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
              Luminous Glow Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={glowColor}
                onChange={(e) => setGlowColor(e.target.value)}
                className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-gray-800 p-0.5"
              />
              <span className="text-xs font-mono text-gray-400">{glowColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">
              Video Aspect Ratio
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as any)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="16:9">16:9 Landscape (YouTube / TV)</option>
              <option value="9:16">9:16 Vertical (TikTok / Reels)</option>
              <option value="1:1">1:1 Square (Instagram / Social)</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-800/80 text-xs text-gray-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={textUppercase}
              onChange={(e) => setTextUppercase(e.target.checked)}
              className="rounded bg-gray-950 border-gray-700 text-amber-500 focus:ring-amber-500"
            />
            <span>UPPERCASE Typography</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={bouncingSparkle}
              onChange={(e) => setBouncingSparkle(e.target.checked)}
              className="rounded bg-gray-950 border-gray-700 text-amber-500 focus:ring-amber-500"
            />
            <span>Celestial Floating Sparkle / Ember</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-amber-300 font-semibold">
            <input
              type="checkbox"
              defaultChecked={true}
              id="show-chords-checkbox"
              className="rounded bg-gray-950 border-gray-700 text-amber-500 focus:ring-amber-500"
            />
            <span>Show Musical Chords (How to Save a Life)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-gray-400">Display:</span>
            <select
              value={showLinesCount}
              onChange={(e) => setShowLinesCount(Number(e.target.value) as any)}
              className="bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs"
            >
              <option value={1}>1 Line (Centered)</option>
              <option value={2}>2 Lines</option>
              <option value={3}>3 Lines (Depth of Field)</option>
            </select>
          </label>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm sm:text-base rounded-xl transition shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>Launch AI Pipeline & Render Video 🚀</span>
        </button>
      </div>
    </div>
  );
};

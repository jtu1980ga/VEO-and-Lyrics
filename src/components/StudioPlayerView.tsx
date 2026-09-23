import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sliders,
  Terminal,
  AlignLeft,
  Wand2,
  Maximize2,
  Sparkles,
  Sun,
  Type,
  Eye,
  EyeOff,
  Disc3,
  Loader2,
  CheckCircle2,
  Music2,
  Image as ImageIcon,
  Megaphone,
  Bot,
  Send,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { TimedLyricLine, VideoSettings, CaptionStyle, LightingMood, FontFamily } from '../types';
import { VideoRenderer } from '../utils/videoRenderer';
import { AudioEngine } from '../utils/audioEngine';
import { VideoExporter } from '../utils/videoExporter';
import { LyricChordEditor } from './LyricChordEditor';
import { PexelsAssetSelector } from './PexelsAssetSelector';

interface StudioPlayerViewProps {
  lyricsLines: TimedLyricLine[];
  settings: VideoSettings;
  audioFile: File | null;
  characterPhotoUrl: string | null;
  bgImageUrl: string | null;
  pipelineLogs: string[];
  activeStep: number;
  isPipelineProcessing: boolean;
  onUpdateSettings: (newSettings: Partial<VideoSettings>) => void;
  onSeekLine: (timeSec: number) => void;
  onUpdateLyricsLines?: (lines: TimedLyricLine[]) => void;
  onUpdateBgImage?: (url: string) => void;
}

export const StudioPlayerView: React.FC<StudioPlayerViewProps> = ({
  lyricsLines,
  settings,
  audioFile,
  characterPhotoUrl,
  bgImageUrl,
  pipelineLogs,
  activeStep,
  isPipelineProcessing,
  onUpdateSettings,
  onSeekLine,
  onUpdateLyricsLines,
  onUpdateBgImage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<VideoRenderer | null>(null);
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const exporterRef = useRef<VideoExporter>(new VideoExporter());

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(32);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);

  // Sidebar Tab
  const [activeTab, setActiveTab] = useState<'lyrics' | 'chords' | 'pexels' | 'chat' | 'cta' | 'director' | 'pipeline'>('lyrics');

  // AI Directing Assistant
  const [isConsultingDirector, setIsConsultingDirector] = useState<boolean>(false);
  const [directorFeedback, setDirectorFeedback] = useState<string | null>(null);

  // AI Editor Chat State for Lyric Video & CTA
  const [aiChatMessages, setAiChatMessages] = useState<
    Array<{ sender: 'user' | 'director'; text: string; time: string }>
  >([
    {
      sender: 'director',
      text: "👋 Hi James! I'm your Lyric Video & CTA AI Director. Tell me what changes you want to make in plain English (e.g. 'Make it golden worship with amber glow', 'Change CTA to Apple Music & Spotify', 'Turn on musical chords', or 'Change background atmosphere to Divine Sanctuary'). What would you like to edit?",
      time: 'Ready',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  const handleSendStudioChat = async (messageText?: string) => {
    const text = messageText || chatInput.trim();
    if (!text || isSendingChat) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAiChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const savedKeys = localStorage.getItem('veostudio_api_keys');
      let customGeminiKey = '';
      if (savedKeys) {
        try {
          const parsed = JSON.parse(savedKeys);
          customGeminiKey = parsed.geminiApiKey || '';
        } catch (e) {}
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customGeminiKey) {
        headers['x-gemini-api-key'] = customGeminiKey;
      }

      const res = await fetch('/api/studio/ai-director-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userMessage: text,
          currentSettings: settings,
          lyricsLines,
        }),
      });

      if (res.ok) {
        const resp = await res.json();
        if (resp.updatedSettings) {
          onUpdateSettings(resp.updatedSettings);
        }
        if (resp.updatedLyricsLines && onUpdateLyricsLines) {
          onUpdateLyricsLines(resp.updatedLyricsLines);
        }
        setAiChatMessages((prev) => [
          ...prev,
          {
            sender: 'director',
            text: resp.reply || "I've applied your edits to the video preview!",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        const errData = await res.json().catch(() => ({}));
        setAiChatMessages((prev) => [
          ...prev,
          {
            sender: 'director',
            text: errData.error || "I noticed an issue reaching Gemini. Please verify your GEMINI_API_KEY in Account Settings or try again.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      console.error('Studio AI Chat error:', err);
      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: 'director',
          text: "Network or server connection error. Your local preview remains active.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Total duration calculation from lines, settings, and outro duration
  useEffect(() => {
    if (settings.videoDurationMode === 'custom' && settings.customDurationSec) {
      setTotalDuration(settings.customDurationSec);
      return;
    }

    if (lyricsLines.length > 0) {
      const lastLine = lyricsLines[lyricsLines.length - 1];
      const outroPortion = settings.showOutroScreen ? (settings.outroDurationSec || 10) : 2;
      setTotalDuration(Math.max(20, Math.ceil(lastLine.end + outroPortion)));
    }
  }, [lyricsLines, settings.videoDurationMode, settings.customDurationSec, settings.showOutroScreen, settings.outroDurationSec]);

  // Initialize AudioEngine
  useEffect(() => {
    const audio = new AudioEngine();
    audioEngineRef.current = audio;

    if (audioFile) {
      audio.loadCustomAudio(audioFile).then((dur) => {
        if (settings.videoDurationMode !== 'custom') {
          const outroPortion = settings.showOutroScreen ? (settings.outroDurationSec || 10) : 0;
          setTotalDuration(Math.ceil(dur) + outroPortion);
        }
      });
    }

    return () => {
      audio.stop();
    };
  }, [audioFile, settings.videoDurationMode, settings.showOutroScreen, settings.outroDurationSec]);

  // Initialize Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Aspect ratio canvas sizing
    if (settings.aspectRatio === '9:16') {
      canvas.width = 720;
      canvas.height = 1280;
    } else if (settings.aspectRatio === '1:1') {
      canvas.width = 720;
      canvas.height = 720;
    } else {
      // 16:9
      canvas.width = 1280;
      canvas.height = 720;
    }

    const renderer = new VideoRenderer(canvas);
    if (characterPhotoUrl) renderer.setUserAvatar(characterPhotoUrl);
    if (bgImageUrl) renderer.setUserBackground(bgImageUrl);
    rendererRef.current = renderer;

    return () => {
      renderer.destroy();
    };
  }, [settings.aspectRatio, characterPhotoUrl, bgImageUrl]);

  // Animation Frame Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying && !isPipelineProcessing) {
        setCurrentSec((prev) => {
          const next = prev + dt;
          if (next >= totalDuration) {
            // Loop playback
            if (audioEngineRef.current) {
              const genre = settings.lightingMood === 'synthwave_neon' ? 'synthwave' : 'worship';
              audioEngineRef.current.play(0, 68, genre);
            }
            return 0;
          }
          return next;
        });
      }

      // Render to canvas
      if (rendererRef.current && canvasRef.current) {
        const vol = audioEngineRef.current ? audioEngineRef.current.getAverageVolume() : 0;
        rendererRef.current.render(currentSec, lyricsLines, settings, vol, isPlaying);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPipelineProcessing, currentSec, lyricsLines, settings, totalDuration]);

  // Helper to determine synthesized genre from settings
  const getActiveGenre = () => {
    if (settings.captionStyle === 'how_to_save_a_life' || settings.lightingMood === 'warm_cinematic') {
      return 'how_to_save_a_life';
    }
    if (settings.lightingMood === 'synthwave_neon') {
      return 'synthwave';
    }
    return 'worship';
  };

  // Handle Play/Pause
  const togglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);

    if (audioEngineRef.current) {
      if (next) {
        audioEngineRef.current.play(currentSec, 68, getActiveGenre());
      } else {
        audioEngineRef.current.stop();
      }
    }
  };

  // Seek time
  const handleSeek = (newSec: number) => {
    const clamped = Math.max(0, Math.min(totalDuration, newSec));
    setCurrentSec(clamped);
    if (isPlaying && audioEngineRef.current) {
      audioEngineRef.current.play(clamped, 68, getActiveGenre());
    }
  };

  // Volume change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioEngineRef.current) {
      audioEngineRef.current.setVolume(newVol);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      handleVolumeChange(volume || 0.85);
    } else {
      setIsMuted(true);
      if (audioEngineRef.current) audioEngineRef.current.setVolume(0);
    }
  };

  // Record and Export MP4/WebM Video
  const handleDownloadVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioEngineRef.current) return;

    setIsRecording(true);
    setRecordingProgress(0);

    // Seek to start for clean recording
    setCurrentSec(0);
    setIsPlaying(true);
    audioEngineRef.current.play(0, 68, getActiveGenre());

    const stream = audioEngineRef.current.getMediaStream();
    exporterRef.current.startRecording(canvas, stream);

    const durationMs = totalDuration * 1000;
    const intervalMs = 250;
    let elapsed = 0;

    const progressTimer = setInterval(() => {
      elapsed += intervalMs;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setRecordingProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(progressTimer);
        exporterRef.current.stopRecording().then((blob) => {
          setIsRecording(false);
          const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
          exporterRef.current.downloadBlob(blob, `worship-lyric-video-${Date.now()}.${ext}`);
        }).catch((err) => {
          console.error(err);
          setIsRecording(false);
        });
      }
    }, intervalMs);
  };

  // AI: Ask Gemini Scene Director
  const handleAskAIDirector = async () => {
    setIsConsultingDirector(true);
    setDirectorFeedback(null);
    try {
      const currentLyrics = lyricsLines.map((l) => l.line).join('\n');
      const res = await fetch('/api/director/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lyrics: currentLyrics,
          genre: settings.lightingMood === 'synthwave_neon' ? 'synthwave' : 'worship',
        }),
      });
      const data = await res.json();
      if (data.captionsStyle) {
        onUpdateSettings({
          captionStyle: data.captionsStyle,
          lightingMood: data.lightingMood,
          cameraMotion: data.cameraMotion,
          glowColor: data.colorPalette?.[0] || settings.glowColor,
        });
        setDirectorFeedback(data.directorNotes || 'Gemini optimized the visual lighting and typography!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsConsultingDirector(false);
    }
  };

  // Format time (mm:ss)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/80 border border-gray-800 p-3 sm:p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
            🎬
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white font-cinzel">
              Cinematic Lyric Video Studio
            </h2>
            <p className="text-[11px] text-gray-400">
              Style: <span className="text-amber-400 font-semibold">{settings.captionStyle.replace('_', ' ').toUpperCase()}</span> • 
              Atmosphere: <span className="text-indigo-400 font-semibold">{settings.lightingMood.replace('_', ' ').toUpperCase()}</span>
            </p>
          </div>
        </div>

        {/* Quick Style Switcher Chips */}
        <div className="hidden lg:flex items-center gap-1.5 bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
          <button
            onClick={() => onUpdateSettings({ captionStyle: 'golden_worship', lightingMood: 'divine_sanctuary', glowColor: '#f59e0b' })}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              settings.captionStyle === 'golden_worship'
                ? 'bg-amber-500 text-gray-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⭐ Golden Worship
          </button>
          <button
            onClick={() => onUpdateSettings({ captionStyle: 'celestial_kinetic', lightingMood: 'twilight_horizon', glowColor: '#38bdf8' })}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              settings.captionStyle === 'celestial_kinetic'
                ? 'bg-sky-500 text-gray-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ✨ Celestial Kinetic
          </button>
          <button
            onClick={() => onUpdateSettings({ captionStyle: 'karaoke_wipe', lightingMood: 'synthwave_neon', glowColor: '#ec4899' })}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              settings.captionStyle === 'karaoke_wipe'
                ? 'bg-pink-500 text-gray-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎤 Karaoke Sweep
          </button>
        </div>

        {/* Export / Download Video Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadVideo}
            disabled={isRecording}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            {isRecording ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Recording {recordingProgress}%</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Video</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Video Stage (2 Cols) + Interactive Sidebar (1 Col) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left / Center: Video Stage & Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Canvas Wrapper */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-black shadow-2xl flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
            <canvas
              ref={canvasRef}
              className={`max-h-[500px] w-auto h-full object-contain ${
                settings.aspectRatio === '9:16'
                  ? 'aspect-[9/16]'
                  : settings.aspectRatio === '1:1'
                  ? 'aspect-square'
                  : 'aspect-video'
              }`}
            />

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>REC • Rendering Video ({recordingProgress}%)</span>
              </div>
            )}

            {/* Aspect Ratio Badge */}
            <div className="absolute top-4 right-4 bg-gray-950/70 border border-gray-800 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-mono text-gray-300">
              {settings.aspectRatio}
            </div>

            {/* Play Overlay when paused */}
            {!isPlaying && !isPipelineProcessing && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 text-gray-950 flex items-center justify-center transition shadow-2xl shadow-amber-500/50 hover:scale-105 cursor-pointer"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
            )}
          </div>

          {/* Player Timeline & Controls Bar */}
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3 shadow-lg">
            {/* Scrubber Timeline */}
            <div className="space-y-1">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={totalDuration}
                  step={0.05}
                  value={currentSec}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition"
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                <span>{formatTime(currentSec)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePlay}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-md shadow-amber-500/20"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleSeek(0)}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition"
                  title="Restart"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Volume Slider */}
                <div className="flex items-center space-x-2 pl-2">
                  <button onClick={toggleMute} className="text-gray-400 hover:text-white transition">
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-gray-800 rounded-lg appearance-none accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Settings Toggles */}
              <div className="flex items-center gap-2 text-xs">
                {/* Avatar toggle */}
                <button
                  onClick={() => onUpdateSettings({ showSingerAvatar: !settings.showSingerAvatar })}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition ${
                    settings.showSingerAvatar
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                      : 'bg-gray-800/80 text-gray-400 border-gray-700'
                  }`}
                >
                  {settings.showSingerAvatar ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>Avatar</span>
                </button>

                {/* Sparkle toggle */}
                <button
                  onClick={() => onUpdateSettings({ bouncingSparkle: !settings.bouncingSparkle })}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition ${
                    settings.bouncingSparkle
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-gray-800/80 text-gray-400 border-gray-700'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Sparkle</span>
                </button>

                {/* Lines count */}
                <select
                  value={settings.showLinesCount}
                  onChange={(e) => onUpdateSettings({ showLinesCount: Number(e.target.value) as any })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-[11px] text-gray-300"
                >
                  <option value={1}>1 Line</option>
                  <option value={2}>2 Lines</option>
                  <option value={3}>3 Lines</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar with Interactive Tabs */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 flex flex-col h-[560px] shadow-xl">
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1 border-b border-gray-800 pb-2.5 mb-3">
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`flex-1 min-w-[60px] flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'lyrics'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Lyrics</span>
            </button>

            <button
              onClick={() => setActiveTab('chords')}
              className={`flex-1 min-w-[60px] flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'chords'
                  ? 'bg-amber-500 text-gray-950 font-black shadow'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Chords</span>
            </button>

            <button
              onClick={() => setActiveTab('pexels')}
              className={`flex-1 min-w-[60px] flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'pexels'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Pexels</span>
            </button>

            <button
              onClick={() => setActiveTab('cta')}
              className={`flex-1 min-w-[50px] flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'cta'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>CTA</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 min-w-[75px] flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-gray-950 font-black shadow-md'
                  : 'text-amber-300 hover:text-white hover:bg-gray-800 border border-amber-500/30'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Chat</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300">
                LIVE
              </span>
            </button>

            <button
              onClick={() => setActiveTab('director')}
              className={`flex-1 min-w-[60px] flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'director'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Director</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex-1 min-w-[60px] flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'pipeline'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>
          </div>

          {/* TAB 1: INTERACTIVE LYRICS TIMELINE */}
          {activeTab === 'lyrics' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="bg-gradient-to-r from-amber-500/10 via-gray-950 to-gray-900 border border-amber-500/25 rounded-xl p-2.5 flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] text-amber-300 font-semibold">Want to edit typography, glow, or styles?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-[10px] rounded-lg transition shrink-0 cursor-pointer"
                >
                  AI Chat →
                </button>
              </div>

              <div className="text-[11px] text-gray-400 mb-2 flex items-center justify-between">
                <span>Click any line to seek</span>
                <span className="text-amber-400 font-mono">{lyricsLines.length} lines timed</span>
              </div>

              {lyricsLines.map((line, idx) => {
                const isActive = currentSec >= line.start && currentSec <= line.end;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSeek(line.start)}
                    className={`p-3 rounded-xl border transition cursor-pointer text-xs ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10'
                        : 'bg-black/40 border-gray-800/80 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mb-1">
                      <span>Line {idx + 1}</span>
                      <span className={isActive ? 'text-amber-400 font-bold' : ''}>
                        {formatTime(line.start)} - {formatTime(line.end)}
                      </span>
                    </div>

                    <p
                      className={`font-semibold leading-relaxed ${
                        isActive ? 'text-amber-300 text-sm font-cinzel' : 'text-gray-300'
                      }`}
                    >
                      {line.line}
                    </p>

                    {/* Word-level breakdown chips */}
                    {isActive && line.words && (
                      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-amber-500/20">
                        {line.words.map((w, wIdx) => {
                          const isWordActive = currentSec >= w.start && currentSec <= w.end;
                          return (
                            <span
                              key={wIdx}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                isWordActive
                                  ? 'bg-amber-400 text-gray-950 font-bold scale-105'
                                  : 'bg-black/50 text-amber-200/70'
                              }`}
                            >
                              {w.word}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: AI DIRECTOR & VISUAL STYLING */}
          {activeTab === 'director' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Gemini Director Button */}
              <button
                onClick={handleAskAIDirector}
                disabled={isConsultingDirector}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-90 font-bold text-white rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isConsultingDirector ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                <span>✨ Gemini AI Scene Director</span>
              </button>

              {directorFeedback && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 leading-relaxed text-[11px]">
                  <strong>Director Notes:</strong> {directorFeedback}
                </div>
              )}

              {/* Caption Style */}
              <div>
                <label className="block text-gray-400 uppercase font-bold text-[10px] mb-1">
                  Caption Style
                </label>
                <select
                  value={settings.captionStyle}
                  onChange={(e) => onUpdateSettings({ captionStyle: e.target.value as CaptionStyle })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-gray-200"
                >
                  <option value="seven_clouds">☁️ 7 Clouds Style (Bold Modern Pill, Drop Shadow & Highlight)</option>
                  <option value="how_to_save_a_life">🎹 How to Save a Life (Warm Clean Centered + Chords)</option>
                  <option value="golden_worship">⭐ Golden Worship (Video Style)</option>
                  <option value="celestial_kinetic">✨ Celestial Kinetic Bloom</option>
                  <option value="karaoke_wipe">🎤 Karaoke Dual-Color Sweep</option>
                  <option value="bouncing_ember">🌟 Bouncing Celestial Ember</option>
                  <option value="minimalist_subtitle">💬 Minimalist Studio Subtitle</option>
                </select>
              </div>

              {/* Atmosphere */}
              <div>
                <label className="block text-gray-400 uppercase font-bold text-[10px] mb-1">
                  Volumetric Lighting Atmosphere
                </label>
                <select
                  value={settings.lightingMood}
                  onChange={(e) => onUpdateSettings({ lightingMood: e.target.value as LightingMood })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-gray-200"
                >
                  <option value="warm_cinematic">☕ Warm Cinematic Ballad (How to Save a Life Style)</option>
                  <option value="divine_sanctuary">☀️ Divine Sanctuary (Worship Rays)</option>
                  <option value="twilight_horizon">🌄 Twilight Mountain Horizon</option>
                  <option value="synthwave_neon">🌆 Synthwave Neon Cyber Grid</option>
                  <option value="concert_spotlight">💡 Concert Stage Spotlight</option>
                </select>
              </div>

              {/* Show Chords Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-gray-950/80 border border-gray-800 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-amber-300 block">Show Musical Chords</span>
                  <span className="text-[10px] text-gray-400">Display chord badges over lyrics</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showChords ?? false}
                  onChange={(e) => onUpdateSettings({ showChords: e.target.checked })}
                  className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              {/* Typography */}
              <div>
                <label className="block text-gray-400 uppercase font-bold text-[10px] mb-1">
                  Typography Font
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => onUpdateSettings({ fontFamily: e.target.value as FontFamily })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-gray-200"
                >
                  <option value="Cinzel">Cinzel (Worship Serif)</option>
                  <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                  <option value="Montserrat">Montserrat (Bold Sans)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta (Modern Clean)</option>
                </select>
              </div>

              {/* Luminous Glow Color */}
              <div>
                <label className="block text-gray-400 uppercase font-bold text-[10px] mb-1">
                  Glow Radiance Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.glowColor}
                    onChange={(e) => onUpdateSettings({ glowColor: e.target.value })}
                    className="w-8 h-8 rounded bg-transparent cursor-pointer border border-gray-800 p-0.5"
                  />
                  <span className="font-mono text-gray-400 text-xs">{settings.glowColor}</span>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-gray-400 uppercase font-bold text-[10px] mb-1">
                  Caption Font Size ({settings.fontSize}px)
                </label>
                <input
                  type="range"
                  min={24}
                  max={64}
                  step={2}
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                  className="w-full h-1 bg-gray-800 rounded accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB: TIMESTAMPS & CHORDS STUDIO */}
          {activeTab === 'chords' && (
            <div className="flex-1 overflow-y-auto pr-1">
              <LyricChordEditor
                lines={lyricsLines}
                onChangeLines={(newLines) => {
                  if (onUpdateLyricsLines) onUpdateLyricsLines(newLines);
                }}
                onPreviewSeek={(t) => handleSeek(t)}
                songDuration={totalDuration}
              />
            </div>
          )}

          {/* TAB: PEXELS CINEMATIC ASSETS */}
          {activeTab === 'pexels' && (
            <div className="flex-1 overflow-y-auto pr-1">
              <PexelsAssetSelector
                selectedUrl={bgImageUrl}
                onSelectAsset={(url, type, title) => {
                  if (onUpdateBgImage) onUpdateBgImage(url);
                  if (rendererRef.current) rendererRef.current.setUserBackground(url);
                }}
              />
            </div>
          )}

          {/* TAB: CALL TO ACTION (CTA) */}
          {activeTab === 'cta' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* AI CTA Copilot helper */}
              <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-gray-950 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">AI CTA Directing Assistant</span>
                    <span className="text-[10px] text-gray-400">Ask AI to polish your streaming headline or color</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('chat');
                    handleSendStudioChat("Update CTA badge to 'Stream on Spotify, Apple Music & Amazon Music' with gold glow");
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-[10px] transition shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Polish CTA</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div>
                  <h4 className="font-bold text-amber-300">Call to Action (CTA) Banner</h4>
                  <p className="text-[10px] text-gray-400">Renders high-converting overlay on video</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.cta?.enabled ?? false}
                  onChange={(e) => {
                    const cta = settings.cta || {
                      enabled: false,
                      text: 'Stream Now on Spotify & Apple Music',
                      subtext: 'Link in description • Official Lyric Video',
                      position: 'bottom',
                      badgeColor: '#f59e0b',
                      icon: 'music',
                    };
                    onUpdateSettings({ cta: { ...cta, enabled: e.target.checked } });
                  }}
                  className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-3 bg-gray-950/70 border border-gray-800 rounded-xl p-3">
                <div>
                  <label className="block text-gray-400 uppercase font-bold text-[10px] mb-1">
                    Primary CTA Headline
                  </label>
                  <input
                    type="text"
                    value={settings.cta?.text || 'Listen on Spotify, Apple Music & YouTube'}
                    onChange={(e) => {
                      const cta = settings.cta || {
                        enabled: true,
                        text: '',
                        subtext: '',
                        position: 'bottom',
                        badgeColor: '#f59e0b',
                        icon: 'music',
                      };
                      onUpdateSettings({ cta: { ...cta, text: e.target.value } });
                    }}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs"
                    placeholder="e.g. Listen on Spotify & Apple Music"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase font-bold text-[10px] mb-1">
                    Supporting Subtext
                  </label>
                  <input
                    type="text"
                    value={settings.cta?.subtext || 'Subscribe & Follow • New Album Out Now'}
                    onChange={(e) => {
                      const cta = settings.cta || {
                        enabled: true,
                        text: '',
                        subtext: '',
                        position: 'bottom',
                        badgeColor: '#f59e0b',
                        icon: 'music',
                      };
                      onUpdateSettings({ cta: { ...cta, subtext: e.target.value } });
                    }}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs"
                    placeholder="e.g. Subscribe for weekly acoustic worship"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-400 uppercase font-bold text-[10px] mb-1">
                      Banner Position
                    </label>
                    <select
                      value={settings.cta?.position || 'bottom'}
                      onChange={(e) => {
                        const cta = settings.cta || {
                          enabled: true,
                          text: 'Listen Now',
                          subtext: '',
                          position: 'bottom',
                          badgeColor: '#f59e0b',
                          icon: 'music',
                        };
                        onUpdateSettings({ cta: { ...cta, position: e.target.value as any } });
                      }}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-gray-200 text-xs"
                    >
                      <option value="bottom">Bottom of Frame</option>
                      <option value="top">Top Header Banner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 uppercase font-bold text-[10px] mb-1">
                      Pulse Dot Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.cta?.badgeColor || '#f59e0b'}
                        onChange={(e) => {
                          const cta = settings.cta || {
                            enabled: true,
                            text: 'Listen Now',
                            subtext: '',
                            position: 'bottom',
                            badgeColor: '#f59e0b',
                            icon: 'music',
                          };
                          onUpdateSettings({ cta: { ...cta, badgeColor: e.target.value } });
                        }}
                        className="w-8 h-8 rounded bg-transparent cursor-pointer border border-gray-700 p-0.5"
                      />
                      <span className="text-[10px] text-gray-400 font-mono">
                        {settings.cta?.badgeColor || '#f59e0b'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AI DIRECTOR CHAT FOR LYRIC VIDEO & CTA */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              <div className="bg-gradient-to-br from-amber-950/40 via-gray-950 to-gray-900 border border-amber-500/30 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>AI Lyric & CTA Director Chat</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  Type instructions in plain English to edit your lyric styling, lighting, musical chords, or CTA banner. AI modifies the video canvas live!
                </p>
              </div>

              {/* Quick Preset Editing Shortcuts */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Quick AI Commands:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🎹 How to Save a Life Style', prompt: 'Apply the How to Save a Life style with centered clean typography and warm lighting.' },
                    { label: '⭐ Golden Worship Glow', prompt: 'Switch caption style to Golden Worship with a radiant amber glow and Cinzel font.' },
                    { label: '📱 Spotify & Apple CTA', prompt: 'Update CTA to: Stream on Spotify & Apple Music (Official Lyric Video) in gold.' },
                    { label: '☀️ Divine Sanctuary Atmosphere', prompt: 'Change lighting mood to divine sanctuary with volumetric God rays.' },
                    { label: '🎵 Show Chords', prompt: 'Turn on musical chords badges above the lyrics.' },
                    { label: '🔕 Hide Chords', prompt: 'Hide musical chords badges.' },
                    { label: '✨ 44px Glowing Font', prompt: 'Set caption font size to 44px with a bright gold glow.' },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendStudioChat(chip.prompt)}
                      disabled={isSendingChat}
                      className="text-[10px] px-2 py-1 rounded-lg bg-gray-950 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 hover:border-amber-500/40 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Log */}
              <div className="flex-1 bg-black/60 border border-gray-800 rounded-xl p-3 text-xs overflow-y-auto space-y-2.5 min-h-[160px]">
                {aiChatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-0.5">
                      {msg.sender === 'director' ? (
                        <>
                          <Bot className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-300 font-bold">AI Studio Director</span>
                        </>
                      ) : (
                        <span className="text-gray-400 font-bold">James Ussery (You)</span>
                      )}
                      <span>• {msg.time}</span>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl text-xs max-w-[90%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-amber-500 text-gray-950 font-semibold rounded-br-none shadow'
                          : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isSendingChat && (
                  <div className="flex items-center gap-2 text-xs text-amber-300 italic pt-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>AI Director is executing your edits on the canvas...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendStudioChat();
                }}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isSendingChat}
                  placeholder="Type edits (e.g. 'Make font larger' or 'Change CTA to Apple Music')..."
                  className="flex-1 bg-gray-950 border border-gray-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isSendingChat || !chatInput.trim()}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-gray-950 font-black text-xs rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Update</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB: PIPELINE LOG TERMINAL */}

          {activeTab === 'pipeline' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Veo 3.1 & Gemini Pipeline Log
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  Step {activeStep} of 9
                </span>
              </div>

              <div className="flex-1 bg-black/60 border border-gray-800 rounded-xl p-3 font-mono text-[11px] text-gray-300 overflow-y-auto space-y-2">
                {pipelineLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed flex items-start gap-1.5">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span className="text-gray-300">{log}</span>
                  </div>
                ))}
                {isPipelineProcessing && (
                  <div className="flex items-center gap-2 text-indigo-400 animate-pulse pt-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Orchestrating neural video generation step...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

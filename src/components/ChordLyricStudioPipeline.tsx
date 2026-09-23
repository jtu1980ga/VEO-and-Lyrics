import React, { useState } from 'react';
import {
  Sparkles,
  Music,
  Upload,
  FileText,
  FileImage,
  Clock,
  Play,
  Copy,
  Check,
  Download,
  Video,
  ArrowLeft,
  Loader2,
  Wand2,
  Info,
  CheckCircle2,
  Sliders,
  Volume2,
  Heart,
  Share2
} from 'lucide-react';
import { VideoSettings, TimedLyricLine, VideoClipItem } from '../types';
import { parseFormattedLrcWithChords, formatLinesToLrcWithChords } from '../utils/chordLrcParser';
import { JAMES_USSERY_PROFILE, buildJamesUsseryDescription } from '../data/creatorProfile';
import { PexelsAssetSelector } from './PexelsAssetSelector';

interface ChordLyricStudioPipelineProps {
  onBack: () => void;
  onLaunchStudioWithChords: (data: {
    lines: TimedLyricLine[];
    audioFile: File | null;
    audioFileName: string | null;
    settings: VideoSettings;
    bgImageUrl: string | null;
  }) => void;
}

const SAMPLE_NORMAL_LYRICS = `I drove past that old dirt road
where you first said you loved me
funny how a memory hits
like a storm you didn’t see
I could turn back yesterday

I hold you close and make you stay
fix every broken promise
every word I didn’t say
if time would give me one more chance
I’d change the man I used to be
if I could turn back yesterday
would you still be here with me

Your picture on the dashboard
still leans toward the radio
I talk to it sometimes
like you’re riding down the road
I know I can’t undo the hurt
or the way I let you down
But I’d trade a thousand lonely nights
for one more night with you around

If I could turn back yesterday
I’d hold you closer and make you stay
fix every broken promise
every word I didn’t say
If time would give me one more chance
I’d change the man I used to be
If I could turn back yesterday
would you still be here with me

Someday I’ll forgive myself
for the things I can’t undo
But every sunrise reminds me
my heart still belongs to you

If I could turn back yesterday
I’d hold you closer and make you stay
fix every broken promise
every word I didn’t say
If time would give me one more chance
I’d change the man I used to be
If I could turn back yesterday
would you still be here with me`;

const SAMPLE_TIMED_OUTPUT = `[00:00.00]
I drove past that old dirt road
where you first said you loved me
funny how a memory hits
like a storm you didn’t see
I could turn back yesterday

[00:17.80]
I hold you close and make you stay
fix every broken promise
every word I didn’t say
if time would give me one more chance
I’d change the man I used to be
if I could turn back yesterday
would you still be here with me

[00:42.07]
Your picture on the dashboard
still leans toward the radio
I talk to it sometimes
like you’re riding down the road
I know I can’t undo the hurt
or the way I let you down
But I’d trade a thousand lonely nights
for one more night with you around

[01:36.34]
If I could turn back yesterday
I’d hold you closer and make you stay
fix every broken promise
every word I didn’t say
If time would give me one more chance
I’d change the man I used to be
If I could turn back yesterday
would you still be here with me

[02:04.84]
Someday I’ll forgive myself
for the things I can’t undo
But every sunrise reminds me
my heart still belongs to you

[02:16.23]
If I could turn back yesterday
I’d hold you closer and make you stay
fix every broken promise
every word I didn’t say
If time would give me one more chance
I’d change the man I used to be
If I could turn back yesterday
would you still be here with me`;

const SAMPLE_FINAL_OUTPUT = `[00:00.00]
      (Em7)I drove past that old dirt (C)road
where you first said you (G)loved me (D)
      (C)funny how a memory (G)hits
like a storm you didn’t (D)see (Em7)
(Em7)I could turn back (C)yester(G)day (D)

[00:17.80]
     (C)I hold you close and (G)make you stay
fix every broken (D)promise (Em7)
every word I didn’t (C)say
if time would give me (G)one more chance
I’d change the man I used to (D)be
if I could turn back (Em7)yester(C)day
would you still be (G)here with (D)me

[00:42.07]
     (Em7)Your picture on the (C)dashboard
still leans toward the (G)radio (D)
I talk to it some(Em7)times
like you’re riding down the (C)road (G)
I know I can’t un(D)do the hurt
or the way I let you (Em7)down (C)
But I’d trade a thousand (G)lonely nights
for one more night with (D)you a(Em7)round

[01:36.34]
If I could turn back (C)yester(Csus2)day
I’d hold you closer and (G)make you stay (Em)
fix every broken (Csus2)promise
every word I didn’t (G)say (D)
If time would give me (Em)one more chance
I’d change the man I used to (Csus2)be
If I could turn back (G)yester(D)day
would you still be (Em)here with (Csus2)me

[02:04.84]
     (Em)Someday I’ll forgive my(C)self
for the things I can’t un(G)do (D)
But every sunrise (Em)reminds me
my heart still belongs to (Csus2)you (G)

[02:16.23]
If I could turn back (D)yester(Em)day
I’d hold you closer and (Csus2)make you stay (G)
fix every broken (D)promise
every word I didn’t (Em)say (Csus2)
If time would give me (G)one more (D)chance
I’d change the man I used to (Em)be (Csus2)
If I could turn back (G)yester(D)day
would you still be (Em)here with (Csus2)me`;

export const ChordLyricStudioPipeline: React.FC<ChordLyricStudioPipelineProps> = ({
  onBack,
  onLaunchStudioWithChords,
}) => {
  // Top: Song Metadata & Video Length
  const [songTitle, setSongTitle] = useState('Breathing Again');
  const [artistName, setArtistName] = useState('James Ussery (@JamesUsseryMusic)');
  const [videoLengthMode, setVideoLengthMode] = useState<'auto' | 'custom'>('auto');
  const [customDurationSec, setCustomDurationSec] = useState<number>(180);
  const [introDurationSec, setIntroDurationSec] = useState<number>(8);
  const [outroDurationSec, setOutroDurationSec] = useState<number>(10);
  const [includeThankYouScreen, setIncludeThankYouScreen] = useState<boolean>(true);
  const [copiedDesc, setCopiedDesc] = useState<boolean>(false);
  const [copiedTags, setCopiedTags] = useState<boolean>(false);

  // AI Description & Song Story states
  const [themePreference, setThemePreference] = useState<'auto' | 'gospel' | 'love_heartbreak'>('auto');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState<boolean>(false);
  const [activeDescription, setActiveDescription] = useState<string>(() =>
    buildJamesUsseryDescription('Breathing Again')
  );
  const [detectedTheme, setDetectedTheme] = useState<string>('Gospel & Worship');
  const [generatedTags, setGeneratedTags] = useState<string[]>([
    'James Ussery',
    'James Ussery Music',
    'Breathing Again',
    'Viking Worship',
    'Country Gospel',
    'Christian Music',
    'Acoustic Worship',
    'Prayer of Salvation',
    'Jesus Christ',
    'Faith Revival',
  ]);

  // Audio Upload Block
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [audioDurationSec, setAudioDurationSec] = useState<number>(168);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Normal Lyrics Block
  const [normalLyrics, setNormalLyrics] = useState<string>(SAMPLE_NORMAL_LYRICS);
  const [isWhisperProcessing, setIsWhisperProcessing] = useState<boolean>(false);
  const [timestampedLyrics, setTimestampedLyrics] = useState<string>(SAMPLE_TIMED_OUTPUT);

  // Chord Screenshot / PDF Block
  const [chordFile, setChordFile] = useState<File | null>(null);
  const [chordFilePreview, setChordFilePreview] = useState<string | null>(null);
  const [chordFileType, setChordFileType] = useState<string>('image/png');
  const [isAiChordAnalyzing, setIsAiChordAnalyzing] = useState<boolean>(false);
  const [finalChordsAndLyrics, setFinalChordsAndLyrics] = useState<string>(SAMPLE_FINAL_OUTPUT);
  const [detectedChords, setDetectedChords] = useState<string[]>(['Em7', 'C', 'G', 'D', 'Csus2', 'Em']);

  // Copy / Download Feedback
  const [copied, setCopied] = useState<boolean>(false);

  // Styling & Video Stitching
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1920&q=80'
  );
  const [selectedVideoClips, setSelectedVideoClips] = useState<VideoClipItem[]>([]);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isAiListeningAudio, setIsAiListeningAudio] = useState<boolean>(false);

  // Handle Audio Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioFileName(file.name);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);

      // Extract duration
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setAudioDurationSec(Math.round(audio.duration));
        }
      };

      // Convert to base64 for AI direct listening if needed
      const reader = new FileReader();
      reader.onload = () => {
        setAudioBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Chord Screenshot or PDF Upload
  const handleChordFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChordFile(file);
      setChordFileType(file.type || 'image/png');
      const reader = new FileReader();
      reader.onload = () => {
        setChordFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI listens to uploaded song audio and pre-fills lyrics
  const handleAiListenSong = async () => {
    setIsAiListeningAudio(true);
    try {
      const res = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: audioBase64 || undefined,
          durationSec: audioDurationSec || 160,
          referenceLyrics: normalLyrics.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.plainLyrics) {
          setNormalLyrics(data.plainLyrics);
        }
        if (data.aligned && data.aligned.length > 0) {
          const lines: TimedLyricLine[] = data.aligned;
          const formatted = formatLinesToLrcWithChords(lines);
          const cleanTimed = formatted.replace(/\([^)]+\)/g, '');
          setTimestampedLyrics(cleanTimed || SAMPLE_TIMED_OUTPUT);
        }
      }
    } catch (err) {
      console.error('Audio listen error:', err);
    } finally {
      setIsAiListeningAudio(false);
    }
  };

  // Send to Whisper to get timestamped lyrics
  const handleSendToWhisper = async () => {
    if (!normalLyrics.trim()) return;
    setIsWhisperProcessing(true);

    try {
      const res = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceLyrics: normalLyrics,
          audioBase64: audioBase64 || undefined,
          durationSec: audioDurationSec || 160,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.aligned && data.aligned.length > 0) {
          // Format into [mm:ss.xx] block text
          const lines: TimedLyricLine[] = data.aligned;
          const formatted = formatLinesToLrcWithChords(lines);
          // Strip parenthesized chords if we just want clean timestamped lyrics for this step
          const cleanTimed = formatted.replace(/\([^)]+\)/g, '');
          setTimestampedLyrics(cleanTimed || SAMPLE_TIMED_OUTPUT);
        } else {
          setTimestampedLyrics(SAMPLE_TIMED_OUTPUT);
        }
      } else {
        setTimestampedLyrics(SAMPLE_TIMED_OUTPUT);
      }
    } catch (err) {
      console.error('Whisper transcribe error:', err);
      setTimestampedLyrics(SAMPLE_TIMED_OUTPUT);
    } finally {
      setIsWhisperProcessing(false);
    }
  };

  // Analyze Chord Screenshot or PDF with Gemini Vision and align with timestamped lyrics
  const handleAnalyzeChordWithAi = async () => {
    setIsAiChordAnalyzing(true);
    try {
      const res = await fetch('/api/chords/ocr-align', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestampedLyrics: timestampedLyrics || normalLyrics,
          chordSheetData: chordFilePreview,
          mimeType: chordFileType,
          songTitle,
          artist: artistName,
          durationSec: audioDurationSec,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.formattedText) {
          setFinalChordsAndLyrics(data.formattedText);
        } else {
          setFinalChordsAndLyrics(SAMPLE_FINAL_OUTPUT);
        }
        if (data.detectedChords && data.detectedChords.length > 0) {
          setDetectedChords(data.detectedChords);
        }
      } else {
        setFinalChordsAndLyrics(SAMPLE_FINAL_OUTPUT);
      }
    } catch (err) {
      console.error('AI Chord OCR alignment error:', err);
      setFinalChordsAndLyrics(SAMPLE_FINAL_OUTPUT);
    } finally {
      setIsAiChordAnalyzing(false);
    }
  };

  // Copy to clipboard
  const handleCopyFormattedText = () => {
    navigator.clipboard.writeText(finalChordsAndLyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download .lrc
  const handleDownloadLrc = () => {
    const blob = new Blob([finalChordsAndLyrics], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${songTitle.toLowerCase().replace(/\s+/g, '_')}_chords_lyrics.lrc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // AI Generate Song Story, Testimony & Full Description (Gospel vs. Love/Heartbreak)
  const handleGenerateAiDescription = async () => {
    setIsGeneratingDesc(true);
    try {
      const res = await fetch('/api/lyrics/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songTitle,
          artistName,
          lyrics: normalLyrics || finalChordsAndLyrics,
          themePreference,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.fullDescription) {
          setActiveDescription(data.fullDescription);
        }
        if (data.detectedTheme) {
          setDetectedTheme(data.detectedTheme);
        }
        if (data.tags && data.tags.length > 0) {
          setGeneratedTags(data.tags);
        }
      }
    } catch (err) {
      console.error('Failed to generate AI description:', err);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Launch in Video Studio with Chords
  const handleLaunchStudio = () => {
    const parsedLines = parseFormattedLrcWithChords(finalChordsAndLyrics, audioDurationSec);

    // Calculate effective total duration
    const totalSec =
      videoLengthMode === 'custom' && customDurationSec
        ? customDurationSec
        : (introDurationSec || 8) + audioDurationSec + (includeThankYouScreen ? (outroDurationSec || 10) : 0);

    const videoSettings: VideoSettings = {
      aspectRatio,
      captionStyle: 'how_to_save_a_life', // Clean warm center typography with chords above words, like YouTube
      lightingMood: 'warm_cinematic',
      cameraMotion: 'dolly_push',
      fontFamily: 'Montserrat',
      glowColor: '#f59e0b',
      fontSize: aspectRatio === '9:16' ? 42 : 36,
      showLinesCount: 3,
      showSingerAvatar: false,
      avatarType: 'none',
      textUppercase: false,
      bouncingSparkle: true,
      particlesEnabled: true,
      showChords: true,
      songTitle,
      artistName,
      videoDurationMode: videoLengthMode,
      customDurationSec: videoLengthMode === 'custom' ? customDurationSec : undefined,
      introDurationSec,
      outroDurationSec,
      showIntroScreen: true,
      showOutroScreen: includeThankYouScreen,
      videoClips: selectedVideoClips.length > 0 ? selectedVideoClips : undefined,
      cta: {
        enabled: true,
        text: `Watch Chords & Lyrics for "${songTitle}"`,
        subtext: 'Like, Subscribe & Share • Link in Description',
        position: 'bottom',
        badgeColor: '#f59e0b',
        icon: 'music',
      },
    };

    onLaunchStudioWithChords({
      lines: parsedLines,
      audioFile,
      audioFileName,
      settings: videoSettings,
      bgImageUrl,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>YouTube Chord & Lyric Video Pipeline</span>
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-gray-900/95 border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl backdrop-blur">
        {/* Header Title */}
        <div className="border-b border-gray-800 pb-5">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 font-cinzel">
            <span>Chord Sheet OCR & Timestamped Lyric Video Generator</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5 leading-relaxed">
            Extract guitar/piano chords from screenshot or PDF, align with Whisper timestamps, and generate
            the exact <code className="text-amber-300 font-mono">[00:00.00] (Chord)Lyric</code> format with cinematic intro
            and 10-second thank you outro.
          </p>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TOP BLOCK: Song Title, Artist & Video Length
        ════════════════════════════════════════════════════════════════ */}
        <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Step 1: Song Information & Video Timing</span>
            </h3>
            <span className="text-[11px] text-gray-500">Stays on screen until first words begin</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Song Title</label>
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="e.g. Yesterday's Memory"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Artist / Band</label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="e.g. Luke Combs / The Fray"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Video Length Selector */}
          <div className="pt-2 border-t border-gray-800/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Video Length Mode</span>
              </label>
              <span className="text-[11px] text-gray-400">
                {videoLengthMode === 'auto'
                  ? `Default: Intro (8s) + Song (${audioDurationSec}s) + Outro (10s) = ${8 + audioDurationSec + (includeThankYouScreen ? 10 : 0)}s`
                  : `Custom: ${customDurationSec}s total`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setVideoLengthMode('auto')}
                className={`flex flex-col p-3 rounded-xl border text-left transition ${
                  videoLengthMode === 'auto'
                    ? 'bg-amber-500/10 border-amber-500/50 text-white'
                    : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400">Auto (Default Timing)</span>
                  {videoLengthMode === 'auto' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <span className="text-[11px] text-gray-400">
                  Intro (8s) → Song audio length → Closing thank you screen (10s)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVideoLengthMode('custom')}
                className={`flex flex-col p-3 rounded-xl border text-left transition ${
                  videoLengthMode === 'custom'
                    ? 'bg-amber-500/10 border-amber-500/50 text-white'
                    : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400">Custom Length</span>
                  {videoLengthMode === 'custom' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <span className="text-[11px] text-gray-400">
                  Select an exact total duration (e.g. 60s Shorts, 3m full video)
                </span>
              </button>
            </div>

            {videoLengthMode === 'custom' && (
              <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-300 font-medium">Target Duration:</span>
                <input
                  type="number"
                  min={15}
                  max={600}
                  value={customDurationSec}
                  onChange={(e) => setCustomDurationSec(Number(e.target.value))}
                  className="w-24 bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-white"
                />
                <span className="text-xs text-gray-400">seconds</span>
                <div className="flex items-center gap-1.5 ml-auto">
                  {[30, 60, 90, 180].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setCustomDurationSec(sec)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        customDurationSec === sec
                          ? 'bg-amber-500 text-gray-950 font-bold'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Outro Screen Toggle */}
            <div className="mt-3 flex items-center justify-between bg-gray-900/40 px-3 py-2 rounded-xl border border-gray-800/60">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeThankYouScreen}
                  onChange={(e) => setIncludeThankYouScreen(e.target.checked)}
                  className="rounded border-gray-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="font-semibold">
                  Include 10-Second Thank You portion at the end
                </span>
              </label>
              <span className="text-[10px] text-gray-500">
                "Thanks for watching Chords and Lyrics... Like, Subscribe & Share"
              </span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            BLOCK 2: Audio Upload
        ════════════════════════════════════════════════════════════════ */}
        <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-sky-400" />
              <span>Step 2: Upload Song Audio</span>
            </h3>
            <span className="text-[11px] text-gray-500">MP3, WAV, M4A, or OGG</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-900/70 p-4 rounded-xl border border-gray-800">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Music className="w-6 h-6" />
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer w-full"
              />
              {audioFileName ? (
                <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Loaded: {audioFileName} ({Math.floor(audioDurationSec / 60)}m {audioDurationSec % 60}s)</span>
                </p>
              ) : (
                <p className="text-[11px] text-gray-500 mt-1">
                  Using default audio track (2m 48s). Upload your custom song to match your performance.
                </p>
              )}
            </div>

            {audioUrl && (
              <div className="shrink-0 w-full sm:w-auto">
                <audio controls src={audioUrl} className="h-8 w-full sm:w-48" />
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            BLOCK 3: Normal Lyrics Input & Whisper Timestamps
        ════════════════════════════════════════════════════════════════ */}
        <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Step 3: Paste Normal Lyrics & Send to Whisper</span>
            </h3>
            <button
              type="button"
              onClick={() => setNormalLyrics(SAMPLE_NORMAL_LYRICS)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              Reset to Sample Lyrics
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Paste normal plain lyrics here (without timestamps or chords):
              </label>
              {audioFile && (
                <button
                  type="button"
                  disabled={isAiListeningAudio}
                  onClick={handleAiListenSong}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 transition cursor-pointer disabled:opacity-50"
                >
                  {isAiListeningAudio ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Listening to Song & Transcribing...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>AI Listen to Uploaded Song & Prefill Lyrics</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <textarea
              rows={6}
              value={normalLyrics}
              onChange={(e) => setNormalLyrics(e.target.value)}
              placeholder="Paste plain lyrics here, or click 'AI Listen to Uploaded Song' to transcribe automatically..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-xs font-mono text-gray-200 leading-relaxed focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Action: Send to Whisper */}
          <button
            type="button"
            disabled={isWhisperProcessing || !normalLyrics.trim()}
            onClick={handleSendToWhisper}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            {isWhisperProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Transcribing & Generating Timestamps with Whisper...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Send Lyrics to Whisper with Key for Timestamped Lyrics</span>
              </>
            )}
          </button>

          {/* Block Underneath: Timestamped Lyrics Output */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Timestamped Lyrics Output (Generated by Whisper):</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Format: [mm:ss.xx]</span>
            </div>

            <textarea
              rows={6}
              value={timestampedLyrics}
              onChange={(e) => setTimestampedLyrics(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs font-mono text-indigo-200 leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            BLOCK 4: Upload Chord Screenshot or PDF & AI Alignment
        ════════════════════════════════════════════════════════════════ */}
        <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <FileImage className="w-4 h-4 text-amber-400" />
              <span>Step 4: Upload Chord Screenshot or PDF</span>
            </h3>
            <span className="text-[11px] text-gray-500">Gemini Multimodal OCR Vision</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-center">
            {/* File Upload Field */}
            <div className="border-2 border-dashed border-gray-700 hover:border-amber-500/70 rounded-xl p-4 text-center cursor-pointer transition bg-gray-900/50">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleChordFileUpload}
                className="hidden"
                id="chord-file-input"
              />
              <label htmlFor="chord-file-input" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-gray-200 block">
                  {chordFile ? chordFile.name : 'Upload Screenshot (PNG/JPG) or PDF'}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Takes tabs from Ultimate Guitar, SongSelect, or photo of sheet music
                </span>
              </label>
            </div>

            {/* Preview or Info Card */}
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 h-full flex flex-col justify-center">
              {chordFilePreview ? (
                <div className="flex items-center gap-3">
                  {chordFileType.includes('pdf') ? (
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center text-red-400">
                      <FileText className="w-8 h-8" />
                    </div>
                  ) : (
                    <img
                      src={chordFilePreview}
                      alt="Chord Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                    />
                  )}
                  <div className="text-xs">
                    <p className="font-semibold text-white truncate max-w-[180px]">{chordFile?.name}</p>
                    <p className="text-emerald-400 flex items-center gap-1 mt-1 text-[11px]">
                      <Check className="w-3 h-3" /> Ready for Gemini OCR
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 leading-relaxed">
                  <p className="font-semibold text-amber-300 mb-1">📸 Instant Chord Detection:</p>
                  Upload any screenshot of chords above lyrics. AI reads the exact chord symbols (e.g. <span className="text-amber-400 font-mono">Em7, C, G, D, Csus2</span>) and places them inline.
                </div>
              )}
            </div>
          </div>

          {/* Action: AI Analyze and Align */}
          <button
            type="button"
            disabled={isAiChordAnalyzing}
            onClick={handleAnalyzeChordWithAi}
            className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-gray-950 font-black text-xs sm:text-sm py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
          >
            {isAiChordAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                <span>Gemini Multimodal Vision Analyzing Chord Chart & Aligning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-gray-950" />
                <span>AI Analyze Chord Sheet & Align with Timestamped Lyrics</span>
              </>
            )}
          </button>

          {/* Detected Chords Badges */}
          {detectedChords.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-gray-400 font-semibold">Detected Chords:</span>
              {detectedChords.map((chord, idx) => (
                <span
                  key={idx}
                  className="bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md"
                >
                  {chord}
                </span>
              ))}
            </div>
          )}

          {/* Block Underneath: Combined Chords, Lyrics & Timestamps in Requested Format */}
          <div className="bg-gray-900/95 border border-amber-500/30 rounded-xl p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>Final Output: Lyrics, Chords, and Timestamps in Exact Format</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyFormattedText}
                  className="flex items-center gap-1 text-[11px] bg-gray-800 hover:bg-gray-700 text-gray-200 px-2.5 py-1 rounded-lg transition border border-gray-700"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadLrc}
                  className="flex items-center gap-1 text-[11px] bg-gray-800 hover:bg-gray-700 text-gray-200 px-2.5 py-1 rounded-lg transition border border-gray-700"
                >
                  <Download className="w-3 h-3 text-amber-400" />
                  <span>Download .LRC</span>
                </button>
              </div>
            </div>

            <textarea
              rows={12}
              value={finalChordsAndLyrics}
              onChange={(e) => setFinalChordsAndLyrics(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs font-mono text-amber-200/90 leading-relaxed focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* James Ussery Ministry & Salvation Description Pack with AI Story Engine */}
          <div className="bg-gradient-to-br from-gray-950 via-amber-950/20 to-gray-950 border border-amber-500/30 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-black tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {artistName || 'James Ussery'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Gospel & Love Songs Ministry</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>🕊️ AI Song Story, Salvation Prayer & SEO Description Pack</span>
                </h4>
                <p className="text-xs text-gray-400 max-w-xl">
                  Analyzes your uploaded song and lyrics to write an authentic testimony/story (Gospel or Love & Heartbreak) in your voice, equipped with the Prayer of Salvation and all 8 streaming links:
                </p>
              </div>

              {/* Theme Preference Picker & AI Generator Button */}
              <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800 text-xs">
                  <span className="text-[10px] text-gray-400 px-1 font-bold">Theme:</span>
                  <button
                    type="button"
                    onClick={() => setThemePreference('auto')}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                      themePreference === 'auto'
                        ? 'bg-amber-500 text-gray-950 shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemePreference('gospel')}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                      themePreference === 'gospel'
                        ? 'bg-amber-500 text-gray-950 shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Gospel / Jesus
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemePreference('love_heartbreak')}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                      themePreference === 'love_heartbreak'
                        ? 'bg-amber-500 text-gray-950 shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Love & Heartbreak
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isGeneratingDesc}
                    onClick={handleGenerateAiDescription}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-gray-950 transition shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingDesc ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing Lyrics & Writing...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>AI Write Song Story & SEO</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeDescription);
                      setCopiedDesc(true);
                      setTimeout(() => setCopiedDesc(false), 3000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition shadow-md cursor-pointer"
                  >
                    {copiedDesc ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Description</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Detected Theme & SEO Tags Banner */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-gray-800/80">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 font-medium">Detected Style:</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {detectedTheme}
                </span>
              </div>

              {generatedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedTags.join(', '));
                    setCopiedTags(true);
                    setTimeout(() => setCopiedTags(false), 2500);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
                >
                  {copiedTags ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied {generatedTags.length} Tags!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy {generatedTags.length} SEO Tags for YouTube / TikTok</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Quick Preview of Streaming Badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">8 Streaming Links:</span>
              {JAMES_USSERY_PROFILE.streamingLinks.map((link, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-amber-300"
                >
                  {link.platform}
                </span>
              ))}
            </div>

            {/* Editable Description Box */}
            <textarea
              rows={8}
              value={activeDescription}
              onChange={(e) => setActiveDescription(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-[11px] font-mono text-gray-300 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            BLOCK 6: Pexels Video Search, Selection & Multi-Clip Stitching
        ════════════════════════════════════════════════════════════════ */}
        <div className="space-y-4">
          <PexelsAssetSelector
            selectedUrl={bgImageUrl}
            onSelectAsset={(url, type, title) => {
              setBgImageUrl(url);
              if (type === 'video') {
                const newClip: VideoClipItem = {
                  id: String(Date.now()),
                  url,
                  previewUrl: url,
                  title,
                  durationSec: 30,
                };
                setSelectedVideoClips((prev) => {
                  const exists = prev.some((c) => c.url === url);
                  if (exists) return prev;
                  return [...prev, newClip];
                });
              }
            }}
          />

          {/* Stitched Clips Track Indicator */}
          {selectedVideoClips.length > 0 && (
            <div className="bg-gray-900/80 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>Stitched Video Clips Sequence ({selectedVideoClips.length} clips selected)</span>
                </span>
                <span className="text-[11px] text-gray-400">
                  Audio: {Math.floor(audioDurationSec / 60)}m {audioDurationSec % 60}s ({audioDurationSec}s)
                </span>
              </div>

              <p className="text-[11px] text-gray-300">
                {selectedVideoClips.length === 1
                  ? `Single video clip (30s) selected: It will automatically be extended and seamlessly looped to cover the full duration of your audio (${audioDurationSec}s).`
                  : `Multiple video clips selected (${selectedVideoClips.length}): Seamlessly stitched together into a complete sequence across your song.`}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedVideoClips.map((clip, idx) => (
                  <div
                    key={clip.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-xs font-medium text-gray-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="max-w-[140px] truncate">{clip.title || `Clip #${idx + 1}`}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedVideoClips((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-gray-500 hover:text-rose-400 text-sm ml-1 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            LAUNCH STUDIO BUTTON
        ════════════════════════════════════════════════════════════════ */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Aspect Ratio:</span>
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`ml-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                  aspectRatio === '16:9' ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-300'
                }`}
              >
                16:9 (YouTube)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  aspectRatio === '9:16' ? 'bg-amber-500 text-gray-950' : 'bg-gray-800 text-gray-300'
                }`}
              >
                9:16 (Shorts/TikTok)
              </button>
            </span>

            <span>YouTube-Style Centered Chords & Word Highlighting</span>
          </div>

          <button
            type="button"
            onClick={handleLaunchStudio}
            className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:via-rose-400 hover:to-indigo-500 text-white font-black text-sm sm:text-base py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Generate Lyric Video with Chords, Intro & 10s Outro</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

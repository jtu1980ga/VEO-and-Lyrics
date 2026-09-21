import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Link as LinkIcon,
  Video,
  Music,
  Share2,
  Copy,
  Check,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sliders,
  TrendingUp,
  Tag,
  Hash,
  FileText,
  Clock,
  Youtube,
  ExternalLink,
  Upload,
  RefreshCw,
  Eye,
  Flame,
  CheckCircle2,
  ArrowRight,
  Layers,
  FastForward,
  RotateCcw,
  Film,
  Plus,
  Search,
  Bot,
  Send,
  MessageSquare,
  Wand2,
  CheckCircle,
} from 'lucide-react';
import { RepurposedVideoData, ViralHookItem } from '../types';
import { AudioEngine } from '../utils/audioEngine';
import { SeoOptimizerModule } from './SeoOptimizerModule';
import {
  JAMES_USSERY_PROFILE,
  buildJamesUsseryDescription,
  buildRepackagedMinistryDescription,
  loadSavedCreatorProfile,
  loadApiKeysConfig,
} from '../data/creatorProfile';

interface RepurposeHubViewProps {
  onBack?: () => void;
  onSendToLyricStudio?: (title: string, lyrics?: string) => void;
}

const SAMPLE_DEMO_LINKS = [
  {
    label: 'Arnold Speech (Leaves Audience Speechless)',
    url: 'https://www.youtube.com/watch?v=1bumPyvzCyo',
    notes: 'Arnold Schwarzenegger motivational speech leaves audience speechless, repurpose with James Ussery Gospel & Love background music, Prayer of Salvation, and high retention inspirational hooks.',
  },
  {
    label: 'Acoustic Worship Short (YouTube)',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    notes: 'Emotional worship ballad short with acoustic guitar',
  },
  {
    label: 'How to Save a Life (The Fray Style)',
    url: 'https://www.youtube.com/watch?v=cjVQ36NhbMk',
    notes: 'Piano ballad pop anthem for emotional reflection',
  },
  {
    label: 'Viral Cinematic Aesthetic (TikTok)',
    url: 'https://www.tiktok.com/@worshipmusic/video/7258912345678901234',
    notes: 'High retention aesthetic reel for trending sound',
  },
];

// Sample Royalty-Free 1080p clips to load instantly for testing
const SAMPLE_VIDEOS = [
  {
    name: 'Sanctuary Sunlight Rays (Cinematic)',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1280&q=80',
    type: 'image_canvas',
    label: 'Golden Hour Rays',
  },
  {
    name: 'Atmospheric Stage Beams',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1280&q=80',
    type: 'image_canvas',
    label: 'Concert Fog & Beams',
  },
  {
    name: 'Mountain Sunrise Glow',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1280&q=80',
    type: 'image_canvas',
    label: 'Morning Horizon',
  }
];

export const RepurposeHubView: React.FC<RepurposeHubViewProps> = ({ onBack, onSendToLyricStudio }) => {
  // Input URL state
  const [videoUrl, setVideoUrl] = useState<string>('https://www.youtube.com/watch?v=cjVQ36NhbMk');
  const [customGoal, setCustomGoal] = useState<string>('Repurpose into viral TikTok & YouTube Shorts with acoustic background song and streaming links');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Extracted Data state
  const [data, setData] = useState<RepurposedVideoData | null>(null);

  // Active Tab for Data Panel
  const [activeTab, setActiveTab] = useState<'chat' | 'seo' | 'hooks' | 'tags' | 'description' | 'adapt'>('chat');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 1-Click Auto-Pilot Transformation state
  const [isAutoPilotRunning, setIsAutoPilotRunning] = useState<boolean>(false);
  const [autoPilotStep, setAutoPilotStep] = useState<string>('');
  const [reviewModeActive, setReviewModeActive] = useState<boolean>(false);

  // Conversational AI Director Assistant Chat state
  const [aiChatMessages, setAiChatMessages] = useState<
    Array<{ sender: 'user' | 'director'; text: string; time: string }>
  >([
    {
      sender: 'director',
      text: "👋 Hey James! I'm your AI Video Director. You can tell me to make changes to this video anytime in plain English (e.g., 'Mute the original voice', 'Make the cover bar solid black', 'Change the hook to something about faith', or 'Update the streaming CTA to Apple Music'). What would you like to tweak?",
      time: 'Ready',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // Video Canvas & Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(8); // Default 8s for viral short loops!
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');

  // Music Video Maker Features: Speed, Reverse & Multi-Clip Stitching
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.5); // 0.5x dreamy slow-mo default for music videos
  const [isReversed, setIsReversed] = useState<boolean>(false);
  const [stitchedClips, setStitchedClips] = useState<Array<{ id: string; name: string; url: string; durationSec: number }>>([]);
  const [isPexelsDrawerOpen, setIsPexelsDrawerOpen] = useState<boolean>(false);
  const [pexelsQuery, setPexelsQuery] = useState<string>('piano acoustic moody');
  const [pexelsResults, setPexelsResults] = useState<Array<any>>([]);
  const [isLoadingPexels, setIsLoadingPexels] = useState<boolean>(false);

  // Video File / Source
  const [videoSourceUrl, setVideoSourceUrl] = useState<string | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Ask AI: Viral Video Discovery State
  const [activeInputMode, setActiveInputMode] = useState<'ask_ai_viral' | 'custom_url'>('ask_ai_viral');
  const [viralCategory, setViralCategory] = useState<string>('all');
  const [viralSearchQuery, setViralSearchQuery] = useState<string>('');
  const [viralVideosList, setViralVideosList] = useState<Array<any>>([]);
  const [isLoadingViralVideos, setIsLoadingViralVideos] = useState<boolean>(false);

  const fetchViralTrendingVideos = async (cat?: string, q?: string) => {
    setIsLoadingViralVideos(true);
    try {
      const res = await fetch('/api/repurpose/viral-trending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: cat !== undefined ? cat : viralCategory,
          query: q !== undefined ? q : viralSearchQuery,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setViralVideosList(json.videos || []);
      }
    } catch (err) {
      console.error('Failed to fetch viral videos:', err);
    } finally {
      setIsLoadingViralVideos(false);
    }
  };

  useEffect(() => {
    fetchViralTrendingVideos('all', '');
  }, []);

  const handleSelectAndAutoPilot = (videoItem: any) => {
    setVideoUrl(videoItem.url);
    const goal = `Repackage into viral TikTok & YouTube Shorts with acoustic soundtrack "${videoItem.suggestedSong || 'Breathing Again'}"`;
    setCustomGoal(goal);
    handleRunAutoPilot(videoItem.url, goal);
  };

  // Audio Engine & Mixers
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const [bgMusicGenre, setBgMusicGenre] = useState<'how_to_save_a_life' | 'worship' | 'synthwave'>('how_to_save_a_life');
  const [bgMusicVolume, setBgMusicVolume] = useState<number>(0.75);
  const [originalVideoVolume, setOriginalVideoVolume] = useState<number>(0.2);
  const [isBgMusicMuted, setIsBgMusicMuted] = useState<boolean>(false);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);

  // Call To Action & Overlays
  const [ctaEnabled, setCtaEnabled] = useState<boolean>(true);
  const [ctaHeadline, setCtaHeadline] = useState<string>('Stream on Spotify & Apple Music');
  const [ctaSubtext, setCtaSubtext] = useState<string>('Official Acoustic Version • Link in Bio');
  const [ctaPosition, setCtaPosition] = useState<'bottom' | 'top' | 'center'>('bottom');
  const [ctaColor, setCtaColor] = useState<string>('#f59e0b');

  // On-screen Viral Hook Overlay
  const [selectedHook, setSelectedHook] = useState<string>('Where did I go wrong?');
  const [showHookOverlay, setShowHookOverlay] = useState<boolean>(true);

  // Subtitle & Watermark Cover-Up Bar (covers previous creator's burned-in words or watermark)
  const [coverBarEnabled, setCoverBarEnabled] = useState<boolean>(false);
  const [coverBarPosition, setCoverBarPosition] = useState<'lower_third' | 'bottom' | 'top'>('lower_third');
  const [coverBarHeight, setCoverBarHeight] = useState<number>(64);
  const [coverBarText, setCoverBarText] = useState<string>('✝️ James Ussery (@JamesUsseryMusic) • Faith & Worship');
  const [coverBarStyle, setCoverBarStyle] = useState<'solid_black' | 'dark_blur' | 'gold_accent'>('gold_accent');

  // Video Recording & Exporting
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // AI Adapt state
  const [adaptPlatform, setAdaptPlatform] = useState<'tiktok' | 'youtube_shorts' | 'reels' | 'spotify'>('tiktok');
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [adaptedContent, setAdaptedContent] = useState<{ title?: string; description?: string; tips?: string } | null>(null);

  // Initialize audio engine
  useEffect(() => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = new AudioEngine();
    }
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Set default initial data
  useEffect(() => {
    handleExtract(false);
  }, []);

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Extract metadata & AI intelligence
  const handleExtract = async (userInitiated: boolean = true) => {
    if (!videoUrl) return;
    setIsLoading(true);
    setError(null);
    setLoadingStep('Connecting to video source & oEmbed metadata...');

    try {
      if (userInitiated) {
        setTimeout(() => setLoadingStep('Analyzing video hook potential & audience psychology with Gemini AI...'), 800);
        setTimeout(() => setLoadingStep('Generating high-ranking SEO tags and trending hashtags...'), 1600);
        setTimeout(() => setLoadingStep('Composing social descriptions, streaming links & CTA blueprint...'), 2400);
      }

      const res = await fetch('/api/repurpose/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoUrl,
          customNotes: customGoal,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const extracted: RepurposedVideoData = await res.json();
      setData(extracted);

      // Auto populate CTA and Hook
      if (extracted.suggestedCta) {
        setCtaHeadline(extracted.suggestedCta.headline || 'Stream on Spotify & Apple Music');
        setCtaSubtext(extracted.suggestedCta.subtext || 'Link in bio • Save this sound');
        if (extracted.suggestedCta.badgeColor) {
          setCtaColor(extracted.suggestedCta.badgeColor);
        }
      }

      if (extracted.viralHooks && extracted.viralHooks.length > 0) {
        setSelectedHook(extracted.viralHooks[0].hook);
      }
    } catch (err: any) {
      console.error('Extract error:', err);
      setError(err.message || 'Failed to extract video intelligence');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // AI Platform Adaptation
  const handleAdapt = async (platform: 'tiktok' | 'youtube_shorts' | 'reels' | 'spotify') => {
    if (!data) return;
    setAdaptPlatform(platform);
    setIsRewriting(true);
    try {
      const res = await fetch('/api/repurpose/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          summary: data.summary,
          targetPlatform: platform,
          customTone: platform === 'tiktok' ? 'fast_paced_curiosity' : 'high_retention_aesthetic',
        }),
      });
      const result = await res.json();
      setAdaptedContent({
        title: result.rewrittenTitle,
        description: result.rewrittenDescription,
        tips: result.platformTips,
      });
    } catch (err) {
      console.error('Adapt rewrite failed:', err);
    } finally {
      setIsRewriting(false);
    }
  };

  // Upload custom video file
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoSourceUrl(url);
    setUploadedVideoName(file.name);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Upload custom audio file for background music
  const handleCustomAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !audioEngineRef.current) return;
    try {
      await audioEngineRef.current.loadCustomAudio(file);
      setCustomAudioName(file.name);
    } catch (err) {
      console.error('Audio load error:', err);
    }
  };

  // Search free Pexels stock video clips
  const searchPexelsVideos = async (q?: string) => {
    setIsLoadingPexels(true);
    try {
      const keys = loadApiKeysConfig();
      const headers: Record<string, string> = {};
      if (keys.pexelsApiKey) {
        headers['x-pexels-api-key'] = keys.pexelsApiKey;
      }
      const queryToSearch = q || pexelsQuery;
      const res = await fetch(`/api/pexels/search?type=videos&query=${encodeURIComponent(queryToSearch)}`, {
        headers,
      });
      if (res.ok) {
        const d = await res.json();
        setPexelsResults(d.items || []);
      }
    } catch (err) {
      console.error('Pexels video search error:', err);
    } finally {
      setIsLoadingPexels(false);
    }
  };

  // Add clip to timeline stitcher
  const addClipToStitcher = (clip: { id: string; title: string; url: string }) => {
    setStitchedClips((prev) => [
      ...prev,
      {
        id: clip.id,
        name: clip.title || 'Stock Clip',
        url: clip.url,
        durationSec: Math.round(duration / Math.max(1, prev.length + 1)),
      },
    ]);
    if (!videoSourceUrl) {
      setVideoSourceUrl(clip.url);
      setUploadedVideoName(clip.title || 'Pexels Clip');
    }
  };

  const removeStitchedClip = (index: number) => {
    setStitchedClips((prev) => prev.filter((_, i) => i !== index));
  };

  // Preset: 8-second Spotify Canvas / TikTok Viral Loop
  const apply8sLoopPreset = () => {
    setDuration(8);
    setAspectRatio('9:16');
    setPlaybackSpeed(0.5); // Slow-mo dreamy aesthetic
    setCurrentTime(0);
  };

  // Play / Pause loop
  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (nextState) {
      if (videoElementRef.current && videoSourceUrl) {
        videoElementRef.current.play().catch(() => {});
      }
      if (audioEngineRef.current && !isBgMusicMuted) {
        audioEngineRef.current.setVolume(bgMusicVolume);
        audioEngineRef.current.play(currentTime, 68, bgMusicGenre);
      }
    } else {
      if (videoElementRef.current) {
        videoElementRef.current.pause();
      }
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
      }
    }
  };

  // Seek time
  const handleSeek = (newSec: number) => {
    setCurrentTime(newSec);
    if (videoElementRef.current && videoSourceUrl) {
      videoElementRef.current.currentTime = newSec;
    }
    if (isPlaying && audioEngineRef.current && !isBgMusicMuted) {
      audioEngineRef.current.play(newSec, 68, bgMusicGenre);
    }
  };

  // 1-Click Auto-Pilot Transformation Pipeline
  const handleRunAutoPilot = async (overrideUrl?: string, overrideGoal?: string) => {
    const targetUrl = overrideUrl || videoUrl;
    if (!targetUrl) return;
    if (overrideUrl) setVideoUrl(overrideUrl);
    if (overrideGoal) setCustomGoal(overrideGoal);

    setIsAutoPilotRunning(true);
    setAutoPilotStep('1/5: Extracting video intelligence & emotional triggers...');
    try {
      let currentData = data;
      if (!currentData || currentData.sourceUrl !== targetUrl) {
        const res = await fetch('/api/repurpose/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl,
            customNotes: overrideGoal || customGoal,
          }),
        });
        if (res.ok) {
          currentData = await res.json();
          setData(currentData);
        }
      }

      await new Promise((r) => setTimeout(r, 600));
      setAutoPilotStep('2/5: Muting original voice & routing James Ussery soundtrack...');
      setOriginalVideoVolume(0); // Mute other creator completely
      setBgMusicVolume(1.0); // 100% James Ussery soundtrack
      setIsBgMusicMuted(false);

      await new Promise((r) => setTimeout(r, 600));
      setAutoPilotStep("3/5: Placing Subtitle & Watermark Cover-Up banner over creator's words...");
      setCoverBarEnabled(true);
      setCoverBarStyle('gold_accent');
      setCoverBarPosition('lower_third');
      setCoverBarHeight(64);
      setCoverBarText('✝️ James Ussery (@JamesUsseryMusic) • Faith & Worship');

      await new Promise((r) => setTimeout(r, 600));
      setAutoPilotStep('4/5: Setting 8-platform streaming CTA & viral faith hook...');
      setCtaEnabled(true);
      setCtaHeadline('Stream James Ussery Music Everywhere');
      setCtaSubtext('Available on 8 Platforms • Link in Bio');
      setCtaColor('#f59e0b');
      setShowHookOverlay(true);
      if (currentData?.viralHooks && currentData.viralHooks.length > 0) {
        setSelectedHook(currentData.viralHooks[0].hook);
      } else {
        setSelectedHook('When God restores your breath after the battle...');
      }

      await new Promise((r) => setTimeout(r, 600));
      setAutoPilotStep('5/5: Repackaging viral search keywords + Prayer of Salvation...');
      const repackagedDesc = buildRepackagedMinistryDescription(
        currentData?.title || 'Inspirational Video',
        currentData?.tags || [],
        currentData?.summary || '',
        customAudioName || 'Breathing Again'
      );
      if (currentData) {
        setData({ ...currentData, optimizedDescription: repackagedDesc });
      }

      // Add Director message to chat log
      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: 'director',
          text: `🎬 Transformation Complete! I've muted the original speaker, enabled your gold ministry cover-up banner, attached your streaming CTA, and blended their viral search keywords with the Prayer of Salvation and your 8 streaming links. Watch your updated preview below and chat with me if you want any adjustments!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setReviewModeActive(true);
      setActiveTab('chat');

      // Start video playback automatically so user can watch immediately
      if (videoElementRef.current) {
        videoElementRef.current.currentTime = 0;
        videoElementRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
      if (audioEngineRef.current) {
        audioEngineRef.current.setVolume(1.0);
        audioEngineRef.current.play(0, 68, bgMusicGenre);
      }
    } catch (err: any) {
      console.error('AutoPilot failed:', err);
    } finally {
      setIsAutoPilotRunning(false);
      setAutoPilotStep('');
    }
  };

  // Conversational AI Director Chat Handler
  const handleSendDirectorChat = async (messageText?: string) => {
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
      const currentSettings = {
        volumeOriginal: originalVideoVolume,
        volumeSong: bgMusicVolume,
        coverBarEnabled,
        coverBarPosition,
        coverBarHeight,
        coverBarText,
        coverBarStyle,
        ctaEnabled,
        ctaHeadline,
        ctaSubtext,
        ctaPosition,
        ctaColor,
        showHookOverlay,
        selectedHook,
        optimizedDescription: data?.optimizedDescription,
        tags: data?.tags,
      };

      const res = await fetch('/api/repurpose/ai-director-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          currentSettings,
          videoMetadata: {
            title: data?.title || 'Inspirational Video',
            summary: data?.summary || '',
            artistName: 'James Ussery',
          },
        }),
      });

      if (res.ok) {
        const resp = await res.json();
        const updated = resp.updatedSettings || {};

        if (typeof updated.volumeOriginal === 'number') setOriginalVideoVolume(updated.volumeOriginal);
        if (typeof updated.volumeSong === 'number') {
          setBgMusicVolume(updated.volumeSong);
          if (audioEngineRef.current) audioEngineRef.current.setVolume(updated.volumeSong);
        }
        if (typeof updated.coverBarEnabled === 'boolean') setCoverBarEnabled(updated.coverBarEnabled);
        if (updated.coverBarPosition) setCoverBarPosition(updated.coverBarPosition);
        if (typeof updated.coverBarHeight === 'number') setCoverBarHeight(updated.coverBarHeight);
        if (typeof updated.coverBarText === 'string') setCoverBarText(updated.coverBarText);
        if (updated.coverBarStyle) setCoverBarStyle(updated.coverBarStyle);
        if (typeof updated.ctaEnabled === 'boolean') setCtaEnabled(updated.ctaEnabled);
        if (updated.ctaHeadline) setCtaHeadline(updated.ctaHeadline);
        if (updated.ctaSubtext) setCtaSubtext(updated.ctaSubtext);
        if (updated.ctaPosition) setCtaPosition(updated.ctaPosition);
        if (updated.ctaColor) setCtaColor(updated.ctaColor);
        if (typeof updated.showHookOverlay === 'boolean') setShowHookOverlay(updated.showHookOverlay);
        if (updated.selectedHook) setSelectedHook(updated.selectedHook);
        if (updated.optimizedDescription && data) {
          setData((prev) => (prev ? { ...prev, optimizedDescription: updated.optimizedDescription } : null));
        }

        setAiChatMessages((prev) => [
          ...prev,
          {
            sender: 'director',
            text: resp.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('AI Director error:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Render loop to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const delta = dt * playbackSpeed;
          if (isReversed) {
            const next = prev - delta;
            return next <= 0 ? duration : next;
          } else {
            const next = prev + delta;
            return next >= duration ? 0 : next;
          }
        });
      }

      // Handle multi-clip switching if stitched clips exist
      if (stitchedClips.length > 1 && isPlaying) {
        const seg = duration / stitchedClips.length;
        const clipIdx = Math.min(stitchedClips.length - 1, Math.floor(currentTime / seg));
        const activeStitched = stitchedClips[clipIdx];
        if (activeStitched && activeStitched.url !== videoSourceUrl) {
          setVideoSourceUrl(activeStitched.url);
        }
      }

      // Sync video element speed and reverse simulation
      if (videoElementRef.current && videoSourceUrl && isPlaying) {
        if (videoElementRef.current.playbackRate !== playbackSpeed) {
          videoElementRef.current.playbackRate = playbackSpeed;
        }
        if (isReversed) {
          const revTime = (duration - (currentTime % duration)) % (videoElementRef.current.duration || duration);
          if (Math.abs(videoElementRef.current.currentTime - revTime) > 0.25) {
            videoElementRef.current.currentTime = revTime;
          }
        }
      }

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw video frame or ambient cinematic background
      ctx.clearRect(0, 0, w, h);

      if (videoElementRef.current && videoSourceUrl && !videoElementRef.current.paused) {
        // Draw real video
        ctx.drawImage(videoElementRef.current, 0, 0, w, h);
      } else {
        // Draw stylized animated cinematic backdrop
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.4, '#1e1b4b');
        grad.addColorStop(0.8, '#311042');
        grad.addColorStop(1, '#090d16');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Volumetric glow
        const radGlow = ctx.createRadialGradient(w / 2, h * 0.45, 10, w / 2, h * 0.45, w * 0.7);
        radGlow.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        radGlow.addColorStop(0.5, 'rgba(217, 70, 239, 0.15)');
        radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radGlow;
        ctx.fillRect(0, 0, w, h);

        // Ambient particles / embers
        const timeOffset = currentTime * 25;
        for (let i = 0; i < 16; i++) {
          const px = (Math.sin(i * 37 + timeOffset * 0.05) * 0.5 + 0.5) * w;
          const py = ((i * 43 + timeOffset) % h);
          ctx.beginPath();
          ctx.arc(px, h - py, 1.8 + (i % 3), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(253, 230, 138, 0.6)';
          ctx.fill();
        }
      }

      // 2. Subtle Cinematic Vignette
      const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.75);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // 2.5 Subtitle / Watermark Cover-Up Bar (covers previous creator's burned-in words or watermark)
      if (coverBarEnabled) {
        ctx.save();
        let barY = h * 0.70; // lower third default where subtitles usually appear
        if (coverBarPosition === 'bottom') barY = h - coverBarHeight - 10;
        if (coverBarPosition === 'top') barY = 10;

        if (coverBarStyle === 'solid_black') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.96)';
        } else if (coverBarStyle === 'gold_accent') {
          const goldGrad = ctx.createLinearGradient(0, barY, w, barY + coverBarHeight);
          goldGrad.addColorStop(0, 'rgba(15, 23, 42, 0.97)');
          goldGrad.addColorStop(0.5, 'rgba(28, 25, 23, 0.98)');
          goldGrad.addColorStop(1, 'rgba(15, 23, 42, 0.97)');
          ctx.fillStyle = goldGrad;
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        }

        ctx.fillRect(0, barY, w, coverBarHeight);

        if (coverBarStyle === 'gold_accent') {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, barY);
          ctx.lineTo(w, barY);
          ctx.moveTo(0, barY + coverBarHeight);
          ctx.lineTo(w, barY + coverBarHeight);
          ctx.stroke();
        }

        if (coverBarText) {
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = coverBarStyle === 'gold_accent' ? '#fde68a' : '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(coverBarText, w / 2, barY + coverBarHeight / 2);
        }
        ctx.restore();
      }

      // 3. Render Viral Hook Overlay (if enabled)
      if (showHookOverlay && selectedHook) {
        ctx.save();
        const hookY = h * 0.28;
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Background pill behind hook
        const textMetrics = ctx.measureText(selectedHook);
        const pillW = textMetrics.width + 36;
        const pillH = 44;
        const pillX = (w - pillW) / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.beginPath();
        ctx.roundRect(pillX, hookY - pillH / 2, pillW, pillH, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
        ctx.shadowBlur = 10;
        ctx.fillText(selectedHook, w / 2, hookY);
        ctx.restore();
      }

      // 4. Render Call to Action (CTA) Banner (if enabled)
      if (ctaEnabled && ctaHeadline) {
        ctx.save();
        const bannerH = 76;
        let bannerY = h - bannerH - 24;
        if (ctaPosition === 'top') bannerY = 24;
        if (ctaPosition === 'center') bannerY = (h - bannerH) / 2;

        const bannerW = w - 40;
        const bannerX = 20;

        // Gradient card
        const cardGrad = ctx.createLinearGradient(bannerX, bannerY, bannerX + bannerW, bannerY + bannerH);
        cardGrad.addColorStop(0, 'rgba(15, 23, 42, 0.92)');
        cardGrad.addColorStop(1, 'rgba(24, 24, 27, 0.94)');
        ctx.fillStyle = cardGrad;
        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 14);
        ctx.fill();

        // Accent border
        ctx.strokeStyle = ctaColor || '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animated pulse circle
        const pulseSize = 5 + Math.sin(time * 0.005) * 1.5;
        ctx.beginPath();
        ctx.arc(bannerX + 22, bannerY + 28, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = ctaColor || '#f59e0b';
        ctx.fill();

        // Headline text
        ctx.textAlign = 'left';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(ctaHeadline, bannerX + 38, bannerY + 32);

        // Subtext
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText(ctaSubtext, bannerX + 38, bannerY + 54);

        // Listen / Arrow badge
        const badgeW = 72;
        const badgeH = 28;
        const badgeX = bannerX + bannerW - badgeW - 14;
        const badgeY = bannerY + (bannerH - badgeH) / 2;

        ctx.fillStyle = ctaColor || '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
        ctx.fill();

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#09090b';
        ctx.textAlign = 'center';
        ctx.fillText('LISTEN ▶', badgeX + badgeW / 2, badgeY + 18);

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, showHookOverlay, selectedHook, ctaEnabled, ctaHeadline, ctaSubtext, ctaPosition, ctaColor, coverBarEnabled, coverBarPosition, coverBarHeight, coverBarText, coverBarStyle, videoSourceUrl]);

  // Export & Download Repurposed Video
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    setExportProgress(10);

    try {
      const stream = canvas.captureStream(30);

      // Add audio track if audio engine stream available
      if (audioEngineRef.current && !isBgMusicMuted) {
        const audioStream = audioEngineRef.current.getMediaStream();
        if (audioStream) {
          audioStream.getAudioTracks().forEach((track) => stream.addTrack(track));
        }
      }

      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4000000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanTitle = (data?.title || 'repurposed-video').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        a.download = `${cleanTitle}-repurposed.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
        a.click();
        setIsExporting(false);
        setExportProgress(100);

        // Also copy upload pack automatically!
        if (data) {
          const pack = `Title: ${data.title}\n\nDescription:\n${data.optimizedDescription}\n\nTags:\n${data.tags.join(', ')}\n\nHashtags:\n${data.hashtags.join(' ')}`;
          navigator.clipboard.writeText(pack);
          setCopiedKey('export_pack');
          setTimeout(() => setCopiedKey(null), 4000);
        }
      };

      recorder.start();

      // Start playback & export timer
      if (!isPlaying) togglePlay();

      let p = 10;
      const interval = setInterval(() => {
        p += 15;
        setExportProgress(Math.min(95, p));
      }, 900);

      setTimeout(() => {
        clearInterval(interval);
        recorder.stop();
        if (isPlaying) togglePlay();
      }, 6000); // 6 second viral snippet export
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              YouTube & TikTok Repurpose Hub
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Gemini 2.5 Intelligence
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
            <span>Video Repurpose & Viral Distribution Studio</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-3xl mt-1">
            Extract descriptions, high-ranking SEO tags, and viral short-form hooks from any YouTube or TikTok link. Layer your background song, customize call-to-actions, and export a ready-to-publish repurposed video.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 transition"
          >
            ← Back to Director
          </button>
        )}
      </div>

      {/* Video Source Selection: Ask AI What's Viral vs Paste Custom Link */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveInputMode('ask_ai_viral')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeInputMode === 'ask_ai_viral'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-gray-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-gray-950 text-gray-300 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            <Flame className="w-4 h-4 text-gray-950" />
            <span>🔥 Ask AI: What's Viral Right Now? (Pick & Repackage)</span>
            <span className="text-[9px] bg-black/20 text-gray-950 font-black px-1.5 py-0.5 rounded">
              TRENDING
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInputMode('custom_url')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeInputMode === 'custom_url'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-gray-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-gray-950 text-gray-300 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>🔗 Paste Any Video Link or Upload File</span>
          </button>
        </div>

        {/* MODE 1: ASK AI WHAT'S VIRAL RIGHT NOW */}
        {activeInputMode === 'ask_ai_viral' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Real-time Viral Inspirational & Faith Video Scout</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Ask AI for currently trending videos with millions of views that pair seamlessly with your worship tracks and gospel ministry.
                </p>
              </div>

              {/* AI Query Search Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchViralTrendingVideos(viralCategory, viralSearchQuery);
                }}
                className="flex items-center gap-2 max-w-md w-full"
              >
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={viralSearchQuery}
                    onChange={(e) => setViralSearchQuery(e.target.value)}
                    placeholder="Ask AI (e.g. 'Videos on rising from failure' or 'Praying in storm')..."
                    className="w-full pl-8 pr-3 py-2 bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-gray-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoadingViralVideos}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {isLoadingViralVideos ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Ask AI</span>
                </button>
              </form>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { id: 'all', label: '🌟 All Trends' },
                { id: 'faith', label: '✝️ Faith & Testimony' },
                { id: 'motivation', label: '🔥 Mindset & Discipline' },
                { id: 'athletic', label: '🏃 Athletic Comebacks' },
                { id: 'military', label: '🎖️ Military & Resilience' },
                { id: 'nature', label: '🌄 God’s Creation' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setViralCategory(cat.id);
                    fetchViralTrendingVideos(cat.id, viralSearchQuery);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    viralCategory === cat.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Viral Videos Grid */}
            {isLoadingViralVideos ? (
              <div className="p-8 border border-gray-800/80 rounded-xl bg-gray-950/60 flex items-center justify-center gap-3 text-amber-300 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>AI is scouting currently viral videos matching your ministry format...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {viralVideosList.map((video, idx) => (
                  <div
                    key={video.id || idx}
                    className="bg-gray-950/80 border border-gray-800 hover:border-amber-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 transition shadow-lg group hover:bg-gray-950"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-400" />
                          <span>{video.views || 'Viral'}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {video.creator || 'Trending Creator'}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-xs leading-snug group-hover:text-amber-300 transition">
                        {video.title}
                      </h4>

                      <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-2">
                        {video.summary}
                      </p>

                      {/* Why it fits your music */}
                      <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-2 text-[10px] text-amber-300/90 leading-relaxed">
                        <span className="font-bold text-amber-300 block mb-0.5">💡 Why it fits your music:</span>
                        {video.whyItMatches || 'Emotional momentum pairs seamlessly with James Ussery acoustic guitar swells.'}
                      </div>

                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Music className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">Pairs with: <strong className="text-gray-200">{video.suggestedSong || 'Breathing Again'}</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectAndAutoPilot(video)}
                      disabled={isAutoPilotRunning}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-gray-950 font-black text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="1-Click Auto-Pilot will mute this video, overlay your music, add cover banner, set CTA, and blend SEO keywords"
                    >
                      {isAutoPilotRunning && videoUrl === video.url ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Transforming Video...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5 text-gray-950" />
                          <span>⚡ Repackage This Video (1-Click)</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODE 2: CUSTOM URL / UPLOAD BAR */}
        {activeInputMode === 'custom_url' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube or TikTok link (e.g. https://www.youtube.com/watch?v=...)"
                  className="w-full pl-9 pr-4 py-3 bg-gray-950 border border-gray-700/80 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRunAutoPilot()}
                disabled={isAutoPilotRunning || !videoUrl}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-gray-950 font-black text-sm rounded-xl transition shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-amber-300/40"
                title="AI automatically mutes original audio, attaches your worship song, adds cover-up bar, sets CTA, and blends keywords with the Prayer of Salvation"
              >
                {isAutoPilotRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-950" />
                    <span>Auto-Pilot Running...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-gray-950" />
                    <span>⚡ 1-Click Auto-Pilot Transform</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleExtract(true)}
                disabled={isLoading || isAutoPilotRunning || !videoUrl}
                className="px-5 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white font-bold text-sm rounded-xl transition border border-gray-700 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Extract Intel</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Sample Links */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-400 font-semibold">Try sample link:</span>
                {SAMPLE_DEMO_LINKS.map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setVideoUrl(demo.url);
                      setCustomGoal(demo.notes);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition cursor-pointer"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>

              <div className="text-gray-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Works with YouTube, Shorts, TikTok & Reels</span>
              </div>
            </div>
          </div>
        )}

        {/* 1-Click Auto-Pilot Progress Steps */}
        {isAutoPilotRunning && (
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>{autoPilotStep || 'Transforming video for James Ussery...'}</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                AUTO-DIRECTOR
              </span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
              <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 h-full w-4/5 animate-pulse" />
            </div>
            <p className="text-[11px] text-gray-400 italic">
              AI is automatically removing original voice, placing the cover-up banner, and preparing your review preview...
            </p>
          </div>
        )}

        {/* Watch & Review Mode Banner */}
        {reviewModeActive && !isAutoPilotRunning && (
          <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-gray-950 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-gray-950 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-gray-950" />
                  WATCH & REVIEW READY
                </span>
                <span className="text-xs text-amber-300 font-semibold">Ready for James Ussery Distribution</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-white">
                🎉 Your Video is Repurposed! Watch the updated preview below.
              </h4>
              <p className="text-xs text-gray-300 max-w-2xl">
                The original voice is muted (0%), your worship music is set (100%), the cover-up banner is active, and the Prayer of Salvation + 8 streaming links are ready. Watch now, export, or use AI Chat to tweak anything!
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={togglePlay}
                className="px-4 py-2.5 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-gray-950 transition shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause Video' : '▶️ Watch Updated Video'}</span>
              </button>
              <button
                onClick={handleExportVideo}
                disabled={isExporting}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export & Download</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-gray-900 hover:bg-gray-850 text-amber-300 border border-amber-500/40 transition flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Director Chat</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Sample Links & Custom Instructions */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400 font-semibold">Try sample link:</span>
            {SAMPLE_DEMO_LINKS.map((demo, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setVideoUrl(demo.url);
                  setCustomGoal(demo.notes);
                }}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition"
              >
                {demo.label}
              </button>
            ))}
          </div>

          <div className="text-gray-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Works with YouTube, Shorts, TikTok & Reels</span>
          </div>
        </div>

        {/* Loading Progress Feedback */}
        {isLoading && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3 text-xs text-amber-300 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-amber-400" />
            <span>{loadingStep || 'Analyzing video structure and generating high-converting metadata...'}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-300">
            {error}
          </div>
        )}
      </div>

      {/* Main Repurpose Hub Workspace */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Video Repurposing Canvas & Song Mixer */}
          <div className="lg:col-span-7 bg-gray-900/90 border border-gray-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">Repurpose Video Canvas & Audio Mixer</h3>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-lg border border-gray-800 text-xs">
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    aspectRatio === '9:16' ? 'bg-amber-500 text-gray-950' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  9:16 (Shorts/TikTok)
                </button>
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    aspectRatio === '16:9' ? 'bg-amber-500 text-gray-950' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  16:9 (Landscape)
                </button>
              </div>
            </div>

            {/* Video Canvas Container */}
            <div className="flex flex-col items-center justify-center bg-gray-950 rounded-xl border border-gray-800 p-3 relative overflow-hidden">
              <canvas
                ref={canvasRef}
                width={aspectRatio === '9:16' ? 360 : 640}
                height={aspectRatio === '9:16' ? 640 : 360}
                className="rounded-lg shadow-2xl max-h-[480px] w-auto bg-black border border-gray-800/80"
              />

              {/* Hidden Video element for local preview */}
              <video
                ref={videoElementRef}
                src={videoSourceUrl || undefined}
                loop
                muted
                playsInline
                className="hidden"
              />

              {/* Canvas Controls Overlay */}
              <div className="w-full max-w-sm mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{currentTime.toFixed(1)}s</span>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="flex-1 mx-3 accent-amber-500 cursor-pointer"
                  />
                  <span>{duration.toFixed(1)}s</span>
                </div>

                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    onClick={togglePlay}
                    className="p-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold transition shadow-md shadow-amber-500/20"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={() => handleSeek(0)}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition"
                  >
                    Restart
                  </button>

                  <button
                    onClick={apply8sLoopPreset}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5"
                    title="Set to 8-second vertical loop with dreamy slow-motion"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    <span>8s Spotify / TikTok Loop</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Music Maker FX Suite: Speed, Reverse & Duration Controls */}
            <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FastForward className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-gray-200">Music Video FX: Speed & Reverse Motion</span>
                </div>
                <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {playbackSpeed}x {isReversed ? '• REVERSED' : ''}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* Slow Motion 0.5x */}
                <button
                  onClick={() => setPlaybackSpeed(0.5)}
                  className={`p-2 rounded-lg border font-bold text-center transition ${
                    playbackSpeed === 0.5
                      ? 'bg-amber-500 text-gray-950 border-amber-400'
                      : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  0.5x Slow-Mo (Dreamy)
                </button>

                {/* Normal 1.0x */}
                <button
                  onClick={() => setPlaybackSpeed(1.0)}
                  className={`p-2 rounded-lg border font-bold text-center transition ${
                    playbackSpeed === 1.0
                      ? 'bg-amber-500 text-gray-950 border-amber-400'
                      : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  1.0x Normal
                </button>

                {/* Fast 1.5x */}
                <button
                  onClick={() => setPlaybackSpeed(1.5)}
                  className={`p-2 rounded-lg border font-bold text-center transition ${
                    playbackSpeed === 1.5
                      ? 'bg-amber-500 text-gray-950 border-amber-400'
                      : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  1.5x Dynamic Flow
                </button>

                {/* Reverse Playback */}
                <button
                  onClick={() => setIsReversed(!isReversed)}
                  className={`p-2 rounded-lg border font-bold text-center transition flex items-center justify-center gap-1 ${
                    isReversed
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-gray-900 border-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reverse Playback</span>
                </button>
              </div>

              {/* Duration Selectors */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-800/80 text-xs">
                <span className="text-gray-400">Target Duration:</span>
                <div className="flex items-center gap-1.5">
                  {[8, 15, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold transition ${
                        duration === d
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-gray-900 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {d}s {d === 8 ? '(Spotify / Hook)' : d === 15 ? '(TikTok / Reel)' : '(Full Clip)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pexels Free 4K Stock Video Browser & Multi-Clip Stitcher */}
            <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-gray-200">Free Pexels Stock Footage & Multi-Clip Stitcher</span>
                </div>
                <button
                  onClick={() => {
                    setIsPexelsDrawerOpen(!isPexelsDrawerOpen);
                    if (!pexelsResults.length) searchPexelsVideos();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition flex items-center gap-1"
                >
                  <Search className="w-3 h-3" />
                  <span>{isPexelsDrawerOpen ? 'Close Library' : 'Browse 4K Clips'}</span>
                </button>
              </div>

              {/* Timeline Stitcher Tray (Shows added clips) */}
              {stitchedClips.length > 0 && (
                <div className="p-3 bg-gray-900/90 rounded-xl border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300">
                      Stitched Timeline ({stitchedClips.length} Clips • {duration}s Sequence):
                    </span>
                    <button
                      onClick={() => setStitchedClips([])}
                      className="text-[10px] text-gray-400 hover:text-rose-400"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {stitchedClips.map((c, i) => (
                      <div
                        key={i}
                        className="p-2 bg-gray-950 rounded-lg border border-gray-800 text-[11px] flex items-center justify-between gap-2"
                      >
                        <span className="truncate font-semibold text-gray-200">
                          #{i + 1} {c.name.slice(0, 18)}
                        </span>
                        <button
                          onClick={() => removeStitchedClip(i)}
                          className="text-gray-500 hover:text-rose-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Clips automatically cross-sequence throughout the {duration}s timeline with your background music!
                  </p>
                </div>
              )}

              {/* Pexels Search & Results Drawer */}
              {isPexelsDrawerOpen && (
                <div className="space-y-3 pt-2 border-t border-gray-800">
                  {/* Genre Quick Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '🎹 Piano', q: 'piano keys hands moody' },
                      { label: '🎸 Acoustic Guitar', q: 'acoustic guitar player' },
                      { label: '🌧️ Rain on Window', q: 'rain on window dark' },
                      { label: '🌅 Golden Sunset', q: 'golden hour sunset sky' },
                      { label: '🕯️ Worship Candle', q: 'candlelight dark warm' },
                      { label: '🌌 Ethereal Night', q: 'night stars clouds timelapse' }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPexelsQuery(chip.q);
                          searchPexelsVideos(chip.q);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 text-[11px] transition"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pexelsQuery}
                      onChange={(e) => setPexelsQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchPexelsVideos()}
                      placeholder="Search free 4K footage (e.g., piano, waves, silhouette)..."
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => searchPexelsVideos()}
                      disabled={isLoadingPexels}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition"
                    >
                      {isLoadingPexels ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
                    </button>
                  </div>

                  {/* Results Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {pexelsResults.map((item) => (
                      <div
                        key={item.id}
                        className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-indigo-500 transition"
                      >
                        <img
                          src={item.previewUrl}
                          alt={item.title}
                          className="w-full h-20 object-cover"
                        />
                        <div className="p-1.5 text-[10px] space-y-1">
                          <p className="truncate text-gray-200 font-medium">{item.photographer}</p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setVideoSourceUrl(item.url);
                                setUploadedVideoName(item.title);
                              }}
                              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 p-1 rounded font-semibold text-[9px] transition text-center"
                            >
                              Use Video
                            </button>
                            <button
                              onClick={() => addClipToStitcher(item)}
                              className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 p-1 rounded font-semibold text-[9px] transition"
                              title="Add to multi-clip timeline sequence"
                            >
                              + Stitch
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Video Downloader & Local Clip Importer */}
            <div className="bg-gray-950/70 border border-gray-800/90 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                  <Download className="w-4 h-4 text-rose-400" />
                  <span>Download Video & Import Clip for Re-mixing</span>
                </div>

                <a
                  href={`https://cobalt.tools/`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300"
                >
                  <span>Open Fast MP4 Downloader</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center justify-center gap-2 p-3 bg-gray-900 hover:bg-gray-850 border border-dashed border-gray-700 rounded-lg cursor-pointer text-gray-300 transition">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span className="truncate">{uploadedVideoName || 'Upload Downloaded MP4/MOV'}</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => {
                    // Set working stock video sample
                    setVideoSourceUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                    setUploadedVideoName('Viral Sample Short Clip.mp4');
                  }}
                  className="flex items-center justify-center gap-2 p-3 bg-gray-900 hover:bg-gray-850 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Load Sample Viral Clip</span>
                </button>
              </div>
            </div>

            {/* Layer Background Song & Audio Mixer */}
            <div className="bg-gray-950/70 border border-gray-800/90 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-gray-200">Add Song to Background & Volume Balance</span>
                </div>
                <span className="text-[11px] text-amber-400 font-medium">Real-Time Audio Synthesis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setBgMusicGenre('how_to_save_a_life');
                    if (isPlaying && audioEngineRef.current) {
                      audioEngineRef.current.play(currentTime, 68, 'how_to_save_a_life');
                    }
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer ${
                    bgMusicGenre === 'how_to_save_a_life'
                      ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                      : 'border-gray-800 bg-gray-900 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <p className="text-white font-semibold">How to Save a Life</p>
                  <p className="text-[10px] text-gray-400">Warm Piano Ballad (Bb-F-Gm)</p>
                </button>

                <button
                  onClick={() => {
                    setBgMusicGenre('worship');
                    if (isPlaying && audioEngineRef.current) {
                      audioEngineRef.current.play(currentTime, 68, 'worship');
                    }
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer ${
                    bgMusicGenre === 'worship'
                      ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                      : 'border-gray-800 bg-gray-900 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <p className="text-white font-semibold">You Found Me in Silence</p>
                  <p className="text-[10px] text-gray-400">Ambient Worship Chimes</p>
                </button>

                <label className="p-2.5 rounded-lg border border-gray-800 bg-gray-900 hover:bg-gray-850 text-left text-xs cursor-pointer flex flex-col justify-center">
                  <span className="text-white font-semibold truncate">{customAudioName || 'Upload Custom Song'}</span>
                  <span className="text-[10px] text-gray-400">MP3, WAV or M4A</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleCustomAudioUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Volume Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-amber-400" />
                      <span>Background Song Volume:</span>
                    </span>
                    <span className="font-mono text-white font-bold">{Math.round(bgMusicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={bgMusicVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setBgMusicVolume(val);
                      if (audioEngineRef.current) audioEngineRef.current.setVolume(val);
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Original Video Volume:</span>
                    </span>
                    <span className="font-mono text-white font-bold">{Math.round(originalVideoVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={originalVideoVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setOriginalVideoVolume(val);
                      if (videoElementRef.current) videoElementRef.current.volume = val;
                    }}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* CTA Overlay Editor */}
            <div className="bg-gray-950/70 border border-gray-800/90 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-gray-200">Call-To-Action (CTA) Overlay Customizer</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={ctaEnabled}
                    onChange={(e) => setCtaEnabled(e.target.checked)}
                    className="rounded bg-gray-900 border-gray-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Show CTA</span>
                </label>
              </div>

              {ctaEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">Headline Text</label>
                    <input
                      type="text"
                      value={ctaHeadline}
                      onChange={(e) => setCtaHeadline(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                      placeholder="e.g. Stream on Spotify & Apple Music"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Subtext / Bio Link</label>
                    <input
                      type="text"
                      value={ctaSubtext}
                      onChange={(e) => setCtaSubtext(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                      placeholder="e.g. Link in bio • Official Lyric Video"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Position on Video</label>
                    <select
                      value={ctaPosition}
                      onChange={(e) => setCtaPosition(e.target.value as any)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-gray-200"
                    >
                      <option value="bottom">Bottom Floating Banner</option>
                      <option value="top">Top Header Banner</option>
                      <option value="center">Center Attention Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Accent Badge Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={ctaColor}
                        onChange={(e) => setCtaColor(e.target.value)}
                        className="w-8 h-8 rounded bg-transparent cursor-pointer border border-gray-700 p-0.5"
                      />
                      <span className="font-mono text-gray-300">{ctaColor}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Subtitle & Watermark Cover-Up Bar (Block original creator's text/watermark) */}
            <div className="bg-gray-950/70 border border-gray-800/90 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🛡️</span>
                  <span className="text-xs font-bold text-gray-200">Subtitle & Watermark Cover-Up Bar</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-semibold border border-rose-500/30">
                    Blocks Their Words / Captions
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={coverBarEnabled}
                    onChange={(e) => setCoverBarEnabled(e.target.checked)}
                    className="rounded bg-gray-900 border-gray-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-semibold">Enable Cover-Up</span>
                </label>
              </div>

              {coverBarEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="text-gray-400 block mb-1">Cover-Up Text (or leave blank for solid blackout)</label>
                    <input
                      type="text"
                      value={coverBarText}
                      onChange={(e) => setCoverBarText(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white placeholder-gray-500"
                      placeholder="e.g. ✝️ James Ussery (@JamesUsseryMusic) • Faith & Worship"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Cover-Up Style</label>
                    <select
                      value={coverBarStyle}
                      onChange={(e) => setCoverBarStyle(e.target.value as any)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-gray-200"
                    >
                      <option value="solid_black">Solid Blackout Block (Complete Cover)</option>
                      <option value="gold_accent">Gold Ministry Banner (Branded & Clean)</option>
                      <option value="dark_blur">Dark Navy Glass Blur</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Bar Position</label>
                    <select
                      value={coverBarPosition}
                      onChange={(e) => setCoverBarPosition(e.target.value as any)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-gray-200"
                    >
                      <option value="lower_third">Lower Third (Standard Subtitle Area ~70%)</option>
                      <option value="bottom">Bottom Edge (Watermark Area)</option>
                      <option value="top">Top Header</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-gray-400">Cover Height Thickness</label>
                      <span className="font-mono text-gray-300">{coverBarHeight}px</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={120}
                      step={5}
                      value={coverBarHeight}
                      onChange={(e) => setCoverBarHeight(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Export / Download Video Button */}
            <div className="pt-2">
              <button
                onClick={handleExportVideo}
                disabled={isExporting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-gray-950 font-black text-sm rounded-xl transition shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Rendering Repurposed Video ({exportProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export & Download Repurposed Video + Copy Keyword Pack</span>
                  </>
                )}
              </button>

              {copiedKey === 'export_pack' && (
                <p className="text-center text-xs text-amber-300 font-semibold mt-2 animate-fade-in">
                  ✓ Video downloaded & complete description/tag pack copied to clipboard!
                </p>
              )}

              {/* Platform Quick Upload Links */}
              <div className="pt-3 border-t border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  <span>Multi-Platform Dispatch & Scheduling</span>
                  <span className="text-[10px] text-amber-400/80 font-normal">Drop file & paste tags</span>
                </div>

                {/* Primary: Adobe Express Multi-Account Scheduler */}
                <a
                  href="https://new.express.adobe.com/schedule"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-2.5 rounded-xl bg-gradient-to-r from-red-950/40 via-purple-950/30 to-gray-900 hover:from-red-900/50 hover:to-purple-900/40 border border-red-500/30 hover:border-red-400/60 transition flex items-center justify-between px-3 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-xs shadow-md">
                      Ex
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                          Adobe Express Content Scheduler
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-red-500/20 text-red-300 rounded border border-red-500/30">
                          ALL ACCOUNTS LINKED
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Drop downloaded video & paste description to publish across TikTok, IG Reels & YouTube at once
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition shrink-0" />
                </a>

                {/* Individual direct platform links */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <a
                    href="https://studio.youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-gray-950 hover:bg-gray-850 border border-gray-800 text-center transition flex flex-col items-center justify-center gap-1 group"
                  >
                    <Youtube className="w-4 h-4 text-rose-500 group-hover:scale-110 transition" />
                    <span className="text-[11px] font-bold text-gray-300 group-hover:text-white">YouTube Studio</span>
                  </a>
                  <a
                    href="https://www.tiktok.com/creator-center/upload"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-gray-950 hover:bg-gray-850 border border-gray-800 text-center transition flex flex-col items-center justify-center gap-1 group"
                  >
                    <Flame className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                    <span className="text-[11px] font-bold text-gray-300 group-hover:text-white">TikTok Upload</span>
                  </a>
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-gray-950 hover:bg-gray-850 border border-gray-800 text-center transition flex flex-col items-center justify-center gap-1 group"
                  >
                    <Share2 className="w-4 h-4 text-pink-500 group-hover:scale-110 transition" />
                    <span className="text-[11px] font-bold text-gray-300 group-hover:text-white">Instagram Reels</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Extracted Metadata, Tags, Hooks & Descriptions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Overview Card */}
            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {data.platform === 'youtube' ? 'YouTube Extraction' : data.platform === 'tiktok' ? 'TikTok Extraction' : 'Video Data'}
                  </span>
                  <h3 className="font-bold text-white text-base mt-1.5 line-clamp-2">
                    {data.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Original by <span className="text-gray-200 font-medium">{data.author}</span>
                  </p>
                </div>

                {/* Virality Score Gauge */}
                <div className="text-center p-2.5 bg-gray-950 rounded-xl border border-gray-800 shrink-0">
                  <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-lg font-mono">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>{data.viralScore}</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-gray-400">Viral Score</span>
                </div>
              </div>

              {/* Psychology & Audience Insights */}
              <div className="bg-gray-950/80 rounded-xl p-3 border border-gray-800/80 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Audience Retention Insights</span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {data.audienceInsights}
                </p>
              </div>

              {/* Navigation Tabs for Extracted Details */}
              <div className="flex items-center border-b border-gray-800 pt-2 gap-1 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`pb-2 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'chat'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Director Chat</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/30">
                    LIVE
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('seo')}
                  className={`pb-2 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'seo'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SEO Optimizer</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    GEMINI
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('hooks')}
                  className={`pb-2 px-3 border-b-2 transition whitespace-nowrap ${
                    activeTab === 'hooks'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Viral Hooks ({data.viralHooks.length})
                </button>

                <button
                  onClick={() => setActiveTab('tags')}
                  className={`pb-2 px-3 border-b-2 transition whitespace-nowrap ${
                    activeTab === 'tags'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Tags & Hashtags
                </button>

                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-2 px-3 border-b-2 transition whitespace-nowrap ${
                    activeTab === 'description'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Optimized Description
                </button>

                <button
                  onClick={() => setActiveTab('adapt')}
                  className={`pb-2 px-3 border-b-2 transition whitespace-nowrap ${
                    activeTab === 'adapt'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  AI Platform Adapter
                </button>
              </div>

              {/* Tab 0: AI Director Conversational Chat */}
              {activeTab === 'chat' && (
                <div className="space-y-4 pt-2">
                  <div className="bg-gradient-to-br from-amber-950/40 via-gray-950 to-gray-900/90 border border-amber-500/30 rounded-xl p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Bot className="w-4 h-4 text-amber-400" />
                      <span>Direct Your Video Using AI Chat</span>
                    </div>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      Tell the AI Director what to modify in plain English (e.g. <em>"Mute original speaker"</em>, <em>"Make cover-up bar solid blackout"</em>, <em>"Change CTA to Apple Music"</em>, or <em>"Write a hook about God's strength"</em>). The video updates immediately!
                    </p>
                  </div>

                  {/* Quick Action Suggestion Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Quick Director Shortcuts:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '🔇 Mute Original 100%', prompt: 'Mute the original video completely so only my worship music plays.' },
                        { label: '🛡️ Solid Blackout Cover-Up', prompt: 'Change the cover-up bar to solid black to block all burned-in subtitles.' },
                        { label: '✝️ Gold Ministry Cover-Up', prompt: 'Use the gold ministry cover-up banner with my handle and cross.' },
                        { label: '🎵 Full Music Volume', prompt: 'Set background worship music volume to 100% full clarity.' },
                        { label: '📱 Spotify CTA Badge', prompt: 'Update CTA badge to say "Stream on Spotify & Apple Music" in gold.' },
                        { label: '🕊️ Faith Hook', prompt: 'Change opening hook to: "When God restores your breath after the storm."' },
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendDirectorChat(chip.prompt)}
                          disabled={isSendingChat}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-950 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 hover:border-amber-500/40 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat Message Thread */}
                  <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 max-h-[300px] overflow-y-auto space-y-2.5">
                    {aiChatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-0.5">
                          {msg.sender === 'director' ? (
                            <>
                              <Bot className="w-3 h-3 text-amber-400" />
                              <span className="text-amber-300 font-bold">AI Video Director</span>
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
                        <span>AI Director is applying your adjustments to the video...</span>
                      </div>
                    )}
                  </div>

                  {/* Chat Input Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendDirectorChat();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isSendingChat}
                      placeholder="Type changes (e.g. 'Make cover bar higher' or 'Set music to 100%')..."
                      className="flex-1 bg-gray-950 border border-gray-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isSendingChat || !chatInput.trim()}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-gray-950 font-black text-xs rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Update</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 1: Viral Hooks */}
              {activeTab === 'hooks' && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-gray-400">
                    High-impact on-screen hooks engineered to stop the scroll in the first 2 seconds:
                  </p>

                  <div className="space-y-2">
                    {data.viralHooks.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition text-xs flex items-center justify-between gap-2 ${
                          selectedHook === item.hook
                            ? 'bg-amber-950/20 border-amber-500/40 text-white'
                            : 'bg-gray-950 border-gray-800 text-gray-300 hover:border-gray-700'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-800 text-amber-300">
                              {item.format}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {item.angle}
                            </span>
                          </div>
                          <p className="font-bold text-sm text-white">
                            "{item.hook}"
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedHook(item.hook);
                              setShowHookOverlay(true);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                              selectedHook === item.hook
                                ? 'bg-amber-500 text-gray-950'
                                : 'bg-gray-850 hover:bg-gray-800 text-gray-300'
                            }`}
                          >
                            Apply to Video
                          </button>

                          <button
                            onClick={() => copyToClipboard(item.hook, `hook_${idx}`)}
                            className="p-1.5 rounded-lg bg-gray-850 hover:bg-gray-800 text-gray-300"
                            title="Copy Hook"
                          >
                            {copiedKey === `hook_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: SEO Tags & Hashtags */}
              {activeTab === 'tags' && (
                <div className="space-y-4 pt-2">
                  {/* High-Ranking Search Tags */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-200">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>SEO Tags for YouTube Studio / TikTok ({data.tags.length})</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(data.tags.join(', '), 'tags_all')}
                        className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
                      >
                        {copiedKey === 'tags_all' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied All!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy All Tags</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 bg-gray-950 p-3 rounded-xl border border-gray-800 max-h-40 overflow-y-auto">
                      {data.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          onClick={() => copyToClipboard(tag, `tag_${idx}`)}
                          className="px-2 py-1 rounded-md bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs cursor-pointer transition hover:text-white"
                          title="Click to copy single tag"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Trending Hashtags */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-200">
                        <Hash className="w-3.5 h-3.5 text-rose-400" />
                        <span>Trending Hashtags for Shorts & TikTok ({data.hashtags.length})</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(data.hashtags.join(' '), 'hash_all')}
                        className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300"
                      >
                        {copiedKey === 'hash_all' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied All!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy All Hashtags</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 bg-gray-950 p-3 rounded-xl border border-gray-800">
                      {data.hashtags.map((h, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-rose-950/20 text-rose-300 border border-rose-500/20 text-xs font-medium"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Optimized Social Description */}
              {activeTab === 'description' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-gray-400">
                      Formatted description ready to paste directly into YouTube, TikTok, or Adobe Express:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const repackaged = buildRepackagedMinistryDescription(
                            data.title,
                            data.tags,
                            data.summary,
                            customAudioName || 'Breathing Again'
                          );
                          setData((prev) => (prev ? { ...prev, optimizedDescription: repackaged } : null));
                          copyToClipboard(repackaged, 'desc_repackage');
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-gray-950 transition shadow-md"
                        title="Blends their viral keywords & topic with your ministry testimony, Prayer of Salvation & 8 streaming links"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>⚡ Repackage: Their Keywords + Your Ministry & Prayer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const customDesc = buildJamesUsseryDescription(data.title, data.summary);
                          setData((prev) => (prev ? { ...prev, optimizedDescription: customDesc } : null));
                          copyToClipboard(customDesc, 'desc_copy');
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-amber-300 border border-amber-500/30 transition"
                        title="Injects the Prayer of Salvation and all 8 of James Ussery's streaming links"
                      >
                        <span>🕊️ Pure Ministry Pack</span>
                      </button>

                      <button
                        onClick={() => copyToClipboard(data.optimizedDescription, 'desc_copy')}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 transition"
                      >
                        {copiedKey === 'desc_copy' || copiedKey === 'desc_repackage' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied to Clipboard!</span>
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

                  {/* 8 Streaming Links Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap p-2 bg-gray-950 rounded-xl border border-gray-800 text-[10px]">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Streaming:</span>
                    {JAMES_USSERY_PROFILE.streamingLinks.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 hover:border-amber-500/50 text-amber-300 font-semibold transition flex items-center gap-1"
                      >
                        <span>{item.platform}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ))}
                  </div>

                  <textarea
                    rows={10}
                    value={data.optimizedDescription}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => (prev ? { ...prev, optimizedDescription: val } : null));
                    }}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-300 font-mono focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>
              )}

              {/* Tab 4: AI Platform Adapter */}
              {activeTab === 'adapt' && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-gray-400">
                    Adapt copy tone, headline, and hashtags for specific social algorithms:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                    {(['tiktok', 'youtube_shorts', 'reels', 'spotify'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => handleAdapt(p)}
                        disabled={isRewriting}
                        className={`p-2 rounded-lg border text-center font-bold capitalize transition ${
                          adaptPlatform === p
                            ? 'bg-amber-500 text-gray-950 border-amber-400'
                            : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {p.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {isRewriting && (
                    <div className="flex items-center justify-center gap-2 p-4 text-xs text-amber-300">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Optimizing copy for {adaptPlatform}...</span>
                    </div>
                  )}

                  {adaptedContent && (
                    <div className="bg-gray-950 rounded-xl p-3 border border-gray-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400">Algorithmic Title:</span>
                        <button
                          onClick={() => copyToClipboard(adaptedContent.title || '', 'adapt_title')}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-semibold text-white">{adaptedContent.title}</p>

                      <div className="pt-2 border-t border-gray-800">
                        <span className="font-bold text-gray-400">Caption / Description:</span>
                        <p className="text-gray-300 whitespace-pre-line mt-1">
                          {adaptedContent.description}
                        </p>
                      </div>

                      {adaptedContent.tips && (
                        <div className="pt-2 border-t border-gray-800 text-amber-300 font-medium">
                          💡 Strategy tip: {adaptedContent.tips}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Gemini SEO Optimizer Module */}
              {activeTab === 'seo' && (
                <div className="pt-2">
                  <SeoOptimizerModule
                    videoTitle={data.title}
                    artistName={data.author}
                    videoSummary={data.summary}
                    initialTags={data.tags}
                    onApplyTitle={(newTitle) => setData((prev) => (prev ? { ...prev, title: newTitle } : null))}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

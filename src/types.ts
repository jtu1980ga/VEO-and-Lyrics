export type CaptionStyle = 
  | 'seven_clouds'        // Signature 7 Clouds style: Bold clean centered rounded-pill typography, black outline & drop shadow, subtle glowing active word
  | 'golden_worship'      // Ethereal golden luminous typography matching modern worship videos
  | 'how_to_save_a_life'  // Clean warm center typography with soft dark vignette & subtle floating particles
  | 'celestial_kinetic'   // Dynamic word-by-word bloom & kinetic scaling
  | 'karaoke_wipe'        // Smooth dual-tone sweep across letters
  | 'bouncing_ember'      // Fluid physics-based glowing particle/halo traversing words
  | 'minimalist_subtitle';// Lower-third or centered clean frosted glass card

export type LightingMood = 
  | 'divine_sanctuary'    // Volumetric golden sunlight shafts, floating light motes, holy atmospheric haze
  | 'warm_cinematic'      // Deep emotional warm cinematic atmosphere with vignette & soft bokeh (How to Save a Life)
  | 'twilight_horizon'    // Moody acoustic twilight gradient, horizon stars, evening mountain/cloud mist
  | 'synthwave_neon'      // Cyberpunk retro grid, magenta & cyan neon glow
  | 'concert_spotlight';  // Volumetric concert stage spotlights & fog

export type CameraMotion = 
  | 'dolly_push'          // Cinematic slow push-in
  | 'orbital_drift'       // Slow floating rotation
  | 'slow_pan'            // Elegant horizontal drift
  | 'breathing_cam';      // Natural subtle breathing camera

export type FontFamily = 
  | 'Cinzel'              // Majestic serif
  | 'Montserrat'         // Modern bold sans
  | 'Playfair Display'    // Elegant classic serif
  | 'Plus Jakarta Sans';  // Clean geometric sans

export interface TimedWord {
  word: string;
  start: number;
  end: number;
  chord?: string; // e.g. "Bb", "F/A", "Gm", "Eb"
}

export interface TimedLyricLine {
  line: string;
  start: number;
  end: number;
  words: TimedWord[];
  chord?: string; // Line-level primary chord (e.g. "Bb", "Gm", "Eb")
}

export interface SongPreset {
  id: string;
  title: string;
  artist: string;
  genre: string;
  lyrics: string;
  defaultStyle: CaptionStyle;
  defaultMood: LightingMood;
  defaultFont: FontFamily;
  defaultColor: string;
  audioBpm: number;
}

export interface CallToActionSettings {
  enabled: boolean;
  text: string; // e.g., "Stream & Worship Everywhere • New Album Out Now"
  subtext: string; // e.g., "Subscribe for more worship lyric videos"
  position: 'bottom' | 'top';
  badgeColor: string;
  icon: 'music' | 'heart' | 'sparkles' | 'bell';
}

export interface VideoSettings {
  aspectRatio: '16:9' | '9:16' | '1:1';
  captionStyle: CaptionStyle;
  lightingMood: LightingMood;
  cameraMotion: CameraMotion;
  fontFamily: FontFamily;
  glowColor: string;
  fontSize: number;
  showLinesCount: 1 | 2 | 3;
  showSingerAvatar: boolean;
  avatarType: 'silhouette' | 'photo' | 'none';
  textUppercase: boolean;
  bouncingSparkle: boolean;
  particlesEnabled: boolean;
  showChords: boolean;
  songTitle?: string;
  artistName?: string;
  videoDurationMode?: 'auto' | 'custom';
  customDurationSec?: number;
  introDurationSec?: number; // e.g. 8s or until first lyric
  outroDurationSec?: number; // e.g. 8s or 10s thank you portion
  showIntroScreen?: boolean;
  showOutroScreen?: boolean;
  cta: CallToActionSettings;
  videoClips?: VideoClipItem[];
}

export interface VideoClipItem {
  id: string;
  url: string;
  previewUrl?: string;
  title?: string;
  durationSec?: number;
}

export interface PexelsMediaItem {
  id: number;
  type: 'photo' | 'video';
  url: string;
  previewUrl: string;
  photographer: string;
  title: string;
}

export interface VeoImageToVideoItem {
  id: string;
  imageUrl: string;
  imageName: string;
  prompt: string;
  status: 'idle' | 'generating' | 'ready' | 'error';
  videoPreviewUrl?: string;
  motionType: 'cinematic_pan' | 'character_breathe' | 'product_spin' | 'zoom_in' | 'slow_motion';
  durationSec: number;
  musicTrack?: string;
  filter: 'none' | 'golden_hour' | 'noir' | 'vibrant' | 'cyber';
  overlayText?: string;
}

export interface ViralHookItem {
  hook: string;
  format: 'TikTok / Reel' | 'YouTube Short' | 'Story';
  angle: string;
}

export interface RepurposedVideoData {
  id: string;
  sourceUrl: string;
  platform: 'youtube' | 'tiktok' | 'other';
  title: string;
  author: string;
  authorUrl?: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  originalDescription: string;
  summary: string;
  tags: string[];
  hashtags: string[];
  viralHooks: ViralHookItem[];
  optimizedDescription: string;
  suggestedCta: {
    headline: string;
    subtext: string;
    badgeColor: string;
  };
  viralScore: number;
  audienceInsights: string;
  suggestedBackgroundMusic: string;
  videoBlobUrl?: string;
  videoFileName?: string;
}

export interface SeoTitleSuggestion {
  formula: string;
  title: string;
  ctrRating: number;
  explanation: string;
}

export interface SeoOptimizationResult {
  viralTitles: SeoTitleSuggestion[];
  hashtagClusters: {
    megaViral: string[];
    nicheTargeted: string[];
    streamingDiscovery: string[];
  };
  descriptionCopy: {
    short: string;
    long: string;
    pinnedComment: string;
  };
  seoHealthScore: number;
  rankingFactors: string[];
  recommendedPostingTimes: string[];
}


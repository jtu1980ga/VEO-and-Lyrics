import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Copy,
  Check,
  Share2,
  Video,
  Instagram,
  Facebook,
  Youtube,
  Music2,
  Wand2,
  Loader2,
  Hash,
  FileText,
  Flame,
  KeyRound,
  ExternalLink,
  Save,
  CheckCircle2
} from 'lucide-react';
import { JAMES_USSERY_PROFILE, buildJamesUsseryDescription, SongThemeType } from '../data/creatorProfile';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const SocialKeywordsHub: React.FC = () => {
  const { user } = useAuth();

  const [songTitle, setSongTitle] = useState('Pearls');
  const [songType, setSongType] = useState<SongThemeType>('pearls_storytelling');
  const [artistName, setArtistName] = useState(JAMES_USSERY_PROFILE.name);
  const [genre, setGenre] = useState('Gospel Rap, Country Pop, Heartfelt Storytelling');
  const [theme, setTheme] = useState('Discovering the pearls inside your pain, God shaping value inside your battles, breakthrough & healing');
  const [customNotes, setCustomNotes] = useState('');
  const [activePlatform, setActivePlatform] = useState<'all' | 'youtube' | 'tiktok' | 'instagram' | 'facebook'>('all');

  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Ready YouTube description
  const [youtubeDesc, setYoutubeDesc] = useState<string>(() => buildJamesUsseryDescription('Pearls', 'pearls_storytelling'));

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleGenerateKeywords = async () => {
    setIsGenerating(true);
    setSaveStatus(null);
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

      const res = await fetch('/api/social/generate-keywords', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          songTitle,
          artistName,
          genre,
          theme,
          customInfo: customNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
        // Refresh YouTube description with current song title
        setYoutubeDesc(buildJamesUsseryDescription(songTitle));

        // Auto-save to Firestore if user logged in
        if (user) {
          try {
            await addDoc(collection(db, 'users', user.uid, 'keywords'), {
              songTitle,
              artistName,
              genre,
              theme,
              results: data,
              createdAt: new Date().toISOString(),
            });
            setSaveStatus('Saved to your Cloud Account!');
          } catch (dbErr) {
            console.warn('Firestore save warning:', dbErr);
          }
        }
      }
    } catch (err) {
      console.error('Keywords generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Platform Social Media & SEO Keyword Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Keywords, SEO & Captions for All Social Media
            </h2>
            <p className="text-sm text-gray-300 max-w-2xl">
              One-click viral keywords, tags, titles, and captions tailored for <span className="text-amber-400 font-bold">TikTok</span>, <span className="text-pink-400 font-bold">Instagram</span>, <span className="text-blue-400 font-bold">Facebook</span>, and <span className="text-red-400 font-bold">YouTube</span> with James Ussery’s official YouTube video description & salvation prayer.
            </p>
          </div>

          <button
            onClick={handleGenerateKeywords}
            disabled={isGenerating}
            className="w-full md:w-auto px-6 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-xl shadow-amber-500/25 transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Generating Keywords...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Keywords & Strategy</span>
              </>
            )}
          </button>
        </div>

        {saveStatus && (
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* Input Configuration Grid */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 space-y-4">
        {/* Song Theme / Category Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Select Song Style & Narrative Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSongType('pearls_storytelling');
                setGenre('Gospel Rap, Country Pop, Heartfelt Storytelling');
                setTheme('Discovering pearls in your pain, God shaping value inside battles, breakthrough');
                setYoutubeDesc(buildJamesUsseryDescription(songTitle, 'pearls_storytelling'));
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                songType === 'pearls_storytelling'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-white">✨ Pearls Storytelling</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  Crossover
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight">
                Gospel Rap, Country & Pop blend. Pressure to purpose & discovering worth.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSongType('gospel_worship');
                setGenre('Gospel Music & Heartfelt Worship');
                setTheme('Christian worship, spiritual revival, overcoming darkness through Jesus Christ');
                setYoutubeDesc(buildJamesUsseryDescription(songTitle, 'gospel_worship'));
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                songType === 'gospel_worship'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-white">🕊️ Gospel & Worship</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Ministry
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight">
                Faith revival, Jesus is Lord, restoration after storms, acoustic & atmospheric.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSongType('love_heartbreak');
                setGenre('Heartfelt Country, Pop Ballad, Emotional Storytelling');
                setTheme('Healing from heartbreak, vulnerability, moving forward with hope and faith');
                setYoutubeDesc(buildJamesUsseryDescription(songTitle, 'love_heartbreak'));
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                songType === 'love_heartbreak'
                  ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                  : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-white">💔 Love & Heartbreak</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  Emotional
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight">
                Vulnerability, letting go of painful goodbyes, picking up the pieces with grace.
              </p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Song / Video Title
            </label>
            <input
              type="text"
              value={songTitle}
              onChange={(e) => {
                setSongTitle(e.target.value);
                setYoutubeDesc(buildJamesUsseryDescription(e.target.value, songType));
              }}
              placeholder="e.g. Pearls"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Artist / Channel Name
            </label>
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Genre & Style
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Theme / Story / Message
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Describe what your song is about..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MASTER YOUTUBE DESCRIPTION BOX (User specific request!)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-gray-950 border border-red-500/30 rounded-3xl p-6 space-y-4 shadow-xl shadow-red-500/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Official YouTube Video Description</span>
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase">
                  Ready to Paste
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Includes your testimony, 8 streaming platform links, Salvation Prayer (Romans 10:9), and ranking hashtags.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => copyToClipboard(youtubeDesc, 'youtube_desc')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              {copiedKey === 'youtube_desc' ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied Description!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Complete YouTube Description</span>
                </>
              )}
            </button>
          </div>
        </div>

        <textarea
          rows={12}
          value={youtubeDesc}
          onChange={(e) => setYoutubeDesc(e.target.value)}
          className="w-full bg-gray-900/80 border border-gray-800 rounded-2xl p-4 text-xs font-mono text-gray-200 leading-relaxed focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActivePlatform('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activePlatform === 'all'
              ? 'bg-amber-500 text-gray-950 font-black shadow-lg shadow-amber-500/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Platforms</span>
        </button>

        <button
          onClick={() => setActivePlatform('tiktok')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activePlatform === 'tiktok'
              ? 'bg-pink-500 text-white font-black shadow-lg shadow-pink-500/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Music2 className="w-3.5 h-3.5" />
          <span>TikTok</span>
        </button>

        <button
          onClick={() => setActivePlatform('instagram')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activePlatform === 'instagram'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black shadow-lg shadow-purple-500/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>Instagram Reels</span>
        </button>

        <button
          onClick={() => setActivePlatform('facebook')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activePlatform === 'facebook'
              ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Facebook className="w-3.5 h-3.5" />
          <span>Facebook</span>
        </button>

        <button
          onClick={() => setActivePlatform('youtube')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activePlatform === 'youtube'
              ? 'bg-red-600 text-white font-black shadow-lg shadow-red-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Youtube className="w-3.5 h-3.5" />
          <span>YouTube SEO</span>
        </button>
      </div>

      {/* Grid of Platform Specific Keyword Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TikTok Card */}
        {(activePlatform === 'all' || activePlatform === 'tiktok') && (
          <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                  TT
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">TikTok Hooks & Hashtags</h4>
                  <p className="text-[11px] text-gray-400">Optimized for TikTok algorithm FYP</p>
                </div>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    (results?.tiktok?.hashtags || JAMES_USSERY_PROFILE.defaultHashtags.slice(0, 10)).join(' '),
                    'tt_tags'
                  )
                }
                className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold"
              >
                {copiedKey === 'tt_tags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Tags</span>
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Top Viral Hooks:</span>
              <div className="space-y-1.5">
                {(results?.tiktok?.trendingHooks || [
                  "Stop scrolling if you need God's peace right now...",
                  "The exact moment God restored my breath after the storm.",
                  "If you feel like giving up, listen to these words.",
                ]).map((hook: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => copyToClipboard(hook, `hook_${idx}`)}
                    className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-300 hover:border-pink-500/50 cursor-pointer flex items-center justify-between transition"
                  >
                    <span>"{hook}"</span>
                    <Copy className="w-3 h-3 text-gray-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hashtags:</span>
              <div className="flex flex-wrap gap-1.5">
                {(results?.tiktok?.hashtags || [
                  '#christiantiktok',
                  '#worshipmusic',
                  '#gospelmusic',
                  '#jesus',
                  '#faith',
                  '#jamesussery',
                  '#breathingagain',
                ]).map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20 text-[11px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instagram Reels Card */}
        {(activePlatform === 'all' || activePlatform === 'instagram') && (
          <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Instagram Reels & Stories</h4>
                  <p className="text-[11px] text-gray-400">Devotional captions & reach hashtags</p>
                </div>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    (results?.instagram?.hashtags || [
                      '#christianreels',
                      '#worshipreels',
                      '#jesusiscalling',
                      '#faithjourney',
                      '#christianmusic',
                      '#jamesussery',
                    ]).join(' '),
                    'ig_tags'
                  )
                }
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
              >
                {copiedKey === 'ig_tags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Tags</span>
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Suggested Caption:</span>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-300 leading-relaxed font-sans">
                {results?.instagram?.captions?.[0] ||
                  `Surrender every storm to Jesus. "${songTitle}" is streaming everywhere now.\n\nDrop a ❤️ or 🙏 if this blessed your spirit today! Stream on Spotify & Apple Music (Link in bio).`}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hashtags:</span>
              <div className="flex flex-wrap gap-1.5">
                {(results?.instagram?.hashtags || [
                  '#christianreels',
                  '#worshipmusic',
                  '#christianindie',
                  '#faithrevival',
                  '#salvation',
                  '#jamesusserymusic',
                ]).map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Facebook Community Card */}
        {(activePlatform === 'all' || activePlatform === 'facebook') && (
          <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Facebook className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Facebook Posts & Groups</h4>
                  <p className="text-[11px] text-gray-400">Shareable testimony & ministry copy</p>
                </div>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    results?.facebook?.postTemplates?.[0] ||
                      `God restores your breath after the storm. Listen to '${songTitle}' by ${artistName} and remember you are never alone. Share this with a friend or family member who needs hope and salvation today.`,
                    'fb_post'
                  )
                }
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                {copiedKey === 'fb_post' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Post</span>
              </button>
            </div>

            <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-300 leading-relaxed font-sans">
              {results?.facebook?.postTemplates?.[0] ||
                `God restores your breath after the storm. Listen to '${songTitle}' by ${artistName} and remember you are never alone. Share this with a friend or family member who needs hope and salvation today.`}
            </div>
          </div>
        )}

        {/* Master Ranking Tags (25+ Keywords) */}
        {(activePlatform === 'all' || activePlatform === 'youtube') && (
          <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">YouTube Tags & Metadata Keywords</h4>
                  <p className="text-[11px] text-gray-400">Comma-separated for YouTube Studio upload tag box</p>
                </div>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    (results?.youtube?.tags || JAMES_USSERY_PROFILE.defaultTags).join(', '),
                    'yt_tags'
                  )
                }
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                {copiedKey === 'yt_tags' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Comma List</span>
              </button>
            </div>

            <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-amber-200/90 font-mono leading-relaxed max-h-36 overflow-y-auto">
              {(results?.youtube?.tags || JAMES_USSERY_PROFILE.defaultTags).join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Key,
  ShieldCheck,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Lock,
  Music,
  HelpCircle,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';
import {
  CreatorProfile,
  JAMES_USSERY_PROFILE,
  loadSavedCreatorProfile,
  saveCreatorProfile,
  loadApiKeysConfig,
  saveApiKeysConfig,
  ApiKeysConfig,
} from '../data/creatorProfile';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedProfile: CreatorProfile) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'api_keys' | 'membership'>('profile');

  // Creator Profile State
  const [profile, setProfile] = useState<CreatorProfile>(JAMES_USSERY_PROFILE);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  // API Keys State
  const [keysConfig, setKeysConfig] = useState<ApiKeysConfig>({
    pexelsApiKey: '',
    openaiWhisperKey: '',
    geminiApiKey: '',
  });
  const [showPexelsKey, setShowPexelsKey] = useState<boolean>(false);
  const [showWhisperKey, setShowWhisperKey] = useState<boolean>(false);
  const [showGeminiKey, setShowGeminiKey] = useState<boolean>(false);

  // Load from local persistence on mount or open
  useEffect(() => {
    if (isOpen) {
      const savedProf = loadSavedCreatorProfile();
      setProfile(savedProf);
      const savedKeys = loadApiKeysConfig();
      setKeysConfig(savedKeys);
      setIsSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    saveCreatorProfile(profile);
    saveApiKeysConfig(keysConfig);
    setIsSavedSuccess(true);
    if (onProfileUpdated) {
      onProfileUpdated(profile);
    }
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  const handleResetToJamesUssery = () => {
    if (window.confirm('Reset account to James Ussery default profile & official streaming links?')) {
      setProfile(JAMES_USSERY_PROFILE);
      saveCreatorProfile(JAMES_USSERY_PROFILE);
      setIsSavedSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(JAMES_USSERY_PROFILE);
      }
      setTimeout(() => setIsSavedSuccess(false), 3000);
    }
  };

  const handleStreamingLinkChange = (index: number, newUrl: string) => {
    const updated = [...profile.streamingLinks];
    updated[index] = { ...updated[index], url: newUrl };
    setProfile({ ...profile, streamingLinks: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-800/80 bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-gray-950 font-black shadow-lg shadow-amber-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Creator Account & Membership
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {profile.name === 'James Ussery' ? 'FOUNDER ACCOUNT' : 'CREATOR PRO'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Personalized branding, streaming links, and API key management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-gray-800 bg-gray-950 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & 8 Streaming Links</span>
          </button>

          <button
            onClick={() => setActiveTab('api_keys')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'api_keys'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Keys (Pexels & Whisper)</span>
            <span className="text-[9px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
              BYOK
            </span>
          </button>

          <button
            onClick={() => setActiveTab('membership')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'membership'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SaaS Membership & Pricing</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-gray-300">
          {/* TAB 1: PROFILE & STREAMING LINKS */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Account Status Badge */}
              <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-gray-950 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">
                      Saved Account: {profile.name} ({profile.handle})
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Your identity and streaming links are permanently saved in local browser storage.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetToJamesUssery}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-[10px] font-bold border border-gray-700 transition flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Restore James Ussery default profile & links"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore James Ussery</span>
                </button>
              </div>

              {/* Creator Name & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">Creator / Artist Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="e.g. James Ussery"
                    className="w-full bg-gray-900 border border-gray-700 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white font-semibold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">Social Handle / Tag</label>
                  <input
                    type="text"
                    value={profile.handle}
                    onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
                    placeholder="e.g. @JamesUsseryMusic"
                    className="w-full bg-gray-900 border border-gray-700 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white font-semibold outline-none font-mono"
                  />
                </div>
              </div>

              {/* Ministry & Music Mission */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Channel Mission Statement</label>
                <textarea
                  rows={2}
                  value={profile.missionStatement}
                  onChange={(e) => setProfile({ ...profile, missionStatement: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-amber-500 rounded-xl p-2.5 text-xs text-gray-200 outline-none leading-relaxed"
                />
              </div>

              {/* 8 Streaming Links Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    <span>Your 8 Official Streaming Links (Used in SEO & CTAs)</span>
                  </label>
                  <span className="text-[10px] text-gray-500">Auto-injected into YouTube Descriptions</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-gray-950 p-3 rounded-xl border border-gray-800">
                  {profile.streamingLinks.map((link, idx) => (
                    <div key={link.platform} className="space-y-1 bg-gray-900/90 p-2.5 rounded-lg border border-gray-800">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                        <span className="text-amber-300">{link.platform}</span>
                        {link.url && (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-400 hover:text-white flex items-center gap-0.5"
                          >
                            <span>Test</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleStreamingLinkChange(idx, e.target.value)}
                        placeholder={`https://... (${link.platform} link)`}
                        className="w-full bg-gray-950 border border-gray-700/80 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Prayer of Salvation & Scripture */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-gray-300">
                  Salvation Prayer Scripture & Gospel Message
                </label>
                <input
                  type="text"
                  value={profile.salvationPrayerScripture}
                  onChange={(e) => setProfile({ ...profile, salvationPrayerScripture: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 focus:border-amber-500 rounded-xl p-2.5 text-xs text-gray-200 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: API KEYS (BYOK - Bring Your Own Keys) */}
          {activeTab === 'api_keys' && (
            <div className="space-y-5">
              <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <span>Bring Your Own Keys (BYOK) Architecture</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  When you offer this app as a subscription service, customers can paste their own API keys below.
                  This ensures your operating costs remain <strong>$0 per user</strong> while giving them unlimited usage!
                </p>
              </div>

              {/* Pexels API Key */}
              <div className="space-y-1.5 bg-gray-950 border border-gray-800 p-3.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>1. Pexels Free Footage API Key</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                      100% FREE
                    </span>
                  </label>
                  <a
                    href="https://www.pexels.com/api/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Get Free Key (pexels.com)</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <p className="text-[11px] text-gray-400">
                  Grants 20,000 free 4K footage searches and video downloads per month at zero cost.
                </p>
                <div className="relative">
                  <input
                    type={showPexelsKey ? 'text' : 'password'}
                    value={keysConfig.pexelsApiKey}
                    onChange={(e) => setKeysConfig({ ...keysConfig, pexelsApiKey: e.target.value })}
                    placeholder="Enter your Pexels API key (leave blank to use default studio pool)..."
                    className="w-full bg-gray-900 border border-gray-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPexelsKey(!showPexelsKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPexelsKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* OpenAI Whisper / Groq API Key */}
              <div className="space-y-1.5 bg-gray-950 border border-gray-800 p-3.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>2. OpenAI Whisper / Audio Transcription Key</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono font-bold">
                      $0.006 / MIN
                    </span>
                  </label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Get OpenAI Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <p className="text-[11px] text-gray-400">
                  Powers precise word-by-word timestamp alignment for lyric video generation.
                </p>
                <div className="relative">
                  <input
                    type={showWhisperKey ? 'text' : 'password'}
                    value={keysConfig.openaiWhisperKey}
                    onChange={(e) => setKeysConfig({ ...keysConfig, openaiWhisperKey: e.target.value })}
                    placeholder="Enter sk-... OpenAI Whisper API key (optional)..."
                    className="w-full bg-gray-900 border border-gray-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWhisperKey(!showWhisperKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showWhisperKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Gemini Studio API Key */}
              <div className="space-y-1.5 bg-gray-950 border border-gray-800 p-3.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>3. Google Gemini 2.5 Director Key</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                      STUDIO ENGINE
                    </span>
                  </label>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Included in Cloud Run Instance</span>
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  The AI Video Director, SEO keyword generation, and viral scouting engines are automatically configured.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SAAS MEMBERSHIP & MONETIZATION BLUEPRINT */}
          {activeTab === 'membership' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-amber-950/40 via-gray-950 to-gray-900 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Commercial SaaS Blueprint: Pricing & Membership</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Here is how you can monetize this application by charging other Christian artists, ministries, and creators for login access:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Plan 1 */}
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Starter Plan
                    </span>
                    <h4 className="text-lg font-black text-white">$19 <span className="text-xs font-normal text-gray-400">/ mo</span></h4>
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                      For indie artists & creators. They enter their own Pexels & Whisper keys (BYOK).
                    </p>
                    <ul className="mt-3 space-y-1.5 text-[11px] text-gray-300">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Unlimited Repurpose Hub</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Lyric Video Studio</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Custom 8 Streaming CTAs</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-2 text-[10px] text-center text-gray-500 border-t border-gray-800">
                    Target: Christian Musicians
                  </div>
                </div>

                {/* Plan 2 */}
                <div className="bg-gradient-to-b from-amber-500/10 to-gray-950 border border-amber-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-lg">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                      ⭐ Most Popular: Pro Ministry
                    </span>
                    <h4 className="text-lg font-black text-amber-300">$49 <span className="text-xs font-normal text-gray-400">/ mo</span></h4>
                    <p className="text-[11px] text-gray-300 mt-2 leading-relaxed">
                      For churches & active YouTube ministries. Managed keys + 4K exports.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-[11px] text-gray-200">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>All Starter Features</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Priority AI Director Chat</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Pexels & Whisper Included</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-2 text-[10px] text-center text-amber-300 font-bold border-t border-amber-500/20">
                    Highest Margin Tier
                  </div>
                </div>

                {/* Plan 3 */}
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Founder License
                    </span>
                    <h4 className="text-lg font-black text-white">$199 <span className="text-xs font-normal text-gray-400">one-time</span></h4>
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                      Lifetime access for early supporters. Perfect for initial launch capital.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-[11px] text-gray-300">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Lifetime Access</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>All Future Feature Updates</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-2 text-[10px] text-center text-gray-500 border-t border-gray-800">
                    Great for Early Launch
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-800/80 bg-gray-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isSavedSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Account & Keys Saved Successfully!</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white font-bold text-xs rounded-xl transition border border-gray-700 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-5 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-gray-950 font-black text-xs rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Account Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

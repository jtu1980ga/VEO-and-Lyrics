export interface CreatorStreamingLink {
  platform: string;
  url: string;
  iconName?: string;
}

export interface CreatorProfile {
  name: string;
  handle: string;
  genre: string;
  missionStatement: string;
  heartMessage: string;
  salvationPrayerTitle: string;
  salvationPrayerScripture: string;
  salvationPrayerText: string;
  salvationPrayerNextSteps: string;
  streamingLinks: CreatorStreamingLink[];
  defaultTags: string[];
  defaultHashtags: string[];
}

export const JAMES_USSERY_PROFILE: CreatorProfile = {
  name: 'James Ussery',
  handle: '@JamesUsseryMusic',
  genre: 'Gospel Music & Heartfelt Worship Songs',
  missionStatement:
    'Welcome to the official music and ministry channel of James Ussery (@JamesUsseryMusic).\nI make gospel music and heartfelt worship songs to spread the love and hope of Jesus Christ.',
  heartMessage:
    'Sit back, take a deep breath, and let the worship, the prayer, and the relaxing soundscape guide you closer to Jesus. Through the Bible and prayer, we find our way back to God. May this video be a testament to the power of faith and worship music to restore the soul.',
  salvationPrayerTitle: '🕊️ THE PRAYER OF SALVATION (AN INVITATION TO JESUS):',
  salvationPrayerScripture:
    '"If you declare with your mouth, ‘Jesus is Lord,’ and believe in your heart that God raised Him from the dead, you will be saved." — Romans 10:9',
  salvationPrayerText: `If you feel Jesus calling your heart today and want to begin a personal relationship with Him, pray this heartfelt prayer with faith:

"Dear Heavenly Father,
I come to You today acknowledging that I need a Savior. I confess that I have sinned and fallen short of Your glory, but I believe that Jesus Christ is the Son of God. I believe He died on the cross for my sins and rose again from the grave on the third day.

Lord Jesus, I surrender my life to You today. Forgive me of all my sins, cleanse my heart, and fill me with Your Holy Spirit. I accept You as my Lord, my Savior, and my Guide. Help me to live for You all the days of my life.

In the mighty name of Jesus Christ I pray, Amen."`,
  salvationPrayerNextSteps:
    '👉 If you prayed this prayer today, welcome to the family of God! 🎉 Please leave a comment or reach out at @JamesUsseryMusic so we can celebrate and pray for you.',
  streamingLinks: [
    {
      platform: 'Spotify',
      url: 'https://open.spotify.com/artist/6gt7J5wg4IDYXvTWY6LWwS?si=Bnvd3mhITDS6777-WcnKvw',
    },
    {
      platform: 'Apple Music',
      url: 'https://artists.apple.com/ui/profile/artist/ami:identity:2bf871ff3a4791bc1e183450a6fc2c2b',
    },
    {
      platform: 'Amazon Music',
      url: 'https://amazon.com/music/player/artists/B0D2YCRX4Z/james-ussery',
    },
    {
      platform: 'YouTube Music',
      url: 'https://music.youtube.com/channel/@JamesUsseryMusic',
    },
    {
      platform: 'SoundCloud',
      url: 'https://soundcloud.com/jamesussery-music',
    },
    {
      platform: 'Tidal',
      url: 'https://tidal.com/artist/47434447',
    },
    {
      platform: 'Qobuz',
      url: 'https://qobuz.com/us-en/interpreter/james-ussery/22280943',
    },
    {
      platform: 'Deezer',
      url: 'https://deezer.com/us/artist/263849781',
    },
  ],
  defaultTags: [
    'James Ussery',
    'James Ussery Music',
    'JamesUsseryMusic',
    'Breathing Again',
    'Viking Worship',
    'Country Gospel',
    'Christian Music',
    'Acoustic Worship',
    'Christian Indie',
    'Epic Gospel',
    'Jesus Christ',
    'Faith Revival',
    'Worship Music',
    'Prayer of Salvation',
    'Christian Warrior',
    'Medieval Worship',
    'Cinematic Worship',
    'Jesus Saves',
    'Praise and Worship',
    'God Is Good',
    'Salvation',
  ],
  defaultHashtags: [
    '#JamesUssery',
    '#JamesUsseryMusic',
    '#BreathingAgain',
    '#VikingWorship',
    '#CountryGospel',
    '#ChristianMusic',
    '#AcousticWorship',
    '#ChristianIndie',
    '#EpicGospel',
    '#JesusChrist',
    '#FaithRevival',
    '#WorshipMusic',
    '#PrayerOfSalvation',
    '#ChristianWarrior',
    '#MedievalWorship',
    '#CinematicWorship',
    '#JesusSaves',
    '#PraiseAndWorship',
    '#GodIsGood',
    '#Salvation',
  ],
};

/**
 * Builds a ready-to-paste master YouTube / Social description for James Ussery
 * exactly matching his signature "Breathing Again" structure and voice.
 */
export function buildJamesUsseryDescription(
  songTitle: string = 'Breathing Again',
  customTestimony?: string
): string {
  const p = JAMES_USSERY_PROFILE;

  const linksBlock = p.streamingLinks
    .map((item) => `🎵 ${item.platform.padEnd(14, ' ')}: ${item.url}`)
    .join('\n');

  const defaultTestimony =
    customTestimony ||
    `This video symbolizes the battle, the struggle, and the moment God restores your breath after the storm. It represents spiritual awakening, rebirth, and the journey of finding peace and redemption through Jesus Christ. As a Christian warrior, I’ve walked through seasons of doubt and darkness, but through prayer, worship, and the presence of God, I found my way back to spiritual renewal.

“${songTitle}” is a testimony of faith revival — a reminder that Jesus is Lord, that He meets us in the chaos, and that His strength carries us when ours fades. The cinematic worship atmosphere and heartfelt prayer create a powerful space for meditation, reflection, and spiritual rebirth. Whether you need peaceful music to study, ambient worship to focus, or simply a moment to breathe, this video is for you.

Sit back, take a deep breath, and let the worship, the prayer, and the relaxing soundscape guide you closer to Jesus. Through the Bible and prayer, we find our way back to God. May this video be a testament to the power of faith and worship music to restore the soul.`;

  // Dynamic hashtags incorporating the specific song title
  const cleanSongTag = `#${songTitle.replace(/[^a-zA-Z0-9]/g, '')}`;
  const hashtags = [
    '#JamesUssery',
    '#JamesUsseryMusic',
    cleanSongTag,
    '#CountryGospel',
    '#ChristianMusic',
    '#AcousticWorship',
    '#ChristianIndie',
    '#EpicGospel',
    '#JesusChrist',
    '#FaithRevival',
    '#WorshipMusic',
    '#PrayerOfSalvation',
    '#ChristianWarrior',
    '#CinematicWorship',
    '#JesusSaves',
    '#PraiseAndWorship',
    '#GodIsGood',
    '#Salvation',
  ];

  return `🎵 ${songTitle} — ${p.name} (${p.handle})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${p.missionStatement}

${defaultTestimony}

🎧 STREAM & LISTEN TO JAMES USSERY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${linksBlock}

🕊️ THE PRAYER OF SALVATION (AN INVITATION TO JESUS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${p.salvationPrayerScripture}

${p.salvationPrayerText}

${p.salvationPrayerNextSteps}

💬 COMMUNITY & SONG REQUESTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Subscribe to the channel: https://youtube.com/@JamesUsseryMusic?sub_confirmation=1  
• Like, Share & Drop a comment if “${songTitle}” blessed your soul today!  
• If you have any song requests or chord transcription requests, let me know in the comments.

🏷️ HASHTAGS:
${hashtags.join(' ')}

© 2026 James Ussery. All rights reserved.`;
}

/**
 * Repackages a viral inspirational video with its high-ranking keywords + James Ussery's ministry & salvation format
 */
export function buildRepackagedMinistryDescription(
  videoTitle: string,
  viralKeywords: string[] = [],
  viralSummary?: string,
  songTitle: string = 'Breathing Again'
): string {
  const p = loadSavedCreatorProfile();

  const linksBlock = p.streamingLinks
    .map((item) => `🎵 ${item.platform.padEnd(14, ' ')}: ${item.url}`)
    .join('\n');

  const cleanKeywords = viralKeywords.slice(0, 18).join(', ');
  const viralHashtags = viralKeywords
    .slice(0, 8)
    .map((k) => `#${k.replace(/[^a-zA-Z0-9]/g, '')}`)
    .filter((h) => h.length > 2)
    .join(' ');

  return `🔥 ${videoTitle.toUpperCase()} • INSPIRATION & FAITH

${viralSummary || "A powerful message on purpose, perseverance, and holding onto your vision even when the world doubts you."}

Soundtrack & Acoustic Worship Atmosphere: "${songTitle}" by ${p.name} (${p.handle}).
When you combine unstoppable perseverance with faith in God, no obstacle can defeat you. Through prayer, worship, and scripture, God restores your strength and renews your spirit after every battle.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎧 STREAM ${p.name.toUpperCase()} ON ALL 8 PLATFORMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${linksBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${p.salvationPrayerTitle}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${p.salvationPrayerScripture}

${p.salvationPrayerText}

${p.salvationPrayerNextSteps}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 HIGH-RANKING SEARCH KEYWORDS:
${cleanKeywords}${cleanKeywords ? ', ' : ''}${p.name}, Breathing Again, Christian Warrior, Gospel Music, Acoustic Worship, Prayer of Salvation, Faith Motivation

🏷️ HASHTAGS:
#${p.name.replace(/\s+/g, '')} #BreathingAgain #ChristianMotivation #Faith #Inspiration #JesusSaves ${viralHashtags}

© 2026 ${p.name}. All rights reserved.`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Multi-Tenant User Profile Persistence & API Keys (BYOK)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ApiKeysConfig {
  pexelsApiKey: string;
  openaiWhisperKey: string;
  geminiApiKey?: string;
}

const CREATOR_PROFILE_KEY = 'veo_saved_creator_profile_v1';
const API_KEYS_CONFIG_KEY = 'veo_saved_api_keys_config_v1';

export function loadSavedCreatorProfile(): CreatorProfile {
  try {
    const saved = localStorage.getItem(CREATOR_PROFILE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.name && parsed.streamingLinks) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading creator profile from storage:', err);
  }
  return JAMES_USSERY_PROFILE;
}

export function saveCreatorProfile(profile: CreatorProfile): void {
  try {
    localStorage.setItem(CREATOR_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving creator profile:', err);
  }
}

export function loadApiKeysConfig(): ApiKeysConfig {
  try {
    const saved = localStorage.getItem(API_KEYS_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        pexelsApiKey: parsed.pexelsApiKey || '',
        openaiWhisperKey: parsed.openaiWhisperKey || '',
        geminiApiKey: parsed.geminiApiKey || '',
      };
    }
  } catch (err) {
    console.error('Error loading API keys config:', err);
  }
  return {
    pexelsApiKey: '',
    openaiWhisperKey: '',
    geminiApiKey: '',
  };
}

export function saveApiKeysConfig(config: ApiKeysConfig): void {
  try {
    localStorage.setItem(API_KEYS_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving API keys config:', err);
  }
}



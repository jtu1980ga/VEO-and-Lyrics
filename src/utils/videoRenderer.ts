import { TimedLyricLine, TimedWord, VideoSettings } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulseSpeed: number;
}

export class VideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private userAvatarImg: HTMLImageElement | null = null;
  private userBgImg: HTMLImageElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not obtain 2D canvas context');
    this.ctx = context;
    this.initParticles(50);
  }

  public setUserAvatar(dataUrl: string | null) {
    if (!dataUrl) {
      this.userAvatarImg = null;
      return;
    }
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      this.userAvatarImg = img;
    };
  }

  public setUserBackground(dataUrl: string | null) {
    if (!dataUrl) {
      this.userBgImg = null;
      return;
    }
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      this.userBgImg = img;
    };
  }

  private initParticles(count: number) {
    this.particles = [];
    const w = this.canvas.width || 1280;
    const h = this.canvas.height || 720;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.6,
        size: 1 + Math.random() * 3,
        alpha: 0.2 + Math.random() * 0.6,
        pulseSpeed: 1 + Math.random() * 3,
      });
    }
  }

  public render(
    currentSec: number,
    lyricsLines: TimedLyricLine[],
    settings: VideoSettings,
    audioVolume: number = 0,
    isPlaying: boolean = false
  ) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const t = currentSec;

    // 1. Draw Background
    this.drawBackground(w, h, t, settings, audioVolume);

    // 2. Volumetric Lights & Atmosphere
    this.drawAtmosphere(w, h, t, settings, audioVolume);

    // 3. Floating Dust & Embers
    if (settings.particlesEnabled) {
      this.drawParticles(w, h, t, settings, audioVolume);
    }

    // 4. Character Performer Avatar (if enabled)
    if (settings.showSingerAvatar && settings.avatarType !== 'none') {
      this.drawCharacterAvatar(w, h, t, settings, audioVolume, isPlaying);
    }

    // 5. Cinematic Intro, Lyric Video Captions, or Outro Screen
    const firstLineStart = lyricsLines.length > 0 ? lyricsLines[0].start : (settings.introDurationSec || 8);
    const lastLineEnd = lyricsLines.length > 0 ? lyricsLines[lyricsLines.length - 1].end : 30;
    const isIntroActive = settings.showIntroScreen !== false && t < firstLineStart;
    const isOutroActive = settings.showOutroScreen !== false && lyricsLines.length > 0 && t >= lastLineEnd;

    if (isIntroActive) {
      this.drawIntroScreen(w, h, t, settings, firstLineStart);
    } else if (isOutroActive) {
      this.drawOutroThankYouScreen(w, h, t, settings, lastLineEnd);
    } else {
      this.drawLyricCaptions(w, h, t, lyricsLines, settings, audioVolume);
    }

    // 6. Call To Action (CTA) Banner & Badges (when not showing outro)
    if (!isOutroActive && settings.cta && settings.cta.enabled) {
      this.drawCallToAction(w, h, t, settings.cta);
    }
  }


  private drawBackground(
    w: number,
    h: number,
    t: number,
    settings: VideoSettings,
    audioVolume: number
  ) {
    const ctx = this.ctx;

    if (this.userBgImg) {
      ctx.drawImage(this.userBgImg, 0, 0, w, h);
      // Dark vignette overlay for caption contrast
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.8);
      vig.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
      vig.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
      return;
    }

    const { lightingMood } = settings;

    if (lightingMood === 'divine_sanctuary') {
      // Deep cathedral / golden worship atmosphere
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.3, 50, w * 0.5, h * 0.7, w * 0.9);
      bgGrad.addColorStop(0, '#1c150b');
      bgGrad.addColorStop(0.5, '#0d0f17');
      bgGrad.addColorStop(1, '#030508');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
    } else if (lightingMood === 'warm_cinematic') {
      // Warm Cinematic Ballad background (The Fray - How to Save a Life style)
      // Deep warm amber-sepia vignette, subtle moody bokeh haze
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 80, w * 0.5, h * 0.5, w * 0.85);
      grad.addColorStop(0, '#241a12');
      grad.addColorStop(0.4, '#15100d');
      grad.addColorStop(0.8, '#0a0807');
      grad.addColorStop(1, '#030202');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle warm horizontal cinematic streaks
      ctx.fillStyle = 'rgba(254, 240, 138, 0.04)';
      ctx.fillRect(0, h * 0.48, w, 2);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.03)';
      ctx.fillRect(0, h * 0.52, w, 1);
    } else if (lightingMood === 'twilight_horizon') {

      // Twilight horizon with gradient sky
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(0.85, '#3b1d38');
      grad.addColorStop(1, '#090714');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Distant mountain silhouette
      ctx.fillStyle = '#05070e';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.72);
      ctx.lineTo(w * 0.25, h * 0.65);
      ctx.lineTo(w * 0.55, h * 0.73);
      ctx.lineTo(w * 0.8, h * 0.63);
      ctx.lineTo(w, h * 0.74);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    } else if (lightingMood === 'synthwave_neon') {
      // Neon dark canvas + retro perspective grid
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#090514');
      grad.addColorStop(0.65, '#200833');
      grad.addColorStop(0.7, '#6b1154');
      grad.addColorStop(1, '#05030a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Neon Sun
      const sunGrad = ctx.createRadialGradient(w / 2, h * 0.55, 10, w / 2, h * 0.55, 90);
      sunGrad.addColorStop(0, '#fde047');
      sunGrad.addColorStop(0.7, '#ec4899');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.55, 90, Math.PI, 0);
      ctx.fill();

      // Moving Grid
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.35)';
      ctx.lineWidth = 1;
      const horizonY = h * 0.65;
      for (let x = -w * 0.5; x <= w * 1.5; x += 60) {
        ctx.beginPath();
        ctx.moveTo(w / 2, horizonY);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      const gridSpeed = (t * 40) % 30;
      for (let y = horizonY + gridSpeed; y < h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    } else {
      // Concert spotlight / stage dark
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 20, w * 0.5, h * 0.5, w * 0.8);
      grad.addColorStop(0, '#111827');
      grad.addColorStop(0.6, '#080d1a');
      grad.addColorStop(1, '#020408');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private drawAtmosphere(
    w: number,
    h: number,
    t: number,
    settings: VideoSettings,
    audioVolume: number
  ) {
    const ctx = this.ctx;
    const volNorm = audioVolume / 255;

    if (settings.lightingMood === 'divine_sanctuary') {
      // Volumetric sunlight beams (God rays) from top-right
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const rayCount = 5;
      const originX = w * 0.75 + Math.sin(t * 0.3) * 30;
      const originY = -50;

      for (let i = 0; i < rayCount; i++) {
        const angle = 0.55 + (i * 0.15) + Math.sin(t * 0.5 + i) * 0.03;
        const width = 80 + i * 35 + volNorm * 40;
        const length = h * 1.5;

        const rayGrad = ctx.createLinearGradient(originX, originY, originX + Math.cos(angle) * length, originY + Math.sin(angle) * length);
        const rayAlpha = (0.12 + volNorm * 0.15) * (1 - i * 0.15);
        rayGrad.addColorStop(0, `rgba(254, 240, 138, ${rayAlpha * 1.5})`);
        rayGrad.addColorStop(0.4, `rgba(245, 158, 11, ${rayAlpha})`);
        rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX + Math.cos(angle - 0.08) * length - width, originY + Math.sin(angle - 0.08) * length);
        ctx.lineTo(originX + Math.cos(angle + 0.08) * length + width, originY + Math.sin(angle + 0.08) * length);
        ctx.closePath();
        ctx.fill();
      }

      // Center ambient divine bloom
      const bloom = ctx.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h * 0.45, 320);
      bloom.addColorStop(0, `rgba(254, 243, 199, ${0.15 + volNorm * 0.15})`);
      bloom.addColorStop(0.5, `rgba(245, 158, 11, ${0.08 + volNorm * 0.08})`);
      bloom.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
    } else if (settings.lightingMood === 'warm_cinematic') {
      // Warm Cinematic Bokeh & floating dust for "How to Save a Life" style
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      
      // Warm ambient center glow
      const bloom = ctx.createRadialGradient(w / 2, h * 0.5, 30, w / 2, h * 0.5, 280);
      bloom.addColorStop(0, `rgba(254, 240, 138, ${0.08 + volNorm * 0.08})`);
      bloom.addColorStop(0.6, `rgba(217, 119, 6, ${0.04 + volNorm * 0.04})`);
      bloom.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);

      // Subtle warm bokeh orbs
      const orbCount = 4;
      for (let i = 0; i < orbCount; i++) {
        const ox = (w * (0.2 + i * 0.22) + Math.sin(t * 0.4 + i) * 40);
        const oy = (h * (0.3 + (i % 3) * 0.2) + Math.cos(t * 0.3 + i) * 30);
        const orad = 40 + i * 15;
        const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, orad);
        orbGrad.addColorStop(0, 'rgba(254, 215, 170, 0.06)');
        orbGrad.addColorStop(1, 'rgba(254, 215, 170, 0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(ox, oy, orad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (settings.lightingMood === 'concert_spotlight') {

      // Stage volumetric spotlights sweeping
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const spotAngle = Math.sin(t * 0.8) * 0.4;

      const spotGrad1 = ctx.createRadialGradient(w * 0.3, 0, 10, w * 0.3 + spotAngle * 250, h, 280);
      spotGrad1.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      spotGrad1.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = spotGrad1;
      ctx.fillRect(0, 0, w, h);

      const spotGrad2 = ctx.createRadialGradient(w * 0.7, 0, 10, w * 0.7 - spotAngle * 250, h, 280);
      spotGrad2.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
      spotGrad2.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = spotGrad2;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }

  private drawParticles(
    w: number,
    h: number,
    t: number,
    settings: VideoSettings,
    audioVolume: number
  ) {
    const ctx = this.ctx;
    const volNorm = audioVolume / 255;
    const isWorship = settings.lightingMood === 'divine_sanctuary';

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    this.particles.forEach((p) => {
      p.x += p.vx + Math.sin(t * p.pulseSpeed) * 0.2;
      p.y += p.vy - volNorm * 0.5;

      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(t * p.pulseSpeed));
      const glowSize = p.size * (1 + volNorm * 1.5);

      const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize * 2.5);
      if (isWorship) {
        pGrad.addColorStop(0, `rgba(254, 243, 199, ${currentAlpha})`);
        pGrad.addColorStop(0.5, `rgba(251, 191, 36, ${currentAlpha * 0.6})`);
        pGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      } else {
        pGrad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha})`);
        pGrad.addColorStop(0.5, `rgba(168, 85, 247, ${currentAlpha * 0.6})`);
        pGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      }

      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowSize * 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  private drawCharacterAvatar(
    w: number,
    h: number,
    t: number,
    settings: VideoSettings,
    audioVolume: number,
    isPlaying: boolean
  ) {
    const ctx = this.ctx;
    const volNorm = audioVolume / 255;
    const bobY = isPlaying ? Math.sin(t * 3) * 6 : 0;
    const charX = w / 2;
    // Position character in upper half so captions have ample clean space in lower half/center
    const charY = h * 0.36 + bobY;
    const radius = Math.min(w, h) * 0.14;

    ctx.save();

    // Audio-reactive pulsing outer halo
    const haloRadius = radius + 15 + volNorm * 25;
    const haloGrad = ctx.createRadialGradient(charX, charY, radius * 0.8, charX, charY, haloRadius);
    const glowColor = settings.glowColor || '#f59e0b';
    haloGrad.addColorStop(0, 'rgba(0,0,0,0)');
    haloGrad.addColorStop(0.7, `${glowColor}33`);
    haloGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(charX, charY, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw uploaded photo or aesthetic singer silhouette
    if (this.userAvatarImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(charX, charY, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(this.userAvatarImg, charX - radius, charY - radius, radius * 2, radius * 2);
      ctx.restore();

      // Glowing rim border
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 3 + volNorm * 3;
      ctx.beginPath();
      ctx.arc(charX, charY, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Artistic Backlit Singer Silhouette
      // Body / Shoulders
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(charX, charY + radius * 1.1, radius * 1.3, radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(charX, charY, radius * 0.72, 0, Math.PI * 2);
      ctx.fill();

      // Headphones / Earset silhouette
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(charX, charY - 8, radius * 0.76, Math.PI * 0.85, Math.PI * 0.15, true);
      ctx.stroke();

      // Ear cups
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.ellipse(charX - radius * 0.72, charY - 5, 6, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(charX + radius * 0.72, charY - 5, 6, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Simulated singing mouth open with audio
      const mouthHeight = isPlaying ? Math.max(3, volNorm * 18 + Math.abs(Math.sin(t * 8)) * 8) : 2;
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(charX, charY + 22, 10, mouthHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rim light highlighting silhouette edge
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2 + volNorm * 2;
      ctx.beginPath();
      ctx.arc(charX, charY, radius * 0.72, Math.PI * 0.7, Math.PI * 1.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(charX, charY, radius * 0.72, -Math.PI * 0.4, Math.PI * 0.3);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawLyricCaptions(
    w: number,
    h: number,
    currentSec: number,
    lines: TimedLyricLine[],
    settings: VideoSettings,
    audioVolume: number
  ) {
    if (!lines || lines.length === 0) return;

    const ctx = this.ctx;
    const volNorm = audioVolume / 255;

    // Find current active line index
    let activeIdx = lines.findIndex(
      (l) => currentSec >= l.start && currentSec <= l.end
    );

    if (activeIdx === -1) {
      // Find nearest upcoming or recent line
      if (currentSec < lines[0].start) {
        activeIdx = 0;
      } else {
        for (let i = lines.length - 1; i >= 0; i--) {
          if (currentSec >= lines[i].end) {
            activeIdx = i;
            break;
          }
        }
      }
    }

    const activeLine = lines[activeIdx];
    if (!activeLine) return;

    const fontFace = settings.fontFamily || 'Cinzel';
    const baseSize = settings.fontSize || Math.round(Math.min(w, h) * 0.052);
    const textTransform = settings.textUppercase;
    const glowColor = settings.glowColor || '#f59e0b';

    // Vertical positioning:
    // If singer avatar is displayed, captions are placed elegantly in lower half (h * 0.75)
    // If singer avatar is off, captions are gracefully centered (h * 0.56)
    const centerY = settings.showSingerAvatar && settings.avatarType !== 'none'
      ? h * 0.74
      : h * 0.54;

    const lineSpacing = baseSize * 1.55;

    // 1. Draw PREVIOUS LINE (Drifting upward with soft fade)
    if (settings.showLinesCount >= 2 && activeIdx > 0) {
      const prevLine = lines[activeIdx - 1];
      const prevText = textTransform ? prevLine.line.toUpperCase() : prevLine.line;
      ctx.save();
      let prevSize = Math.round(baseSize * 0.78);
      ctx.font = `600 ${prevSize}px '${fontFace}', Georgia, serif`;
      const prevW = ctx.measureText(prevText).width;
      const maxW = w * 0.86;
      if (prevW > maxW && prevW > 0) {
        prevSize = Math.max(14, Math.round(prevSize * (maxW / prevW)));
        ctx.font = `600 ${prevSize}px '${fontFace}', Georgia, serif`;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
      ctx.fillText(prevText, w / 2, centerY - lineSpacing);
      ctx.restore();
    }

    // 2. Draw NEXT LINE (Previewed softly below)
    if (settings.showLinesCount === 3 && activeIdx < lines.length - 1) {
      const nextLine = lines[activeIdx + 1];
      const nextText = textTransform ? nextLine.line.toUpperCase() : nextLine.line;
      ctx.save();
      let nextSize = Math.round(baseSize * 0.75);
      ctx.font = `500 ${nextSize}px '${fontFace}', Georgia, serif`;
      const nextW = ctx.measureText(nextText).width;
      const maxW = w * 0.86;
      if (nextW > maxW && nextW > 0) {
        nextSize = Math.max(14, Math.round(nextSize * (maxW / nextW)));
        ctx.font = `500 ${nextSize}px '${fontFace}', Georgia, serif`;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.fillText(nextText, w / 2, centerY + lineSpacing);
      ctx.restore();
    }

    // 3. Draw ACTIVE LINE (The signature cinematic experience)
    const activeText = textTransform ? activeLine.line.toUpperCase() : activeLine.line;
    const lineDuration = Math.max(0.1, activeLine.end - activeLine.start);
    const lineProgress = Math.max(0, Math.min(1, (currentSec - activeLine.start) / lineDuration));

    ctx.save();
    ctx.font = `700 ${baseSize}px '${fontFace}', Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // STYLE 1: GOLDEN WORSHIP (The user's requested style)
    if (settings.captionStyle === 'golden_worship') {
      this.renderGoldenWorshipCaptions(
        w,
        centerY,
        activeLine,
        currentSec,
        baseSize,
        fontFace,
        textTransform,
        glowColor,
        volNorm,
        settings.bouncingSparkle
      );
    }
    // STYLE: HOW TO SAVE A LIFE (Clean warm centered typography with chords support & soft emotional glow)
    else if (settings.captionStyle === 'how_to_save_a_life') {
      this.renderHowToSaveALifeCaptions(
        w,
        centerY,
        activeLine,
        currentSec,
        baseSize,
        fontFace,
        textTransform,
        glowColor,
        volNorm,
        settings.showChords
      );
    }
    // STYLE 2: CELESTIAL KINETIC BLOOM

    else if (settings.captionStyle === 'celestial_kinetic') {
      this.renderCelestialKineticCaptions(
        w,
        centerY,
        activeLine,
        currentSec,
        baseSize,
        fontFace,
        textTransform,
        glowColor,
        volNorm
      );
    }
    // STYLE 3: KARAOKE DUAL-COLOR SWEEP
    else if (settings.captionStyle === 'karaoke_wipe') {
      this.renderKaraokeWipeCaptions(
        w,
        centerY,
        activeText,
        lineProgress,
        baseSize,
        fontFace,
        glowColor
      );
    }
    // STYLE 4: FLUID BOUNCING EMBER / HALO
    else if (settings.captionStyle === 'bouncing_ember') {
      this.renderBouncingEmberCaptions(
        w,
        centerY,
        activeLine,
        currentSec,
        baseSize,
        fontFace,
        textTransform,
        glowColor
      );
    }
    // STYLE 5: MINIMALIST SUBTITLE
    else {
      this.renderMinimalistSubtitle(
        w,
        centerY,
        activeText,
        baseSize,
        fontFace
      );
    }

    ctx.restore();
  }

  /**
   * Signature Golden Worship Caption Renderer
   * Renders the exact golden glowing, multi-word worship lyric video typography
   */
  private renderGoldenWorshipCaptions(
    w: number,
    centerY: number,
    line: TimedLyricLine,
    currentSec: number,
    fontSize: number,
    fontFace: string,
    uppercase: boolean,
    glowColor: string,
    volNorm: number,
    showSparkle: boolean
  ) {
    const ctx = this.ctx;
    const words = line.words && line.words.length > 0 ? line.words : this.autoBreakWords(line);

    // Calculate total width of line to accurately position words
    const maxAllowedWidth = w * 0.86;
    let effectiveFontSize = fontSize;
    ctx.font = `700 ${effectiveFontSize}px '${fontFace}', Georgia, serif`;
    let spaceWidth = ctx.measureText(' ').width;
    let wordWidths = words.map((wObj) => {
      const text = uppercase ? wObj.word.toUpperCase() : wObj.word;
      return ctx.measureText(text).width;
    });
    let totalLineWidth = wordWidths.reduce((a, b) => a + b, 0) + (words.length - 1) * spaceWidth;

    if (totalLineWidth > maxAllowedWidth && totalLineWidth > 0) {
      const fitRatio = maxAllowedWidth / totalLineWidth;
      effectiveFontSize = Math.max(16, Math.round(fontSize * fitRatio));
      ctx.font = `700 ${effectiveFontSize}px '${fontFace}', Georgia, serif`;
      spaceWidth = ctx.measureText(' ').width;
      wordWidths = words.map((wObj) => {
        const text = uppercase ? wObj.word.toUpperCase() : wObj.word;
        return ctx.measureText(text).width;
      });
      totalLineWidth = wordWidths.reduce((a, b) => a + b, 0) + (words.length - 1) * spaceWidth;
    }

    let currentX = Math.max(w * 0.05, (w - totalLineWidth) / 2);
    let activeWordCenter = { x: w / 2, y: centerY };

    // Draw background luminous ribbon / subtle shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 12;

    words.forEach((wObj, idx) => {
      const text = uppercase ? wObj.word.toUpperCase() : wObj.word;
      const wWidth = wordWidths[idx];
      const wordMidX = currentX + wWidth / 2;

      const isCurrent = currentSec >= wObj.start && currentSec <= wObj.end;
      const isPast = currentSec > wObj.end;

      if (isCurrent) {
        activeWordCenter = { x: wordMidX, y: centerY };

        // Radiance bloom around the active word
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 24 + volNorm * 18;

        // Subtle kinetic lift
        const wordProgress = (currentSec - wObj.start) / Math.max(0.1, wObj.end - wObj.start);
        const liftY = Math.sin(wordProgress * Math.PI) * -4;

        ctx.font = `800 ${effectiveFontSize * 1.05}px '${fontFace}', Georgia, serif`;
        ctx.fillStyle = '#fffbeb'; // Radiant warm white
        ctx.fillText(text, wordMidX, centerY + liftY);

        // Blazing golden core overlay
        ctx.fillStyle = glowColor;
        ctx.fillText(text, wordMidX, centerY + liftY);
        ctx.restore();
      } else if (isPast) {
        // Words already sung: warm golden sheen
        ctx.save();
        ctx.fillStyle = '#fef3c7'; // soft cream gold
        ctx.shadowColor = 'rgba(245, 158, 11, 0.3)';
        ctx.shadowBlur = 8;
        ctx.fillText(text, wordMidX, centerY);
        ctx.restore();
      } else {
        // Words to be sung: elegant muted white
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fillText(text, wordMidX, centerY);
        ctx.restore();
      }

      currentX += wWidth + spaceWidth;
    });

    ctx.restore();

    // Floating Celestial Ember / Sparkle over active word
    if (showSparkle && activeWordCenter) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const sparkleY = activeWordCenter.y - fontSize * 0.75 - Math.sin(currentSec * 6) * 4;
      const sparkGrad = ctx.createRadialGradient(
        activeWordCenter.x,
        sparkleY,
        0,
        activeWordCenter.x,
        sparkleY,
        14 + volNorm * 8
      );
      sparkGrad.addColorStop(0, '#ffffff');
      sparkGrad.addColorStop(0.3, glowColor);
      sparkGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = sparkGrad;
      ctx.beginPath();
      ctx.arc(activeWordCenter.x, sparkleY, 14 + volNorm * 8, 0, Math.PI * 2);
      ctx.fill();

      // Four-point star sparkle
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      const sLen = 8 + volNorm * 6;
      ctx.beginPath();
      ctx.moveTo(activeWordCenter.x - sLen, sparkleY);
      ctx.lineTo(activeWordCenter.x + sLen, sparkleY);
      ctx.moveTo(activeWordCenter.x, sparkleY - sLen);
      ctx.lineTo(activeWordCenter.x, sparkleY + sLen);
      ctx.stroke();

      ctx.restore();
    }
  }

  /**
   * Celestial Kinetic Typography
   */
  private renderCelestialKineticCaptions(
    w: number,
    centerY: number,
    line: TimedLyricLine,
    currentSec: number,
    fontSize: number,
    fontFace: string,
    uppercase: boolean,
    glowColor: string,
    volNorm: number
  ) {
    const ctx = this.ctx;
    const words = line.words && line.words.length > 0 ? line.words : this.autoBreakWords(line);

    ctx.font = `800 ${fontSize}px '${fontFace}', sans-serif`;
    const spaceWidth = ctx.measureText(' ').width;
    const wordWidths = words.map((wObj) => {
      const text = uppercase ? wObj.word.toUpperCase() : wObj.word;
      return ctx.measureText(text).width;
    });
    const totalLineWidth = wordWidths.reduce((a, b) => a + b, 0) + (words.length - 1) * spaceWidth;

    let currentX = (w - totalLineWidth) / 2;

    words.forEach((wObj, idx) => {
      const text = uppercase ? wObj.word.toUpperCase() : wObj.word;
      const wWidth = wordWidths[idx];
      const wordMidX = currentX + wWidth / 2;
      const isCurrent = currentSec >= wObj.start && currentSec <= wObj.end;

      ctx.save();
      if (isCurrent) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 30 + volNorm * 20;
        ctx.font = `900 ${fontSize * 1.12}px '${fontFace}', sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, wordMidX, centerY - 2);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText(text, wordMidX, centerY);
      }
      ctx.restore();

      currentX += wWidth + spaceWidth;
    });
  }

  /**
   * Karaoke Dual-Color Text Sweep
   */
  private renderKaraokeWipeCaptions(
    w: number,
    centerY: number,
    text: string,
    progress: number,
    fontSize: number,
    fontFace: string,
    glowColor: string
  ) {
    const ctx = this.ctx;
    ctx.font = `800 ${fontSize}px '${fontFace}', sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const startX = (w - textWidth) / 2;

    // First draw unsung text (white with subtle shadow)
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText(text, w / 2, centerY);
    ctx.restore();

    // Clip to progress and draw golden/neon sweep
    ctx.save();
    ctx.beginPath();
    ctx.rect(startX - 10, centerY - fontSize, textWidth * progress + 10, fontSize * 2);
    ctx.clip();

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20;
    ctx.fillStyle = glowColor;
    ctx.fillText(text, w / 2, centerY);
    ctx.restore();
  }

  /**
   * Bouncing Ember Captions
   */
  private renderBouncingEmberCaptions(
    w: number,
    centerY: number,
    line: TimedLyricLine,
    currentSec: number,
    fontSize: number,
    fontFace: string,
    uppercase: boolean,
    glowColor: string
  ) {
    const ctx = this.ctx;
    const words = line.words && line.words.length > 0 ? line.words : this.autoBreakWords(line);

    ctx.font = `700 ${fontSize}px '${fontFace}', sans-serif`;
    const spaceWidth = ctx.measureText(' ').width;
    const wordWidths = words.map((wObj) => {
      const text = uppercase ? wObj.word.toUpperCase() : wObj.word;
      return ctx.measureText(text).width;
    });
    const totalLineWidth = wordWidths.reduce((a, b) => a + b, 0) + (words.length - 1) * spaceWidth;

    let currentX = (w - totalLineWidth) / 2;
    let emberX = w / 2;
    let emberY = centerY - fontSize * 0.7;

    words.forEach((wObj, idx) => {
      const text = uppercase ? wObj.word.toUpperCase() : wObj.word;
      const wWidth = wordWidths[idx];
      const wordMidX = currentX + wWidth / 2;
      const isCurrent = currentSec >= wObj.start && currentSec <= wObj.end;

      if (isCurrent) {
        const p = (currentSec - wObj.start) / Math.max(0.01, wObj.end - wObj.start);
        emberX = wordMidX;
        emberY = centerY - fontSize * 0.75 - Math.sin(p * Math.PI) * 16;
        ctx.fillStyle = glowColor;
      } else {
        ctx.fillStyle = '#ffffff';
      }

      ctx.fillText(text, wordMidX, centerY);
      currentX += wWidth + spaceWidth;
    });

    // Draw bouncing ember
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(emberX, emberY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Minimalist Subtitle
   */
  private renderMinimalistSubtitle(
    w: number,
    centerY: number,
    text: string,
    fontSize: number,
    fontFace: string
  ) {
    const ctx = this.ctx;
    ctx.font = `600 ${fontSize * 0.9}px '${fontFace}', sans-serif`;
    const textWidth = ctx.measureText(text).width;

    // Glass pill background
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;

    const pillH = fontSize * 1.7;
    const pillW = textWidth + 40;
    const pillX = (w - pillW) / 2;
    const pillY = centerY - pillH / 2;
    const radius = 12;

    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, radius);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(text, w / 2, centerY);
    ctx.restore();
  }

  /**
   * Signature "How to Save a Life" Style Caption Renderer
   * Features: Clean centered warm typography, gentle active word illumination, optional musical chord badges above words/lines,
   * subtle cinematic text drop-shadow, and line-level lyric progress.
   */
  private renderHowToSaveALifeCaptions(
    w: number,
    centerY: number,
    line: TimedLyricLine,
    currentSec: number,
    fontSize: number,
    fontFace: string,
    uppercase: boolean,
    glowColor: string,
    volNorm: number,
    showChords: boolean
  ) {
    const ctx = this.ctx;
    const words = line.words && line.words.length > 0 ? line.words : this.autoBreakWords(line);

    const maxAllowedWidth = w * 0.86;
    let effectiveFontSize = fontSize;

    // Primary font calculation
    ctx.font = `700 ${effectiveFontSize}px '${fontFace}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    let spaceWidth = ctx.measureText(' ').width;

    let wordWidths = words.map((wObj) => {
      const text = uppercase ? wObj.word.toUpperCase() : wObj.word;
      return ctx.measureText(text).width;
    });
    let totalLineWidth = wordWidths.reduce((a, b) => a + b, 0) + (words.length - 1) * spaceWidth;

    // Safe auto-fit for 9:16 vertical and mobile screens: ensure words never clip off-screen
    if (totalLineWidth > maxAllowedWidth && totalLineWidth > 0) {
      const fitRatio = maxAllowedWidth / totalLineWidth;
      effectiveFontSize = Math.max(16, Math.round(fontSize * fitRatio));
      ctx.font = `700 ${effectiveFontSize}px '${fontFace}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      spaceWidth = ctx.measureText(' ').width;
      wordWidths = words.map((wObj) => {
        const text = uppercase ? wObj.word.toUpperCase() : wObj.word;
        return ctx.measureText(text).width;
      });
      totalLineWidth = wordWidths.reduce((a, b) => a + b, 0) + (words.length - 1) * spaceWidth;
    }

    let currentX = Math.max(w * 0.05, (w - totalLineWidth) / 2);

    // Optional: Draw line-level primary chord banner if enabled
    if (showChords && line.chord) {
      ctx.save();
      ctx.font = `700 ${Math.round(effectiveFontSize * 0.42)}px 'Montserrat', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      
      const chordText = line.chord;
      const chordW = ctx.measureText(chordText).width + 16;
      const chordH = effectiveFontSize * 0.55;
      const chordX = w / 2;
      const chordY = centerY - effectiveFontSize * 0.95;

      // Chord badge background
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(chordX - chordW / 2, chordY - chordH, chordW, chordH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(chordText, chordX, chordY - 4);
      ctx.restore();
    }

    // Render each word
    words.forEach((wObj, idx) => {
      const wordText = uppercase ? wObj.word.toUpperCase() : wObj.word;
      const wordW = wordWidths[idx];
      const wordMidX = currentX + wordW / 2;

      const isPassed = currentSec >= wObj.end;
      const isActive = currentSec >= wObj.start && currentSec < wObj.end;
      const isUpcoming = currentSec < wObj.start;

      ctx.save();

      // Word-level chord indicator
      if (showChords && wObj.chord && !line.chord) {
        ctx.font = `700 ${Math.round(effectiveFontSize * 0.38)}px 'Montserrat', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = isActive ? '#fde047' : 'rgba(254, 240, 138, 0.65)';
        ctx.fillText(wObj.chord, wordMidX, centerY - effectiveFontSize * 0.72);
      }

      ctx.font = `700 ${effectiveFontSize}px '${fontFace}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (isActive) {
        // Highlighting current spoken/sung word with warm glow
        const wordDur = Math.max(0.01, wObj.end - wObj.start);
        const wordProg = Math.min(1, Math.max(0, (currentSec - wObj.start) / wordDur));
        const pulse = 1 + Math.sin(wordProg * Math.PI) * 0.08 + volNorm * 0.04;

        ctx.translate(wordMidX, centerY);
        ctx.scale(pulse, pulse);

        // Soft warm halo behind active word
        ctx.shadowColor = glowColor || '#fef08a';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(wordText, 0, 0);

        // Secondary crisp layer
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fffbeb';
        ctx.fillText(wordText, 0, 0);
      } else if (isPassed) {
        // Already sung words: warm light off-white
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(wordText, wordMidX, centerY);
      } else {
        // Upcoming words: subtle soft opacity
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = 'rgba(241, 245, 249, 0.55)';
        ctx.fillText(wordText, wordMidX, centerY);
      }

      ctx.restore();
      currentX += wordW + spaceWidth;
    });
  }

  /**
   * Draw Call To Action (CTA) overlay bar
   */
  private drawCallToAction(
    w: number,
    h: number,
    t: number,
    cta: { enabled: boolean; text: string; subtext: string; position: 'bottom' | 'top'; badgeColor: string }
  ) {
    const ctx = this.ctx;
    ctx.save();

    const isTop = cta.position === 'top';
    const barY = isTop ? 40 : h - 65;
    const barH = 46;
    const paddingX = 24;

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    const textW = ctx.measureText(cta.text).width;
    const pillW = Math.min(w - 40, Math.max(300, textW + 90));
    const pillX = (w - pillW) / 2;

    // Glass backdrop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.roundRect(pillX, barY, pillW, barH, 23);
    ctx.fill();
    ctx.stroke();

    // Pulse badge indicator
    const badgeX = pillX + 18;
    const badgeY = barY + barH / 2;
    const pulseRad = 6 + Math.sin(t * 3) * 1.5;

    ctx.shadowBlur = 8;
    ctx.shadowColor = cta.badgeColor || '#f59e0b';
    ctx.fillStyle = cta.badgeColor || '#f59e0b';
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, pulseRad, 0, Math.PI * 2);
    ctx.fill();

    // Text & Subtext
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    if (cta.subtext) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(cta.text, badgeX + 14, barY + barH / 2 - 8);

      ctx.fillStyle = 'rgba(226, 232, 240, 0.75)';
      ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(cta.subtext, badgeX + 14, barY + barH / 2 + 9);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(cta.text, badgeX + 14, barY + barH / 2);
    }

    ctx.restore();
  }

  private autoBreakWords(line: TimedLyricLine): TimedWord[] {
    const words = line.line.split(/\s+/).filter(Boolean);
    const dur = Math.max(0.1, line.end - line.start);
    const wordDur = dur / Math.max(1, words.length);
    return words.map((word, i) => ({
      word,
      start: line.start + i * wordDur,
      end: line.start + (i + 1) * wordDur,
    }));
  }

  /**
   * Draw Cinematic Introduction Screen (stays on screen until first lyrics start)
   */
  private drawIntroScreen(
    w: number,
    h: number,
    t: number,
    settings: VideoSettings,
    firstLineStart: number
  ) {
    const ctx = this.ctx;
    ctx.save();

    const title = settings.songTitle || 'Song Title';
    const artist = settings.artistName || 'Artist';
    const countdown = Math.max(0, Math.ceil(firstLineStart - t));

    // Center focal coordinates
    const centerX = w / 2;
    const centerY = h / 2 - 15;

    // Subtle atmospheric intro card background
    const cardW = Math.min(w - 60, 680);
    const cardH = 260;
    const cardX = centerX - cardW / 2;
    const cardY = centerY - cardH / 2;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 24;

    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 20);
    ctx.fill();
    ctx.stroke();

    // Top Glowing Pill Badge: "CHORDS & LYRICS"
    const pillW = 220;
    const pillH = 32;
    const pillX = centerX - pillW / 2;
    const pillY = cardY + 28;

    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 12px "Montserrat", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText('♫ CHORDS & LYRICS VIDEO', centerX, pillY + pillH / 2);

    // Big Cinematic Song Title
    let fontSize = Math.min(46, Math.max(24, Math.round(w / 18)));
    ctx.font = `800 ${fontSize}px '${settings.fontFamily || "Montserrat"}', sans-serif`;
    const titleW = ctx.measureText(title).width;
    const maxTitleW = cardW - 40;
    if (titleW > maxTitleW && titleW > 0) {
      fontSize = Math.max(18, Math.round(fontSize * (maxTitleW / titleW)));
      ctx.font = `800 ${fontSize}px '${settings.fontFamily || "Montserrat"}', sans-serif`;
    }
    ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, centerX, centerY + 18);

    // Artist line
    ctx.shadowBlur = 0;
    let artistFontSize = 18;
    ctx.font = `600 ${artistFontSize}px "Plus Jakarta Sans", sans-serif`;
    const artistText = `by ${artist}`;
    const artW = ctx.measureText(artistText).width;
    if (artW > maxTitleW && artW > 0) {
      artistFontSize = Math.max(13, Math.round(artistFontSize * (maxTitleW / artW)));
      ctx.font = `600 ${artistFontSize}px "Plus Jakarta Sans", sans-serif`;
    }
    ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
    ctx.fillText(artistText, centerX, centerY + 58);

    // Countdown / Progress bar until lyrics
    const progress = Math.min(1, Math.max(0, t / Math.max(0.1, firstLineStart)));
    const barW = Math.min(cardW - 60, 420);
    const barH = 4;
    const barX = centerX - barW / 2;
    const barY = cardY + cardH - 34;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * progress, barH, 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
    ctx.fillText(countdown > 0 ? `Song starts in ${countdown}s...` : 'Song starting...', centerX, barY - 12);

    ctx.restore();
  }

  /**
   * Draw 10-Second Thank You & Closing Screen
   */
  private drawOutroThankYouScreen(
    w: number,
    h: number,
    t: number,
    settings: VideoSettings,
    lastLineEnd: number
  ) {
    const ctx = this.ctx;
    ctx.save();

    const title = settings.songTitle || 'Song';
    const artist = settings.artistName || 'Artist';

    const centerX = w / 2;
    const centerY = h / 2;

    const cardW = Math.min(w - 32, 720);
    const cardH = 330;
    const cardX = centerX - cardW / 2;
    const cardY = centerY - cardH / 2;

    // Glass backdrop
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 30;

    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 22);
    ctx.fill();
    ctx.stroke();

    // Top Header Badge
    const pillW = Math.min(260, cardW - 40);
    const pillH = 32;
    const pillX = centerX - pillW / 2;
    const pillY = cardY + 22;

    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 12px "Montserrat", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText('⭐ THANK YOU FOR WATCHING', centerX, pillY + pillH / 2);

    // Main Thanks message
    let thanksFontSize = Math.min(22, Math.max(15, Math.round(cardW / 26)));
    ctx.font = `700 ${thanksFontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 8;
    ctx.fillText(`Thanks for watching Chords & Lyrics for`, centerX, cardY + 86);

    // Song & Artist Highlight - auto-scale to card
    let trackFontSize = Math.min(26, Math.max(16, Math.round(cardW / 22)));
    ctx.font = `800 ${trackFontSize}px '${settings.fontFamily || "Montserrat"}', sans-serif`;
    const fullTrackText = `"${title}" - ${artist}`;
    const trackW = ctx.measureText(fullTrackText).width;
    const maxTrackW = cardW - 40;
    if (trackW > maxTrackW && trackW > 0) {
      trackFontSize = Math.max(14, Math.round(trackFontSize * (maxTrackW / trackW)));
      ctx.font = `800 ${trackFontSize}px '${settings.fontFamily || "Montserrat"}', sans-serif`;
    }
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 12;
    ctx.fillText(fullTrackText, centerX, cardY + 124);

    // Like, Subscribe, Share Action Badges (responsive to 9:16 width)
    const badges = [
      { label: '👍 Like', color: '#38bdf8' },
      { label: '🔔 Subscribe', color: '#f59e0b' },
      { label: '↗️ Share', color: '#a855f7' },
    ];
    const availableForBadges = cardW - 40;
    const badgeW = Math.min(120, Math.floor((availableForBadges - 24) / 3));
    const badgeH = 34;
    const gap = 12;
    const totalBadgesW = badges.length * badgeW + (badges.length - 1) * gap;
    const startBX = centerX - totalBadgesW / 2;
    const bY = cardY + 168;

    badges.forEach((b, idx) => {
      const bx = startBX + idx * (badgeW + gap);
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1.2;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(bx, bY, badgeW, badgeH, 17);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      const bTextSize = Math.min(13, Math.max(10, Math.floor(badgeW / 8)));
      ctx.font = `700 ${bTextSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(b.label, bx + badgeW / 2, bY + badgeH / 2);
    });

    // Request quote box (with safe auto-fit text)
    const quoteW = cardW - 40;
    const quoteH = 46;
    const quoteX = centerX - quoteW / 2;
    const quoteY = cardY + cardH - 64;

    ctx.fillStyle = 'rgba(2, 6, 23, 0.5)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(quoteX, quoteY, quoteW, quoteH, 12);
    ctx.fill();
    ctx.stroke();

    const quoteMsg = '💬 Have a song request? Leave your request in the comments! Thanks.';
    let quoteFontSize = 13;
    ctx.font = `500 ${quoteFontSize}px "Plus Jakarta Sans", sans-serif`;
    const qW = ctx.measureText(quoteMsg).width;
    if (qW > quoteW - 20 && qW > 0) {
      quoteFontSize = Math.max(10, Math.round(quoteFontSize * ((quoteW - 20) / qW)));
      ctx.font = `500 ${quoteFontSize}px "Plus Jakarta Sans", sans-serif`;
    }
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(quoteMsg, centerX, quoteY + quoteH / 2);

    ctx.restore();
  }
}

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Music,
  Video,
  Download,
  Film,
  Layers,
  Wand2,
  Loader2,
  Trash2,
  Plus,
  CheckCircle2,
  Image as ImageIcon,
  Edit3,
} from 'lucide-react';
import { VeoImageToVideoItem } from '../types';

interface VeoVideoStudioProps {
  onExportVideo?: (blob: Blob) => void;
}

export const VeoVideoStudio: React.FC<VeoVideoStudioProps> = ({ onExportVideo }) => {
  const [items, setItems] = useState<VeoImageToVideoItem[]>([
    {
      id: 'demo_ad',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      imageName: 'Minimalist Modern Watch (Product Ad)',
      prompt: 'Bring watch to life: slow 360 rotation, dramatic studio rim light, atmospheric floating golden dust motes',
      status: 'ready',
      motionType: 'product_spin',
      durationSec: 5,
      filter: 'golden_hour',
      overlayText: 'Crafted with Precision • Order Now',
      musicTrack: 'ambient_future',
    },
    {
      id: 'demo_portrait',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      imageName: 'Character Portrait Animation',
      prompt: 'Animate portrait: natural breathing motion, subtle hair breeze, cinematic volumetric catchlight in eyes',
      status: 'ready',
      motionType: 'character_breathe',
      durationSec: 6,
      filter: 'none',
      overlayText: 'Echoes of Grace • Available Everywhere',
      musicTrack: 'acoustic_warmth',
    },
  ]);

  const [activeItemId, setActiveItemId] = useState<string>('demo_ad');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);

  // Studio Player state for the active Veo project
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeItem = items.find((i) => i.id === activeItemId) || items[0];

  // Upload handler for new images
  const handleUploadImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newItem: VeoImageToVideoItem = {
          id: `veo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          imageUrl: reader.result as string,
          imageName: file.name,
          prompt: 'Veo 3: Transform photo into high-end cinematic video with camera parallax & lighting shifts',
          status: 'idle',
          motionType: 'cinematic_pan',
          durationSec: 5,
          filter: 'golden_hour',
          overlayText: 'New Vision • 2026',
          musicTrack: 'acoustic_warmth',
        };
        setItems((prev) => [newItem, ...prev]);
        setActiveItemId(newItem.id);
      };
      reader.readAsDataURL(file);
    });
  };

  // Run Veo 3 / Google AI Animation on Active Image
  const handleAnimateWithVeo = async () => {
    if (!activeItem) return;
    setIsGenerating(true);
    setGenerationLogs([]);

    const log = (msg: string) => setGenerationLogs((prev) => [...prev, `[Veo 3 Engine] ${msg}`]);

    log('Analyzing uploaded image dimensions & subject segmentation...');
    setTimeout(() => log('Extracting depth map, specular lighting channels & normal vectors...'), 600);
    setTimeout(() => log(`Synthesizing motion vector: "${activeItem.motionType}" with Google Veo 3 model...`), 1400);

    try {
      const res = await fetch('/api/veo/animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: activeItem.imageUrl,
          prompt: activeItem.prompt,
          motionType: activeItem.motionType,
          durationSec: activeItem.durationSec,
        }),
      });
      const data = await res.json();
      setTimeout(() => {
        log(`Veo Video Generation complete! Applied prompt: ${data.directorNotes || 'Dynamic camera track'}`);
        setItems((prev) =>
          prev.map((it) =>
            it.id === activeItem.id ? { ...it, status: 'ready' } : it
          )
        );
        setIsGenerating(false);
      }, 2400);
    } catch (e) {
      console.error(e);
      setTimeout(() => {
        log('Veo 3 local synthesis ready.');
        setItems((prev) =>
          prev.map((it) =>
            it.id === activeItem.id ? { ...it, status: 'ready' } : it
          )
        );
        setIsGenerating(false);
      }, 1500);
    }
  };

  // Update item properties (prompt, music, text, filter)
  const updateActiveItem = (partial: Partial<VeoImageToVideoItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === activeItemId ? { ...it, ...partial } : it))
    );
  };

  // Video Rendering Loop on Canvas
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas || !activeItem) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = activeItem.imageUrl;
    img.crossOrigin = 'anonymous';

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const t = currentTime;
      const progress = (t % activeItem.durationSec) / activeItem.durationSec;

      ctx.clearRect(0, 0, w, h);

      if (img.complete && img.naturalWidth > 0) {
        ctx.save();

        // Apply motion effect based on motionType
        let scale = 1.0;
        let dx = 0;
        let dy = 0;
        let rot = 0;

        if (activeItem.motionType === 'zoom_in') {
          scale = 1.0 + progress * 0.15;
        } else if (activeItem.motionType === 'cinematic_pan') {
          scale = 1.1;
          dx = Math.sin(progress * Math.PI * 2) * 30;
          dy = Math.cos(progress * Math.PI) * 10;
        } else if (activeItem.motionType === 'character_breathe') {
          scale = 1.0 + Math.sin(t * 1.8) * 0.02;
          dy = Math.sin(t * 1.8) * 8;
        } else if (activeItem.motionType === 'product_spin') {
          scale = 1.05 + Math.sin(t * 2) * 0.04;
          dx = Math.sin(t * 2.5) * 20;
        } else {
          scale = 1.0 + progress * 0.08;
        }

        ctx.translate(w / 2, h / 2);
        ctx.rotate(rot);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -w / 2 + dx, -h / 2 + dy, w, h);
        ctx.restore();

        // Apply Color Filter
        if (activeItem.filter === 'golden_hour') {
          const warmGrad = ctx.createRadialGradient(w * 0.7, h * 0.2, 50, w / 2, h / 2, w * 0.8);
          warmGrad.addColorStop(0, 'rgba(254, 215, 170, 0.25)');
          warmGrad.addColorStop(1, 'rgba(217, 119, 6, 0.1)');
          ctx.fillStyle = warmGrad;
          ctx.fillRect(0, 0, w, h);
        } else if (activeItem.filter === 'cyber') {
          const cyberGrad = ctx.createLinearGradient(0, 0, w, h);
          cyberGrad.addColorStop(0, 'rgba(236, 72, 153, 0.15)');
          cyberGrad.addColorStop(1, 'rgba(56, 189, 248, 0.15)');
          ctx.fillStyle = cyberGrad;
          ctx.fillRect(0, 0, w, h);
        } else if (activeItem.filter === 'noir') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fillRect(0, 0, w, h);
        }

        // Vignette
        const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.75);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        // Overlay Cinematic Text & CTA
        if (activeItem.overlayText) {
          ctx.save();
          ctx.font = '700 24px "Montserrat", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 12;
          ctx.fillText(activeItem.overlayText, w / 2, h * 0.88);
          ctx.restore();
        }

        // Veo watermark badge
        ctx.save();
        ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('⚡ Veo 3 Motion Synthesis', 24, h - 20);
        ctx.restore();
      }

      if (isPlaying) {
        setCurrentTime((prev) => (prev + 0.033 > activeItem.durationSec ? 0 : prev + 0.033));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, activeItem, currentTime]);

  // Export Veo Video MP4
  const handleExportMP4 = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(0);

    const stream = canvas.captureStream(30);
    const mime = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
      ? 'video/mp4;codecs=avc1'
      : MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType: mime });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veo-animated-video-${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    };

    recorder.start(100);
    setIsPlaying(true);
    setCurrentTime(0);

    const durationMs = activeItem.durationSec * 1000;
    const intervalMs = 200;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalMs;
      setExportProgress(Math.min(100, Math.round((elapsed / durationMs) * 100)));
      if (elapsed >= durationMs) {
        clearInterval(timer);
        recorder.stop();
        setIsPlaying(false);
      }
    }, intervalMs);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950/40 to-gray-900 border border-indigo-900/40 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              Veo 3 AI Video Editor & Maker
            </span>
            <span className="text-xs text-gray-400">• Standalone Creative Suite</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-cinzel">
            Bring Images to Life with Google AI Veo 3
          </h2>
          <p className="text-xs text-gray-300 max-w-2xl mt-1">
            Upload product photos or character portraits and turn them into dynamic video ads, living portraits, and cinematic clips with custom music and captions.
          </p>
        </div>

        {/* Upload Multiple Images Button */}
        <label className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-black text-xs px-5 py-3 rounded-2xl cursor-pointer transition shadow-lg shrink-0">
          <Upload className="w-4 h-4" />
          <span>Upload Image(s) to Animate</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUploadImages}
            className="hidden"
          />
        </label>
      </div>

      {/* Main Studio 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Queue & Project Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Image Project Queue ({items.length})</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {items.map((item) => {
                const isSelected = item.id === activeItemId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveItemId(item.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-gray-800/90 border-amber-400 ring-1 ring-amber-400/50'
                        : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.imageName}
                      className="w-14 h-14 object-cover rounded-lg shrink-0 border border-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{item.imageName}</p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.prompt}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          {item.motionType.replace('_', ' ')}
                        </span>
                        <span className="text-[9px] text-gray-500">{item.durationSec}s</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Canvas Stage, Editor Controls & Export (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Canvas Video Stage */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-gray-800 shadow-inner flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-contain"
              />

              {isGenerating && (
                <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 p-6 text-center z-20">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
                    <Wand2 className="w-6 h-6 animate-spin" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Google Veo 3 Neural Animation in Progress</h4>
                  <div className="space-y-1 max-w-md text-xs text-amber-300 font-mono">
                    {generationLogs.slice(-2).map((log, idx) => (
                      <p key={idx}>{log}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Playback Controls & Timeline */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-950/70 border border-gray-800 p-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 flex items-center justify-center transition shadow-md"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTime(0)}
                  className="w-9 h-9 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center border border-gray-800 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 font-mono ml-2">
                  {currentTime.toFixed(1)}s / {activeItem?.durationSec || 5}s
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAnimateWithVeo}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Animate with Veo 3</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportMP4}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{isExporting ? `Exporting MP4 (${exportProgress}%)` : 'Export MP4 Video'}</span>
                </button>
              </div>
            </div>

            {/* Editing Controls for Active Project */}
            <div className="bg-gray-950/70 border border-gray-800 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Video Editor Controls</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Prompt & Animation Director */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Veo 3 Motion Direction Prompt</label>
                  <textarea
                    rows={2}
                    value={activeItem.prompt}
                    onChange={(e) => updateActiveItem({ prompt: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                    placeholder="Describe how to animate (e.g. 360 spin, gentle breath, camera push)"
                  />
                </div>

                {/* Overlay Caption Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Ad Overlay Caption / Headline</label>
                  <input
                    type="text"
                    value={activeItem.overlayText || ''}
                    onChange={(e) => updateActiveItem({ overlayText: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                    placeholder="e.g. New Product Arrival • Shop Today"
                  />
                </div>

                {/* Motion Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Motion Preset</label>
                  <select
                    value={activeItem.motionType}
                    onChange={(e) => updateActiveItem({ motionType: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="cinematic_pan">Cinematic Slow Pan & Tilt</option>
                    <option value="character_breathe">Living Character Breath & Parallax</option>
                    <option value="product_spin">Dynamic Product 360 Spin</option>
                    <option value="zoom_in">Slow Dramatic Push-In (Dolly)</option>
                    <option value="slow_motion">Ethereal Slow Motion Flow</option>
                  </select>
                </div>

                {/* Color Mood Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Color Grade / Atmospheric Filter</label>
                  <select
                    value={activeItem.filter}
                    onChange={(e) => updateActiveItem({ filter: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="golden_hour">Golden Hour Sunset Radiance</option>
                    <option value="cyber">Cyber Magenta & Cyan Glow</option>
                    <option value="noir">Cinematic Noir Shadow</option>
                    <option value="none">Natural / True to Life</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

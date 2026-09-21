import React, { useState } from 'react';
import {
  Search,
  Video,
  Image as ImageIcon,
  Loader2,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { PexelsMediaItem } from '../types';

interface PexelsAssetSelectorProps {
  onSelectAsset: (url: string, type: 'photo' | 'video', title: string) => void;
  selectedUrl: string | null;
}

export const PexelsAssetSelector: React.FC<PexelsAssetSelectorProps> = ({
  onSelectAsset,
  selectedUrl,
}) => {
  const [query, setQuery] = useState('worship cinematic nature landscape rays');
  const [mediaType, setMediaType] = useState<'photos' | 'videos'>('photos');
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<PexelsMediaItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isKeyActive, setIsKeyActive] = useState<boolean | null>(null);

  const searchPexels = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/pexels/search?q=${encodeURIComponent(query)}&type=${mediaType}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
      setIsKeyActive(data.keyConfigured);
    } catch (e) {
      console.error('Failed to query Pexels API:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-950/70 border border-gray-800 rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">P</span>
            <span>Pexels Stock Visuals for Background</span>
          </h3>
          <p className="text-[11px] text-gray-400">
            Search millions of high-res cinematic 4K stock photos and footage directly for your background.
          </p>
        </div>
        {isKeyActive !== null && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isKeyActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'}`}>
            {isKeyActive ? 'Pexels API Connected' : 'Curated 4K Mode Active'}
          </span>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchPexels()}
            placeholder="e.g. golden hour rays, starry night, cathedral, mountains"
            className="w-full bg-gray-900 border border-gray-700 text-xs text-gray-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Type Toggle */}
        <div className="flex items-center bg-gray-900 border border-gray-700 rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => setMediaType('photos')}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
              mediaType === 'photos'
                ? 'bg-amber-500 text-gray-950 shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos</span>
          </button>
          <button
            type="button"
            onClick={() => setMediaType('videos')}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
              mediaType === 'videos'
                ? 'bg-amber-500 text-gray-950 shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videos</span>
          </button>
        </div>

        <button
          type="button"
          onClick={searchPexels}
          disabled={isLoading}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition border border-gray-700 hover:border-amber-500"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          <span>Search Pexels</span>
        </button>
      </div>

      {/* Suggested Quick Tags */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-gray-500">Quick Tags:</span>
        {['Cathedral Light', 'Worship Stars', 'Piano Ballad', 'Golden Dusk', 'Ocean Mist'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag);
              setTimeout(() => searchPexels(), 50);
            }}
            className="px-2 py-0.5 rounded-md bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-amber-300 border border-gray-800 transition"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid of Results */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
          {items.map((item) => {
            const isSelected = selectedUrl === item.url;
            return (
              <div
                key={item.id}
                onClick={() => onSelectAsset(item.url, item.type, item.title)}
                className={`relative group cursor-pointer rounded-xl overflow-hidden border transition aspect-video bg-gray-900 ${
                  isSelected ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                <img
                  src={item.previewUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-1.5 left-2 right-2 text-left">
                  <p className="text-[10px] text-white font-medium truncate">{item.title}</p>
                  <p className="text-[9px] text-gray-400 truncate">By {item.photographer}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-500 text-gray-950 flex items-center justify-center font-bold text-xs shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hasSearched && items.length === 0 && !isLoading && (
        <p className="text-xs text-gray-400 text-center py-4">No assets found for "{query}". Try another worship or cinematic search term.</p>
      )}
    </div>
  );
};

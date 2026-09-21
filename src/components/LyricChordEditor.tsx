import React, { useState } from 'react';
import {
  Clock,
  Music2,
  Plus,
  Trash2,
  Play,
  Sparkles,
  Volume2,
  Wand2,
  Loader2,
  CheckCircle2,
  Mic,
} from 'lucide-react';
import { TimedLyricLine, TimedWord } from '../types';

interface LyricChordEditorProps {
  lines: TimedLyricLine[];
  onChangeLines: (newLines: TimedLyricLine[]) => void;
  onPreviewSeek?: (timeSec: number) => void;
  songDuration?: number;
}

export const LyricChordEditor: React.FC<LyricChordEditorProps> = ({
  lines,
  onChangeLines,
  onPreviewSeek,
  songDuration = 32,
}) => {
  const [isAiTranscribing, setIsAiTranscribing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleUpdateLine = (index: number, partial: Partial<TimedLyricLine>) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], ...partial };
    onChangeLines(updated);
  };

  const handleUpdateWordChord = (lineIndex: number, wordIndex: number, chord: string) => {
    const updated = [...lines];
    const targetLine = { ...updated[lineIndex] };
    const targetWords = [...targetLine.words];
    targetWords[wordIndex] = { ...targetWords[wordIndex], chord: chord.trim() || undefined };
    targetLine.words = targetWords;
    updated[lineIndex] = targetLine;
    onChangeLines(updated);
  };

  const handleAddLine = () => {
    const lastEnd = lines.length > 0 ? lines[lines.length - 1].end : 0;
    const newLine: TimedLyricLine = {
      line: 'New lyric phrase',
      start: +(lastEnd + 0.5).toFixed(1),
      end: +(lastEnd + 4.0).toFixed(1),
      chord: 'Bb',
      words: [
        { word: 'New', start: +(lastEnd + 0.5).toFixed(1), end: +(lastEnd + 1.5).toFixed(1), chord: 'Bb' },
        { word: 'lyric', start: +(lastEnd + 1.5).toFixed(1), end: +(lastEnd + 2.8).toFixed(1) },
        { word: 'phrase', start: +(lastEnd + 2.8).toFixed(1), end: +(lastEnd + 4.0).toFixed(1) },
      ],
    };
    onChangeLines([...lines, newLine]);
  };

  const handleDeleteLine = (index: number) => {
    const updated = lines.filter((_, i) => i !== index);
    onChangeLines(updated);
  };

  // Run Whisper / Groq transcription + AI chord detector
  const handleWhisperGroqTranscribe = async () => {
    setIsAiTranscribing(true);
    setStatusMessage('Transcribing with Whisper Groq model & aligning chord progression...');
    try {
      const currentLyrics = lines.map((l) => l.line).join('\n');
      const res = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceLyrics: currentLyrics, durationSec: songDuration }),
      });
      const data = await res.json();
      if (data.aligned && data.aligned.length > 0) {
        onChangeLines(data.aligned);
        setStatusMessage(`Successfully aligned ${data.aligned.length} timestamped lines with chords! (${data.source})`);
      }
    } catch (e: any) {
      console.error(e);
      setStatusMessage('Transcription request error; please check connectivity.');
    } finally {
      setIsAiTranscribing(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Music2 className="w-4 h-4 text-amber-400" />
            <span>Timestamped Lyric & Chord Studio Editor</span>
          </h3>
          <p className="text-[11px] text-gray-400">
            Edit timestamps, chords, and word-by-word highlights. Match standard music leadsheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleWhisperGroqTranscribe}
            disabled={isAiTranscribing}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-gray-950 font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-md disabled:opacity-50"
          >
            {isAiTranscribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5" />}
            <span>Whisper Groq AI Align & Chords</span>
          </button>

          <button
            type="button"
            onClick={handleAddLine}
            className="flex items-center gap-1 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Line</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Lines Table */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {lines.map((lineObj, idx) => (
          <div
            key={idx}
            className="bg-gray-900/90 border border-gray-800/80 rounded-xl p-3 hover:border-gray-700 transition space-y-2.5"
          >
            {/* Top Row: Line text, Chord badge, Timestamps, Delete */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <span className="w-5 h-5 rounded-md bg-gray-800 text-gray-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <input
                  type="text"
                  value={lineObj.line}
                  onChange={(e) => {
                    const newText = e.target.value;
                    const words = newText.split(/\s+/).filter(Boolean);
                    const dur = Math.max(0.1, lineObj.end - lineObj.start);
                    const wordDur = dur / Math.max(1, words.length);
                    const updatedWords = words.map((w, i) => ({
                      word: w,
                      start: +(lineObj.start + i * wordDur).toFixed(2),
                      end: +(lineObj.start + (i + 1) * wordDur).toFixed(2),
                      chord: lineObj.words[i]?.chord,
                    }));
                    handleUpdateLine(idx, { line: newText, words: updatedWords });
                  }}
                  className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Primary Chord */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] uppercase font-bold text-amber-400">Chord:</span>
                <input
                  type="text"
                  value={lineObj.chord || ''}
                  onChange={(e) => handleUpdateLine(idx, { chord: e.target.value })}
                  placeholder="e.g. Bb, Gm, Eb"
                  className="w-16 bg-gray-950 border border-amber-500/40 text-amber-300 rounded-lg px-2 py-0.5 text-xs text-center font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Start & End Seconds */}
              <div className="flex items-center gap-1 text-xs shrink-0 text-gray-400">
                <Clock className="w-3 h-3 text-gray-500" />
                <input
                  type="number"
                  step="0.1"
                  value={lineObj.start}
                  onChange={(e) => handleUpdateLine(idx, { start: parseFloat(e.target.value) || 0 })}
                  className="w-14 bg-gray-950 border border-gray-700 rounded px-1.5 py-0.5 text-center text-xs text-gray-200"
                />
                <span>s -</span>
                <input
                  type="number"
                  step="0.1"
                  value={lineObj.end}
                  onChange={(e) => handleUpdateLine(idx, { end: parseFloat(e.target.value) || 0 })}
                  className="w-14 bg-gray-950 border border-gray-700 rounded px-1.5 py-0.5 text-center text-xs text-gray-200"
                />
                <span>s</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                {onPreviewSeek && (
                  <button
                    type="button"
                    onClick={() => onPreviewSeek(lineObj.start)}
                    title="Seek video to this line"
                    className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-amber-400 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteLine(idx)}
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Word Chips Row with mini chord tag */}
            <div className="flex flex-wrap items-center gap-1.5 pl-7">
              <span className="text-[9px] text-gray-500 uppercase font-semibold">Words:</span>
              {lineObj.words?.map((w, wIdx) => (
                <div
                  key={wIdx}
                  className="bg-gray-950/80 border border-gray-800 rounded-lg px-2 py-0.5 flex items-center gap-1 text-[11px]"
                >
                  <span className="text-gray-200">{w.word}</span>
                  <input
                    type="text"
                    value={w.chord || ''}
                    onChange={(e) => handleUpdateWordChord(idx, wIdx, e.target.value)}
                    placeholder="chord"
                    className="w-10 bg-transparent text-[10px] text-amber-400 font-bold border-b border-gray-700 focus:border-amber-400 outline-none text-center"
                  />
                  <span className="text-[9px] text-gray-500">{w.start.toFixed(1)}s</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

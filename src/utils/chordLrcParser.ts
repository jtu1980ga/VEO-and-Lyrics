import { TimedLyricLine, TimedWord } from '../types';

/**
 * Parses timestamp string like "[00:17.80]" or "[01:36.34]" into seconds
 */
export function parseTimestampToSec(timestampStr: string): number {
  const match = timestampStr.match(/\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/);
  if (!match) return 0;
  const minutes = parseInt(match[1], 10) || 0;
  const seconds = parseInt(match[2], 10) || 0;
  const frac = match[3] ? parseFloat(`0.${match[3]}`) : 0;
  return +(minutes * 60 + seconds + frac).toFixed(2);
}

/**
 * Formats seconds into [mm:ss.xx]
 */
export function formatSecToTimestamp(sec: number): string {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const remainingSec = s % 60;
  const secInt = Math.floor(remainingSec);
  const hundredths = Math.floor((remainingSec - secInt) * 100);
  const mStr = String(m).padStart(2, '0');
  const sStr = String(secInt).padStart(2, '0');
  const hStr = String(hundredths).padStart(2, '0');
  return `[${mStr}:${sStr}.${hStr}]`;
}

/**
 * Parses an inline chord line like:
 * "      (Em7)I drove past that old dirt (C)road"
 * returns:
 *   cleanLine: "I drove past that old dirt road"
 *   wordsWithChords: [{ word: "I", chord: "Em7" }, { word: "drove" }, ..., { word: "road", chord: "C" }]
 *   primaryChord: "Em7"
 */
export function parseInlineChordLine(rawLine: string): {
  cleanLine: string;
  wordsWithChords: { word: string; chord?: string }[];
  primaryChord?: string;
} {
  const trimmed = rawLine.trim();
  if (!trimmed) {
    return { cleanLine: '', wordsWithChords: [] };
  }

  // Tokenize by spaces while keeping track of attached (Chord) tokens
  // E.g. "(Em7)I", "drove", "past", "that", "old", "dirt", "(C)road", "me", "(D)"
  const rawTokens = trimmed.split(/\s+/).filter(Boolean);
  const wordsWithChords: { word: string; chord?: string }[] = [];
  let pendingChord: string | undefined = undefined;
  let primaryChord: string | undefined = undefined;

  for (const token of rawTokens) {
    // Check if token has one or multiple chords, e.g. "(Em7)I", "where", "loved", "(D)", "yester(Csus2)day"
    const chordPattern = /\(([^)]+)\)/g;
    let match;
    const chordsInToken: { chord: string; index: number }[] = [];
    while ((match = chordPattern.exec(token)) !== null) {
      chordsInToken.push({ chord: match[1], index: match.index });
    }

    if (chordsInToken.length === 0) {
      // Normal word
      wordsWithChords.push({
        word: token,
        chord: pendingChord,
      });
      pendingChord = undefined;
    } else {
      // Remove (Chord) from token text to get clean word
      const cleanWord = token.replace(/\(([^)]+)\)/g, '').trim();

      // If token was just a chord like "(D)", it attaches to previous word or is saved as pending
      if (!cleanWord) {
        const lastChord = chordsInToken[chordsInToken.length - 1].chord;
        if (wordsWithChords.length > 0) {
          // Attach to last word if it doesn't already have one
          const lastWord = wordsWithChords[wordsWithChords.length - 1];
          if (!lastWord.chord) {
            lastWord.chord = lastChord;
          } else {
            pendingChord = lastChord;
          }
        } else {
          pendingChord = lastChord;
        }
        if (!primaryChord) primaryChord = lastChord;
      } else {
        const firstChord = chordsInToken[0].chord;
        if (!primaryChord) primaryChord = firstChord;
        wordsWithChords.push({
          word: cleanWord,
          chord: pendingChord || firstChord,
        });
        pendingChord = undefined;
      }
    }
  }

  const cleanLine = wordsWithChords.map((w) => w.word).join(' ');
  return {
    cleanLine,
    wordsWithChords,
    primaryChord: primaryChord || wordsWithChords.find((w) => w.chord)?.chord,
  };
}

/**
 * Parses full formatted text with timestamps and inline chords like:
 * [00:00.00]
 *       (Em7)I drove past that old dirt (C)road
 * where you first said you (G)loved me (D)
 *
 * [00:17.80]
 *      (C)I hold you close and (G)make you stay
 */
export function parseFormattedLrcWithChords(
  rawText: string,
  totalDurationFallback: number = 60
): TimedLyricLine[] {
  const blocks = rawText.split(/(?=\[\d{1,2}:\d{1,2}(?:\.\d{1,3})?\])/g);
  const result: TimedLyricLine[] = [];

  const parsedBlocks: { timestampSec: number; rawContent: string }[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(\[\d{1,2}:\d{1,2}(?:\.\d{1,3})?\])/);
    if (match) {
      const tsStr = match[1];
      const sec = parseTimestampToSec(tsStr);
      const content = trimmed.slice(tsStr.length).trim();
      parsedBlocks.push({ timestampSec: sec, rawContent: content });
    } else {
      // No timestamp at start; could be header or untimed lines
      parsedBlocks.push({ timestampSec: result.length * 4.0, rawContent: trimmed });
    }
  }

  for (let i = 0; i < parsedBlocks.length; i++) {
    const current = parsedBlocks[i];
    const next = parsedBlocks[i + 1];
    const blockStart = current.timestampSec;
    const blockEnd = next ? next.timestampSec : Math.max(blockStart + 8.0, totalDurationFallback);

    // Split block into individual lines
    const rawLines = current.rawContent.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!rawLines.length) continue;

    const lineDuration = (blockEnd - blockStart) / rawLines.length;

    rawLines.forEach((rawLine, lIdx) => {
      const lineStart = +(blockStart + lIdx * lineDuration).toFixed(2);
      const lineEnd = +(blockStart + (lIdx + 1) * lineDuration).toFixed(2);
      const { cleanLine, wordsWithChords, primaryChord } = parseInlineChordLine(rawLine);

      if (!cleanLine) return;

      const wDur = Math.max(0.1, (lineEnd - lineStart) / Math.max(1, wordsWithChords.length));
      const words: TimedWord[] = wordsWithChords.map((wObj, wIdx) => ({
        word: wObj.word,
        start: +(lineStart + wIdx * wDur).toFixed(2),
        end: +(lineStart + (wIdx + 1) * wDur).toFixed(2),
        chord: wObj.chord,
      }));

      result.push({
        line: cleanLine,
        start: lineStart,
        end: lineEnd,
        chord: primaryChord,
        words,
      });
    });
  }

  return result;
}

/**
 * Formats an array of TimedLyricLine into the user's requested output format:
 * [00:00.00]
 *       (Em7)I drove past that old dirt (C)road
 * where you first said you (G)loved me (D)
 */
export function formatLinesToLrcWithChords(lines: TimedLyricLine[]): string {
  if (!lines || lines.length === 0) return '';

  // Group lines into blocks of ~3-5 lines or by timestamps
  const blocks: string[] = [];
  let currentTimestamp: string | null = null;
  let currentLines: string[] = [];

  lines.forEach((line, idx) => {
    // Start a new timestamp header every 4 lines or if gap is > 6 seconds
    const shouldHeader = idx === 0 || (idx > 0 && line.start - lines[idx - 1].end > 4.0) || idx % 4 === 0;

    if (shouldHeader) {
      if (currentTimestamp && currentLines.length > 0) {
        blocks.push(`${currentTimestamp}\n${currentLines.join('\n')}`);
        currentLines = [];
      }
      currentTimestamp = formatSecToTimestamp(line.start);
    }

    // Build line with inline chords
    const wordsWithInlineChords = (line.words || []).map((w, wIdx) => {
      const chordPart = w.chord ? `(${w.chord})` : (wIdx === 0 && line.chord ? `(${line.chord})` : '');
      return `${chordPart}${w.word}`;
    });

    const formattedLine = wordsWithInlineChords.length > 0
      ? `      ${wordsWithInlineChords.join(' ')}`
      : `      ${line.chord ? `(${line.chord})` : ''}${line.line}`;

    currentLines.push(formattedLine);
  });

  if (currentTimestamp && currentLines.length > 0) {
    blocks.push(`${currentTimestamp}\n${currentLines.join('\n')}`);
  }

  return blocks.join('\n\n');
}

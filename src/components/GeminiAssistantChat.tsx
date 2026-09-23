import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  Wand2,
  Music,
  Video,
  FileText,
  Sliders,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GeminiAssistantChatProps {
  onApplySettings?: (settingsPartial: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiAssistantChat: React.FC<GeminiAssistantChatProps> = ({
  onApplySettings,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        "Hello James! I'm your Gemini AI Creative Director. I can help you edit your music, fine-tune chords & timestamped lyrics, adjust video styling/fonts, generate YouTube descriptions & salvation prayers, and optimize your keywords for TikTok, Instagram, Facebook, and YouTube. What would you like to work on?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const savedKeys = localStorage.getItem('veostudio_api_keys');
      let customGeminiKey = '';
      if (savedKeys) {
        try {
          const parsed = JSON.parse(savedKeys);
          customGeminiKey = parsed.geminiApiKey || '';
        } catch (err) {}
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customGeminiKey) {
        headers['x-gemini-api-key'] = customGeminiKey;
      }

      // Format history for backend
      const history = [...messages, userMsg].map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: history }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: data.reply || "I've processed your request!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Save to Firestore if user logged in
        if (user) {
          try {
            await addDoc(collection(db, 'users', user.uid, 'chats'), {
              userMessage: userMsg.content,
              aiReply: aiMsg.content,
              timestamp: new Date().toISOString(),
            });
          } catch (dbErr) {
            console.warn('Chat Firestore save warning:', dbErr);
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: 'assistant',
            content: errData.error || "I ran into an issue connecting with Gemini. Please verify your GEMINI_API_KEY or try again.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: "Connection error. Please check your network and try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    "Help me write a viral TikTok hook for Breathing Again",
    "Suggest worship chord progressions in G Major",
    "How can I improve my YouTube description for SEO?",
    "Give me 5 faith video concepts for Instagram Reels",
  ];

  return (
    <div className="fixed bottom-6 right-6 w-96 sm:w-[420px] h-[550px] bg-gray-950/95 border border-amber-500/30 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col z-50 overflow-hidden animate-slideUp">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Gemini AI Director</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-gray-400">Editing, Music, Lyrics & Social Strategy</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl p-3 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-gray-950 font-medium'
                  : 'bg-gray-900 border border-gray-800 text-gray-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              <div
                className={`text-[9px] mt-1.5 ${
                  m.role === 'user' ? 'text-gray-900/70' : 'text-gray-500'
                }`}
              >
                {m.timestamp}
              </div>
            </div>
            {m.role === 'user' && (
              <div className="w-6 h-6 rounded-lg bg-gray-800 text-gray-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Gemini is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-gray-900 bg-gray-950/60 overflow-x-auto flex gap-1.5 no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => setInput(qp)}
            className="text-[10px] text-gray-400 hover:text-amber-300 bg-gray-900 hover:bg-gray-800 border border-gray-800 px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-gray-950 border-t border-gray-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gemini to edit music, lyrics, or keywords..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 flex items-center justify-center transition cursor-pointer shrink-0 shadow-md shadow-amber-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

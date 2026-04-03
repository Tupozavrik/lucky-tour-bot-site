"use client";

import { useState, useTransition } from "react";

const LANGUAGES = [
  { code: "ru", label: "🇷🇺 Русский" },
  { code: "en", label: "🇬🇧 Английский" },
  { code: "tr", label: "🇹🇷 Турецкий" },
  { code: "ar", label: "🇦🇪 Арабский" },
  { code: "de", label: "🇩🇪 Немецкий" },
  { code: "fr", label: "🇫🇷 Французский" },
  { code: "es", label: "🇪🇸 Испанский" },
];

interface TranslateResult {
  translatedText: string;
  confidence: number;
}

export default function TranslatorWidget() {
  const [text, setText] = useState("");
  const [from, setFrom] = useState("ru");
  const [to, setTo] = useState("en");
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const maxChars = 500;

  function swapLanguages() {
    setFrom(to);
    setTo(from);
    setResult(null);
  }

  function copyResult() {
    if (result?.translatedText) {
      navigator.clipboard.writeText(result.translatedText).catch(() => {});
    }
  }

  function handleTranslate() {
    if (!text.trim()) return;
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, from, to }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Ошибка перевода");
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      }
    });
  }

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <LangSelect value={from} onChange={(v) => { setFrom(v); setResult(null); }} />
        <button
          onClick={swapLanguages}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Поменять языки"
        >
          ⇄
        </button>
        <LangSelect value={to} onChange={(v) => { setTo(v); setResult(null); }} />
      </div>

      <div className="relative mb-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxChars))}
          placeholder="Введите текст для перевода..."
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm resize-none outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-500"
        />
        <span className={`absolute bottom-3 right-3 text-[10px] ${text.length >= maxChars ? "text-red-400" : "text-slate-500"}`}>
          {text.length}/{maxChars}
        </span>
      </div>

      <button
        onClick={handleTranslate}
        disabled={isPending || !text.trim()}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner />
            Переводим…
          </span>
        ) : "Перевести"}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="mt-3 bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Перевод</p>
            <button
              onClick={copyResult}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all active:scale-95"
            >
              <CopyIcon className="w-3.5 h-3.5" />
              Копировать
            </button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.translatedText}</p>
          {result.confidence < 1 && (
            <p className="text-[10px] text-slate-500 mt-2">
              Уверенность: {Math.round(result.confidence * 100)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function LangSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code} className="bg-slate-900">
          {lang.label}
        </option>
      ))}
    </select>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

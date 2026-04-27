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
      {/* Выбор языков */}
      <div className="flex items-center gap-2 mb-3">
        <LangSelect value={from} onChange={(v) => { setFrom(v); setResult(null); }} />
        <button
          onClick={swapLanguages}
          className="p-2 rounded-xl active:scale-95 transition-all"
          style={{
            background: "color-mix(in srgb, var(--tg-hint) 12%, transparent)",
            color: "var(--tg-text)",
          }}
          aria-label="Поменять языки"
        >
          ⇄
        </button>
        <LangSelect value={to} onChange={(v) => { setTo(v); setResult(null); }} />
      </div>

      {/* Текстовое поле */}
      <div className="relative mb-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxChars))}
          placeholder="Введите текст для перевода..."
          rows={4}
          className="w-full rounded-2xl px-4 py-3 text-sm resize-none outline-none transition-all"
          style={{
            background: "color-mix(in srgb, var(--tg-hint) 10%, var(--tg-section-bg))",
            border: "1px solid color-mix(in srgb, var(--tg-hint) 20%, transparent)",
            color: "var(--tg-text)",
          }}
        />
        <span
          className="absolute bottom-3 right-3 text-[10px]"
          style={{ color: text.length >= maxChars ? "var(--tg-destructive)" : "var(--tg-hint)" }}
        >
          {text.length}/{maxChars}
        </span>
      </div>

      {/* Кнопка перевода */}
      <button
        onClick={handleTranslate}
        disabled={isPending || !text.trim()}
        className="w-full py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        style={{
          background: "var(--tg-button)",
          color: "var(--tg-button-text)",
        }}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner />
            Переводим…
          </span>
        ) : "Перевести"}
      </button>

      {/* Ошибка */}
      {error && (
        <div
          className="mt-3 p-3 rounded-2xl text-sm border"
          style={{
            background: "color-mix(in srgb, var(--tg-destructive) 10%, transparent)",
            borderColor: "color-mix(in srgb, var(--tg-destructive) 25%, transparent)",
            color: "var(--tg-destructive)",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Результат */}
      {result && (
        <div
          className="mt-3 rounded-2xl p-4 border"
          style={{
            background: "color-mix(in srgb, var(--tg-hint) 10%, var(--tg-section-bg))",
            borderColor: "color-mix(in srgb, var(--tg-hint) 20%, transparent)",
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--tg-section-header)" }}>Перевод</p>
            <button
              onClick={copyResult}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs active:scale-95 transition-all"
              style={{
                color: "var(--tg-hint)",
                background: "color-mix(in srgb, var(--tg-hint) 10%, transparent)",
              }}
            >
              <CopyIcon className="w-3.5 h-3.5" />
              Копировать
            </button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--tg-text)" }}>
            {result.translatedText}
          </p>
          {result.confidence < 1 && (
            <p className="text-[10px] mt-2" style={{ color: "var(--tg-hint)" }}>
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
      className="flex-1 rounded-xl px-3 py-2 text-sm outline-none transition-all appearance-none cursor-pointer"
      style={{
        background: "color-mix(in srgb, var(--tg-hint) 10%, var(--tg-section-bg))",
        border: "1px solid color-mix(in srgb, var(--tg-hint) 20%, transparent)",
        color: "var(--tg-text)",
      }}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
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

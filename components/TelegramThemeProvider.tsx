"use client";

import { useEffect } from "react";

/**
 * Инициализирует Telegram Mini App и применяет тему пользователя через CSS-переменные.
 * Должен быть вставлен один раз — в корневой layout.
 *
 * Telegram Web App SDK (telegram-web-app.js) автоматически прописывает переменные
 * --tg-theme-bg-color, --tg-theme-text-color и т.д. в :root, но только после ready().
 * Этот компонент:
 *  1. Вызывает tg.ready() и tg.expand()
 *  2. Копирует переменные в наш неймспейс --tg-*
 *  3. Подписывается на themeChanged для динамического обновления
 */

const TG_VAR_MAP: Record<string, string> = {
  "--tg-theme-bg-color": "--tg-bg",
  "--tg-theme-text-color": "--tg-text",
  "--tg-theme-hint-color": "--tg-hint",
  "--tg-theme-link-color": "--tg-link",
  "--tg-theme-button-color": "--tg-button",
  "--tg-theme-button-text-color": "--tg-button-text",
  "--tg-theme-secondary-bg-color": "--tg-secondary-bg",
  "--tg-theme-header-bg-color": "--tg-header-bg",
  "--tg-theme-bottom-bar-bg-color": "--tg-bottom-bar-bg",
  "--tg-theme-accent-text-color": "--tg-accent",
  "--tg-theme-section-bg-color": "--tg-section-bg",
  "--tg-theme-section-header-text-color": "--tg-section-header",
  "--tg-theme-subtitle-text-color": "--tg-subtitle",
  "--tg-theme-destructive-text-color": "--tg-destructive",
};

const DARK_FALLBACK: Record<string, string> = {
  "--tg-bg": "#0d1117",
  "--tg-text": "#f0f6fc",
  "--tg-hint": "#8b949e",
  "--tg-link": "#58a6ff",
  "--tg-button": "#1f6feb",
  "--tg-button-text": "#ffffff",
  "--tg-secondary-bg": "#161b22",
  "--tg-header-bg": "#0d1117",
  "--tg-bottom-bar-bg": "#0d1117",
  "--tg-accent": "#58a6ff",
  "--tg-section-bg": "#161b22",
  "--tg-section-header": "#8b949e",
  "--tg-subtitle": "#8b949e",
  "--tg-destructive": "#f85149",
};

const LIGHT_FALLBACK: Record<string, string> = {
  "--tg-bg": "#ffffff",
  "--tg-text": "#000000",
  "--tg-hint": "#999999",
  "--tg-link": "#2678b6",
  "--tg-button": "#2678b6",
  "--tg-button-text": "#ffffff",
  "--tg-secondary-bg": "#efeff4",
  "--tg-header-bg": "#f7f7f7",
  "--tg-bottom-bar-bg": "#f7f7f7",
  "--tg-accent": "#2678b6",
  "--tg-section-bg": "#ffffff",
  "--tg-section-header": "#6d6d72",
  "--tg-subtitle": "#6d6d72",
  "--tg-destructive": "#ff3b30",
};

function syncTheme() {
  const root = document.documentElement;
  const tg = window.Telegram?.WebApp;
  const isDark = tg?.colorScheme === "dark" || !tg;

  const fallback = isDark ? DARK_FALLBACK : LIGHT_FALLBACK;

  // Применяем фолбэки сначала
  for (const [ourVar, value] of Object.entries(fallback)) {
    root.style.setProperty(ourVar, value);
  }

  // Перезаписываем из тех переменных, что Telegram SDK уже проставил
  const computed = getComputedStyle(root);
  for (const [tgVar, ourVar] of Object.entries(TG_VAR_MAP)) {
    const val = computed.getPropertyValue(tgVar).trim();
    if (val) root.style.setProperty(ourVar, val);
  }

  // Если есть прямой доступ к themeParams — берём оттуда (надёжнее)
  const p = tg?.themeParams ?? {};
  const directMap: Record<string, string> = {
    "--tg-bg": p.bg_color ?? "",
    "--tg-text": p.text_color ?? "",
    "--tg-hint": p.hint_color ?? "",
    "--tg-link": p.link_color ?? "",
    "--tg-button": p.button_color ?? "",
    "--tg-button-text": p.button_text_color ?? "",
    "--tg-secondary-bg": p.secondary_bg_color ?? "",
    "--tg-header-bg": p.header_bg_color ?? "",
    "--tg-bottom-bar-bg": p.bottom_bar_bg_color ?? "",
    "--tg-accent": p.accent_text_color ?? "",
    "--tg-section-bg": p.section_bg_color ?? "",
    "--tg-section-header": p.section_header_text_color ?? "",
    "--tg-subtitle": p.subtitle_text_color ?? "",
    "--tg-destructive": p.destructive_text_color ?? "",
  };
  for (const [ourVar, val] of Object.entries(directMap)) {
    if (val) root.style.setProperty(ourVar, val);
  }

  root.setAttribute("data-tg-theme", isDark ? "dark" : "light");
}

export default function TelegramThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    syncTheme();

    tg?.onEvent("themeChanged", syncTheme);
    return () => tg?.offEvent("themeChanged", syncTheme);
  }, []);

  return <>{children}</>;
}

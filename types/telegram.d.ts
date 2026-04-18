// Декларации типов для Telegram Web App SDK
// https://core.telegram.org/bots/webapps

interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebAppInitData {
  start_param?: string;
  user?: TelegramWebAppUser;
  query_id?: string;
  auth_date?: number;
  hash?: string;
}

/** Полный набор параметров темы Telegram Mini Apps */
interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  bottom_bar_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

type TelegramEventType =
  | "themeChanged"
  | "viewportChanged"
  | "mainButtonClicked"
  | "backButtonClicked"
  | "settingsButtonClicked"
  | "invoiceClosed"
  | "popupClosed"
  | "qrTextReceived"
  | "clipboardTextReceived"
  | "writeAccessRequested"
  | "contactRequested";

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  initData: string;
  initDataUnsafe: TelegramWebAppInitData;
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;

  setBackgroundColor(color: "bg_color" | "secondary_bg_color" | string): void;
  setHeaderColor(color: "bg_color" | "secondary_bg_color" | string): void;

  onEvent(eventType: TelegramEventType, eventHandler: () => void): void;
  offEvent(eventType: TelegramEventType, eventHandler: () => void): void;

  MainButton: {
    text: string;
    isVisible: boolean;
    isActive: boolean;
    show(): void;
    hide(): void;
    onClick(fn: () => void): void;
    // (Отсюда мы их убрали)
  };

  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(fn: () => void): void;
  };

  HapticFeedback: {
    impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
    notificationOccurred(type: "error" | "success" | "warning"): void;
    selectionChanged(): void;
  };
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}

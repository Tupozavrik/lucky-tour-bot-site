import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Разрешаем HMR через localtunnel (Telegram Web App)
  allowedDevOrigins: [
    'lucky-tour.loca.lt', 
    // Если используешь другие туннели, можешь добавить их сюда
  ],
};

export default nextConfig;

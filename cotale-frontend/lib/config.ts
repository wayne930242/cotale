// Environment configuration for CoTale frontend

export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',

  // Application Configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'CoTale',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Feature Flags
  enableAiFeatures: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true',
  enableCollaboration: process.env.NEXT_PUBLIC_ENABLE_COLLABORATION === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',

  // Development Configuration
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',

  // Monaco Editor Configuration
  monacoWorkerPath: process.env.NEXT_PUBLIC_MONACO_WORKER_PATH || '/monaco-editor/workers',

  // WebSocket Configuration
  wsReconnectInterval: parseInt(process.env.NEXT_PUBLIC_WS_RECONNECT_INTERVAL || '5000'),
  wsMaxReconnectAttempts: parseInt(process.env.NEXT_PUBLIC_WS_MAX_RECONNECT_ATTEMPTS || '10'),

  // UI Configuration
  theme: process.env.NEXT_PUBLIC_THEME || 'dark',
  defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'zh-TW',
} as const;

// Type definitions for better TypeScript support
export type Config = typeof config;

// Helper function to get WebSocket URL for a specific document
export const getWebSocketUrl = (documentId: string): string => {
  return `${config.wsUrl}/ws/${documentId}`;
};

// Helper function to get API endpoint URL
export const getApiUrl = (endpoint: string): string => {
  return `${config.apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Development helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Log configuration in development
if (isDevelopment && config.debug) {
  console.log('CoTale Configuration:', config);
} 
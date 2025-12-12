import type { AppConfig } from './lib/types';

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: '10xDS',
  pageTitle: 'VisitoraX',
  pageDescription: 'A voice agent built with LiveKit',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/icon2-removebg-preview.svg',
  accent: '#002cf2',
  logoDark: '/icon2-removebg-preview.svg',
  accentDark: '#1fd5f9',
  startButtonText: 'Start call',

  agentName: undefined,
};
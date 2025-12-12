export type AppConfig = {
  companyName: string;
  pageTitle: string;
  pageDescription: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  accent: string;
  logoDark: string;
  accentDark: string;
  startButtonText: string;

  agentName?: string;
};
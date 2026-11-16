export type WebhookInfo = {
  application_id: string | null;
  avatar: string | null;
  channel_id: string;
  guild_id: string;
  id: string;
  name: string;
  type: number;
  token?: string;
  url?: string;
};

export type EmbedField = {
  id: string;
  name: string;
  value: string;
  inline: boolean;
};

export type EmbedItem = {
  id: string;
  title?: string;
  description?: string;
  url?: string;
  color?: string;
  author?: string;
  authorIcon?: string;
  authorUrl?: string;
  footer?: string;
  footerIcon?: string;
  thumbnail?: string;
  image?: string;
  timestamp?: string;
  fields: EmbedField[];
};

export type PollAnswer = {
  id: string;
  text: string;
};

export type PollConfig = {
  enabled: boolean;
  question: string;
  answers: PollAnswer[];
  allowMultiselect: boolean;
  duration: number;
};

export type SavedWebhook = {
  id: string;
  name: string;
  url: string;
};

export type HistoryItem = {
  id: string;
  timestamp: string;
  webhookUrl: string;
  payload: Record<string, unknown>;
  summary?: string;
};

export type NewsStyle = 'REAL' | 'FAKE';
export type AspectRatio = '16:9' | '9:16' | '1:1';

export interface Voice {
  voice_id: string;
  voice_name: string;
  sample_audio: string;
  cover_url?: string;
  tag_list?: string[];
}

export interface NewsItem {
  headline: string;
  summary: string; // Acts as the Narration Script
  imagePrompt: string; // The specific prompt for image generation
  impactLevel: 'Bajo' | 'Medio' | 'Alto' | 'Viral' | 'Cataclísmico';
  category: string;
  hashtag: string;
  imageUrl?: string;
  style?: NewsStyle;
  selectedVoiceId?: string;
  audioUrl?: string;
  aspectRatio?: AspectRatio;
}

export enum GeneratorStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
export interface User {
  id: string;
  name: string;
  city?: string;
  current_role?: string;
  industries?: string[];
  intent?: string;
  open_to_intros: boolean;
  preferred_mode: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  text: string;
  track?: string;
  is_voice: boolean;
  audio_duration?: number;
  has_audio_response: boolean;
  created_at: string;
}

export interface Intro {
  id: string;
  from_user_id: string;
  to_user_id: string;
  other_user: {
    name: string;
    city?: string;
    current_role?: string;
  };
  reason: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface Analytics {
  total_users: number;
  active_users: number;
  total_conversations: number;
  total_messages: number;
  total_voice_messages: number;
  track_distribution: Record<string, number>;
  intros_suggested: number;
  intros_accepted: number;
  intros_declined: number;
  power_users: number;
}


export interface Event {
  id: string;
  title: string;
  theme: string;
  location: string;
  duration: 'micro-retreat' | 'macro-retreat';
  days: string;
  price: number;
  thumbnail: string;
  description: string;
  coordinates: { x: number; y: number }; // Percentage relative to map container
}

export interface UserProgress {
  tripsBooked: number;
  tripsCompleted: number;
  streak: number;
  nextJourney: string | null;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  tags: string[];
}

export interface AddOn {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: string;
}

export enum Section {
  HERO = 'hero',
  DISCOVER = 'discover',
  EVENTS = 'events',
  JOURNEY = 'journey',
  COMMUNITY = 'community',
  MARKETPLACE = 'marketplace'
}

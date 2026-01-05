
import { Event, CommunityPost, AddOn, JournalEntry } from './types';

export const COLORS = {
  primary: '#004d4d', // Deep Teal
  accent: '#ffbf00',  // Warm Amber
  bg: '#f4f1ea',      // Soft Sand
  lavender: '#967bb6' // Lavender
};

export interface DetailedEvent extends Event {
  program: string[];
  benefits: string[];
  therapyProgram: {
    phase: string;
    details: string;
  }[];
  itinerary: {
    day: string;
    activity: string;
  }[];
  preparationChecklist: {
    category: string;
    items: string[];
  }[];
}

const createEvent = (id: string, title: string, theme: string, location: string, duration: 'micro-retreat' | 'macro-retreat', days: string, price: number, x: number, y: number, thumbnail: string, poster: string, desc: string): DetailedEvent => ({
  id, title, theme, location, duration, days, price, thumbnail, posterUrl: poster, description: desc,
  coordinates: { x, y },
  program: ['Sacred Geometry', 'Breathwork Mastery', 'Lineage Ritual'],
  benefits: ['Neural Plasticity', 'Emotional Sovereignty', 'Ancestral Clearing'],
  therapyProgram: [
    { phase: 'Descent', details: 'Identifying the egoic structures and somatic blockages.' },
    { phase: 'Liminality', details: 'Navigating the space between the old self and the emerging consciousness.' },
    { phase: 'Integration', details: 'Grounding the peak insights into daily biological rhythms.' }
  ],
  itinerary: [
    { day: 'Day 1', activity: 'Arrival, Cleaning, and Intention Setting.' },
    { day: 'Day 2', activity: 'Elemental Immersion: Earth & Water rituals.' },
    { day: 'Day 3', activity: 'The Shadow Walk: Deep psychological exploration.' },
    { day: 'Final Day', activity: 'The Re-entry Protocol: Mapping the path forward.' }
  ],
  preparationChecklist: [
    { category: 'Spirit', items: ['Meditative focus', 'Dream journal practice'] },
    { category: 'Physical', items: ['Clean diet 7 days prior', 'Hydration focus'] }
  ]
});

const themes = [
  "Shamanic Wisdom", "Self-Development", "Neural Rewiring", "Ancestral Healing", 
  "Somatic Release", "Conscious Leadership", "Spiritual Alchemy", "Nature Immersion"
];

const locations = [
  "Sedona, USA", "Tulum, Mexico", "Bali, Indonesia", "Kyoto, Japan", 
  "Andes, Peru", "Swiss Alps", "Sahara, Morocco", "Daintree, Australia"
];

const descriptions = [
  "A profound journey into the subconscious through the lens of ancient lineage wisdom.",
  "Unlock the architecture of your mind and rewrite the narratives that no longer serve your growth.",
  "Connect with the primal frequencies of the earth in a ritual designed for radical self-discovery.",
  "An intensive somatic experience focused on releasing stored trauma and reclaiming your vital energy.",
  "Master the art of presence through guided breathwork and silent forest immersion.",
  "Explore the intersection of quantum physics and spiritual alchemy in a transformative setting."
];

// Curated list of high-quality Unsplash IDs for cinematic feel
const imageIds = [
  "1506197664102-b770ff030834", "1518005020250-ee21d1d03099", "1464822759023-fed622ff2c3b",
  "1501785888041-af3ef285b470", "1507525428034-b723cf961d3e", "1472214103451-9374bd1c798e",
  "1534067783941-51c9c23ecfd3", "1519681393784-d120267933ba", "1506126613408-eca07ce68773",
  "1518173946684-147107ba1f21", "1500382017468-9049fee74a62", "1512413316925-fd304447a679"
];

export const MOCK_EVENTS: DetailedEvent[] = Array.from({ length: 52 }, (_, i) => {
  const theme = themes[i % themes.length];
  const location = locations[i % locations.length];
  const desc = descriptions[i % descriptions.length];
  const isMacro = i % 3 === 0;
  const imageId = imageIds[i % imageIds.length];
  
  return createEvent(
    (i + 1).toString(),
    `${theme}: ${location.split(',')[0]} Resonance`,
    theme,
    location,
    isMacro ? 'macro-retreat' : 'micro-retreat',
    isMacro ? '14 Days' : '4 Days',
    1500 + (i * 120),
    10 + (i * 1.7) % 80,
    10 + (i * 1.3) % 80,
    `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&q=80&w=600`,
    `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&q=80&w=1600`, // High-res poster
    desc
  );
});

export const COMMUNITY_POSTS: CommunityPost[] = [
  { id: '1', author: 'Elena R.', avatar: 'https://i.pravatar.cc/150?u=1', content: 'Just returned from the Volcanic Rebirth. I feel like my cells have been literalized. Still processing the black sand ritual...', likes: 24, tags: ['Iceland', 'Transformation'] },
  { id: '2', author: 'Marcus V.', avatar: 'https://i.pravatar.cc/150?u=2', content: 'Does anyone have the packing list for the Heart-Center retreat? Thinking about linen colors.', likes: 12, tags: ['Peru', 'Preparation'] },
  { id: '3', author: 'Sasha K.', avatar: 'https://i.pravatar.cc/150?u=3', content: 'The AI Mentor just recommended a "Radical Pivot" to the Arctic. Nervous but excited!', likes: 45, tags: ['NeuralSync', 'Growth'] }
];

export const MARKETPLACE_ADDONS: AddOn[] = [
  { id: '1', title: 'Deep Tissue Shamanic Massage', description: '90-minute session with local lineage healers.', price: 150, icon: 'fa-hands-holding' },
  { id: '2', title: 'Carbon Offset (Double)', description: 'Fund 200% of your journey\'s footprint in forest conservation.', price: 45, icon: 'fa-leaf' },
  { id: '3', title: 'Virtual Pre-Integration', description: '3 calls with a psychologist before you travel.', price: 250, icon: 'fa-video' }
];

export const MOCK_JOURNAL: JournalEntry[] = [
  { id: '1', date: 'Oct 24, 2025', title: 'Shadow Integration', content: 'The drum circle unlocked something in my solar plexus today. I saw the version of myself that was afraid to fail.', mood: 'Expansive' },
  { id: '2', date: 'Oct 22, 2025', title: 'Preparing for Wadi Rum', content: 'Packing light. Focused on the void. The AI says I need to embrace the desert silence.', mood: 'Focused' }
];

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is your primary intention?",
    options: ["Healing", "Exploration", "Disconnection", "Growth"]
  },
  {
    id: 2,
    question: "Preferred landscape?",
    options: ["Mountains", "Ocean", "Desert", "Forest"]
  },
  {
    id: 3,
    question: "Journey intensity?",
    options: ["Gentle (Micro)", "Transformative (Macro)", "Virtual (Digital)"]
  }
];

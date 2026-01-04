
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

const createEvent = (id: string, title: string, theme: string, location: string, duration: 'micro-retreat' | 'macro-retreat', days: string, price: number, x: number, y: number, img: string, desc: string): DetailedEvent => ({
  id, title, theme, location, duration, days, price, thumbnail: img, description: desc,
  coordinates: { x, y },
  program: ['Sacred Geometry', 'Breathwork Mastery', 'Lineage Ritual'],
  benefits: ['Stress reduction', 'Identity clarity', 'Neural rewiring'],
  therapyProgram: [
    { phase: 'Descent', details: 'Introduction to shadow-work and somatic release.' },
    { phase: 'Equilibrium', details: 'Harmonizing internal polarities.' }
  ],
  itinerary: [
    { day: 'Day 1', activity: 'Arrival and Intention.' },
    { day: 'Days 2-3', activity: 'Deep immersion and peak rituals.' }
  ],
  preparationChecklist: [
    { category: 'Spirit', items: ['Meditative focus', 'Journal'] }
  ]
});

export const MOCK_EVENTS: DetailedEvent[] = [
  createEvent('1', 'Heart-Center Healing', 'Emotional Release', 'Sacred Valley, Peru', 'macro-retreat', '10 Days', 3400, 28, 65, 'https://images.unsplash.com/photo-1518173946687-a4c8a9ba336c?auto=format&fit=crop&q=80&w=800', 'A deep dive into shamanic medicine and ancient Quechua traditions to unlock your emotional potential.'),
  createEvent('2', 'Desert Drum Ritual', 'Ancestral Connection', 'Wadi Rum, Jordan', 'micro-retreat', '3 Days', 1200, 58, 48, 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=800', 'Sync your heartbeat with the rhythm of the desert through rhythmic entrainment and vast perspective.'),
  createEvent('3', 'Misty Forest Awakening', 'Mindfulness', 'Yakushima, Japan', 'macro-retreat', '7 Days', 2800, 82, 38, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800', 'Walk through ancient cedar forests and rediscover your connection to the Earth spirit.'),
  createEvent('4', 'Arctic Soul Bath', 'Resilience', 'Lofoten, Norway', 'micro-retreat', '3 Days', 1800, 52, 15, 'https://images.unsplash.com/photo-1520520731457-9283dd14aa66?auto=format&fit=crop&q=80&w=800', 'Cold exposure therapy and northern lights meditation to build grit and psychological flexibility.'),
  createEvent('5', 'Sacred Silence', 'Deep Introspection', 'Rishikesh, India', 'macro-retreat', '14 Days', 3100, 72, 45, 'https://images.unsplash.com/photo-1545389336-cf09bd8c9b0e?auto=format&fit=crop&q=80&w=800', 'A two-week vow of silence in the foothills of the Himalayas to confront internal chatter.'),
  createEvent('6', 'Volcanic Rebirth', 'Transformation', 'Reykjavik, Iceland', 'micro-retreat', '4 Days', 2200, 45, 20, 'https://images.unsplash.com/photo-1517639493569-5666a7b2f494?auto=format&fit=crop&q=80&w=800', 'Utilize geothermal energy rituals to burn away old versions of self.'),
  createEvent('7', 'Amazonian Genesis', 'Plant Medicine', 'Iquitos, Peru', 'macro-retreat', '12 Days', 3900, 31, 75, 'https://images.unsplash.com/photo-1516533075015-a3838414c3cb?auto=format&fit=crop&q=80&w=800', 'Authentic Ayahuasca ceremonies with Shipibo elders in the heart of the rainforest.'),
  createEvent('8', 'Sahara Starlight', 'Cosmic Alignment', 'Merzouga, Morocco', 'micro-retreat', '4 Days', 1500, 48, 42, 'https://images.unsplash.com/photo-1504198266287-1659872e6590?auto=format&fit=crop&q=80&w=800', 'Nocturnal navigation and astronomy-based meditation in the world\'s most silent dunes.'),
  createEvent('9', 'Aegean Serenity', 'Somatic Yoga', 'Santorini, Greece', 'micro-retreat', '5 Days', 2100, 55, 35, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=800', 'Combining movement therapy with the healing frequency of Mediterranean waters.'),
  createEvent('10', 'Celtic Mist', 'Druidic Wisdom', 'Isle of Skye, Scotland', 'macro-retreat', '8 Days', 2600, 46, 12, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=800', 'Reconnecting with ancestral lore and stone circle energy work.'),
  createEvent('11', 'Balinese Bloom', 'Creative Flow', 'Ubud, Bali', 'macro-retreat', '10 Days', 3200, 85, 65, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800', 'Art therapy and water purification rituals in tropical sanctuary.'),
  createEvent('12', 'Atacama Void', 'Sensory Reboot', 'San Pedro, Chile', 'micro-retreat', '4 Days', 1900, 25, 85, 'https://images.unsplash.com/photo-1447005497523-267866384074?auto=format&fit=crop&q=80&w=800', 'Floating in salt lagoons and high-altitude sensory deprivation sessions.'),
  // Fillers for total 24
  ...Array.from({ length: 12 }, (_, i) => createEvent(
    (i + 13).toString(),
    `Elemental Path ${i + 13}`,
    'Expansion',
    'Sacred Site',
    i % 2 === 0 ? 'macro-retreat' : 'micro-retreat',
    '7 Days',
    2400,
    10 + (i * 7) % 80,
    10 + (i * 11) % 80,
    `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80&w=800`,
    'An AI-curated journey into the deep subconscious using unique local frequencies.'
  ))
];

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

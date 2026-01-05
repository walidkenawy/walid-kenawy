
import { useState, FC, FormEvent, useEffect, useRef, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import { Section, Event, UserProgress, CommunityPost, AddOn, JournalEntry } from './types';
import { MOCK_EVENTS, COLORS, DetailedEvent, COMMUNITY_POSTS, MARKETPLACE_ADDONS, MOCK_JOURNAL } from './constants';
import GlobeMap from './components/GlobeMap';
import Quiz from './components/Quiz';
import { askMentor, analyzeJourney, getEventDeepAnswer, getOracleResponse } from './services/geminiService';
import { fetchExternalContent, ExternalPageData } from './services/contentService';

/**
 * Component to render markdown-like content from AI or External sources.
 */
const MarkdownView: FC<{ content: string; dark?: boolean }> = ({ content, dark }) => {
  const lines = content.split('\n');
  return (
    <div className={`space-y-4 leading-relaxed font-light ${dark ? 'text-teal-900/80' : 'text-teal-100/90'}`}>
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-serif text-amber-500 mt-6 mb-3 italic">{line.replace('### ', '')}</h3>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-serif text-amber-500 mt-8 mb-4 italic">{line.replace('## ', '')}</h2>;
        if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-serif text-amber-600 mt-10 mb-6 italic border-b border-white/10 pb-2">{line.replace('# ', '')}</h1>;
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return <div key={i} className="flex gap-3 pl-4"><span className="text-amber-500/50">•</span><span>{line.trim().substring(2)}</span></div>;
        }
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, pi) => part.startsWith('**') && part.endsWith('**') ? 
              <strong key={pi} className="text-amber-600 font-bold">{part.slice(2, -2)}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
};

const App: FC = () => {
  // Navigation & Dynamic Content State
  const [activeView, setActiveView] = useState<'standard' | 'dynamic' | 'detail'>('standard');
  const [dynamicData, setDynamicData] = useState<ExternalPageData | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Global Oracle State
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [oracleInput, setOracleInput] = useState("");
  const [oracleHistory, setOracleHistory] = useState<{role: 'user' | 'oracle', text: string}[]>([]);
  const [isOracleTyping, setIsOracleTyping] = useState(false);

  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DetailedEvent | null>(null);
  const [eventDeepAnswer, setEventDeepAnswer] = useState<string | null>(null);
  const [isFetchingDeepAnswer, setIsFetchingDeepAnswer] = useState(false);
  
  const [isSharing, setIsSharing] = useState(false);
  
  // Filtering states
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [themeFilter, setThemeFilter] = useState<string>('all');

  // Cart and Checkout states
  const [cart, setCart] = useState<(DetailedEvent | AddOn)[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutFormOpen, setIsCheckoutFormOpen] = useState(false);
  const [contactData, setContactData] = useState({ name: '', email: '', intention: '' });
  const [isTransmitting, setIsTransmitting] = useState(false);

  const [userProgress] = useState<UserProgress>({
    tripsBooked: 2,
    tripsCompleted: 12,
    streak: 8,
    nextJourney: 'Arctic Soul Bath'
  });

  const availableThemes = useMemo(() => {
    const themes = MOCK_EVENTS.map(e => e.theme);
    return ['all', ...Array.from(new Set(themes))];
  }, []);

  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter(e => {
      const durationMatch = eventFilter === 'all' || e.duration === eventFilter;
      const themeMatch = themeFilter === 'all' || e.theme === themeFilter;
      return durationMatch && themeMatch;
    });
  }, [eventFilter, themeFilter]);

  // Handle Fetching Deep Answer when event is selected
  useEffect(() => {
    if (selectedEvent) {
      setEventDeepAnswer(null);
      fetchDeepAnswer(selectedEvent);
      // Ensure we are in detail view
      setActiveView('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedEvent]);

  const fetchDeepAnswer = async (event: DetailedEvent) => {
    setIsFetchingDeepAnswer(true);
    const answer = await getEventDeepAnswer(event.title, event.location, event.theme, event.description);
    setEventDeepAnswer(answer);
    setIsFetchingDeepAnswer(false);
  };

  const handleOracleSubmit = async (e?: FormEvent, directInput?: string) => {
    e?.preventDefault();
    const message = directInput || oracleInput;
    if (!message.trim()) return;

    setOracleHistory(prev => [...prev, { role: 'user', text: message }]);
    setOracleInput("");
    setIsOracleOpen(true);
    setIsOracleTyping(true);

    const context = `User is on the ${activeView} view. Selected event: ${selectedEvent?.title || 'None'}. User Progress: ${userProgress.tripsCompleted} completed.`;
    const response = await getOracleResponse(message, context);
    
    setOracleHistory(prev => [...prev, { role: 'oracle', text: response }]);
    setIsOracleTyping(false);
  };

  const navigateToSlug = async (slug: string) => {
    if (slug === 'home') {
      setActiveView('standard');
      setSelectedEvent(null);
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (slug === 'events') {
      setActiveView('standard');
      setSelectedEvent(null);
      document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsLoadingContent(true);
    const data = await fetchExternalContent(slug);
    if (data) {
      setDynamicData(data);
      setActiveView('dynamic');
      setTimeout(() => {
        document.getElementById('main-content-mount')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    setIsLoadingContent(false);
  };

  const handleAddToCart = (item: DetailedEvent | AddOn) => {
    setCart(prev => [...prev, item]);
    setIsCartOpen(true);
    setTimeout(() => setIsCartOpen(false), 2000);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!contactData.name || !contactData.email || !contactData.intention) {
      alert("Please focus and complete all fields.");
      return;
    }

    setIsTransmitting(true);
    try {
      const cartDetails = cart.length > 0 
        ? `\n\n--- CART ITEMS ---\n${cart.map((item) => `- ${item.title} ($${item.price})`).join('\n')}\nTotal Investment: $${totalCartPrice}`
        : '\n\nNo specific items in cart.';

      const templateParams = {
        from_name: contactData.name,
        from_email: contactData.email,
        message: `${contactData.intention}${cartDetails}`,
        subject: 'New Ritual Inquiry - Voyage & Veda'
      };

      await emailjs.send('service_9495io7', 'template_fpxsrp8', templateParams, { publicKey: 'rtKxSHs8VO77vzy6g' });
      alert("The ritual has been transmitted to the source. Your path is being paved.");
      setContactData({ name: '', email: '', intention: '' });
      setCart([]);
      setIsCheckoutFormOpen(false);
    } catch (error: any) {
      alert(`Ritual Transmission Error: ${error.text || error.message}.`);
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleShare = (platform: string) => {
    if (!selectedEvent) return;
    const shareUrl = window.location.href;
    const shareText = `Explore "${selectedEvent.title}" in ${selectedEvent.location}. #Switch`;
    let url = '';
    switch (platform) {
      case 'twitter': url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`; break;
      case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`; break;
      case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`; break;
      case 'whatsapp': url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`; break;
    }
    if (url) window.open(url, '_blank');
    setIsSharing(false);
  };

  return (
    <div className="min-h-screen relative bg-[#f4f1ea] custom-scrollbar overflow-y-auto">
      {/* Persistant Header Shell */}
      <nav className="fixed top-0 w-full p-8 md:p-12 flex justify-between items-center z-[200] bg-gradient-to-b from-[#f4f1ea] via-[#f4f1ea]/80 to-transparent backdrop-blur-sm">
        <div 
          onClick={() => navigateToSlug('home')} 
          className="text-[#004d4d] logo-font text-2xl md:text-4xl font-black tracking-tighter opacity-80 cursor-pointer hover:opacity-100 transition-opacity"
        >
          SWITCH
        </div>
        <div className="hidden lg:flex gap-16 text-[#004d4d]/60 text-[10px] tracking-[0.5em] uppercase font-bold">
          <button onClick={() => navigateToSlug('discover')} className="hover:text-amber-500 transition-colors uppercase">Discover</button>
          <button onClick={() => navigateToSlug('events')} className="hover:text-amber-500 transition-colors uppercase">Events</button>
          <button onClick={() => navigateToSlug('home')} className="hover:text-amber-500 transition-colors uppercase">Journey</button>
          <button onClick={() => navigateToSlug('community')} className="hover:text-amber-500 transition-colors uppercase">Community</button>
        </div>
        <div className="flex items-center gap-6 md:gap-8">
          <button onClick={() => setIsCartOpen(true)} className="relative text-teal-900 text-xl hover:text-amber-500 transition-colors">
            <i className="fa-solid fa-cart-shopping" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-amber-400 text-[#004d4d] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cart.length}
              </span>
            )}
          </button>
          <button onClick={() => setIsOracleOpen(true)} className="bg-[#004d4d] text-white px-6 md:px-10 py-3 md:py-4 rounded-full text-[10px] tracking-widest font-black uppercase hover:bg-amber-400 transition-all shadow-lg hidden sm:block">Speak with Oracle</button>
        </div>
      </nav>

      {/* Detail View Mode (The "New Page") */}
      {activeView === 'detail' && selectedEvent ? (
        <div className="min-h-screen bg-white animate-fade-in relative z-[100]">
          {/* CINEMATIC POSTER HERO */}
          <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={selectedEvent.posterUrl} 
                className="w-full h-full object-cover brightness-[0.7] contrast-[1.1] animate-ken-burns" 
                alt="Cinematic Experience Poster" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#004d4d]/20 to-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#004d4d]/40 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 text-center px-4 max-w-6xl">
              <span className="text-amber-400 font-serif italic text-3xl md:text-5xl mb-6 block animate-fade-in" style={{animationDelay: '0.4s'}}>{selectedEvent.theme}</span>
              <h1 className="text-7xl md:text-[12rem] logo-font text-white mb-8 tracking-[-0.05em] uppercase drop-shadow-2xl animate-fade-in" style={{animationDelay: '0.6s'}}>
                {selectedEvent.title.split(':')[0]}
              </h1>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center text-white/80 text-[10px] md:text-xs tracking-[0.5em] font-black uppercase animate-fade-in" style={{animationDelay: '0.8s'}}>
                <span>{selectedEvent.location}</span>
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                <span>{selectedEvent.days} Experience</span>
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                <span>A Switch Original Production</span>
              </div>
            </div>

            <button 
              onClick={() => setActiveView('standard')} 
              className="absolute top-12 left-12 z-50 text-white/60 hover:text-amber-400 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center group-hover:border-amber-400 transition-all">
                <i className="fa-solid fa-arrow-left" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Return to Collective</span>
            </button>
            
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
              <i className="fa-solid fa-chevron-down text-3xl text-teal-900" />
            </div>
          </section>

          {/* DETAIL CONTENT */}
          <section className="py-32 px-4 md:px-20 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-24">
              {/* LEFT COLUMN: The Narrative */}
              <div className="lg:w-2/3">
                <div className="mb-24">
                  <h2 className="text-5xl md:text-7xl font-serif text-teal-900 italic mb-12">The Narrative</h2>
                  <p className="text-2xl md:text-3xl font-light text-teal-900/60 italic leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* AI RESONANCE PAGE CONTENT */}
                <div className="p-12 md:p-20 bg-[#f4f1ea] rounded-[4rem] border border-teal-50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 text-[15rem] group-hover:rotate-12 transition-all">
                    <i className="fa-solid fa-brain" />
                  </div>
                  <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center text-teal-900 text-3xl shadow-xl">
                      <i className="fa-solid fa-sparkles" />
                    </div>
                    <div>
                      <h4 className="text-teal-900 font-serif text-4xl italic">Oracle Resonance</h4>
                      <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40 mt-1">Advisor · Therapist · Healer · Coach</p>
                    </div>
                  </div>

                  {isFetchingDeepAnswer ? (
                    <div className="flex flex-col items-center py-20 gap-8 opacity-40">
                      <div className="w-32 h-1 bg-teal-100 relative overflow-hidden rounded-full">
                         <div className="absolute inset-0 bg-amber-400 animate-[scroll_2s_infinite]" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.6em]">Aligning Neural Pathways...</p>
                    </div>
                  ) : eventDeepAnswer ? (
                    <div className="animate-fade-in">
                      <MarkdownView content={eventDeepAnswer} dark />
                    </div>
                  ) : (
                    <p className="text-teal-400 italic">Resonance failed to anchor. Re-initiate portal.</p>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: The Logistics & Action */}
              <div className="lg:w-1/3">
                <div className="sticky top-40 space-y-12">
                  <div className="p-12 bg-white rounded-[3rem] shadow-3xl border border-teal-50">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-400 mb-4 block">Sacred Investment</span>
                    <div className="flex items-baseline gap-4 mb-12">
                      <span className="text-7xl font-serif text-teal-900">${selectedEvent.price}</span>
                      <span className="text-teal-900/40 text-xl italic">USD</span>
                    </div>
                    
                    <ul className="space-y-6 mb-12 border-y border-teal-50 py-10">
                      {[
                        { icon: 'fa-calendar', text: selectedEvent.days },
                        { icon: 'fa-location-dot', text: selectedEvent.location },
                        { icon: 'fa-user-group', text: 'Intimate Collective' },
                        { icon: 'fa-bolt', text: 'Full Digital Detox' }
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-4 text-teal-900/60">
                          <div className="w-8 flex justify-center text-amber-500"><i className={`fa-solid ${item.icon}`} /></div>
                          <span className="text-sm font-medium tracking-wide">{item.text}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => handleAddToCart(selectedEvent)} 
                      className="w-full bg-[#004d4d] text-white py-8 rounded-full font-black tracking-[0.5em] uppercase shadow-2xl hover:bg-amber-400 transition-all text-xs"
                    >
                      ADD TO JOURNEY
                    </button>
                    
                    <button 
                      onClick={() => setIsSharing(!isSharing)}
                      className="w-full mt-6 text-teal-900/40 text-[10px] font-black uppercase tracking-[0.4em] hover:text-amber-500 transition-all flex items-center justify-center gap-4"
                    >
                      <i className="fa-solid fa-share-nodes" /> Invite Your Tribe
                    </button>
                    
                    {isSharing && (
                      <div className="flex justify-center gap-6 mt-6 animate-fade-in">
                        <button onClick={() => handleShare('twitter')} className="text-xl text-sky-400"><i className="fa-brands fa-twitter" /></button>
                        <button onClick={() => handleShare('facebook')} className="text-xl text-blue-600"><i className="fa-brands fa-facebook-f" /></button>
                        <button onClick={() => handleShare('whatsapp')} className="text-xl text-green-500"><i className="fa-brands fa-whatsapp" /></button>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-12 bg-amber-400/5 rounded-[3rem] border border-amber-400/20">
                    <h5 className="font-serif text-2xl text-teal-900 mb-6 italic">Advisor Note</h5>
                    <p className="text-sm text-teal-900/60 leading-relaxed font-light">
                      This ritual is high-intensity and requires significant somatic preparation. Our Oracle recommends starting the preparation protocol at least 14 days before your descent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <>
          {/* Cinematic Hero */}
          <section id="hero" className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#f4f1ea]">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000" 
                className="w-full h-full object-cover brightness-[1.15] contrast-[0.9] saturate-[0.8] opacity-60 animate-ken-burns" 
                alt="Cinematic background"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-[#f4f1ea]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-200/20 rounded-full blur-[100px] glow-orb" />
            </div>

            <div className="relative z-10 text-center px-4">
              <h1 className="text-[5rem] md:text-[16rem] logo-font mb-4 tracking-[-0.08em] uppercase text-white drop-shadow-[0_15px_30px_rgba(0,0,0,0.05)] select-none">
                {isLoadingContent ? 'LOADING' : 'SWITCH'}
              </h1>
              <p className="text-base md:text-3xl tracking-[0.8em] font-light uppercase text-[#004d4d]/60 mb-16 md:mb-20 animate-float drop-shadow-sm">
                Travel · Transform · Thrive
              </p>
              
              <div className="relative group">
                <div className="absolute -inset-4 bg-amber-400/30 rounded-full blur-2xl group-hover:bg-amber-400/50 transition-all duration-500 animate-pulse" />
                <button 
                  onClick={() => document.getElementById('main-content-mount')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="relative bg-[#ffbf00] text-[#004d4d] px-10 md:px-16 py-6 md:py-8 rounded-full font-black text-xl md:text-2xl hover:bg-white transition-all duration-700 shadow-[0_20px_50px_rgba(255,191,0,0.4)] flex items-center gap-4 md:gap-6"
                >
                  {activeView === 'dynamic' ? 'VIEW RESONANCE' : 'FLIP THE SWITCH'} <i className="fa-solid fa-bolt animate-bounce" />
                </button>
              </div>
            </div>
          </section>

          {/* Content Mount Point */}
          <main id="main-content-mount">
            {activeView === 'dynamic' && dynamicData ? (
              <section className="py-40 px-4 md:px-20 bg-[#004d4d] text-white animate-fade-in">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row gap-20 items-center mb-24">
                    <div className="flex-1">
                       <span className="text-amber-400 font-serif italic text-3xl mb-4 block">{dynamicData.subtitle}</span>
                       <h2 className="text-6xl md:text-9xl font-serif mb-8 italic opacity-90 leading-tight">{dynamicData.title}</h2>
                       <MarkdownView content={dynamicData.body} />
                    </div>
                    {dynamicData.heroImage && (
                      <div className="flex-1 w-full aspect-square rounded-[5rem] overflow-hidden border border-white/10 shadow-3xl">
                        <img src={dynamicData.heroImage} className="w-full h-full object-cover opacity-80" alt="Resonance image" />
                      </div>
                    )}
                  </div>
                  <button onClick={() => navigateToSlug('home')} className="bg-white text-teal-900 px-12 py-5 rounded-full font-black text-xs tracking-[0.4em] shadow-3xl hover:bg-amber-400 transition-all">RETURN TO SYSTEM CORE</button>
                </div>
              </section>
            ) : (
              <>
                <section id="discover" className="py-24 md:py-40 px-4 md:px-20 bg-[#f4f1ea]">
                  <div className="max-w-7xl mx-auto text-center mb-24">
                    <span className="text-[#967bb6] font-serif italic text-2xl md:text-3xl mb-4 block">Where your soul leads...</span>
                    <h2 className="text-5xl md:text-8xl text-[#004d4d] font-serif mb-16 italic">Personalized Discovery</h2>
                    <GlobeMap onSelectEvent={(e) => setSelectedEvent(e as DetailedEvent)} />
                  </div>
                  {!showQuiz ? (
                    <div className="max-w-5xl mx-auto text-center p-12 md:p-20 bg-white rounded-[3rem] md:rounded-[5rem] shadow-[0_50px_100px_rgba(0,0,0,0.03)] border border-teal-50 hover:shadow-amber-100 transition-all duration-700">
                      <h3 className="text-3xl md:text-5xl font-serif mb-10 italic text-teal-900">Not sure where to begin?</h3>
                      <button onClick={() => setShowQuiz(true)} className="bg-[#004d4d] text-white px-12 md:px-16 py-4 md:py-6 rounded-full font-black tracking-widest hover:bg-amber-400 transition-all uppercase text-[10px] md:text-xs shadow-2xl">Analyze My Intention</button>
                    </div>
                  ) : (
                    <Quiz onComplete={() => setShowQuiz(false)} />
                  )}
                </section>

                <section id="events" className="py-24 md:py-40 bg-[#004d4d] text-white overflow-hidden">
                  <div className="px-4 md:px-20 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                      <div>
                        <h2 className="text-6xl md:text-9xl font-serif italic opacity-90 leading-tight">The Collective</h2>
                        <p className="text-teal-100/40 font-black uppercase tracking-[0.5em] text-[10px] mt-6">52 Curated Shamanic & Growth Masterclasses</p>
                      </div>
                      <div className="flex gap-4">
                        <select 
                          value={themeFilter}
                          onChange={(e) => setThemeFilter(e.target.value)}
                          className="bg-teal-900/50 border border-white/10 text-white rounded-full px-8 py-3 focus:outline-none focus:border-amber-400 text-[10px] uppercase tracking-widest"
                        >
                          {availableThemes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
                      {filteredEvents.map(event => (
                        <div 
                          key={event.id} 
                          onClick={() => setSelectedEvent(event)} 
                          className="group relative h-[450px] md:h-[550px] rounded-[3rem] overflow-hidden cursor-pointer bg-teal-900 border border-white/5 shadow-2xl transition-all duration-500 hover:-translate-y-4"
                        >
                          <img src={event.thumbnail} className="absolute w-full h-full object-cover opacity-60 group-hover:scale-125 transition-all duration-[2000ms] group-hover:opacity-100" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#002d2d] via-transparent to-transparent opacity-100" />
                          <div className="absolute bottom-0 p-8 md:p-12 w-full z-10">
                            <span className="text-amber-400 text-[9px] font-bold tracking-[0.5em] uppercase mb-4 block">{event.theme}</span>
                            <h3 className="text-2xl md:text-3xl font-serif mb-4 leading-tight group-hover:text-amber-400 transition-colors">{event.title}</h3>
                            <p className="text-[10px] text-teal-100/40 mb-8 italic uppercase tracking-widest">{event.location}</p>
                            <div className="flex items-center justify-between pt-6 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                              <span className="text-xl font-serif italic text-amber-400">${event.price}</span>
                              <span className="text-[9px] font-black tracking-widest text-white uppercase">Experience <i className="fa-solid fa-arrow-right ml-2" /></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* PERSISTENT AI ASSISTANT BOTTOM SECTION */}
            <section className="py-32 md:py-48 px-4 md:px-20 bg-[#f4f1ea] border-t border-teal-50 overflow-hidden relative">
               <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-100/40 rounded-full blur-[100px] animate-pulse" />
               <div className="max-w-4xl mx-auto text-center relative z-10">
                  <div className="inline-flex items-center gap-4 bg-white px-8 py-3 rounded-full shadow-sm mb-12 border border-teal-50">
                     <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-900/60">The Oracle is Online</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-serif text-teal-900 mb-12 italic">Ask the Guide</h2>
                  <p className="text-xl md:text-2xl font-light text-teal-900/60 mb-16 italic max-w-2xl mx-auto">
                    Consult our synthesized intelligence for travel advice, emotional mapping, shamanic wisdom, or performance coaching.
                  </p>
                  
                  <div className="relative group max-w-2xl mx-auto">
                    <input 
                      id="global-oracle-input"
                      type="text" 
                      placeholder="e.g. 'How do I prepare for a 10-day silence?'" 
                      className="w-full bg-white border-2 border-teal-100 rounded-full px-12 py-8 pr-32 text-xl focus:outline-none focus:border-amber-400 transition-all shadow-2xl"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleOracleSubmit(undefined, (e.target as HTMLInputElement).value);
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('global-oracle-input') as HTMLInputElement;
                        handleOracleSubmit(undefined, input.value);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#004d4d] text-amber-400 px-10 py-5 rounded-full font-black text-xs tracking-[0.3em] uppercase hover:bg-amber-400 hover:text-teal-900 transition-all shadow-lg"
                    >
                      Seek
                    </button>
                  </div>
                  <div className="mt-12 flex flex-wrap justify-center gap-4 opacity-50">
                    {["Advisor", "Therapist", "Healer", "Coach"].map(label => (
                      <span key={label} className="text-[10px] font-black uppercase tracking-[0.3em] border border-teal-900/20 px-4 py-2 rounded-full">{label}</span>
                    ))}
                  </div>
               </div>
            </section>
          </main>
        </>
      )}

      {/* Persistent Footer */}
      <footer className="bg-white pt-32 md:pt-48 pb-16 md:pb-24 px-4 md:px-20 border-t border-teal-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24 mb-24 md:mb-40">
          <div className="lg:col-span-2">
            <h2 className="text-5xl md:text-7xl logo-font font-black text-[#004d4d] mb-12 tracking-[-0.05em]">SWITCH</h2>
            <p className="text-teal-700/60 max-w-lg italic text-xl md:text-2xl mb-16 leading-relaxed">"The most authentic journey is the one that brings you closer to your own spirit."</p>
          </div>
          <div>
            <h4 className="font-black uppercase text-[10px] tracking-[0.5em] mb-10 text-teal-900 opacity-60">System Map</h4>
            <ul className="space-y-6 text-sm font-medium opacity-50">
              <li><button onClick={() => navigateToSlug('discover')} className="hover:text-amber-500 transition-all uppercase tracking-widest">Global Discovery</button></li>
              <li><button onClick={() => navigateToSlug('events')} className="hover:text-amber-500 transition-all uppercase tracking-widest">Collective</button></li>
              <li><button onClick={() => navigateToSlug('home')} className="hover:text-amber-500 transition-all uppercase tracking-widest">Dashboard</button></li>
              <li><button onClick={() => setIsCheckoutFormOpen(true)} className="hover:text-amber-500 transition-all uppercase tracking-widest">Support</button></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Global Oracle Interface */}
      {isOracleOpen && (
        <div className="fixed inset-0 z-[500] flex justify-end">
          <div onClick={() => setIsOracleOpen(false)} className="absolute inset-0 bg-teal-950/40 backdrop-blur-md" />
          <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-3xl flex flex-col animate-slide-left border-l border-teal-50">
            <div className="p-8 md:p-12 border-b border-teal-50 flex justify-between items-center bg-[#f4f1ea]">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-teal-900 text-xl shadow-lg">
                    <i className="fa-solid fa-sparkles" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-teal-900 italic">Global Oracle</h3>
                    <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">Frequency: Shamanic-Digital Sync</p>
                  </div>
               </div>
               <button onClick={() => setIsOracleOpen(false)} className="text-teal-900 text-3xl hover:rotate-90 transition-all">
                 <i className="fa-solid fa-xmark" />
               </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar bg-white">
              {oracleHistory.length === 0 && (
                <div className="text-center py-20 opacity-30">
                  <i className="fa-solid fa-brain text-8xl mb-8 block text-teal-100" />
                  <p className="italic text-xl">"What journey weighs upon your spirit today?"</p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.4em] font-black">Advisor • Therapist • Healer • Coach</p>
                </div>
              )}
              {oracleHistory.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-sm ${msg.role === 'user' ? 'bg-[#004d4d] text-white rounded-tr-none' : 'bg-teal-50/50 text-teal-900 rounded-tl-none border border-teal-100'}`}>
                    {msg.role === 'user' ? (
                      <p className="text-lg font-light leading-relaxed">{msg.text}</p>
                    ) : (
                      <MarkdownView content={msg.text} dark />
                    )}
                  </div>
                </div>
              ))}
              {isOracleTyping && (
                <div className="flex items-center gap-4 opacity-50 px-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Oracle is resonating...</span>
                </div>
              )}
            </div>

            <div className="p-8 md:p-12 border-t border-teal-50 bg-[#f4f1ea]">
               <form onSubmit={handleOracleSubmit} className="relative group">
                 <input 
                   type="text" 
                   value={oracleInput}
                   onChange={(e) => setOracleInput(e.target.value)}
                   placeholder="Seek guidance from the Oracle..." 
                   className="w-full bg-white border-2 border-teal-100 rounded-full px-10 py-6 pr-24 focus:outline-none focus:border-amber-400 text-lg transition-all shadow-inner"
                 />
                 <button 
                   type="submit" 
                   disabled={isOracleTyping || !oracleInput.trim()}
                   className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#004d4d] text-amber-400 rounded-full flex items-center justify-center text-xl hover:bg-amber-400 hover:text-teal-900 transition-all disabled:opacity-30 disabled:grayscale"
                 >
                   <i className="fa-solid fa-arrow-up" />
                 </button>
               </form>
               <p className="text-[9px] text-center mt-6 text-teal-900/40 tracking-[0.3em] font-medium uppercase">Neural Integration by Gemini Flash 2.5</p>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[600] flex justify-end">
          <div onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-teal-900/40 backdrop-blur-xl" />
          <div className="w-full max-w-lg bg-white h-full relative z-[310] p-12 flex flex-col shadow-2xl animate-slide-left">
            <h3 className="text-4xl md:text-5xl font-serif text-teal-900 italic mb-16">Experience Cart</h3>
            <div className="flex-grow overflow-y-auto space-y-8 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-20 opacity-30 italic">"Your path is currently clear. Add a ritual to begin."</div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex gap-6 p-6 bg-teal-50/30 rounded-[2rem] group border border-transparent hover:border-teal-100 transition-all">
                    <div className="flex-grow">
                      <h4 className="font-serif text-xl text-teal-900">{item.title}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-teal-400 font-bold mt-1">${item.price}</p>
                    </div>
                    <button onClick={() => removeFromCart(idx)} className="text-red-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can" /></button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="mt-auto pt-10 border-t border-teal-50">
                 <div className="flex justify-between items-center mb-8">
                    <span className="font-black uppercase tracking-widest text-xs opacity-40">Total Contribution</span>
                    <span className="text-4xl font-serif text-teal-900">${totalCartPrice}</span>
                 </div>
                 <button onClick={() => { setIsCartOpen(false); setIsCheckoutFormOpen(true); }} className="w-full bg-[#004d4d] text-white py-8 rounded-full font-black tracking-[0.4em] uppercase shadow-2xl hover:bg-amber-400 transition-all">INITIATE CHECKOUT</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Form */}
      {isCheckoutFormOpen && (
        <div className="fixed inset-0 z-[700] bg-[#f4f1ea] flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto animate-fade-in">
          <button onClick={() => setIsCheckoutFormOpen(false)} className="absolute top-8 md:top-16 right-8 md:right-16 text-teal-900 text-4xl md:text-6xl hover:rotate-90 transition-all"><i className="fa-solid fa-xmark" /></button>
          <div className="w-full max-w-2xl bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 shadow-2xl border border-teal-50">
            <h2 className="text-4xl md:text-5xl font-serif text-[#004d4d] mb-8 italic text-center">Ritual Initiation</h2>
            <form className="space-y-8" onSubmit={handleContactSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-400 ml-2">Identifying Label</label>
                <input type="text" required value={contactData.name} onChange={(e) => setContactData({...contactData, name: e.target.value})} className="w-full border-b-2 border-teal-100 py-4 focus:outline-none focus:border-amber-400 text-lg transition-all" placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-400 ml-2">Digital Frequency</label>
                <input type="email" required value={contactData.email} onChange={(e) => setContactData({...contactData, email: e.target.value})} className="w-full border-b-2 border-teal-100 py-4 focus:outline-none focus:border-amber-400 text-lg transition-all" placeholder="Email Address" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-400 ml-2">Spirit Statement</label>
                <textarea required value={contactData.intention} onChange={(e) => setContactData({...contactData, intention: e.target.value})} className="w-full border-b-2 border-teal-100 py-4 h-32 focus:outline-none focus:border-amber-400 text-lg resize-none transition-all" placeholder="Tell us about the resonance you seek..."></textarea>
              </div>
              <button disabled={isTransmitting} className="w-full bg-[#004d4d] text-white py-6 md:py-8 rounded-full font-black tracking-[0.5em] hover:bg-amber-400 transition-all disabled:opacity-50 shadow-xl mt-8">
                {isTransmitting ? 'TRANSMITTING...' : 'TRANSMIT RITUAL'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Floating Oracle Bubble */}
      <div className="fixed bottom-10 right-10 z-[400] flex items-center group">
        <div className="bg-[#004d4d] text-white px-6 py-3 rounded-full mr-4 shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0 hidden md:block">
           <span className="text-[10px] font-black uppercase tracking-[0.4em]">Oracle AI Assistant</span>
        </div>
        <button 
          onClick={() => setIsOracleOpen(true)} 
          className="relative w-20 h-20 bg-amber-400 text-teal-900 rounded-full flex items-center justify-center text-3xl shadow-3xl hover:scale-110 hover:bg-[#004d4d] hover:text-white transition-all animate-bounce"
          style={{ animationDuration: '3.5s' }}
        >
          <i className="fa-solid fa-sparkles" />
          <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-20" />
        </button>
      </div>

      {/* Keyframe Styles */}
      <style>{`
        @keyframes slide-left {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-left {
          animation: slide-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default App;

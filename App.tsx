
import { useState, FC, FormEvent, useEffect, useRef, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import { Section, Event, UserProgress, CommunityPost, AddOn, JournalEntry } from './types';
import { MOCK_EVENTS, COLORS, DetailedEvent, COMMUNITY_POSTS, MARKETPLACE_ADDONS, MOCK_JOURNAL } from './constants';
import GlobeMap from './components/GlobeMap';
import Quiz from './components/Quiz';
import { askMentor, analyzeJourney, getEventDeepAnswer } from './services/geminiService';
import { fetchExternalContent, ExternalPageData } from './services/contentService';

/**
 * Component to render markdown-like content from AI or External sources.
 */
const MarkdownView: FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  return (
    <div className="space-y-4 text-teal-100/90 leading-relaxed font-light">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-serif text-amber-400 mt-8 mb-4 italic">{line.replace('### ', '')}</h3>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-serif text-amber-400 mt-10 mb-6 italic">{line.replace('## ', '')}</h2>;
        if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-serif text-amber-500 mt-12 mb-8 italic border-b border-white/10 pb-4">{line.replace('# ', '')}</h1>;
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return <div key={i} className="flex gap-3 pl-4"><span className="text-amber-400/50">•</span><span>{line.trim().substring(2)}</span></div>;
        }
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return <p key={i} className="text-teal-900/80">{parts.map((part, pi) => part.startsWith('**') && part.endsWith('**') ? <strong key={pi} className="text-amber-600 font-bold">{part.slice(2, -2)}</strong> : part)}</p>;
      })}
    </div>
  );
};

const App: FC = () => {
  // Navigation & Dynamic Content State
  const [activeView, setActiveView] = useState<'standard' | 'dynamic'>('standard');
  const [dynamicData, setDynamicData] = useState<ExternalPageData | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DetailedEvent | null>(null);
  const [eventDeepAnswer, setEventDeepAnswer] = useState<string | null>(null);
  const [isFetchingDeepAnswer, setIsFetchingDeepAnswer] = useState(false);
  
  const [isSharing, setIsSharing] = useState(false);
  const [mentorQuestion, setMentorQuestion] = useState("");
  const [mentorReply, setMentorReply] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
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
    }
  }, [selectedEvent]);

  const fetchDeepAnswer = async (event: DetailedEvent) => {
    setIsFetchingDeepAnswer(true);
    const answer = await getEventDeepAnswer(event.title, event.location, event.theme, event.description);
    setEventDeepAnswer(answer);
    setIsFetchingDeepAnswer(false);
  };

  const navigateToSlug = async (slug: string) => {
    if (slug === 'home') {
      setActiveView('standard');
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
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

      const publicKey: string = 'rtKxSHs8VO77vzy6g'; 

      const response = await emailjs.send(
        'service_9495io7',
        'template_fpxsrp8',
        templateParams,
        {
          publicKey: publicKey,
        }
      );

      alert("The ritual has been transmitted to the source. Your path is being paved. Expect a resonance within 24 hours.");
      
      setContactData({ name: '', email: '', intention: '' });
      setCart([]);
      setIsCheckoutFormOpen(false);
    } catch (error: any) {
      const errorMsg = error?.text || error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      console.error("EmailJS Transmission Error Detailed:", { message: errorMsg, originalError: error });
      alert(`Ritual Transmission Error: ${errorMsg}.`);
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleShare = (platform: string) => {
    if (!selectedEvent) return;
    const shareUrl = window.location.href;
    const shareText = `Explore the transformative journey of "${selectedEvent.title}" in ${selectedEvent.location}. #Switch #TravelTransformThrive`;
    
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

  const openContactWithEvent = (eventTitle: string) => {
    setContactData(prev => ({ 
      ...prev, 
      intention: `I am inquiring about the "${eventTitle}" ritual. I'm interested in knowing more about... ` 
    }));
    setIsCheckoutFormOpen(true);
  };

  return (
    <div className="min-h-screen relative bg-[#f4f1ea] custom-scrollbar overflow-y-auto">
      {/* Persistant Header Shell */}
      <nav className="fixed top-0 w-full p-12 flex justify-between items-center z-[200] bg-gradient-to-b from-[#f4f1ea] via-[#f4f1ea]/80 to-transparent backdrop-blur-sm">
        <div 
          onClick={() => navigateToSlug('home')} 
          className="text-[#004d4d] logo-font text-4xl font-black tracking-tighter opacity-80 cursor-pointer hover:opacity-100 transition-opacity"
        >
          SWITCH
        </div>
        <div className="hidden lg:flex gap-16 text-[#004d4d]/60 text-[10px] tracking-[0.5em] uppercase font-bold">
          <button onClick={() => navigateToSlug('discover')} className="hover:text-amber-500 transition-colors uppercase">Discover</button>
          <button onClick={() => navigateToSlug('events')} className="hover:text-amber-500 transition-colors uppercase">Events</button>
          <button onClick={() => navigateToSlug('home')} className="hover:text-amber-500 transition-colors uppercase">Journey</button>
          <button onClick={() => navigateToSlug('community')} className="hover:text-amber-500 transition-colors uppercase">Community</button>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => setIsCartOpen(true)} className="relative text-teal-900 text-xl hover:text-amber-500 transition-colors">
            <i className="fa-solid fa-cart-shopping" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-amber-400 text-[#004d4d] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cart.length}
              </span>
            )}
          </button>
          <button className="bg-[#004d4d] text-white px-10 py-4 rounded-full text-[10px] tracking-widest font-black uppercase hover:bg-amber-400 transition-all shadow-lg">Enter Portal</button>
        </div>
      </nav>

      {/* Cinematic Hero (Always standard) */}
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
          <h1 className="text-[7rem] md:text-[16rem] logo-font mb-4 tracking-[-0.08em] uppercase text-white drop-shadow-[0_15px_30px_rgba(0,0,0,0.05)] select-none">
            {isLoadingContent ? 'LOADING' : 'SWITCH'}
          </h1>
          <p className="text-lg md:text-3xl tracking-[0.8em] font-light uppercase text-[#004d4d]/60 mb-20 animate-float drop-shadow-sm">
            Travel · Transform · Thrive
          </p>
          
          <div className="relative group">
            <div className="absolute -inset-4 bg-amber-400/30 rounded-full blur-2xl group-hover:bg-amber-400/50 transition-all duration-500 animate-pulse" />
            <button 
              onClick={() => document.getElementById('main-content-mount')?.scrollIntoView({ behavior: 'smooth' })} 
              className="relative bg-[#ffbf00] text-[#004d4d] px-16 py-8 rounded-full font-black text-2xl hover:bg-white transition-all duration-700 shadow-[0_20px_50px_rgba(255,191,0,0.4)] flex items-center gap-6"
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
              <button 
                onClick={() => navigateToSlug('home')} 
                className="bg-white text-teal-900 px-12 py-5 rounded-full font-black text-xs tracking-[0.4em] shadow-3xl hover:bg-amber-400 transition-all"
              >
                RETURN TO SYSTEM CORE
              </button>
            </div>
          </section>
        ) : (
          <>
            <section id="discover" className="py-40 px-4 md:px-20 bg-[#f4f1ea]">
              <div className="max-w-7xl mx-auto text-center mb-24">
                <span className="text-[#967bb6] font-serif italic text-3xl mb-4 block">Where your soul leads...</span>
                <h2 className="text-6xl md:text-8xl text-[#004d4d] font-serif mb-16 italic">Personalized Discovery</h2>
                <GlobeMap onSelectEvent={(e) => setSelectedEvent(e as DetailedEvent)} />
              </div>
              {!showQuiz ? (
                <div className="max-w-5xl mx-auto text-center p-20 bg-white rounded-[5rem] shadow-[0_50px_100px_rgba(0,0,0,0.03)] border border-teal-50 hover:shadow-amber-100 transition-all duration-700">
                  <h3 className="text-5xl font-serif mb-10 italic text-teal-900">Not sure where to begin?</h3>
                  <button onClick={() => setShowQuiz(true)} className="bg-[#004d4d] text-white px-16 py-6 rounded-full font-black tracking-widest hover:bg-amber-400 transition-all uppercase text-xs shadow-2xl">Analyze My Intention</button>
                </div>
              ) : (
                <Quiz onComplete={() => setShowQuiz(false)} />
              )}
            </section>

            <section id="events" className="py-40 bg-[#004d4d] text-white overflow-hidden">
              <div className="px-4 md:px-20 max-w-7xl mx-auto">
                <h2 className="text-6xl md:text-9xl font-serif mb-24 italic opacity-90">Annual Collective</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                  {filteredEvents.map(event => (
                    <div 
                      key={event.id} 
                      onClick={() => setSelectedEvent(event)} 
                      className="group relative h-[650px] rounded-[4rem] overflow-hidden cursor-pointer bg-teal-900 border border-white/5"
                    >
                      <img src={event.thumbnail} className="absolute w-full h-full object-cover opacity-80 group-hover:scale-125 transition-all duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#002d2d] via-transparent to-transparent opacity-100" />
                      <div className="absolute bottom-0 p-16 w-full z-10">
                        <span className="text-amber-400 text-xs font-bold tracking-[0.5em] uppercase mb-6 block">{event.theme}</span>
                        <h3 className="text-5xl font-serif mb-6 leading-tight">{event.title}</h3>
                        <p className="text-base text-teal-100/60 mb-10 italic">{event.location}</p>
                        <div className="flex items-center justify-between pt-10 border-t border-white/10">
                          <span className="text-3xl font-serif italic text-amber-400">${event.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Persistent Footer Shell */}
      <footer className="bg-white pt-48 pb-24 px-4 md:px-20 border-t border-teal-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24 mb-40">
          <div className="lg:col-span-2">
            <h2 className="text-7xl logo-font font-black text-[#004d4d] mb-12 tracking-[-0.05em]">SWITCH</h2>
            <p className="text-teal-700/60 max-w-lg italic text-2xl mb-16 leading-relaxed">"The most authentic journey is the one that brings you closer to your own spirit."</p>
          </div>
          <div>
            <h4 className="font-black uppercase text-xs tracking-[0.5em] mb-12 text-teal-900 opacity-60">System Map</h4>
            <ul className="space-y-8 text-base font-medium opacity-50">
              <li><button onClick={() => navigateToSlug('discover')} className="hover:text-amber-500 transition-all uppercase tracking-widest">Global Discovery</button></li>
              <li><button onClick={() => navigateToSlug('events')} className="hover:text-amber-500 transition-all uppercase tracking-widest">Collective</button></li>
              <li><button onClick={() => navigateToSlug('home')} className="hover:text-amber-500 transition-all uppercase tracking-widest">Dashboard</button></li>
              <li><button onClick={() => setIsCheckoutFormOpen(true)} className="hover:text-amber-500 transition-all uppercase tracking-widest">Support</button></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Persistent UI Elements (Modals, Overlays, Cart) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[300] bg-teal-900/40 backdrop-blur-xl flex justify-end">
          <div onClick={() => setIsCartOpen(false)} className="absolute inset-0" />
          <div className="w-full max-w-lg bg-white h-full relative z-[310] p-12 flex flex-col shadow-2xl">
            <h3 className="text-5xl font-serif text-teal-900 italic mb-16">Experience Cart</h3>
            <div className="flex-grow overflow-y-auto space-y-8">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-6 p-6 bg-teal-50/30 rounded-[2rem]">
                  <h4 className="font-serif text-xl text-teal-900 flex-grow">{item.title}</h4>
                  <button onClick={() => removeFromCart(idx)} className="text-red-400"><i className="fa-solid fa-trash-can" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => { setIsCartOpen(false); setIsCheckoutFormOpen(true); }} className="w-full bg-[#004d4d] text-white py-8 rounded-full font-black tracking-[0.4em] uppercase mt-12">CHECKOUT</button>
          </div>
        </div>
      )}

      {isCheckoutFormOpen && (
        <div className="fixed inset-0 z-[400] bg-[#f4f1ea] flex flex-col items-center justify-center p-12 overflow-y-auto">
          <button onClick={() => setIsCheckoutFormOpen(false)} className="absolute top-16 right-16 text-teal-900 text-6xl hover:rotate-90 transition-all"><i className="fa-solid fa-xmark" /></button>
          <div className="w-full max-w-2xl bg-white rounded-[3rem] p-16 shadow-2xl border border-teal-50">
            <h2 className="text-5xl font-serif text-[#004d4d] mb-8 italic text-center">Ritual Initiation</h2>
            <form className="space-y-8" onSubmit={handleContactSubmit}>
              <input type="text" required value={contactData.name} onChange={(e) => setContactData({...contactData, name: e.target.value})} className="w-full border-b-2 border-teal-100 py-4 focus:outline-none focus:border-amber-400 text-lg" placeholder="Full Name" />
              <input type="email" required value={contactData.email} onChange={(e) => setContactData({...contactData, email: e.target.value})} className="w-full border-b-2 border-teal-100 py-4 focus:outline-none focus:border-amber-400 text-lg" placeholder="Email" />
              <textarea required value={contactData.intention} onChange={(e) => setContactData({...contactData, intention: e.target.value})} className="w-full border-b-2 border-teal-100 py-4 h-32 focus:outline-none focus:border-amber-400 text-lg resize-none" placeholder="Your Intention"></textarea>
              <button disabled={isTransmitting} className="w-full bg-[#004d4d] text-white py-6 rounded-full font-black tracking-[0.5em] hover:bg-amber-400 transition-all disabled:opacity-50">
                {isTransmitting ? 'TRANSMITTING...' : 'TRANSMIT RITUAL'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedEvent && !isCheckoutFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-8 bg-teal-900/70 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-7xl rounded-[5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative border border-teal-50">
            <button onClick={() => setSelectedEvent(null)} className="absolute top-12 right-12 text-teal-900 lg:text-teal-900 z-50 text-5xl hover:rotate-90 transition-all"><i className="fa-solid fa-circle-xmark" /></button>
            <div className="lg:w-2/5 min-h-[400px] relative">
              <img src={selectedEvent.thumbnail} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 to-transparent" />
              <div className="absolute bottom-12 left-12 text-white">
                 <h4 className="text-amber-400 uppercase tracking-[0.4em] font-black text-[10px] mb-4">Location Anchor</h4>
                 <p className="text-3xl font-serif italic">{selectedEvent.location}</p>
              </div>
            </div>
            <div className="lg:w-3/5 p-16 lg:p-24 bg-white overflow-y-auto max-h-[95vh] custom-scrollbar relative">
              <div className="flex justify-between items-start mb-12">
                <h3 className="text-6xl font-serif italic leading-tight text-teal-900">{selectedEvent.title}</h3>
                <div className="relative">
                  <button 
                    onClick={() => setIsSharing(!isSharing)} 
                    className="text-teal-400 hover:text-amber-500 transition-colors text-3xl p-4"
                    title="Share Experience"
                  >
                    <i className="fa-solid fa-share-nodes" />
                  </button>
                  {isSharing && (
                    <div className="absolute right-0 top-16 bg-white border border-teal-50 shadow-2xl rounded-2xl p-4 flex gap-4 z-50 animate-fade-in">
                      <button onClick={() => handleShare('twitter')} className="w-10 h-10 flex items-center justify-center rounded-full bg-sky-100 text-sky-500"><i className="fa-brands fa-twitter" /></button>
                      <button onClick={() => handleShare('facebook')} className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600"><i className="fa-brands fa-facebook-f" /></button>
                      <button onClick={() => handleShare('linkedin')} className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700"><i className="fa-brands fa-linkedin-in" /></button>
                      <button onClick={() => handleShare('whatsapp')} className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600"><i className="fa-brands fa-whatsapp" /></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-16">
                <span className="text-teal-400 uppercase tracking-[0.5em] font-black text-[11px] mb-4 block">Event Essence</span>
                <p className="text-2xl text-teal-900/70 font-light italic leading-relaxed">{selectedEvent.description}</p>
              </div>

              {/* AI DEEP ANSWER SECTION */}
              <div className="mb-16 p-12 bg-teal-50/50 rounded-[3rem] border border-teal-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl group-hover:rotate-12 transition-all">
                  <i className="fa-solid fa-brain" />
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-teal-900 text-xl shadow-lg animate-pulse">
                    <i className="fa-solid fa-sparkles" />
                  </div>
                  <h4 className="text-teal-900 font-serif text-2xl italic">Oracle Resonance Analysis</h4>
                </div>

                {isFetchingDeepAnswer ? (
                  <div className="flex flex-col items-center py-12 gap-6 opacity-40">
                    <div className="w-20 h-1 bg-teal-100 relative overflow-hidden rounded-full">
                       <div className="absolute inset-0 bg-amber-400 animate-[scroll_1.5s_infinite]" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.6em]">Consulting the ancient and the digital...</p>
                  </div>
                ) : eventDeepAnswer ? (
                  <div className="animate-fade-in">
                    <MarkdownView content={eventDeepAnswer} />
                  </div>
                ) : (
                  <p className="text-teal-400 italic">The analysis failed to manifest. Please re-open the portal.</p>
                )}
              </div>
              
              <div className="mt-16 pt-16 border-t border-teal-50 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex flex-col">
                  <span className="text-teal-900 text-6xl font-serif">${selectedEvent.price}</span>
                  <span className="text-teal-400 uppercase tracking-[0.4em] font-black text-[10px] mt-2">Sacred Investment</span>
                </div>
                <div className="flex gap-6">
                  <button onClick={() => handleAddToCart(selectedEvent)} className="bg-white border-2 border-amber-400 text-teal-900 px-14 py-6 rounded-full font-black text-sm tracking-[0.4em] uppercase hover:bg-amber-50 transition-all">ADD TO CART</button>
                  <button onClick={() => { setSelectedEvent(null); setIsCheckoutFormOpen(true); }} className="bg-amber-400 text-teal-900 px-16 py-6 rounded-full font-black text-sm tracking-[0.4em] uppercase shadow-xl hover:scale-105 transition-all">INITIATE SHIFT</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

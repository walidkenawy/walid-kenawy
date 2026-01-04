
import { useState, FC } from 'react';
import { MOCK_EVENTS } from '../constants';
import { Event } from '../types';

interface GlobeMapProps {
  onSelectEvent: (event: Event) => void;
}

const GlobeMap: FC<GlobeMapProps> = ({ onSelectEvent }) => {
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-[2/1] bg-[#002d2d] rounded-3xl overflow-hidden shadow-2xl border border-teal-800/50">
      {/* SVG Map Background - Simplified abstraction */}
      <svg viewBox="0 0 1000 500" className="w-full h-full opacity-30 select-none">
        <path d="M150,150 Q200,100 300,150 T500,200 T700,150 T900,100" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="5,5" />
        <circle cx="200" cy="200" r="100" fill="rgba(255,255,255,0.05)" />
        <circle cx="700" cy="300" r="150" fill="rgba(255,255,255,0.03)" />
        {/* Abstract World Representation */}
        <text x="400" y="250" fontSize="120" opacity="0.1" fill="white">MAP</text>
      </svg>

      {/* Pins */}
      {MOCK_EVENTS.map((event) => (
        <div
          key={event.id}
          className="absolute cursor-pointer group"
          style={{ left: `${event.coordinates.x}%`, top: `${event.coordinates.y}%` }}
          onMouseEnter={() => setHoveredEvent(event)}
          onMouseLeave={() => setHoveredEvent(null)}
          onClick={() => onSelectEvent(event)}
        >
          <div className="relative w-6 h-6 -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-[#ffbf00] rounded-full absolute top-1.5 left-1.5 z-10 border-2 border-[#004d4d]" />
            <div className="w-full h-full bg-[#ffbf00]/50 rounded-full animate-ping opacity-75" />
          </div>

          {/* Quick View Card */}
          {hoveredEvent?.id === event.id && (
            <div className="absolute z-20 top-8 left-1/2 -translate-x-1/2 w-48 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/20 transform transition-all duration-300 scale-100 opacity-100">
              <img src={event.thumbnail} alt={event.title} className="w-full h-24 object-cover rounded-lg mb-2" />
              <h4 className="font-serif text-sm font-bold text-teal-900 leading-tight">{event.title}</h4>
              <p className="text-[10px] text-teal-700 uppercase tracking-widest mt-1">{event.theme}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">{event.days}</span>
                <span className="text-xs font-bold text-teal-900">${event.price}</span>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Map Labels */}
      <div className="absolute bottom-6 left-6 text-white/40 text-xs font-mono tracking-widest">
        00.00°N / 00.00°E <br />
        VOYAGE & VEDA GLOBAL COMPASS v1.0
      </div>
    </div>
  );
};

export default GlobeMap;

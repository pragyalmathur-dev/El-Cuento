import { useEffect, useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Sun, 
  CloudSun, 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles, 
  Sliders, 
  Layers, 
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { OverlayParams, Apartment } from './types';
import { APARTMENTS, BLOCK_META, DEFAULT_OVERLAY_PARAMS } from './data';
import MapContainer from './components/MapContainer';
import UnitDetailsModal from './components/UnitDetailsModal';
import TuningPanel from './components/TuningPanel';

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<'A' | 'B' | 'C' | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);
  const [weatherTemp, setWeatherTemp] = useState<number>(31); // Average tropical Goa temperature
  const [weatherDesc, setWeatherDesc] = useState<string>('Bright Sun');
  
  // Site Overlay Calibration parameter states
  const [overlayParams, setOverlayParams] = useState<OverlayParams>(() => {
    try {
      const saved = localStorage.getItem('elcuento.overlay.v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('LocalStorage preferences bypassed.');
    }
    return DEFAULT_OVERLAY_PARAMS;
  });

  // Toggle debug calibration parameters panel
  const [showTuning, setShowTuning] = useState<boolean>(false);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);

  // Initialize loading timer and state values
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1100);

    // Read URL query parameter "?tune=1" to unlock calibration panel on arrival
    const params = new URLSearchParams(window.location.search);
    if (params.get('tune') === '1') {
      setShowTuning(true);
    }

    // Dynamic Goa Weather approximation based on local conditions
    const hour = new Date().getUTCHours() + 5.5; // Goa/India offset
    if (hour > 18 || hour < 6) {
      setWeatherTemp(27);
      setWeatherDesc('Warm Breeze');
    } else {
      setWeatherTemp(32);
      setWeatherDesc('Dappled Sun');
    }

    return () => clearTimeout(timer);
  }, []);

  const handleSelectUnit = (id: string) => {
    setSelectedUnitId(id);
    setIsSidebarOpen(false); // Close mobile tray on click
    
    // Automatically switch active sidebar block to match the selected unit
    const unit = APARTMENTS.find((a) => a.id === id);
    if (unit) {
      setSelectedBlock(unit.block as 'A' | 'B' | 'C');
    }
  };

  const handleResetOverlayDefaults = () => {
    setOverlayParams(DEFAULT_OVERLAY_PARAMS);
    localStorage.removeItem('elcuento.overlay.v1');
  };

  // Safe retrieve selected unit details
  const activeUnit = APARTMENTS.find((a) => a.id === selectedUnitId) || null;

  // Toggle synthesized ambient slow-living sound loop (tropical birds & rustling palm breeze)
  const toggleAmbientAudio = () => {
    const audioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioContextClass) return;

    if (!isAmbientPlaying) {
      setIsAmbientPlaying(true);
      // Play a beautiful synthesized slow-living wave soundscape
      try {
        const ctx = new audioContextClass();
        const mainGain = ctx.createGain();
        mainGain.gain.setValueAtTime(0.06, ctx.currentTime);
        mainGain.connect(ctx.destination);

        // Low ocean roar synthesis using brown noise
        const bufferSize = ctx.sampleRate * 4; // 4 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // amplify
        }

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.08; // extremely slow wash rate (12 seconds cycle)
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.25;
        lfo.connect(lfoGain);

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 350;
        bandpass.Q.value = 1.0;

        lfoGain.connect(bandpass.frequency);

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = buffer;
        noiseSrc.loop = true;
        noiseSrc.connect(bandpass);
        bandpass.connect(mainGain);

        noiseSrc.start();
        lfo.start();

        // High frangipani breeze birds whistle node
        const playBirdWhistle = () => {
          if (!(window as any).ambientAudioPlaying) return;
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          oscGain.gain.setValueAtTime(0.00, ctx.currentTime);
          oscGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.5);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(950 + Math.random() * 200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1400 + Math.random() * 200, ctx.currentTime + 1.2);

          osc.connect(oscGain);
          oscGain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 3.0);

          setTimeout(playBirdWhistle, 5000 + Math.random() * 7000);
        };

        (window as any).ambientAudioPlaying = true;
        (window as any).ambientNoiseSource = noiseSrc;
        (window as any).ambientLfo = lfo;
        (window as any).ambientCtx = ctx;

        playBirdWhistle();
      } catch (err) {
        console.warn('Audio environment blocked by browser policies.', err);
      }
    } else {
      setIsAmbientPlaying(false);
      try {
        (window as any).ambientAudioPlaying = false;
        if ((window as any).ambientNoiseSource) (window as any).ambientNoiseSource.stop();
        if ((window as any).ambientLfo) (window as any).ambientLfo.stop();
        if ((window as any).ambientCtx) (window as any).ambientCtx.close();
      } catch (e) {
        console.warn('Audio connection cleanup error.');
      }
    }
  };

  return (
    <div className="relative h-full w-full bg-brand-cream text-brand-ink font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* 1. BRAND LUXURY LOADING SCREEN */}
      {loading && (
        <div id="loader-overlay" className="fixed inset-0 z-[100] bg-brand-cream flex flex-col items-center justify-center transition-opacity duration-700 ease-out">
          <div className="text-center space-y-6 max-w-sm px-6">
            <h1 className="font-serif text-4xl font-extralight tracking-[0.25em] text-brand-ink uppercase leading-snug">
              EL <span className="text-brand-olive font-normal italic">CUENTO</span>
            </h1>
            
            {/* Elegant thin loading progress indicator */}
            <div className="w-48 h-[1px] bg-brand-cream-deep relative overflow-hidden mx-auto">
              <div className="absolute top-0 left-0 h-full w-24 bg-brand-gold animate-slide-load" style={{ animation: 'slide-load 1.6s infinite ease-in-out' }}></div>
            </div>

            <p className="font-sans font-light text-[10px] tracking-[0.4em] text-brand-ink-soft uppercase">
              Boutique Residences · Mandrem
            </p>
          </div>
        </div>
      )}

      {/* CSS Injection for beautiful sliding loading progress bar */}
      <style>{`
        @keyframes slide-load {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-spin-slow {
          animation: spin 16s linear infinite;
        }
      `}</style>

      {/* Mobile Header Trigger Row */}
      <header className="md:hidden bg-brand-cream-soft border-b border-brand-sand p-4 flex items-center justify-between z-40 relative">
        <button
          onClick={() => setIsSidebarOpen(true)}
          id="btn-mobile-menu-trigger"
          className="p-2.5 rounded-full bg-brand-cream border border-brand-sand text-brand-ink flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Open Navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="font-serif text-xl tracking-[0.15em] text-brand-ink uppercase">
          EL <span className="text-brand-olive italic font-light">CUENTO</span>
        </h1>

        <div className="w-10 h-10 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-brand-gold" />
        </div>
      </header>

      {/* --- 2. LEFT SIDEBAR: Boutique portfolio details (Spans 350px on desktop) --- */}
      <aside 
        id="property-sidebar"
        className={`fixed md:relative top-0 left-0 h-full z-40 w-80 md:w-[350px] bg-gradient-to-b from-brand-cream-soft to-brand-cream border-r border-brand-sand flex flex-col justify-between transform transition-transform duration-500 ease-in-out md:transform-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex flex-col h-full justify-between">
          
          {/* Header & Brand Identity */}
          <div className="p-7 border-b border-brand-sand/60 relative flex flex-col items-stretch">
            {/* Close Mobile menu */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              id="btn-mobile-menu-close"
              className="md:hidden absolute top-7 right-7 p-1 text-brand-ink-soft hover:text-brand-ink z-10"
              aria-label="Close Mobile Menu"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-center mb-1">
              <span className="font-sans text-[8px] tracking-[0.40em] text-brand-olive uppercase leading-none font-semibold">
                VIANAAR HOMES
              </span>
            </div>

            <h1 className="font-serif text-3xl font-light tracking-[0.03em] text-brand-ink leading-none mt-1">
              El <em className="font-normal italic text-[#5B6A4E]">Cuento</em>
            </h1>
            <p className="font-sans text-[11px] font-light tracking-[0.24em] text-brand-ink-soft uppercase leading-none mt-2.5">
              Mandrem · North Goa
            </p>
            <div className="w-7 h-[1px] bg-brand-gold mt-4.5" />
          </div>

          {/* Dynamic Scrollable Property blocks & units navigator */}
          <div className="flex-1 overflow-y-auto px-7 py-5 custom-scrollbar">
            
            {/* TO SITE Full width big Green Pill button */}
            <button
              onClick={() => {
                setSelectedBlock(null);
                setSelectedUnitId(null);
                setIsSidebarOpen(false);
                setRecenterTrigger((prev) => prev + 1);
              }}
              className="w-full bg-[#5B6A4E] text-brand-cream py-3.5 px-6 rounded-lg font-serif font-bold tracking-[0.16em] text-[11px] uppercase shadow-md hover:bg-[#4a573e] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mb-6 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>TO SITE MAP</span>
            </button>

            {/* Dynamic sidebar screen switcher */}
            {selectedBlock === null ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase text-brand-ink-soft">
                    SELECT BLOCK
                  </h3>
                  <span className="font-serif text-[10px] tracking-wide text-brand-ink-soft italic font-medium">
                    3 Blocks Available
                  </span>
                </div>

                <div className="space-y-3">
                  {(['A', 'B', 'C'] as const).map((blockLetter) => {
                    const count = APARTMENTS.filter((a) => a.block === blockLetter).length;
                    return (
                      <button
                        key={blockLetter}
                        onClick={() => setSelectedBlock(blockLetter)}
                        className="w-full text-left bg-brand-cream-soft border border-brand-sand/65 hover:border-[#5B6A4E] rounded-xl p-4 hover:bg-[#5B6A4E]/5 transition-all duration-300 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-serif text-2xl font-bold text-[#5B6A4E] leading-none">
                            Block {blockLetter}
                          </span>
                          <span className="bg-[#FAF6EC] text-[9px] border border-brand-sand px-2.5 py-1 rounded-full font-serif font-semibold tracking-wide text-[#5B6A4E]">
                            {count} Units
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                
                {/* Selected Block with Back Trigger */}
                <div className="space-y-3 pb-3.5 border-b border-brand-sand/60">
                  <button
                    onClick={() => setSelectedBlock(null)}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-sans font-extrabold text-[#5B6A4E] hover:text-[#4a573e] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Blocks</span>
                  </button>

                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#5B6A4E] leading-none">
                      Block {selectedBlock}
                    </h3>
                  </div>
                </div>

                {/* Grid of circle buttons */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase text-brand-ink-soft">
                      APARTMENTS
                    </h4>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {APARTMENTS.filter((apt) => apt.block === selectedBlock).map((apt) => {
                      const isActive = apt.id === selectedUnitId;
                      return (
                        <button
                          key={apt.id}
                          onClick={() => handleSelectUnit(apt.id)}
                          className={`aspect-square w-full rounded-full border flex flex-col items-center justify-center font-serif text-[11px] font-bold tracking-wider transition-all duration-300 cursor-pointer
                            ${isActive
                              ? 'bg-[#5B6A4E] text-[#FAF6EC] border-[#5B6A4E] shadow-md scale-105 font-extrabold'
                              : 'bg-white hover:bg-[#5B6A4E]/10 hover:border-[#5B6A4E] text-brand-ink border-brand-sand/70'
                            }`}
                        >
                          {apt.id}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Descriptive block snippet */}
                <div className="bg-[#FAF6EC] border border-brand-sand/50 p-4 rounded-lg mt-6">
                  <p className="font-sans font-light text-[10.5px] text-brand-ink-soft leading-relaxed">
                    {BLOCK_META[selectedBlock].description}
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>
      </aside>

      {/* --- 3. MAIN MAP DISPLAY STAGE (Pervades all background space) --- */}
      <main className="flex-1 relative h-full">
        <MapContainer
          overlayParams={overlayParams}
          selectedUnitId={selectedUnitId}
          onSelectUnit={handleSelectUnit}
          showTuningPanel={showTuning}
          selectedBlock={selectedBlock}
          recenterTrigger={recenterTrigger}
        />

        {/* Ambient Top Float card banner */}
        <div className="absolute top-6 left-6 md:left-1/2 md:-translate-x-1/2 z-20 bg-brand-cream-soft/90 backdrop-blur-md rounded-full px-5 py-2.5 border border-brand-gold-soft/35 shadow-lg flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-olive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-olive"></span>
            </div>
            <span className="font-sans text-[10px] tracking-[0.25em] font-medium text-brand-ink uppercase whitespace-nowrap">
              EL CUENTO · LIVE SITE PLAN
            </span>
          </div>

          <div className="w-[1px] h-3.5 bg-brand-sand" />

          {/* Computed tropical Goa weather widget */}
          <div className="flex items-center gap-2">
            <CloudSun className="w-3.5 h-3.5 text-brand-gold" />
            <span className="font-serif italic text-xs text-brand-olive-deep whitespace-nowrap">
              {weatherTemp}°C {weatherDesc}
            </span>
          </div>

          <div className="w-[1px] h-3.5 bg-brand-sand" />

          {/* Quick toggle for the Dev Alignment Custom Tool */}
          <button
            onClick={() => setShowTuning(!showTuning)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] tracking-widest font-sans font-extrabold uppercase transition-all duration-350 cursor-pointer shadow-sm
              ${showTuning 
                ? 'bg-brand-olive text-[#FAF6EC] border-[#5B6A4E]' 
                : 'bg-white hover:bg-[#5B6A4E]/10 hover:border-[#5B6A4E] text-[#5B6A4E] border border-brand-sand/50'
              }`}
            title="Toggle Sitemap Alignment Tools"
          >
            <Sliders className="w-3 h-3" />
            <span>DEV TOOL</span>
          </button>
        </div>

        {/* Dynamic active Overlay Calibration sliders panel */}
        {showTuning && (
          <TuningPanel
            params={overlayParams}
            onChangeParams={setOverlayParams}
            onResetToDefaults={handleResetOverlayDefaults}
            onClose={() => setShowTuning(false)}
          />
        )}
      </main>

      {/* --- 4. FLOATING UNIT DESIGN BLUEPRINT DRAWER & SHOWN GALLERY --- */}
      {selectedUnitId && (
        <UnitDetailsModal
          unit={activeUnit}
          onClose={() => setSelectedUnitId(null)}
        />
      )}

    </div>
  );
}

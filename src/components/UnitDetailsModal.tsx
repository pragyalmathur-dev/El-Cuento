import React, { useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, CornerDownRight } from 'lucide-react';
import { Apartment } from '../types';
import { BLOCK_META, FLOORPLANS } from '../data';

interface UnitDetailsModalProps {
  unit: Apartment | null;
  onClose: () => void;
}

export default function UnitDetailsModal({ unit, onClose }: UnitDetailsModalProps) {
  const [withDimension, setWithDimension] = useState<boolean>(true);
  const [imgErrorCount, setImgErrorCount] = useState<number>(0);

  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const isDraggingRef = useRef<boolean>(false);
  const startDragRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const pinchStartRef = useRef<{ d: number; s: number } | null>(null);

  // Sync state when selected apartment unit changes
  useEffect(() => {
    if (unit) {
      setImgErrorCount(0);
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [unit]);

  // Reset image errors when switching dimension state to check corresponding custom assets
  useEffect(() => {
    setImgErrorCount(0);
  }, [withDimension]);

  if (!unit) return null;

  // Render original vector fallback inline safely as a data URI
  const getSvgUri = (variantKey: '1bhk' | '2bhk' | '3bhk') => {
    const rawSvg = FLOORPLANS[variantKey];
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(rawSvg);
  };

  // Naming resolution helper (resolves IDs like 'A01' to 'A_01')
  const getFilenameBase = () => {
    const block = unit.block; // e.g. 'A'
    let numPart = unit.id; // e.g. 'A01' or 'A101'
    if (numPart.toUpperCase().startsWith(block)) {
      numPart = numPart.slice(1); // '01' or '101'
    }
    return `${block}_${numPart}`; // 'A_01'
  };

  // Sequenced fallback loader for custom assets: .jpg -> .jpeg -> .png -> .svg -> .webp -> default fallback
  const getImagePath = (attempt: number) => {
    const base = getFilenameBase();
    const suffix = withDimension ? '_WD' : '_WOD';
    
    if (attempt === 0) return `/assets/floor-plan/${base}${suffix}.jpg`;
    if (attempt === 1) return `/assets/floor-plan/${base}${suffix}.jpeg`;
    if (attempt === 2) return `/assets/floor-plan/${base}${suffix}.png`;
    if (attempt === 3) return `/assets/floor-plan/${base}${suffix}.svg`;
    if (attempt === 4) return `/assets/floor-plan/${base}${suffix}.webp`;
    if (attempt === 5 && unit.floorplanAsset) return unit.floorplanAsset;
    
    return getSvgUri(unit.variant);
  };

  const imageSrc = getImagePath(imgErrorCount);

  const handleImgError = () => {
    if (imgErrorCount < 6) {
      setImgErrorCount((prev) => prev + 1);
    }
  };

  // Zoom Controllers
  const handleZoomIn = () => setScale((prev) => Math.min(3.5, prev * 1.25));
  const handleZoomOut = () => setScale((prev) => Math.max(0.5, prev / 1.25));
  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Drag-to-Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startDragRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    setOffset({
      x: e.clientX - startDragRef.current.x,
      y: e.clientY - startDragRef.current.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Target Container Fullscreen Handler
  const toggleFullscreen = () => {
    if (!viewerRef.current) return;

    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn('Fullscreen access failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Multi-Touch Handlers (Swipe variant details or double-pinch zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY,
        t: Date.now() 
      };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartRef.current = { d: Math.hypot(dx, dy), s: scale };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.hypot(dx, dy);
      const computedScale = Math.max(0.5, Math.min(3.5, pinchStartRef.current.s * (d / pinchStartRef.current.d)));
      setScale(computedScale);
    } else if (e.touches.length === 1 && touchStartRef.current) {
      // Allow slight drag panning on touch if zoomed in
      if (scale > 1.05) {
        const dx = e.touches[0].clientX - touchStartRef.current.x;
        const dy = e.touches[0].clientY - touchStartRef.current.y;
        setOffset((prev) => ({
          x: prev.x + dx * 0.4,
          y: prev.y + dy * 0.4
        }));
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          t: touchStartRef.current.t
        };
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    pinchStartRef.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-brand-ink/75 backdrop-blur-md">
      {/* Immersive show room card board matching screenshot wireframe perfectly */}
      <div 
        id={`residence-${unit.id}`}
        className="relative w-full max-w-6xl max-h-[92vh] bg-[#FCFAF6] rounded-2.5xl border border-brand-sand shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100"
      >
        
        {/* ================= HEADER SECTION ================= */}
        <div className="w-full px-6 md:px-8 py-5 flex items-center justify-between border-b border-brand-sand/35 bg-[#FAF9F5]">
          <div>
            <h2 className="font-serif text-3xl font-medium text-brand-ink uppercase tracking-wide leading-none">
              Residence {unit.id}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5 font-sans text-[10px] font-black tracking-[0.18em] text-brand-olive uppercase select-none">
              <span>Floor Plan Perspective</span>
              <span className="text-brand-gold font-bold">•</span>
              <span className="text-[#10B981] font-extrabold tracking-[0.22em]">Available</span>
            </div>
          </div>

          {/* Simple clean Close icon positioned exactly at top right border matching screenshot */}
          <button
            onClick={onClose}
            id="btn-close-drawer"
            className="p-2 ml-4 rounded-full bg-brand-cream/60 hover:bg-brand-gold hover:rotate-90 text-brand-ink transition-all duration-300 border border-brand-sand/40 cursor-pointer"
            aria-label="Close Floor Plan Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= SECONDARY SPLIT CONTENT SECTION ================= */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">
          
          {/* --- LEFT SIDEBAR (DIMENSIONS AND SPECIFICATIONS) --- */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-[#FCFAF6] p-6 hover:shadow-inner border-r border-brand-sand/40 overflow-y-auto max-h-[40vh] md:max-h-full flex flex-col justify-between gap-6">
            
            <div className="space-y-6">
              {/* DIMENSIONS BINARY SWITCH COMPONENT (WITHOUT NESTED FLOOR LEVER AS REQUESTED) */}
              <div>
                <span className="font-sans text-[10px] font-bold text-[#7E8675] tracking-[0.16em] uppercase mb-2.5 block">
                  Dimensions
                </span>
                
                <div className="bg-[#EFEDE8]/75 p-1 rounded-full flex gap-1 w-full max-w-[220px] border border-brand-sand/20">
                  <button
                    onClick={() => setWithDimension(true)}
                    className={`flex-1 py-1.5 text-xs font-black tracking-wider uppercase rounded-full transition-all duration-200 cursor-pointer text-center ${
                      withDimension 
                        ? 'bg-white text-[#0E3524] shadow-sm font-extrabold' 
                        : 'text-[#7E8675]/80 hover:text-[#0a261a]'
                    }`}
                  >
                    With
                  </button>
                  <button
                    onClick={() => setWithDimension(false)}
                    className={`flex-1 py-1.5 text-xs font-black tracking-wider uppercase rounded-full transition-all duration-200 cursor-pointer text-center ${
                      !withDimension 
                        ? 'bg-white text-[#0E3524] shadow-sm font-extrabold' 
                        : 'text-[#7E8675]/80 hover:text-[#0a261a]'
                    }`}
                  >
                    Without
                  </button>
                </div>
              </div>

              {/* SPECIFICATION DETAILS (CARPET AREA, ACCENTS, BREEZE CONTROLS) */}
              <div className="border-t border-brand-sand/40 pt-5 space-y-4">
                <div>
                  <span className="font-sans uppercase text-[9px] font-bold tracking-widest text-[#7E8675] block mb-0.5">
                    Layout Schema
                  </span>
                  <span className="font-serif text-base font-bold text-brand-ink leading-snug block">
                    {unit.config}
                  </span>
                  <span className="font-sans text-[10px] font-medium text-brand-olive block leading-normal italic text-[#7E8675]">
                    {unit.configSub}
                  </span>
                </div>

                <div>
                  <span className="font-sans uppercase text-[9px] font-bold tracking-widest text-[#7E8675] block mb-0.5">
                    Carpet Area
                  </span>
                  <span className="font-serif text-base font-bold text-brand-ink leading-snug block">
                    {unit.area}
                  </span>
                  <span className="font-sans text-[10px] font-medium text-brand-olive block leading-normal italic text-[#7E8675]">
                    {unit.areaSub}
                  </span>
                </div>

                <div>
                  <span className="font-sans uppercase text-[9px] font-bold tracking-widest text-[#7E8675] block mb-0.5">
                    Aspect & Sunlight
                  </span>
                  <span className="font-serif text-[13.5px] font-bold text-brand-ink leading-snug block">
                    {unit.aspect}
                  </span>
                  <span className="font-sans text-[9.5px] font-medium text-brand-olive block leading-tight text-[#7E8675] mt-0.5">
                    {unit.aspectSub}
                  </span>
                </div>

                <div>
                  <span className="font-sans uppercase text-[9px] font-bold tracking-widest text-[#7E8675] block mb-0.5">
                    Open Spaces
                  </span>
                  <span className="font-serif text-[13.5px] font-bold text-brand-ink leading-snug block">
                    {unit.outdoor}
                  </span>
                  <span className="font-sans text-[9.5px] font-medium text-brand-olive block leading-tight text-[#7E8675] mt-0.5">
                    {unit.outdoorSub}
                  </span>
                </div>
              </div>
            </div>

            {/* LOWER SLOW LIVING SPECIFICATION HIGHLIGHTS LIST */}
            <div className="border-t border-brand-sand/40 pt-5 space-y-2.5">
              <span className="font-sans uppercase text-[9px] font-bold tracking-widest text-[#7E8675] block mb-1">
                Design Features
              </span>
              <div className="space-y-2 text-[10.5px] leading-relaxed text-brand-ink-soft font-sans font-light">
                {unit.features.slice(0, 3).map((feature, i) => (
                  <div key={i} className="flex gap-2">
                    <CornerDownRight className="w-3 h-3 text-brand-gold flex-shrink-0 mt-0.5" />
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* --- RIGHT STAGE (TACTILE BLUEPRINT MAP RENDERING VIEWPORT) --- */}
          <div 
            ref={viewerRef}
            className="col-span-12 md:col-span-8 lg:col-span-9 bg-gradient-to-tr from-[#FAF8F4] to-[#EFEADA] relative flex flex-col justify-between min-h-[420px] md:min-h-[520px] overflow-hidden select-none cursor-grab active:cursor-grabbing border-t md:border-t-0 border-brand-sand/20"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Elegant compass rose styled matching screenshot (N pointer indicator at top right) */}
            <div className="absolute top-6 right-6 flex flex-col items-center pointer-events-none opacity-85 select-none text-brand-ink">
              <span className="font-serif text-[9px] font-bold tracking-[0.25em] mb-1.5 text-center block">N</span>
              <svg viewBox="0 0 32 32" className="w-8 h-8 text-brand-olive-deep" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="0.8" />
                <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 2" />
                {/* Vintage gold pointer star */}
                <path d="M16 4 L18.5 13.5 L16 12 L13.5 13.5 Z" fill="#C5A059" stroke="currentColor" strokeWidth="0.4" />
                <path d="M16 28 L18.5 18.5 L16 20 L13.5 18.5 Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.4" />
                <path d="M28 16 L18.5 18.5 L20 16 L18.5 13.5 Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.4" />
                <path d="M4 16 L13.5 18.5 L12 16 L13.5 13.5 Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="0.4" />
                <circle cx="16" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </div>

            {/* Interactive Image Display Area */}
            <div className="flex-1 flex items-center justify-center p-6 h-full w-full">
              <img
                src={imageSrc}
                onError={handleImgError}
                alt={`Floor plan of Residence ${unit.id} ${withDimension ? '(With Dimensions)' : '(Without Dimensions)'}`}
                id={`floorplan-img-${unit.id}`}
                className="max-w-[85%] max-h-[80%] select-none pointer-events-none drop-shadow-2xl transition-transform duration-75"
                referrerPolicy="no-referrer"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transformOrigin: 'center center',
                }}
              />
            </div>

            {/* Floating Navigation / Watermark and Zoom controls bar */}
            <div className="p-4 bg-brand-cream/80 backdrop-blur-sm border-t border-brand-sand/25 flex items-center justify-between z-20 pointer-events-auto">
              <span className="text-[9px] tracking-[0.16em] font-sans uppercase font-bold text-[#7E8675] select-none block">
                {scale > 1.05 
                  ? `Zoomed: ${(scale * 100).toFixed(0)}% · Drag to inspect` 
                  : 'Pinch or Drag to explore details'}
              </span>

              <div className="flex items-center gap-1.5 backdrop-blur shadow-sm bg-white/60 p-1.5 rounded-full border border-brand-sand/30">
                <button
                  onClick={handleZoomOut}
                  id="btn-blueprint-zoomout"
                  className="p-1 rounded-full bg-white hover:bg-brand-gold text-brand-ink transition-all duration-200 cursor-pointer shadow-xs border border-brand-sand/20"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleReset}
                  id="btn-blueprint-reset"
                  className="p-1 rounded-full bg-white hover:bg-brand-gold text-brand-ink transition-all duration-200 cursor-pointer shadow-xs border border-brand-sand/20"
                  title="Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleZoomIn}
                  id="btn-blueprint-zoomin"
                  className="p-1 rounded-full bg-white hover:bg-brand-gold text-brand-ink transition-all duration-200 cursor-pointer shadow-xs border border-brand-sand/20"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  id="btn-blueprint-fullscreen"
                  className="p-1 rounded-full bg-white hover:bg-brand-gold text-brand-ink transition-all duration-200 cursor-pointer shadow-xs border border-brand-sand/20"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span className="sr-only">Fullscreen</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Compass, ArrowRight, CornerDownRight } from 'lucide-react';
import { Apartment } from '../types';
import { BLOCK_META, FLOORPLANS } from '../data';

interface UnitDetailsModalProps {
  unit: Apartment | null;
  onClose: () => void;
}

export default function UnitDetailsModal({ unit, onClose }: UnitDetailsModalProps) {
  const [currentVariant, setCurrentVariant] = useState<'1bhk' | '2bhk' | '3bhk'>('2bhk');
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const startDragRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; t: number } | null>(null);
  const pinchStartRef = useRef<{ d: number; s: number } | null>(null);

  // Sync initial layout variant with the selected unit configuration
  useEffect(() => {
    if (unit) {
      setCurrentVariant(unit.variant);
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [unit]);

  if (!unit) return null;

  // Render SVG string inline safely as data URI
  const getSvgUri = (variantKey: '1bhk' | '2bhk' | '3bhk') => {
    const rawSvg = FLOORPLANS[variantKey];
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(rawSvg);
  };

  // Zoom Interactions
  const handleZoomIn = () => setScale((prev) => Math.min(3.5, prev * 1.2));
  const handleZoomOut = () => setScale((prev) => Math.max(0.5, prev / 1.2));
  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Drag-Pan mechanics for custom floor-plan exploration
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

  // Fullscreen container handler
  const toggleFullscreen = () => {
    if (!viewerRef.current) return;

    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn('Error expanding display:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Follow document exit fullscreen changes to sync React state
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Touch handlers: Swipe gestures to flip variants + pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, t: Date.now() };
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
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dt = Date.now() - touchStartRef.current.t;

      // Swap layout template on quick horizontal swipe (threshold > 75px)
      if (dt < 420 && Math.abs(dx) > 75) {
        const variantsList: ('1bhk' | '2bhk' | '3bhk')[] = ['1bhk', '2bhk', '3bhk'];
        const currentIndex = variantsList.indexOf(currentVariant);
        if (dx < 0 && currentIndex < 2) {
          // swipe left -> next variant
          setCurrentVariant(variantsList[currentIndex + 1]);
          setScale(1);
          setOffset({ x: 0, y: 0 });
        } else if (dx > 0 && currentIndex > 0) {
          // swipe right -> previous variant
          setCurrentVariant(variantsList[currentIndex - 1]);
          setScale(1);
          setOffset({ x: 0, y: 0 });
        }
      }
    }
    touchStartRef.current = null;
    pinchStartRef.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/75 backdrop-blur-md">
      {/* Immersive show room card board */}
      <div 
        id={`residence-${unit.id}`}
        className="relative w-full max-w-6xl max-h-[90vh] bg-brand-cream-soft rounded-2xl border border-brand-sand shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12"
      >
        
        {/* CLOSE CONTROL */}
        <button
          onClick={onClose}
          id="btn-close-drawer"
          className="absolute top-5 right-5 z-40 p-2.5 rounded-full bg-brand-cream hover:bg-brand-gold text-brand-ink hover:text-brand-ink-soft shadow-md transition-all duration-300 hover:rotate-90"
          aria-label="Close Showroom Panel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- LEFT: Blue-print map viewer stage (Spans 7cols) --- */}
        <div 
          ref={viewerRef}
          className={`relative md:col-span-7 bg-gradient-to-tr from-[#FAF8F4] to-[#EFEADA] min-h-[360px] md:min-h-[500px] flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing select-none`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Watermark brand details */}
          <div className="absolute top-6 left-6 flex items-center gap-2 pointer-events-none opacity-80">
            <Compass className="w-4 h-4 text-brand-olive animate-spin-slow" />
            <span className="font-serif text-xs font-semibold tracking-wide text-brand-olive-deep">
              El Cuento · {unit.id}
            </span>
          </div>

          {/* Interactive room render stage */}
          <div className="flex-1 flex items-center justify-center p-6 h-full w-full">
            <img
              src={getSvgUri(currentVariant)}
              alt={`${currentVariant} Blueprint Layout`}
              id={`floorplan-img-${unit.id}`}
              className="max-w-[90%] max-h-[85%] select-none pointer-events-none drop-shadow-xl transition-transform duration-75"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            />
          </div>

          {/* View control bar layout */}
          <div className="p-4 bg-brand-cream/60 backdrop-blur-sm border-t border-brand-cream-deep/40 flex items-center justify-between z-20 pointer-events-auto">
            <span className="text-[10px] tracking-widest font-sans uppercase font-medium text-brand-ink-soft">
              Pinch or drag to inspect
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleZoomOut}
                id="btn-blueprint-zoomout"
                className="p-1.5 rounded-full bg-brand-cream hover:bg-brand-gold text-brand-ink transition-all duration-300 shadow-sm"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                id="btn-blueprint-reset"
                className="p-1.5 rounded-full bg-brand-cream hover:bg-brand-gold text-brand-ink transition-all duration-300 shadow-sm"
                title="Reset Size"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomIn}
                id="btn-blueprint-zoomin"
                className="p-1.5 rounded-full bg-brand-cream hover:bg-brand-gold text-brand-ink transition-all duration-300 shadow-sm"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                id="btn-blueprint-fullscreen"
                className="p-1.5 rounded-full bg-brand-cream hover:bg-brand-gold text-brand-ink transition-all duration-300 shadow-sm"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span className="sr-only">Fullscreen</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT: Detailed Specifications (Spans 5cols) --- */}
        <div className="md:col-span-5 p-7 md:p-8 flex flex-col justify-between bg-[#FCFAF6] border-t md:border-t-0 md:border-l border-brand-sand overflow-y-auto max-h-[50vh] md:max-h-full">
          <div>
            <span className="font-sans font-light text-[9px] tracking-[0.5em] text-brand-olive uppercase block mb-3">
              {BLOCK_META[unit.block].name}
            </span>
            <h2 className="font-serif text-3xl font-bold text-brand-ink mb-1">
              Residence {unit.id}
            </h2>
            <div className="font-serif italic text-sm text-brand-ink-soft mb-6">
              {unit.name}
            </div>

            <div className="w-8 h-[1px] bg-brand-gold mb-6" />

            {/* Custom specification bento metrics */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
              <div className="border-l border-brand-sand pl-3">
                <span className="font-sans uppercase text-[9px] font-light tracking-widest text-[#7E8675] block mb-1">
                  Layout Schema
                </span>
                <span className="font-serif text-lg font-bold text-brand-ink">
                  {unit.config}
                </span>
                <span className="font-sans text-[11px] font-light text-brand-olive block leading-tight mt-0.5 whitespace-nowrap">
                  {unit.configSub}
                </span>
              </div>

              <div className="border-l border-brand-sand pl-3">
                <span className="font-sans uppercase text-[9px] font-light tracking-widest text-[#7E8675] block mb-1">
                  Carpet Area
                </span>
                <span className="font-serif text-lg font-bold text-brand-ink">
                  {unit.area}
                </span>
                <span className="font-sans text-[11px] font-light text-brand-olive block leading-tight mt-0.5 whitespace-nowrap">
                  {unit.areaSub}
                </span>
              </div>

              <div className="border-l border-brand-sand pl-3">
                <span className="font-sans uppercase text-[9px] font-light tracking-widest text-[#7E8675] block mb-1">
                  Sun Exposure
                </span>
                <span className="font-serif text-base font-bold text-brand-ink leading-tight block">
                  {unit.aspect}
                </span>
                <span className="font-sans text-[11px] font-light text-brand-olive block leading-tight mt-0.5">
                  {unit.aspectSub}
                </span>
              </div>

              <div className="border-l border-brand-sand pl-3">
                <span className="font-sans uppercase text-[9px] font-light tracking-widest text-[#7E8675] block mb-1">
                  Open Living
                </span>
                <span className="font-serif text-base font-bold text-brand-ink leading-tight block">
                  {unit.outdoor}
                </span>
                <span className="font-sans text-[11px] font-light text-brand-olive block leading-tight mt-0.5">
                  {unit.outdoorSub}
                </span>
              </div>
            </div>

            {/* Slow Living story & Architecture specs */}
            <div className="space-y-3 prose text-xs leading-relaxed text-brand-ink-soft font-sans font-light mb-6">
              {unit.features.map((feature, i) => (
                <div key={i} className="flex gap-2">
                  <CornerDownRight className="w-3.5 h-3.5 text-brand-gold flex-shrink-0 mt-0.5" />
                  <p>{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Variants drawer comparison list */}
          <div className="mt-4 pt-5 border-t border-brand-sand/60">
            <span className="font-sans uppercase text-[9px] font-light tracking-widest text-[#7E8675] block mb-3">
              Browse Layout Variants
            </span>

            <div className="flex gap-2 pb-2 overflow-x-auto">
              {(['1bhk', '2bhk', '3bhk'] as const).map((v) => {
                const isSelected = currentVariant === v;

                return (
                  <button
                    key={v}
                    onClick={() => {
                      setCurrentVariant(v);
                      setScale(1);
                      setOffset({ x: 0, y: 0 });
                    }}
                    id={`btn-variant-${v}`}
                    className={`flex-shrink-0 px-3.5 py-2.5 rounded-lg border text-left cursor-pointer transition-all duration-300 w-24 flex flex-col justify-between
                      ${isSelected
                        ? 'border-brand-olive bg-brand-olive/10 text-brand-olive-deep font-semibold'
                        : 'border-brand-sand/60 bg-brand-cream/20 hover:border-brand-sage text-brand-ink-soft'
                      }`}
                  >
                    <span className="text-[10px] tracking-widest uppercase block font-serif">
                      {v.toUpperCase()}
                    </span>
                    <span className="text-[8px] font-sans font-light text-brand-olive mt-1 whitespace-nowrap block">
                      {v === '1bhk' ? 'Studio 54㎡' : v === '2bhk' ? 'Garden 96㎡' : 'Estate 186㎡'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

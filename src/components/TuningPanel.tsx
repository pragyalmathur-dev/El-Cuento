import { useState } from 'react';
import { 
  Sliders, 
  Copy, 
  Save, 
  Info, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Plus, 
  Minus,
  RotateCw,
  Move
} from 'lucide-react';
import { OverlayParams } from '../types';
import { ENTRY_COORDINATES } from '../data';

interface TuningPanelProps {
  params: OverlayParams;
  onChangeParams: (newParams: OverlayParams) => void;
  onResetToDefaults: () => void;
  onClose: () => void;
}

export default function TuningPanel({
  params,
  onChangeParams,
  onResetToDefaults,
  onClose,
}: TuningPanelProps) {
  // Movement precision step options (in degrees of latitude/longitude)
  const [moveStep, setMoveStep] = useState<number>(0.00001);

  const handleCopyConfig = () => {
    const formattedJson = JSON.stringify(params, null, 2);
    navigator.clipboard?.writeText(formattedJson).then(() => {
      alert('Configuration copied successfully! Paste this inside DEFAULT_OVERLAY_PARAMS in src/data.ts.');
    }).catch(() => {
      console.warn('Clipboard access denied.');
    });
  };

  const handleLockLocalDefault = () => {
    localStorage.setItem('elcuento.overlay.v1', JSON.stringify(params));
    alert('Alignment locked! Pre-calibration saved into secure local storage.');
  };

  const updateParam = (key: keyof OverlayParams, val: number) => {
    onChangeParams({
      ...params,
      [key]: val,
    });
  };

  // Helper to change parameters by increments
  const nudgeParam = (key: keyof OverlayParams, delta: number) => {
    onChangeParams({
      ...params,
      [key]: Math.round((params[key] + delta) * 10000000) / 10000000,
    });
  };

  // Helper for proportional scaling (stretching both keeping the same aspect ratio)
  const scaleProportionally = (multiplier: number) => {
    onChangeParams({
      ...params,
      widthM: Math.round(params.widthM * multiplier * 10) / 10,
      heightM: Math.round(params.heightM * multiplier * 10) / 10,
    });
  };

  // Compute calculated boundary corners to display in the monospace readout
  const mLat = 1 / 111320;
  const mLng = 1 / (111320 * Math.cos((params.centerLat * Math.PI) / 180));
  const halfW = params.widthM / 2;
  const halfH = params.heightM / 2;
  const rad = (params.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const corners = [
    [-halfW, halfH],  // TL
    [halfW, halfH],   // TR
    [halfW, -halfH],  // BR
    [-halfW, -halfH]  // BL
  ].map(([x, y]) => {
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return {
      lat: (params.centerLat + ry * mLat).toFixed(7),
      lng: (params.centerLng + rx * mLng).toFixed(7),
    };
  });

  return (
    <div id="overlay-tune-panel" className="absolute top-24 right-8 z-30 w-[340px] bg-brand-cream-soft/95 backdrop-blur-md rounded-2xl border border-brand-gold-soft/40 shadow-2xl p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-brand-sand pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-gold" />
          <h3 className="font-serif text-lg font-bold text-brand-ink">
            Site Alignment Tool
          </h3>
        </div>
        <button
          onClick={onClose}
          id="btn-close-tuning"
          className="text-xs font-sans text-brand-olive hover:text-brand-ink uppercase tracking-widest font-bold cursor-pointer"
        >
          Hide
        </button>
      </div>

      {/* --- SECTION 1: MOVE MAP (LATITUDE & LONGITUDE D-PAD) --- */}
      <div className="bg-brand-cream/60 border border-brand-sand/40 rounded-xl p-3 space-y-3">
        <h4 className="font-sans text-[10px] font-bold tracking-widest text-[#5B6A4E] uppercase flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-brand-gold" />
          <span>1. Move Sitemap (Positioning)</span>
        </h4>

        {/* Nudge step-size selector */}
        <div className="flex justify-between items-center gap-1.5 bg-brand-cream border border-brand-sand/55 rounded-lg p-1">
          <span className="font-sans text-[8px] uppercase tracking-wide text-brand-ink-soft ml-1.5 font-bold">Step:</span>
          <div className="flex gap-1">
            {[0.000001, 0.00001, 0.0001].map((val) => (
              <button
                key={val}
                onClick={() => setMoveStep(val)}
                className={`px-2 py-0.5 rounded font-mono text-[9px] font-semibold transition-all cursor-pointer ${
                  moveStep === val 
                    ? 'bg-[#5B6A4E] text-brand-cream font-bold' 
                    : 'bg-brand-cream-soft text-brand-ink-soft hover:bg-black/5 hover:text-brand-ink'
                }`}
              >
                {val === 0.000001 ? 'Micro' : val === 0.00001 ? 'Fine' : 'Coarse'}
              </button>
            ))}
          </div>
        </div>

        {/* Directional Pad Controls */}
        <div className="flex flex-col items-center">
          {/* North Nudge */}
          <button
            onClick={() => nudgeParam('centerLat', moveStep)}
            className="w-12 h-9 bg-brand-cream border border-brand-sand hover:border-brand-gold hover:bg-brand-gold/15 text-brand-ink rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
            title="Nudge North / Up"
          >
            <ArrowUp className="w-4 h-4 text-brand-olive" />
          </button>

          {/* West / East Nudges */}
          <div className="flex gap-10 my-1 justify-center w-full">
            <button
              onClick={() => nudgeParam('centerLng', -moveStep)}
              className="w-12 h-9 bg-brand-cream border border-brand-sand hover:border-brand-gold hover:bg-brand-gold/15 text-brand-ink rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
              title="Nudge West / Left"
            >
              <ArrowLeft className="w-4 h-4 text-brand-olive" />
            </button>

            <button
              onClick={() => nudgeParam('centerLng', moveStep)}
              className="w-12 h-9 bg-brand-cream border border-brand-sand hover:border-brand-gold hover:bg-brand-gold/15 text-brand-ink rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
              title="Nudge East / Right"
            >
              <ArrowRight className="w-4 h-4 text-brand-olive" />
            </button>
          </div>

          {/* South Nudge */}
          <button
            onClick={() => nudgeParam('centerLat', -moveStep)}
            className="w-12 h-9 bg-brand-cream border border-brand-sand hover:border-brand-gold hover:bg-brand-gold/15 text-brand-ink rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
            title="Nudge South / Down"
          >
            <ArrowDown className="w-4 h-4 text-brand-olive" />
          </button>
        </div>

        {/* Precise GPS LatLng Text Fields */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[9px] tracking-wide text-brand-ink-soft uppercase block mb-0.5">Latitude</label>
            <input
              type="number"
              step="0.0000001"
              value={params.centerLat}
              onChange={(e) => updateParam('centerLat', parseFloat(e.target.value) || params.centerLat)}
              className="w-full bg-brand-cream border border-brand-sand rounded px-2 py-1 font-mono text-[10px] text-brand-ink focus:outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="text-[9px] tracking-wide text-brand-ink-soft uppercase block mb-0.5">Longitude</label>
            <input
              type="number"
              step="0.0000001"
              value={params.centerLng}
              onChange={(e) => updateParam('centerLng', parseFloat(e.target.value) || params.centerLng)}
              className="w-full bg-brand-cream border border-brand-sand rounded px-2 py-1 font-mono text-[10px] text-brand-ink focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>
      </div>

      {/* --- SECTION 2: PROPORTIONAL SCALE & HEIGHT/WIDTH STRETCH --- */}
      <div className="bg-brand-cream/60 border border-brand-sand/40 rounded-xl p-3 space-y-3">
        <h4 className="font-sans text-[10px] font-bold tracking-widest text-[#5B6A4E] uppercase flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-brand-gold" />
          <span>2. Scale & Stretch Map</span>
        </h4>

        {/* A. Proportional Scale Section */}
        <div className="space-y-1.5 border-b border-brand-sand/40 pb-2.5">
          <div className="flex justify-between items-baseline">
            <span className="font-sans text-[10px] font-semibold text-brand-ink">Proportional Scale (Aspect Lock)</span>
            <span className="font-sans text-[8px] text-brand-olive font-bold uppercase tracking-wider">Preserves Proportions</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => scaleProportionally(0.95)}
              className="py-1 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand text-brand-ink text-[10px] rounded cursor-pointer transition-all hover:border-brand-gold active:scale-95"
              title="Scale down by 5%"
            >
              -5%
            </button>
            <button
              onClick={() => scaleProportionally(0.99)}
              className="py-1 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand text-brand-ink text-[10px] rounded cursor-pointer transition-all hover:border-brand-gold active:scale-95"
              title="Scale down by 1%"
            >
              -1%
            </button>
            <button
              onClick={() => scaleProportionally(1.01)}
              className="py-1 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand text-brand-ink text-[10px] rounded cursor-pointer transition-all hover:border-brand-gold active:scale-95"
              title="Scale up by 1%"
            >
              +1%
            </button>
            <button
              onClick={() => scaleProportionally(1.05)}
              className="py-1 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand text-brand-ink text-[10px] rounded cursor-pointer transition-all hover:border-brand-gold active:scale-95"
              title="Scale up by 5%"
            >
              +5%
            </button>
          </div>
        </div>

        {/* B. Width Stretch Controls */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] tracking-wide text-brand-ink-soft uppercase">
            <span>Sitemap Width Stretch</span>
            <span className="font-mono font-bold text-brand-olive">{params.widthM}m</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => nudgeParam('widthM', -1)}
              className="w-10 h-7 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand rounded cursor-pointer flex items-center justify-center font-bold text-brand-ink active:scale-95 transition-all text-xs"
            >
              -1
            </button>
            <button
              onClick={() => nudgeParam('widthM', -0.1)}
              className="w-10 h-7 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand rounded cursor-pointer flex items-center justify-center text-[10px] text-brand-ink active:scale-95 transition-all"
            >
              -0.1
            </button>
            
            <input
              type="range"
              min="5"
              max="200"
              step="0.1"
              value={params.widthM}
              onChange={(e) => updateParam('widthM', parseFloat(e.target.value))}
              className="flex-1 accent-[#5B6A4E] h-1.5 bg-brand-cream rounded-lg cursor-pointer"
            />

            <button
              onClick={() => nudgeParam('widthM', 0.1)}
              className="w-10 h-7 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand rounded cursor-pointer flex items-center justify-center text-[10px] text-brand-ink active:scale-95 transition-all"
            >
              +0.1
            </button>
            <button
              onClick={() => nudgeParam('widthM', 1)}
              className="w-10 h-7 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand rounded cursor-pointer flex items-center justify-center font-bold text-brand-ink active:scale-95 transition-all text-xs"
            >
              +1
            </button>
          </div>
        </div>

        {/* C. Height Stretch Controls */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] tracking-wide text-brand-ink-soft uppercase">
            <span>Sitemap Height Stretch</span>
            <span className="font-mono font-bold text-brand-olive">{params.heightM}m</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => nudgeParam('heightM', -2)}
              className="w-10 h-7 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand rounded cursor-pointer flex items-center justify-center font-bold text-brand-ink active:scale-95 transition-all text-xs"
            >
              -2
            </button>
            <button
              onClick={() => nudgeParam('heightM', -0.5)}
              className="w-10 h-7 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand rounded cursor-pointer flex items-center justify-center text-[10px] text-brand-ink active:scale-95 transition-all"
            >
              -0.5
            </button>
            
            <input
              type="range"
              min="10"
              max="400"
              step="0.5"
              value={params.heightM}
              onChange={(e) => updateParam('heightM', parseFloat(e.target.value))}
              className="flex-1 accent-[#5B6A4E] h-1.5 bg-brand-cream rounded-lg cursor-pointer"
            />

            <button
              onClick={() => nudgeParam('heightM', 0.5)}
              className="w-10 h-7 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand rounded cursor-pointer flex items-center justify-center text-[10px] text-[#5B6A4E] active:scale-95 transition-all"
            >
              +0.5
            </button>
            <button
              onClick={() => nudgeParam('heightM', 2)}
              className="w-10 h-7 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand rounded cursor-pointer flex items-center justify-center font-bold text-brand-ink active:scale-95 transition-all text-xs"
            >
              +2
            </button>
          </div>
        </div>
      </div>

      {/* --- SECTION 3: ROTATION ALIGNMENT --- */}
      <div className="bg-brand-cream/60 border border-brand-sand/40 rounded-xl p-3 space-y-2">
        <h4 className="font-sans text-[10px] font-bold tracking-widest text-[#5B6A4E] uppercase flex items-center gap-1.5">
          <RotateCw className="w-3.5 h-3.5 text-brand-gold" />
          <span>3. Rotational Alignment</span>
        </h4>

        <div className="flex justify-between text-[9px] tracking-wide text-brand-ink-soft uppercase leading-none mb-1">
          <span>Angle (Clockwise Degrees)</span>
          <span className="font-mono font-bold text-brand-olive">{params.rotation.toFixed(1)}°</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => nudgeParam('rotation', -1)}
            className="w-9 h-7 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand rounded cursor-pointer flex items-center justify-center font-bold text-brand-ink text-xs transition-all active:scale-95"
            title="Rotate anti-clockwise big step"
          >
            -1°
          </button>
          <button
            onClick={() => nudgeParam('rotation', -0.1)}
            className="w-9 h-7 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand rounded cursor-pointer flex items-center justify-center text-[10px] text-brand-ink transition-all active:scale-95"
            title="Rotate anti-clockwise fine step"
          >
            -0.1
          </button>

          <input
            type="range"
            min="-180"
            max="180"
            step="0.1"
            value={params.rotation}
            onChange={(e) => updateParam('rotation', parseFloat(e.target.value))}
            className="flex-1 accent-[#5B6A4E] h-1.5 bg-brand-cream rounded-lg cursor-pointer"
          />

          <button
            onClick={() => nudgeParam('rotation', 0.1)}
            className="w-9 h-7 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand rounded cursor-pointer flex items-center justify-center text-[10px] text-[#5B6A4E] transition-all active:scale-95"
            title="Rotate clockwise fine step"
          >
            +0.1
          </button>
          <button
            onClick={() => nudgeParam('rotation', 1)}
            className="w-9 h-7 bg-brand-cream hover:bg-brand-gold/15 border border-brand-sand rounded cursor-pointer flex items-center justify-center font-bold text-brand-ink text-xs transition-all active:scale-95"
            title="Rotate clockwise big step"
          >
            +1°
          </button>
        </div>
      </div>

      {/* --- SECTION 4: DIAGNOSTICS & OPACITY --- */}
      <div className="bg-brand-cream/40 border border-brand-sand/30 rounded-xl p-3 space-y-2">
        <div className="flex justify-between items-center text-[9px] text-brand-ink-soft uppercase font-semibold">
          <span>Layer Opacity</span>
          <span className="font-mono text-brand-olive font-bold">{(params.opacity * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0.10"
          max="1.0"
          step="0.01"
          value={params.opacity}
          onChange={(e) => updateParam('opacity', parseFloat(e.target.value))}
          className="w-full accent-[#5B6A4E] cursor-pointer h-1 bg-brand-cream"
        />

        <div className="bg-brand-cream border border-brand-sand/40 rounded-lg p-2.5 font-mono text-[9px] text-brand-ink-soft leading-relaxed select-all mt-2 max-h-[120px] overflow-y-auto custom-scrollbar">
          <div className="text-brand-ink font-bold border-b border-brand-sand/30 pb-0.5 mb-1 text-[8px] uppercase tracking-wider">COPY FOR CODESET</div>
          <span className="text-[#5B6A4E] font-bold">centerLat:</span> {params.centerLat.toFixed(7)}<br />
          <span className="text-[#5B6A4E] font-bold">centerLng:</span> {params.centerLng.toFixed(7)}<br />
          <span className="text-[#5B6A4E] font-bold">widthM:</span> {params.widthM}m<br />
          <span className="text-[#5B6A4E] font-bold">heightM:</span> {params.heightM}m<br />
          <span className="text-[#5B6A4E] font-bold">rotation:</span> {params.rotation.toFixed(1)}°<br />
          <span className="text-[#5B6A4E] font-bold">opacity:</span> {params.opacity.toFixed(2)}<br />
          <span className="text-[#969F8E] mt-1.5 block font-sans uppercase text-[7px] tracking-widest font-bold border-t border-brand-sand/20 pt-1">CORNER PLOT LATLNGS</span>
          TL: {corners[0].lat}, {corners[0].lng}<br />
          TR: {corners[1].lat}, {corners[1].lng}<br />
          BR: {corners[2].lat}, {corners[2].lng}<br />
          BL: {corners[3].lat}, {corners[3].lng}
        </div>
      </div>

      {/* Action triggers list */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleCopyConfig}
          id="btn-tuning-copy"
          className="w-full py-2 bg-brand-cream border border-brand-sand hover:border-brand-gold hover:bg-brand-gold hover:text-brand-ink text-brand-ink rounded-lg font-sans text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition-all pointer-events-auto cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy config</span>
        </button>

        <button
          onClick={handleLockLocalDefault}
          id="btn-tuning-lock"
          className="w-full py-2 bg-[#5B6A4E] text-brand-cream hover:bg-[#4a573e] rounded-lg font-sans text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition-all pointer-events-auto cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Lock Saved</span>
        </button>
      </div>

      <button
        onClick={onResetToDefaults}
        id="btn-tuning-reset"
        className="w-full py-1.5 border border-dashed border-brand-sand/70 text-[9px] text-brand-ink-soft hover:text-brand-ink hover:border-brand-gold hover:bg-black/5 rounded-lg font-sans uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 transition-all pointer-events-auto cursor-pointer"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Reset to Defaults</span>
      </button>

      <div className="flex gap-2 text-[9px] text-[#868F7F] font-sans leading-relaxed">
        <Info className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
        <p>Pre-calibrations persist across live browser reloads automatically through your secure local storage.</p>
      </div>
    </div>
  );
}

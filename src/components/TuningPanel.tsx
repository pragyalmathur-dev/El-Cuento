import { Sliders, Copy, Save, Info, RefreshCw } from 'lucide-react';
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
    <div id="overlay-tune-panel" className="absolute top-24 right-8 z-30 w-80 bg-brand-cream-soft/95 backdrop-blur-md rounded-2xl border border-brand-gold-soft/40 shadow-2xl p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-brand-sand pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-gold" />
          <h3 className="font-serif text-lg font-bold text-brand-ink">
            Overlay Calibrator
          </h3>
        </div>
        <button
          onClick={onClose}
          id="btn-close-tuning"
          className="text-xs font-sans text-brand-olive hover:text-brand-ink uppercase tracking-widest font-semibold"
        >
          Hide
        </button>
      </div>

      {/* Input sliders for fine aligning */}
      <div className="space-y-4">
        {/* Latitude Slider Input */}
        <div>
          <label htmlFor="input-lat" className="flex justify-between text-[10px] tracking-wide text-brand-ink-soft uppercase mb-1">
            <span>Center Latitude</span>
            <span className="font-mono font-medium text-brand-olive">
              {params.centerLat.toFixed(7)}°
            </span>
          </label>
          <input
            id="input-lat"
            type="number"
            step="0.0000001"
            value={params.centerLat}
            onChange={(e) => updateParam('centerLat', parseFloat(e.target.value) || params.centerLat)}
            className="w-full bg-brand-cream border border-brand-sand rounded px-2.5 py-1.5 font-mono text-xs text-brand-ink focus:outline-none focus:border-brand-gold"
          />
        </div>

        {/* Longitude Slider Input */}
        <div>
          <label htmlFor="input-lng" className="flex justify-between text-[10px] tracking-wide text-brand-ink-soft uppercase mb-1">
            <span>Center Longitude</span>
            <span className="font-mono font-medium text-brand-olive">
              {params.centerLng.toFixed(7)}°
            </span>
          </label>
          <input
            id="input-lng"
            type="number"
            step="0.0000001"
            value={params.centerLng}
            onChange={(e) => updateParam('centerLng', parseFloat(e.target.value) || params.centerLng)}
            className="w-full bg-brand-cream border border-brand-sand rounded px-2.5 py-1.5 font-mono text-xs text-brand-ink focus:outline-none focus:border-brand-gold"
          />
        </div>

        {/* Width scale (meters) */}
        <div>
          <label htmlFor="input-width" className="flex justify-between text-[10px] tracking-wide text-brand-ink-soft uppercase mb-1">
            <span>Scale Width</span>
            <span className="font-mono font-medium text-brand-olive">
              {params.widthM} meters
            </span>
          </label>
          <input
            id="input-width"
            type="range"
            min="10"
            max="120"
            step="0.1"
            value={params.widthM}
            onChange={(e) => updateParam('widthM', parseFloat(e.target.value))}
            className="w-full accent-brand-olive cursor-pointer"
          />
        </div>

        {/* Height scale (meters) */}
        <div>
          <label htmlFor="input-height" className="flex justify-between text-[10px] tracking-wide text-brand-ink-soft uppercase mb-1">
            <span>Scale Height</span>
            <span className="font-mono font-medium text-brand-olive">
              {params.heightM} meters
            </span>
          </label>
          <input
            id="input-height"
            type="range"
            min="40"
            max="260"
            step="0.5"
            value={params.heightM}
            onChange={(e) => updateParam('heightM', parseFloat(e.target.value))}
            className="w-full accent-brand-olive cursor-pointer"
          />
        </div>

        {/* Rotation alignment (degrees clockwise) */}
        <div>
          <label htmlFor="input-rot" className="flex justify-between text-[10px] tracking-wide text-brand-ink-soft uppercase mb-1">
            <span>Rotation angle</span>
            <span className="font-mono font-medium text-brand-olive">
              {params.rotation}°
            </span>
          </label>
          <input
            id="input-rot"
            type="range"
            min="-180"
            max="180"
            step="0.1"
            value={params.rotation}
            onChange={(e) => updateParam('rotation', parseFloat(e.target.value))}
            className="w-full accent-brand-olive cursor-pointer"
          />
        </div>

        {/* Opacity blend */}
        <div>
          <label htmlFor="input-opacity" className="flex justify-between text-[10px] tracking-wide text-brand-ink-soft uppercase mb-1">
            <span>Layer Opacity</span>
            <span className="font-mono font-medium text-brand-olive">
              {(params.opacity * 100).toFixed(0)}%
            </span>
          </label>
          <input
            id="input-opacity"
            type="range"
            min="0.15"
            max="1.0"
            step="0.01"
            value={params.opacity}
            onChange={(e) => updateParam('opacity', parseFloat(e.target.value))}
            className="w-full accent-brand-olive cursor-pointer"
          />
        </div>
      </div>

      {/* Dynamic Monospace Readings output */}
      <div className="bg-brand-cream border border-brand-sand/50 rounded-lg p-2.5 font-mono text-[9px] text-brand-ink-soft leading-relaxed select-all">
        <div className="text-brand-ink font-semibold border-b border-brand-sand/30 pb-1 mb-1">CALIBRATED POSITIONS</div>
        center: {params.centerLat.toFixed(7)}, {params.centerLng.toFixed(7)}<br />
        plot: {params.widthM}m × {params.heightM}m<br />
        bearing: {params.rotation}°<br />
        opacity: {params.opacity.toFixed(2)}<br />
        <span className="text-[#969F8E] mt-1 block font-sans uppercase text-[7px] tracking-widest font-bold">BOUNDING SPANS</span>
        TL: {corners[0].lat}, {corners[0].lng}<br />
        TR: {corners[1].lat}, {corners[1].lng}<br />
        BR: {corners[2].lat}, {corners[2].lng}<br />
        BL: {corners[3].lat}, {corners[3].lng}<br />
        <span className="text-[#969F8E] mt-1 block font-sans uppercase text-[7px] tracking-widest font-bold">GATEWAY ENTRY</span>
        GPS: {ENTRY_COORDINATES.lat.toFixed(7)}, {ENTRY_COORDINATES.lng.toFixed(7)}
      </div>

      {/* Command Triggers list */}
      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={handleCopyConfig}
          id="btn-tuning-copy"
          className="w-full py-2 bg-brand-cream border border-brand-sand hover:border-brand-gold hover:bg-brand-gold hover:text-brand-ink text-brand-ink rounded-lg font-sans text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all duration-300 pointer-events-auto cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy config</span>
        </button>

        <button
          onClick={handleLockLocalDefault}
          id="btn-tuning-lock"
          className="w-full py-2 bg-brand-olive text-brand-cream hover:bg-brand-olive-deep rounded-lg font-sans text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all duration-300 pointer-events-auto cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Lock as default</span>
        </button>

        <button
          onClick={onResetToDefaults}
          id="btn-tuning-reset"
          className="w-full py-1.5 border border-dashed border-brand-sand text-[10px] text-brand-ink-soft hover:text-brand-ink hover:border-brand-gold hover:bg-black/5 rounded font-sans uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 pointer-events-auto cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset defaults</span>
        </button>
      </div>

      <div className="flex gap-2 text-[9px] text-[#868F7F] font-sans leading-relaxed mt-1">
        <Info className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
        <p>Values locked here persist across local browser reboots automatically.</p>
      </div>
    </div>
  );
}

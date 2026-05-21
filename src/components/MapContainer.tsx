import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Apartment, OverlayParams } from '../types';
import { APARTMENTS, ENTRY_COORDINATES } from '../data';

const ROAD_COORDINATES: [number, number][] = [
  [15.672340, 73.723681],
  [15.672046, 73.725260],
  [15.671715, 73.726270],
  [15.671610, 73.726764],
  [15.671523, 73.728040],
  [15.671119, 73.729831],
  [15.670824, 73.730814],
  [15.670719, 73.731262],
  [15.670679, 73.731685],
  [15.670651, 73.732498],
  [15.670838, 73.734307],
  [15.670988, 73.734916],
  [15.672096, 73.736803],
  [15.672390, 73.737433],
  [15.672800, 73.737949],
  [15.673670, 73.738931],
  [15.674237, 73.739894],
  [15.674955, 73.741401],
  [15.675833, 73.742893]
];

interface MapContainerProps {
  overlayParams: OverlayParams;
  selectedUnitId: string | null;
  onSelectUnit: (id: string) => void;
  selectedBlock: 'A' | 'B' | 'C' | null;
  recenterTrigger?: number;
}

export default function MapContainer({
  overlayParams,
  selectedUnitId,
  onSelectUnit,
  selectedBlock,
  recenterTrigger = 0,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<any | null>(null);
  const pinsGroupRef = useRef<L.FeatureGroup | null>(null);
  const routerGroupRef = useRef<L.FeatureGroup | null>(null);
  const overpassGroupRef = useRef<L.FeatureGroup | null>(null);

  const [sitemapUrl, setSitemapUrl] = useState<string | null>(null);

  // Prober to see if they've uploaded a custom sitemap image under /assets/
  useEffect(() => {
    const paths = [
      '/assets/site-plan/site-plan.png',
      '/assets/site-plan/site-plan.jpg',
      '/assets/site-plan/site-plan.webp',
      '/assets/site-plan.png',
      '/assets/site-plan.jpg',
      '/assets/site-plan.webp',
      '/assets/sitemap.webp',
      '/assets/sitemap.png',
      '/assets/sitemap.jpg'
    ];

    let isMounted = true;

    const probeImages = async () => {
      for (const p of paths) {
        if (!isMounted) return;
        try {
          const success = await new Promise<boolean>((resolve) => {
            const img = new Image();
            img.referrerPolicy = 'no-referrer';
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = p;
          });
          if (success && isMounted) {
            setSitemapUrl(p);
            return;
          }
        } catch (err) {
          // ignore
        }
      }
    };

    probeImages();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper: map SVG (X, Y) layout workspace [350x1300] to map LatLng positions
  const getSvgCoordinatesLatLng = (svgX: number, svgY: number, params: OverlayParams) => {
    const { centerLat, centerLng, widthM, heightM, rotation } = params;
    const W = 350;
    const H = 1300;

    // Normalizing SVG coordinates to relative offsets from center in meters
    const nx = (svgX / W - 0.5) * widthM;
    const ny = (0.5 - svgY / H) * heightM; // North is positive

    const rad = (rotation * Math.PI) / 180;
    const rx = nx * Math.cos(rad) - ny * Math.sin(rad);
    const ry = nx * Math.sin(rad) + ny * Math.cos(rad);

    const mLat = 1 / 111320;
    const mLng = 1 / (111320 * Math.cos((centerLat * Math.PI) / 180));

    return L.latLng(centerLat + ry * mLat, centerLng + rx * mLng);
  };

  // Helper: Get corners of rotated overlay in LatLng order [TL, TR, BR, BL]
  const getOverlayCorners = (params: OverlayParams) => {
    const { centerLat, centerLng, widthM, heightM, rotation } = params;
    const mLat = 1 / 111320;
    const mLng = 1 / (111320 * Math.cos((centerLat * Math.PI) / 180));
    const halfW = widthM / 2;
    const halfH = heightM / 2;
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const corners = [
      [-halfW, halfH],  // TL
      [halfW, halfH],   // TR
      [halfW, -halfH],  // BR
      [-halfW, -halfH]  // BL
    ];

    return corners.map(([x, y]) => {
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      return L.latLng(centerLat + ry * mLat, centerLng + rx * mLng);
    });
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create the Leaflet Map instance
    const map = L.map(mapContainerRef.current, {
      center: [overlayParams.centerLat, overlayParams.centerLng],
      zoom: 18.5,
      minZoom: 15,
      maxZoom: 21,
      zoomControl: false, // will use a custom-themed zoom widget
      preferCanvas: true,
      zoomSnap: 0.1,
      zoomDelta: 0.5,
    });

    mapRef.current = map;

    // Load satellite imagery tile layer (clean Esri high fidelity satellite)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Imagery © Esri · World',
      maxZoom: 21,
      maxNativeZoom: 17, // Changed from 19 to 17 to prevent "Map data not available" high-zoom 404 tile warnings
    }).addTo(map);

    // Hybrid label overlay for nearby villages
    L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 21,
      maxNativeZoom: 17, // Set to 17 here as well for seamless tile upscaling zoom compatibility
      opacity: 0.45,
      pane: 'shadowPane',
    }).addTo(map);

    // Create groups for layers
    pinsGroupRef.current = L.featureGroup().addTo(map);
    routerGroupRef.current = L.featureGroup().addTo(map);
    overpassGroupRef.current = L.featureGroup().addTo(map);

    // Add entry beacon at the villa gateway
    const entryIcon = L.divIcon({
      className: 'entry-beacon-wrap',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-brand-gold/30 animate-ping opacity-75"></div>
          <div class="w-4 h-4 rounded-full bg-brand-gold border-2 border-brand-cream shadow-md z-10"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    L.marker([ENTRY_COORDINATES.lat, ENTRY_COORDINATES.lng], { icon: entryIcon, interactive: false }).addTo(map);

    // Dynamic zoom-fit on first load
    const corners = getOverlayCorners(overlayParams);
    const bounds = L.latLngBounds(corners);
    map.fitBounds(bounds, { padding: [40, 40] });

    // Draw the custom highlighted road near the property
    drawPropertyRoad();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Custom rotated image overlay rendering & lifecycle management
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // If an overlay already exists, remove it
    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }

    if (!sitemapUrl) {
      // If no custom sitemap image exists yet in the assets folder, we don't display any overlay
      return;
    }

    // Creating Custom Rotated Image Overlay using Leaflet Layer abstraction
    const RotatedImageOverlay = L.Layer.extend({
      initialize: function (imageUrl: string, params: OverlayParams) {
        this._imageUrl = imageUrl;
        this._params = params;
        this._nativeW = 350;
        this._nativeH = 1300;
      },
      onAdd: function (map: L.Map) {
        this._container = L.DomUtil.create('div', 'leaflet-rotated-image-overlay absolute pointer-events-none select-none');
        
        this._imgEl = document.createElement('img');
        this._imgEl.src = this._imageUrl;
        this._imgEl.style.display = 'block';
        this._imgEl.style.width = '100%';
        this._imgEl.style.height = '100%';
        this._imgEl.setAttribute('referrerPolicy', 'no-referrer');

        this._inner = document.createElement('div');
        this._inner.style.position = 'absolute';
        this._inner.style.left = '0';
        this._inner.style.top = '0';
        this._inner.style.width = this._nativeW + 'px';
        this._inner.style.height = this._nativeH + 'px';
        this._inner.style.transformOrigin = '0 0';
        this._inner.appendChild(this._imgEl);

        this._container.style.position = 'absolute';
        this._container.style.left = '0';
        this._container.style.top = '0';
        this._container.style.width = '0';
        this._container.style.height = '0';
        this._container.style.transformOrigin = '0 0';
        this._container.appendChild(this._inner);

        map.getPanes().overlayPane.appendChild(this._container);
        map.on('zoomend moveend viewreset zoom', this._reset, this);
        this._reset();
      },
      onRemove: function (map: L.Map) {
        if (this._container && this._container.parentNode) {
          this._container.parentNode.removeChild(this._container);
        }
        map.off('zoomend moveend viewreset zoom', this._reset, this);
      },
      setParams: function (p: OverlayParams) {
        this._params = p;
        this._reset();
      },
      _reset: function () {
        if (!this._map || !this._inner) return;

        const corners = getOverlayCorners(this._params);
        const pts = corners.map((ll) => this._map.latLngToLayerPoint(ll));
        const [tl, tr, br, bl] = pts;

        // Apply affine matrix transform to map coordinate points onto screen pixels
        const a = (tr.x - tl.x) / this._nativeW;
        const b = (tr.y - tl.y) / this._nativeW;
        const c = (bl.x - tl.x) / this._nativeH;
        const d = (bl.y - tl.y) / this._nativeH;
        const e = tl.x;
        const f = tl.y;

        this._inner.style.transform = `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
        this._inner.style.opacity = this._params.opacity.toString();
      },
    });

    const instance = new (RotatedImageOverlay as any)(sitemapUrl, overlayParams);
    overlayRef.current = instance;
    map.addLayer(instance);

    return () => {
      if (overlayRef.current && map.hasLayer(overlayRef.current)) {
        map.removeLayer(overlayRef.current);
      }
    };
  }, [overlayParams, sitemapUrl]);

  // 3. Reactively update interactive unit labels (Pins) - Cleared per user request
  useEffect(() => {
    const pinsGroup = pinsGroupRef.current;
    if (pinsGroup) {
      pinsGroup.clearLayers();
    }
  }, [selectedBlock, selectedUnitId]);

  // Auto-recenter when selecting the whole site plan (when selectedBlock and selectedUnitId are null) or when clicking TO SITE MAP multiple times
  useEffect(() => {
    if (selectedBlock === null && selectedUnitId === null) {
      resetViewport();
    }
  }, [selectedBlock, selectedUnitId, recenterTrigger]);

  // 4. Draw bold highlighted road with custom colour #F4F6FC as requested
  const drawPropertyRoad = () => {
    const routerGroup = routerGroupRef.current;
    if (!routerGroup) return;

    routerGroup.clearLayers();

    // Semi-transparent outer halo (dark background) to make the light road pop on satellite imagery
    L.polyline(ROAD_COORDINATES, {
      color: '#000000',
      weight: 10,
      opacity: 0.4,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false,
    }).addTo(routerGroup);

    // Subtle dark outer border
    L.polyline(ROAD_COORDINATES, {
      color: '#3A4430',
      weight: 7,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false,
    }).addTo(routerGroup);

    // Bold main road line highlighted in custom color #F4F6FC
    L.polyline(ROAD_COORDINATES, {
      color: '#F4F6FC',
      weight: 4.5,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false,
    }).addTo(routerGroup);
  };

  // Custom Zoom Handlers
  const handleZoomIn = () => {
    mapRef.current?.zoomIn(0.5);
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut(0.5);
  };

  const resetViewport = () => {
    const map = mapRef.current;
    if (!map) return;
    const corners = getOverlayCorners(overlayParams);
    const bounds = L.latLngBounds(corners);
    map.fitBounds(bounds, { padding: [50, 50], animate: true });
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-[#181C16]">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Control buttons designed with high contrast minimalist style */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          id="btn-zoom-in"
          className="w-11 h-11 bg-brand-cream-soft hover:bg-brand-gold text-brand-ink border border-brand-sand hover:border-brand-gold shadow-lg rounded-full flex items-center justify-center transition-all duration-300 text-xl font-medium"
          aria-label="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          id="btn-zoom-out"
          className="w-11 h-11 bg-brand-cream-soft hover:bg-brand-gold text-brand-ink border border-brand-sand hover:border-brand-gold shadow-lg rounded-full flex items-center justify-center transition-all duration-300 text-xl font-medium"
          aria-label="Zoom Out"
        >
          −
        </button>
      </div>
    </div>
  );
}

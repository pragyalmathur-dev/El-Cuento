import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Apartment, OverlayParams, Landmark } from '../types';
import { APARTMENTS, ENTRY_COORDINATES, LANDMARKS } from '../data';
import { X } from 'lucide-react';

const ROAD_COORDINATES: [number, number][] = [
  [15.685757, 73.711181],
  [15.684172, 73.710976],
  [15.683663, 73.710800],
  [15.682866, 73.710716],
  [15.680952, 73.711046],
  [15.680098, 73.710878],
  [15.678479, 73.711060],
  [15.677627, 73.711157],
  [15.676023, 73.710669],
  [15.675368, 73.709970],
  [15.675128, 73.709382],
  [15.674019, 73.709268],
  [15.674008, 73.709286],
  [15.673281, 73.709255],
  [15.672773, 73.709426],
  [15.671498, 73.710295],
  [15.670488, 73.711576],
  [15.670358, 73.712353],
  [15.670331, 73.713479],
  [15.670355, 73.713944],
  [15.670817, 73.714251],
  [15.671190, 73.714543],
  [15.671611, 73.714889],
  [15.672039, 73.715333],
  [15.672527, 73.715509],
  [15.672986, 73.717291],
  [15.672992, 73.717695],
  [15.672912, 73.718601],
  [15.672937, 73.719106],
  [15.673106, 73.720458],
  [15.672925, 73.721691],
  [15.672448, 73.722853],
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
  [15.674227, 73.739739],
  [15.675339, 73.741917],
  [15.676493, 73.744415],
  [15.676594, 73.745002],
  [15.676669, 73.745266],
  [15.677762, 73.747327],
  [15.679482, 73.749320],
  [15.680235, 73.749941],
  [15.680771, 73.750889],
  [15.682678, 73.754223],
  [15.683042, 73.754905],
  [15.683246, 73.755118],
  [15.685588, 73.756563],
  [15.689011, 73.759353],
  [15.690815, 73.760838]
];

interface MapContainerProps {
  overlayParams: OverlayParams;
  selectedUnitId: string | null;
  onSelectUnit: (id: string) => void;
  selectedBlock: 'A' | 'B' | 'C' | null;
  recenterTrigger?: number;
  activeCategoryFilter: string | null;
}

export default function MapContainer({
  overlayParams,
  selectedUnitId,
  onSelectUnit,
  selectedBlock,
  recenterTrigger = 0,
  activeCategoryFilter,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<any | null>(null);
  const pinsGroupRef = useRef<L.FeatureGroup | null>(null);
  const routerGroupRef = useRef<L.FeatureGroup | null>(null);
  const overpassGroupRef = useRef<L.FeatureGroup | null>(null);
  const landmarksGroupRef = useRef<L.FeatureGroup | null>(null);

  const [sitemapUrl, setSitemapUrl] = useState<string | null>(null);

  // Routing parameters & live paths state
  const [activeRoute, setActiveRoute] = useState<{
    landmarkId: string;
    name: string;
    distance: string;
    duration: string;
  } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);

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
      attributionControl: false, // hide Leaflet / Esri / tile layer attribution panel on the map
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
    landmarksGroupRef.current = L.featureGroup().addTo(map);

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
      weight: 5.5,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false,
    }).addTo(routerGroup);

    // Road Badges on requested coordinates
    const badgePoints: { coords: [number, number]; label: string }[] = [
      { coords: [15.671307, 73.714598], label: 'MANDREM ROAD' },
      { coords: [15.682257, 73.710777], label: 'MANDREM ROAD' },
      { coords: [15.674112, 73.739548], label: 'MANDREM ROAD' },
      { coords: [15.671544, 73.735850], label: 'TOWARDS MOPA AIRPORT ->' }
    ];

    badgePoints.forEach(({ coords: [lat, lng], label }) => {
      const labelIcon = L.divIcon({
        className: 'custom-road-badge-wrapper',
        html: `
          <div class="absolute w-max flex items-center justify-center -translate-x-1/2 -translate-y-1/2 bg-[#0E3524] text-white text-[7.5px] font-sans font-black tracking-[0.08em] uppercase px-2 py-0.5 rounded-[4px] border border-[#184a32]/85 shadow-sm whitespace-nowrap select-none" style="width: max-content;">
            ${label}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      L.marker([lat, lng], { icon: labelIcon, interactive: false }).addTo(routerGroup);
    });
  };

  // 5. Draw and update landmarks dynamically based on activeCategoryFilter
  useEffect(() => {
    const landmarksGroup = landmarksGroupRef.current;
    if (!landmarksGroup) return;

    landmarksGroup.clearLayers();

    // Filter landmarks based on category
    const filteredLandmarks = activeCategoryFilter
      ? LANDMARKS.filter((landmark) => landmark.category === activeCategoryFilter)
      : LANDMARKS;

    filteredLandmarks.forEach((landmark) => {
      const siteLatLng = L.latLng(ENTRY_COORDINATES.lat, ENTRY_COORDINATES.lng);
      const distanceMeters = siteLatLng.distanceTo(L.latLng(landmark.lat, landmark.lng));
      const distanceKm = (distanceMeters / 1000).toFixed(1);
      // Dynamic driving time
      const driveMinutes = Math.max(1, Math.round(Number(distanceKm) * 2));

      // Category color palettes and inner SVG icons:
      let pinColor = '#0E3524'; // Default tourist/beach deep green
      let centerSvgHtml = '<circle cx="16" cy="16" r="4.5" fill="white"/>'; // default white core dot

      if (landmark.category === 'school') {
        pinColor = '#1A73E8'; // Google Maps School Blue
        centerSvgHtml = `
          <g transform="translate(8, 8)">
            <path d="M8 2L1 5.5L8 9L15 5.5L8 2Z" fill="white"/>
            <path d="M3.5 8V11.5C3.5 12.8 5.5 13.8 8 13.8C10.5 13.8 12.5 12.8 12.5 11.5V8" fill="none" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.5 6.5V11" fill="none" stroke="white" stroke-width="1" stroke-linecap="round"/>
            <circle cx="13.5" cy="11" r="1" fill="white"/>
          </g>
        `;
      } else if (landmark.category === 'restaurant') {
        pinColor = '#EA4335'; // Google Maps Red-Orange
        centerSvgHtml = `
          <g transform="translate(8, 8)">
            <!-- Fork & Spoon -->
            <path d="M4 2V6C4 7 4.8 7.5 5.5 7.5V14H6.5V7.5C7.2 7.5 8 7 8 6V2H7.2V5.5H6.5V2H5.5V5.5H4.8V2H4Z" fill="white"/>
            <path d="M11.5 2C10.0 2 10.0 4.5 10.0 7V14H11.5V2Z" fill="white"/>
          </g>
        `;
      } else if (landmark.category === 'hotel') {
        pinColor = '#C2185B'; // Google Maps Lodging Pink/Fuchsia
        centerSvgHtml = `
          <g transform="translate(8, 8)">
            <!-- Headboard -->
            <rect x="1" y="2" width="2" height="12" rx="0.5" fill="white"/>
            <!-- Footboard -->
            <rect x="13" y="6" width="2" height="8" rx="0.5" fill="white"/>
            <!-- Mattress -->
            <rect x="3" y="6" width="10" height="6" rx="1" fill="white"/>
            <!-- Pillow -->
            <rect x="4" y="4" width="3" height="2.2" rx="0.5" fill="white"/>
          </g>
        `;
      } else if (landmark.category === 'airport') {
        pinColor = '#1A73E8'; // Google Maps Airport Blue
        centerSvgHtml = `
          <g transform="translate(8, 8)">
            <path d="M14 8.5h-3.2l-2.6-4.6c-.2-.3-.5-.4-.8-.4h-.9c-.3 0-.5.3-.4.6l1.3 4.4H5.2L3.7 6.3V6c0-.3-.2-.5-.5-.5h-.7c-.2 0-.4.2-.4.4l.6 2.6-.6 2.6c0 .2.2.4.4.4h.7c.3 0 .5-.2.5-.5v-.3l1.5-2.2h2.2l-1.3 4.4c-.1.3.1.6.4.6h.9c.3 0 .6-.1.8-.4l2.6-4.6H14c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5z" fill="white"/>
          </g>
        `;
      } else if (landmark.category === 'other') {
        pinColor = '#D97706'; // Saffron Gold / Orange-Yellow
        centerSvgHtml = `
          <g transform="translate(8, 8)">
            <path d="M8 1L10.2 5.5L15 6.2L11.5 9.6L12.3 14.4L8 12.1L3.7 14.4L4.5 9.6L1 6.2L5.8 5.5L8 1Z" fill="white"/>
          </g>
        `;
      }

      const landmarkIcon = L.divIcon({
        className: `custom-landmark-pin-${landmark.id}`,
        html: `
          <div class="relative group select-none cursor-pointer" style="transform: translate(-50%, -100%); width: 24px; height: 32px;">
            <!-- Tooltip Popup -->
            <div class="absolute bottom-[36px] left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[9999] bg-[#FAF6EC] border border-[#0E3524]/20 px-3.5 py-2.5 rounded-xl shadow-xl flex flex-col items-center justify-center text-center whitespace-nowrap min-w-[170px] pointer-events-auto">
              <div class="text-[#0E3524] text-[10.5px] font-sans font-extrabold tracking-[0.08em] uppercase mb-0.5">
                ${landmark.name}
              </div>
              <div class="text-[#505D41] text-[9px] font-sans font-bold tracking-[0.04em] uppercase mb-0.5">
                ${driveMinutes} MIN DRIVE
              </div>
              <div class="text-[#505D41]/70 text-[8.5px] font-sans font-semibold tracking-[0.04em] uppercase">
                ${distanceKm} KM AWAY
              </div>
              ${landmark.description ? `<div class="text-[8px] text-[#505D41]/65 font-sans font-medium tracking-normal mt-1 border-t border-[#505D41]/10 pt-1 w-full text-center leading-relaxed whitespace-normal">${landmark.description}</div>` : ''}
              
              <!-- Invisible hover bridge -->
              <div class="absolute -bottom-3.5 left-0 right-0 h-3.5 bg-transparent"></div>

              <!-- Arrow Tip -->
              <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FAF6EC] border-r border-b border-[#0E3524]/10 rotate-45"></div>
            </div>

            <!-- Drop Pin SVG Visual with customized category colored backdrop and interior icon -->
            <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-md hover:scale-110 active:scale-95 transition-transform duration-200">
              <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="white"/>
              <path d="M16 3C8.82 3 3 8.82 3 16C3 25.2 16 37 16 37C16 37 29 25.2 29 16C29 8.82 23.18 3 16 3Z" fill="${pinColor}"/>
              ${centerSvgHtml}
            </svg>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      L.marker([landmark.lat, landmark.lng], { icon: landmarkIcon, interactive: true }).addTo(landmarksGroup);
    });
  }, [activeCategoryFilter]);

  // Custom route drawing function using highly performant driving calculations (OSRM API)
  const calculateAndDrawRoute = async (landmarkId: string) => {
    const landmark = LANDMARKS.find((l) => l.id === landmarkId);
    if (!landmark) return;

    setIsLoadingRoute(true);
    if (overpassGroupRef.current) {
      overpassGroupRef.current.clearLayers();
    }

    try {
      const response = await fetch(
        `https://router.projectosrm.org/route/v1/driving/${ENTRY_COORDINATES.lng},${ENTRY_COORDINATES.lat};${landmark.lng},${landmark.lat}?overview=full&geometries=geojson`
      );
      if (!response.ok) {
        throw new Error('OSRM API error');
      }
      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );

        const distKm = (route.distance / 1000).toFixed(1);
        const durMin = Math.max(1, Math.round(route.duration / 60));

        const map = mapRef.current;
        if (map && overpassGroupRef.current) {
          // Bottom glowing route line
          L.polyline(coordinates, {
            color: '#FFFFFF',
            weight: 7,
            opacity: 0.7,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(overpassGroupRef.current);

          // Top animated dashed golden route line
          L.polyline(coordinates, {
            color: '#B09A68', // Elegant gold color
            weight: 3.8,
            opacity: 1.0,
            lineCap: 'round',
            lineJoin: 'round',
            dashArray: '3, 7',
          }).addTo(overpassGroupRef.current);

          // Set bounds padding to fit whole route comfortably
          const bounds = L.latLngBounds([
            [ENTRY_COORDINATES.lat, ENTRY_COORDINATES.lng],
            [landmark.lat, landmark.lng],
            ...coordinates
          ]);
          map.fitBounds(bounds, { padding: [80, 80], animate: true });

          setActiveRoute({
            landmarkId,
            name: landmark.name,
            distance: `${distKm} km`,
            duration: `${durMin} mins`,
          });
        }
      } else {
        throw new Error('No route code Ok status');
      }
    } catch (err) {
      console.warn('Routing engine fallback to direct line:', err);
      // Perfect geodesic direct line fallback
      const map = mapRef.current;
      if (map && overpassGroupRef.current) {
        const coordinates: [number, number][] = [
          [ENTRY_COORDINATES.lat, ENTRY_COORDINATES.lng],
          [landmark.lat, landmark.lng],
        ];

        const siteLatLng = L.latLng(ENTRY_COORDINATES.lat, ENTRY_COORDINATES.lng);
        const targetLatLng = L.latLng(landmark.lat, landmark.lng);
        const distKm = (siteLatLng.distanceTo(targetLatLng) / 1000).toFixed(1);
        const durMin = Math.max(1, Math.round(Number(distKm) * 2));

        L.polyline(coordinates, {
          color: '#FFFFFF',
          weight: 7,
          opacity: 0.7,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(overpassGroupRef.current);

        L.polyline(coordinates, {
          color: '#B09A68',
          weight: 3.8,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: '4, 8',
        }).addTo(overpassGroupRef.current);

        const bounds = L.latLngBounds(coordinates);
        map.fitBounds(bounds, { padding: [100, 100], animate: true });

        setActiveRoute({
          landmarkId,
          name: landmark.name,
          distance: `${distKm} km (direct)`,
          duration: `${durMin} mins`,
        });
      }
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Ref-updater to prevent stale closures inside Leaflet global delegation event listeners
  const calculateAndDrawRouteRef = useRef(calculateAndDrawRoute);
  useEffect(() => {
    calculateAndDrawRouteRef.current = calculateAndDrawRoute;
  });

  // Delegate click helper to catch standard click on custom show route buttons inside map container
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleDelegatedClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.show-route-btn');
      if (btn) {
        e.stopPropagation();
        e.preventDefault();
        const landmarkId = btn.getAttribute('data-landmark-id');
        if (landmarkId) {
          if (landmarkId === 'mandrem-beach') {
            window.open('https://maps.app.goo.gl/XGy1rKvDVUFEztCTA', '_blank');
          }
          calculateAndDrawRouteRef.current(landmarkId);
        }
      }
    };

    container.addEventListener('click', handleDelegatedClick);
    return () => {
      container.removeEventListener('click', handleDelegatedClick);
    };
  }, []);

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

      {/* Floating Route Info/Details Banner */}
      {activeRoute && (
        <div id="route-info-panel" className="absolute top-6 left-20 md:left-24 z-20 w-80 max-w-[calc(100vw-6rem)] bg-[#FAF6EC]/95 backdrop-blur-md border border-[#0E3524]/15 rounded-2xl p-4.5 shadow-xl flex flex-col justify-between transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <span className="font-sans text-[8px] font-extrabold tracking-[0.25em] text-[#505D41]/75 uppercase block mb-1">
                DRIVING ROUTE ACTIVE
              </span>
              <h3 className="font-serif text-base font-bold text-[#0E3524] tracking-wide leading-tight">
                {activeRoute.name}
              </h3>
            </div>
            <button
              onClick={() => {
                setActiveRoute(null);
                if (overpassGroupRef.current) {
                  overpassGroupRef.current.clearLayers();
                }
                resetViewport();
              }}
              className="p-1 rounded-full bg-[#0E3524]/5 hover:bg-[#0E3524]/10 text-[#0E3524] transition-all cursor-pointer flex items-center justify-center border border-[#0E3524]/10"
              aria-label="Clear Route"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-1.5 bg-white/70 rounded-xl p-3 border border-[#0E3524]/5">
            <div>
              <span className="font-sans text-[8px] font-bold text-[#505D41]/65 tracking-wider uppercase block mb-0.5">
                EST. DRIVE TIME
              </span>
              <span className="font-sans text-xs font-black text-[#0E3524]">
                {activeRoute.duration}
              </span>
            </div>
            <div>
              <span className="font-sans text-[8px] font-bold text-[#505D41]/65 tracking-wider uppercase block mb-0.5">
                ROAD DISTANCE
              </span>
              <span className="font-sans text-xs font-black text-[#0E3524]">
                {activeRoute.distance}
              </span>
            </div>
          </div>
          
          <div className="mt-3 flex justify-between items-center text-[8px] font-sans font-bold tracking-wider text-[#5B6A4E] uppercase border-t border-[#505D41]/10 pt-2.5">
            <span>START: EL CUENTO</span>
            <span className="text-[#0E3524] flex items-center gap-1.5 font-sans font-extrabold tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E3524] animate-pulse"></span>
              ROUTING ACTIVE
            </span>
          </div>
        </div>
      )}

      {/* Calculating Route loading progress */}
      {isLoadingRoute && (
        <div id="route-info-loading" className="absolute top-6 left-20 md:left-24 z-20 w-56 bg-[#FAF6EC]/95 backdrop-blur-md border border-[#0E3524]/15 rounded-xl px-4 py-3.5 shadow-md flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-[#0E3524] border-t-transparent animate-spin"></div>
          <span className="font-sans text-[9px] font-bold tracking-wider text-[#0E3524] uppercase">
            Calculating route...
          </span>
        </div>
      )}

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

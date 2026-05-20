export interface Apartment {
  id: string; // e.g., 'A-01'
  block: 'A' | 'B' | 'C';
  name: string;
  tag: string; // e.g., '2BHK · Garden Suite'
  config: string; // e.g., '2 BHK'
  configSub: string; // e.g., 'two bedrooms, two baths'
  area: string; // e.g., '96 sq m'
  areaSub: string; // e.g., '≈ 1,033 sq ft'
  aspect: string; // e.g., 'East-facing'
  aspectSub: string; // e.g., 'morning light'
  outdoor: string; // e.g., 'Private deck'
  outdoorSub: string; // e.g., 'garden views'
  features: string[]; // describe slow living & details
  variant: '1bhk' | '2bhk' | '3bhk';
  svgCoord: [number, number]; // [X, Y] within the 350x1300 sitemap coordinate space
  // Optional asset-based overrides for rendering images
  floorplanAsset?: string; // custom image file relative path in /assets/
  renderAssets?: string[]; // custom high-res render images
}

export interface BlockDetails {
  name: string;
  sub: string;
  description: string;
}

export interface OverlayParams {
  centerLat: number;
  centerLng: number;
  widthM: number;
  heightM: number;
  rotation: number;
  opacity: number;
}

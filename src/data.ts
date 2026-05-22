import { Apartment, BlockDetails, OverlayParams, Landmark } from './types';

export const BLOCK_META: Record<string, BlockDetails> = {
  A: {
    name: 'Block A · Canopy Suites',
    sub: 'Ground & Upper Level Sanctuary Homes',
    description: 'Set under mature palms in the quiet southern sweep of the property, Block A offers private decks and sunset-facing balconies.'
  },
  B: {
    name: 'Block B · Sky Penthouses',
    sub: 'Elevated Double-Height Estates',
    description: 'Each spanning full plates with double-height glass panels, a private indoor stair leads directly to a private sky terrace.'
  },
  C: {
    name: 'Block C · Poolside Residences',
    sub: 'Fluid Front-row & Pool-view Pavilions',
    description: 'Direct poolside stepout, wrap-around verandas, and dual aspects catching the ocean breeze rolling through Mandrem.'
  }
};

export const APARTMENTS: Apartment[] = [
  // ==================== BLOCK A ====================
  // Ground floor
  {
    id: 'A01',
    block: 'A',
    name: 'A01 · Garden Suite',
    tag: '2BHK · Ground Garden',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '96 sq m',
    areaSub: '≈ 1,033 sq ft',
    aspect: 'East-facing',
    aspectSub: 'morning light through teak branches',
    outdoor: 'Private yard & deck',
    outdoorSub: 'garden boundaries with plunge spillway',
    features: [
      'A garden-level corner residence featuring triple aspect ventilation.',
      'Double-height ceilings in the main family room and full-height steel casement glazing.',
      'A master bedroom equipped with an outdoor rain shower enclosed within high basalt stone walls.'
    ],
    variant: '2bhk',
    svgCoord: [211, 1150],
    floorplanAsset: '/assets/floorplan_a01.webp'
  },
  {
    id: 'A02',
    block: 'A',
    name: 'A02 · Terrace Studio',
    tag: '1BHK · Sunset Terrace',
    config: '1 BHK',
    configSub: 'one bedroom, one bath',
    area: '54 sq m',
    areaSub: '≈ 581 sq ft',
    aspect: 'West-facing',
    aspectSub: 'glowing evening light & sea breeze',
    outdoor: 'Spacious high veranda',
    outdoorSub: 'views onto pool deck and property spine',
    features: [
      'An intimate retreat designed for digital hermits or sunset-loving individuals.',
      'Fitted with native timber cabinetry, stone counter finishes, and sliding louvers that moderate light throughout the day.',
      'Direct breeze capture coming up from Mandrem beach.'
    ],
    variant: '1bhk',
    svgCoord: [211, 1025],
    floorplanAsset: '/assets/floorplan_a02.webp'
  },
  {
    id: 'A03',
    block: 'A',
    name: 'A03 · Eastern Studio',
    tag: '1BHK · Canopy Retreat',
    config: '1 BHK',
    configSub: 'one bedroom, one bath',
    area: '54 sq m',
    areaSub: '≈ 581 sq ft',
    aspect: 'East-facing',
    aspectSub: 'gentle morning golden hours',
    outdoor: 'Tucked-away private loggia',
    outdoorSub: 'overlooking mature tropical gardens',
    features: [
      'Mirror configuration of A-02 with optimized east ventilation.',
      'Surrounded by frangipani blossoms and creeping vines for absolute visual isolation.',
      'Perfectly quiet workspace corner.'
    ],
    variant: '1bhk',
    svgCoord: [261, 1025],
    floorplanAsset: '/assets/floorplan_a03.webp'
  },
  {
    id: 'A04',
    block: 'A',
    name: 'A04 · Garden Suite',
    tag: '2BHK · Ground Garden',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '96 sq m',
    areaSub: '≈ 1,033 sq ft',
    aspect: 'West-facing',
    aspectSub: 'dappled afternoon shadows',
    outdoor: 'Private wrap-around deck',
    outdoorSub: 'shaded patio with native stone paving',
    features: [
      'The west-facing garden suite companion to A-01.',
      'Equipped with custom terrazzo flooring in sand/neutral earth colors.',
      'The living pavilion seamlessly blends into a private lawn lined with wild grass.'
    ],
    variant: '2bhk',
    svgCoord: [261, 1150],
    floorplanAsset: '/assets/floorplan_a04.webp'
  },
  // First Floor
  {
    id: 'A101',
    block: 'A',
    name: 'A101 · Canopy Premium',
    tag: '2BHK · Level 1 Canopy',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '98 sq m',
    areaSub: '≈ 1,054 sq ft',
    aspect: 'East-facing',
    aspectSub: 'elevated garden light',
    outdoor: 'Extensive private loggia',
    outdoorSub: 'raised deck with treetop views',
    features: [
      'A first-floor premium residence tucked into the palm trunks.',
      'Warm custom teak frames with premium brass hardware.',
      'Spacious master en-suite with an abundance of natural light.'
    ],
    variant: '2bhk',
    svgCoord: [211, 1150],
    floorplanAsset: '/assets/floorplan_a01.webp'
  },
  {
    id: 'A102',
    block: 'A',
    name: 'A102 · Breezy Studio',
    tag: '1BHK · Level 1 Veranda',
    config: '1 BHK',
    configSub: 'one bedroom, one bath',
    area: '56 sq m',
    areaSub: '≈ 602 sq ft',
    aspect: 'West-facing',
    aspectSub: 'sea-ward breeze filter',
    outdoor: 'Deep sunset balcony',
    outdoorSub: 'private timber-decked overlook',
    features: [
      'Perfect first-floor retreat with high vaulted rafters.',
      'Polished concrete flooring that keeps the studio cool inside.'
    ],
    variant: '1bhk',
    svgCoord: [211, 1025],
    floorplanAsset: '/assets/floorplan_a02.webp'
  },
  {
    id: 'A103',
    block: 'A',
    name: 'A103 · Eastern Studio',
    tag: '1BHK · Level 1 East-side',
    config: '1 BHK',
    configSub: 'one bedroom, one bath',
    area: '56 sq m',
    areaSub: '≈ 602 sq ft',
    aspect: 'East-facing',
    aspectSub: 'morning bird chorus light',
    outdoor: 'Leafy deep balcony',
    outdoorSub: 'nestled within old orchard branches',
    features: [
      'Quiet workspace studio with soundproof acoustics and dual ventilation.'
    ],
    variant: '1bhk',
    svgCoord: [261, 1025],
    floorplanAsset: '/assets/floorplan_a03.webp'
  },
  {
    id: 'A104',
    block: 'A',
    name: 'A104 · Canopy Vista',
    tag: '2BHK · Level 1 Orchard',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '98 sq m',
    areaSub: '≈ 1,054 sq ft',
    aspect: 'West-facing',
    aspectSub: 'golden sunset filters',
    outdoor: 'Private extended veranda',
    outdoorSub: 'bamboo-shaded sitting corner',
    features: [
      'Twin layout to A101 with customized west view configuration.'
    ],
    variant: '2bhk',
    svgCoord: [261, 1150],
    floorplanAsset: '/assets/floorplan_a04.webp'
  },
  // Second Floor
  {
    id: 'A201',
    block: 'A',
    name: 'A201 · Sky Vista Suite',
    tag: '2BHK · Level 2 Vista',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '102 sq m',
    areaSub: '≈ 1,098 sq ft',
    aspect: 'East-facing',
    aspectSub: 'bright early light and breeze',
    outdoor: 'Panoramic private deck',
    outdoorSub: 'commanding orchard line views',
    features: [
      'A rare level two corner with premium fixtures and crosswise airflow.'
    ],
    variant: '2bhk',
    svgCoord: [211, 1150],
    floorplanAsset: '/assets/floorplan_a01.webp'
  },
  {
    id: 'A202',
    block: 'A',
    name: 'A202 · Elevated Studio',
    tag: '1BHK · Level 2 Retreat',
    config: '1 BHK',
    configSub: 'one bedroom, one bath',
    area: '58 sq m',
    areaSub: '≈ 624 sq ft',
    aspect: 'West-facing',
    aspectSub: 'unhindered ocean-breeze reach',
    outdoor: 'Wrap-around balcony loggia',
    outdoorSub: 'private timber sunset overlook',
    features: [
      'A majestic second-floor loft with hand-crafted Goan cane separators.'
    ],
    variant: '1bhk',
    svgCoord: [211, 1025],
    floorplanAsset: '/assets/floorplan_a02.webp'
  },
  {
    id: 'A203',
    block: 'A',
    name: 'A203 · Elevated Studio',
    tag: '1BHK · Level 2 East-wing',
    config: '1 BHK',
    configSub: 'one bedroom, one bath',
    area: '58 sq m',
    areaSub: '≈ 624 sq ft',
    aspect: 'East-facing',
    aspectSub: 'gentle daylight curves',
    outdoor: 'Serene terrace snug',
    outdoorSub: 'views into top-layer frangipani branches',
    features: [
      'Quiet studio focusing on natural wellness and stone finishes.'
    ],
    variant: '1bhk',
    svgCoord: [261, 1025],
    floorplanAsset: '/assets/floorplan_a03.webp'
  },
  {
    id: 'A204',
    block: 'A',
    name: 'A204 · Sky Vista Suite',
    tag: '2BHK · Level 2 West-flank',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '102 sq m',
    areaSub: '≈ 1,098 sq ft',
    aspect: 'West-facing',
    aspectSub: 'sea sunset horizon sightlines',
    outdoor: 'Panoramic private deck',
    outdoorSub: 'stretching over sunset lawn boundaries',
    features: [
      'Perfect western aspect with full deck integration and sliding glass walls.'
    ],
    variant: '2bhk',
    svgCoord: [261, 1150],
    floorplanAsset: '/assets/floorplan_a04.webp'
  },
  // Third Floor (skipping A303 as requested)
  {
    id: 'A301',
    block: 'A',
    name: 'A301 · Crown Pavilion',
    tag: '2BHK · Level 3 Skydeck',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '110 sq m',
    areaSub: '≈ 1,184 sq ft',
    aspect: 'East-facing',
    aspectSub: 'full morning dome views',
    outdoor: 'Crown terrace with snug lounge',
    outdoorSub: 'private top-level panorama platform',
    features: [
      'Set immediately under high exposed-rafter ceiling systems.',
      'Exceptional architectural elegance with supreme acoustic privacy.'
    ],
    variant: '2bhk',
    svgCoord: [211, 1150],
    floorplanAsset: '/assets/floorplan_a01.webp'
  },
  {
    id: 'A302',
    block: 'A',
    name: 'A302 · Crown Studio',
    tag: '1BHK · Level 3 Sanctuary',
    config: '1 BHK',
    configSub: 'one bedroom, one bath',
    area: '64 sq m',
    areaSub: '≈ 688 sq ft',
    aspect: 'West-facing',
    aspectSub: 'endless sea horizon breeze',
    outdoor: 'High dramatic skyward veranda',
    outdoorSub: 'sunset platform above the tree line',
    features: [
      'The topmost single-BHK suite of Block A, unmatched in light and breeze.'
    ],
    variant: '1bhk',
    svgCoord: [211, 1025],
    floorplanAsset: '/assets/floorplan_a02.webp'
  },
  {
    id: 'A304',
    block: 'A',
    name: 'A304 · Crown Pavilion',
    tag: '2BHK · Level 3 Sky-West',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '110 sq m',
    areaSub: '≈ 1,184 sq ft',
    aspect: 'West-facing',
    aspectSub: 'unrestrained sunset spectacle',
    outdoor: 'Crown terrace with snug lounge',
    outdoorSub: 'breathtaking views of Mandrem skies',
    features: [
      'Signature top-floor design with exposed rafters and premium teak decking.'
    ],
    variant: '2bhk',
    svgCoord: [261, 1150],
    floorplanAsset: '/assets/floorplan_a04.webp'
  },

  // ==================== BLOCK B ====================
  // Ground floor
  {
    id: 'B01',
    block: 'B',
    name: 'B01 · Sky Penthouse',
    tag: '3BHK · Penthouse Estate',
    config: '3 BHK',
    configSub: 'three bedrooms, three baths',
    area: '186 sq m',
    areaSub: '≈ 2,002 sq ft',
    aspect: 'Dual aspects',
    aspectSub: 'full cross ventilation (east to west)',
    outdoor: 'Sky terrace & pool',
    outdoorSub: 'private staircase to roof terrace',
    features: [
      'The signature crowning estate of El Cuento. Features a long-axis layout with a double-height dining volume.',
      'A bespoke minimalist circular steel staircase spirals up to a completely private rooftop lounge with panoramic views.',
      'Plush clay-plaster wall details that naturally moderate tropical humidity.'
    ],
    variant: '3bhk',
    svgCoord: [234, 850],
    floorplanAsset: '/assets/floorplan_b01.webp'
  },
  {
    id: 'B02',
    block: 'B',
    name: 'B02 · Sky Penthouse',
    tag: '3BHK · Penthouse Estate',
    config: '3 BHK',
    configSub: 'three bedrooms, three baths',
    area: '186 sq m',
    areaSub: '≈ 2,002 sq ft',
    aspect: 'Dual aspects',
    aspectSub: 'optimal ocean current crossflow',
    outdoor: 'Sky terrace & pool',
    outdoorSub: 'private staircase to roof terrace',
    features: [
      'The northern companion penthouse with expansive dual balconies on the master suite level.',
      'An open kitchen island detailed in fluted Goan laterite stone and concrete.',
      'Bespoke hand-crafted timber doors that fully open to frame the distant horizon.'
    ],
    variant: '3bhk',
    svgCoord: [234, 720],
    floorplanAsset: '/assets/floorplan_b02.webp'
  },
  // First Floor
  {
    id: 'B101',
    block: 'B',
    name: 'B101 · Sky Estate',
    tag: '3BHK · Level 1 Grand',
    config: '3 BHK',
    configSub: 'three bedrooms, three baths',
    area: '190 sq m',
    areaSub: '≈ 2,045 sq ft',
    aspect: 'E-W Dual aspects',
    aspectSub: 'double breezes',
    outdoor: 'Extended tree-level patio',
    outdoorSub: 'outdoor dining veranda under palm canopy',
    features: [
      'Premium spacious flat layout with high design details and timber screens.'
    ],
    variant: '3bhk',
    svgCoord: [234, 850],
    floorplanAsset: '/assets/floorplan_b01.webp'
  },
  {
    id: 'B102',
    block: 'B',
    name: 'B102 · Sky Estate',
    tag: '3BHK · Level 1 Grand',
    config: '3 BHK',
    configSub: 'three bedrooms, three baths',
    area: '190 sq m',
    areaSub: '≈ 2,045 sq ft',
    aspect: 'E-W Dual aspects',
    aspectSub: 'breeze rolling over pool garden',
    outdoor: 'Extended tree-level patio',
    outdoorSub: 'gorgeous timber deck for morning tea',
    features: [
      'Integrated gourmet kitchen block with raw sand and laterite detailing.'
    ],
    variant: '3bhk',
    svgCoord: [234, 720],
    floorplanAsset: '/assets/floorplan_b02.webp'
  },
  // Second Floor
  {
    id: 'B201',
    block: 'B',
    name: 'B201 · Sky Sanctuary',
    tag: '3BHK · Level 2 Premium',
    config: '3 BHK',
    configSub: 'three bedrooms, three baths',
    area: '194 sq m',
    areaSub: '≈ 2,088 sq ft',
    aspect: 'Dual aspects',
    aspectSub: 'full horizon vistas',
    outdoor: 'Stretched private balcony',
    outdoorSub: 'high panoramic sunset lounging system',
    features: [
      'Elevated luxury with absolute visual peace, high ceilings, and terrazzo bathrooms.'
    ],
    variant: '3bhk',
    svgCoord: [234, 850],
    floorplanAsset: '/assets/floorplan_b01.webp'
  },
  {
    id: 'B202',
    block: 'B',
    name: 'B202 · Sky Sanctuary',
    tag: '3BHK · Level 2 Premium',
    config: '3 BHK',
    configSub: 'three bedrooms, three baths',
    area: '194 sq m',
    areaSub: '≈ 2,088 sq ft',
    aspect: 'Dual aspects',
    aspectSub: 'high ocean breeze filter',
    outdoor: 'Stretched private balcony',
    outdoorSub: 'with dedicated daybed snug',
    features: [
      'Bespoke luxury featuring modular partitions and walk-in dresser corners.'
    ],
    variant: '3bhk',
    svgCoord: [234, 720],
    floorplanAsset: '/assets/floorplan_b02.webp'
  },
  // Third Floor
  {
    id: 'B301',
    block: 'B',
    name: 'B301 · Ultimate Penthouse',
    tag: '3BHK · Level 3 Penthouse',
    config: '3 BHK',
    configSub: 'three bedrooms, three baths',
    area: '202 sq m',
    areaSub: '≈ 2,174 sq ft',
    aspect: 'Full 360° crossflow',
    aspectSub: 'overlooking all of old Mandrem village',
    outdoor: 'Dual sky-roof loggias',
    outdoorSub: 'private skydeck stairs and garden platform',
    features: [
      'Set under striking cathedral-style structural rafters.',
      'Polished limestone floors, private outdoor baths, and customized cocktail bar island.'
    ],
    variant: '3bhk',
    svgCoord: [234, 850],
    floorplanAsset: '/assets/floorplan_b01.webp'
  },
  {
    id: 'B302',
    block: 'B',
    name: 'B302 · Ultimate Penthouse',
    tag: '3BHK · Level 3 Penthouse',
    config: '3 BHK',
    configSub: 'three bedrooms, three baths',
    area: '202 sq m',
    areaSub: '≈ 2,174 sq ft',
    aspect: 'Full 360° crossflow',
    aspectSub: 'high-tier breeze currents',
    outdoor: 'Dual sky-roof loggias',
    outdoorSub: 'private glass-framed sunset lookout',
    features: [
      'The topmost crowning apartment of Block B, offering maximum visual majesty.'
    ],
    variant: '3bhk',
    svgCoord: [234, 720],
    floorplanAsset: '/assets/floorplan_b02.webp'
  },

  // ==================== BLOCK C ====================
  // Ground floor
  {
    id: 'C',
    block: 'C',
    name: 'C · Pool Front Pavilion',
    tag: '3BHK · Pool Steps front',
    config: '3 BHK',
    configSub: 'three bedrooms, three baths',
    area: '142 sq m',
    areaSub: '≈ 1,528 sq ft',
    aspect: 'Full South aspect',
    aspectSub: 'direct solar line and direct water view',
    outdoor: 'Direct Pool veranda',
    outdoorSub: 'sun loungers stepout straight into pool',
    features: [
      'An exceptional poolside residence with a sprawling direct veranda that meets the main pool deck.',
      'Open plan living area styled with polished concrete flooring and timber columns that mirror traditional Goan architecture.',
      'Equipped with custom-designed sliding accordion glazing that allows you to turn the entire living room into an open garden deck.'
    ],
    variant: '3bhk',
    svgCoord: [236, 365],
    floorplanAsset: '/assets/floorplan_c.webp'
  },
  {
    id: 'C01',
    block: 'C',
    name: 'C01 · Pool Front Pavilion',
    tag: '3BHK · Pool steps front',
    config: '3 BHK',
    configSub: 'three bedrooms, three baths',
    area: '142 sq m',
    areaSub: '≈ 1,528 sq ft',
    aspect: 'Full South aspect',
    aspectSub: 'direct pool deck views and breeze',
    outdoor: 'Direct Pool veranda',
    outdoorSub: 'direct stairs straight to the sparkling water',
    features: [
      'Twin pavilion companion to C, with identical pool integration and sliding screens.'
    ],
    variant: '3bhk',
    svgCoord: [236, 290],
    floorplanAsset: '/assets/floorplan_c.webp'
  },
  {
    id: 'C02',
    block: 'C',
    name: 'C02 · Pool View Estate',
    tag: '2BHK · Canopy Corner',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '104 sq m',
    areaSub: '≈ 1,119 sq ft',
    aspect: 'South-facing',
    aspectSub: 'captures bright reflected pool light',
    outdoor: 'Extensive pool balcony',
    outdoorSub: 'elevated above the shared pool area',
    features: [
      'A peaceful residence positioned above the pool deck, offering dual vistas of water and native trees.',
      'Surrounded by floor-to-ceiling glass paneling and fitted with hand-woven cane partitioning screens.',
      'Offers a balanced layout with separated sleeping zones of equal privacy.'
    ],
    variant: '2bhk',
    svgCoord: [201, 140],
    floorplanAsset: '/assets/floorplan_c02.webp'
  },
  {
    id: 'C03',
    block: 'C',
    name: 'C03 · Pool View Estate',
    tag: '2BHK · Canopy Corner',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '104 sq m',
    areaSub: '≈ 1,119 sq ft',
    aspect: 'South-facing',
    aspectSub: 'unrestrained sun over pool',
    outdoor: 'Extensive pool balcony',
    outdoorSub: 'elevated above the shared pool area',
    features: [
      'Mirror configuration of C-02, situated on the east side of the resort.',
      'Dappled sunlight filters through majestic old-growth mango trees surrounding the property.',
      'Ideal for enjoying a gentle breeze and calm mornings.'
    ],
    variant: '2bhk',
    svgCoord: [259, 140],
    floorplanAsset: '/assets/floorplan_c03.webp'
  },
  // First Floor
  {
    id: 'C101',
    block: 'C',
    name: 'C101 · Elevated Pavilion',
    tag: '3BHK · Level 1 Pool View',
    config: '3 BHK',
    configSub: 'three bedrooms, three baths',
    area: '146 sq m',
    areaSub: '≈ 1,571 sq ft',
    aspect: 'Full South aspect',
    aspectSub: 'stunning bird-eye pool blue reflections',
    outdoor: 'Wide timber balcony deck',
    outdoorSub: 'with native teak railing details',
    features: [
      'An exceptional first-floor residence with a sprawling direct veranda that overlooks the pool.'
    ],
    variant: '3bhk',
    svgCoord: [236, 290],
    floorplanAsset: '/assets/floorplan_c.webp'
  },
  {
    id: 'C102',
    block: 'C',
    name: 'C102 · Canopy Pool View',
    tag: '2BHK · Level 1 Canopy Corner',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '106 sq m',
    areaSub: '≈ 1,140 sq ft',
    aspect: 'South-facing',
    aspectSub: 'dappled palm shadows',
    outdoor: 'High spacious pool balcony',
    outdoorSub: 'nestled within the cooling leafy canopies',
    features: [
      'A peaceful corner unit with dual panoramas and polished concrete lines.'
    ],
    variant: '2bhk',
    svgCoord: [201, 140],
    floorplanAsset: '/assets/floorplan_c02.webp'
  },
  {
    id: 'C103',
    block: 'C',
    name: 'C103 · Canopy Pool View',
    tag: '2BHK · Level 1 Canopy East',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '106 sq m',
    areaSub: '≈ 1,140 sq ft',
    aspect: 'South-facing',
    aspectSub: 'mango branch morning filters',
    outdoor: 'High spacious pool balcony',
    outdoorSub: 'secluded balcony corner overlooking native gardens',
    features: [
      'Optimized east layout with great morning light and gentle resort airflow.'
    ],
    variant: '2bhk',
    svgCoord: [259, 140],
    floorplanAsset: '/assets/floorplan_c03.webp'
  },
  // Second Floor
  {
    id: 'C201',
    block: 'C',
    name: 'C201 · Sky Pool View Court',
    tag: '3BHK · Level 2 Grand View',
    config: '3 BHK',
    configSub: 'three bedrooms, three baths',
    area: '150 sq m',
    areaSub: '≈ 1,614 sq ft',
    aspect: 'Panoramic South aspect',
    aspectSub: 'captures horizon sea layers',
    outdoor: 'Panoramic elevated loggia',
    outdoorSub: 'majestic timber deck with high lounge sofas',
    features: [
      'Spanning second level with absolute visual command of pool and property lines.'
    ],
    variant: '3bhk',
    svgCoord: [236, 290],
    floorplanAsset: '/assets/floorplan_c.webp'
  },
  {
    id: 'C202',
    block: 'C',
    name: 'C202 · Sky Pool View Estate',
    tag: '2BHK · Level 2 Canopy Premium',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '110 sq m',
    areaSub: '≈ 1,184 sq ft',
    aspect: 'South-facing',
    aspectSub: 'bright solar reach and breeze',
    outdoor: 'Panoramic pool balcony',
    outdoorSub: 'elevated above orchard boundaries',
    features: [
      'Second floor corner which blends concrete style and private terrace snug areas.'
    ],
    variant: '2bhk',
    svgCoord: [201, 140],
    floorplanAsset: '/assets/floorplan_c02.webp'
  },
  {
    id: 'C203',
    block: 'C',
    name: 'C203 · Sky Pool View Estate',
    tag: '2BHK · Level 2 Canopy East',
    config: '2 BHK',
    configSub: 'two bedrooms, two baths',
    area: '110 sq m',
    areaSub: '≈ 1,184 sq ft',
    aspect: 'South-facing',
    aspectSub: 'unrestrained cross currents',
    outdoor: 'Panoramic pool balcony',
    outdoorSub: 'with integrated lounge hammock space',
    features: [
      'Sleek layout with premium walk-in dressers and tropical bath features.'
    ],
    variant: '2bhk',
    svgCoord: [259, 140],
    floorplanAsset: '/assets/floorplan_c03.webp'
  }
];

export const ENTRY_COORDINATES = { lat: 15.6707778, lng: 73.7321667 };

export const LANDMARKS: Landmark[] = [
  {
    id: 'mandrem-beach',
    name: 'Mandrem Beach',
    lat: 15.670584,
    lng: 73.708562,
    category: 'tourist',
    description: 'Pristine white sand beach'
  },
  {
    id: 'surfing-school',
    name: 'Surfing School',
    lat: 15.663984,
    lng: 73.712960,
    category: 'tourist',
    description: 'Elite surfing instruction & gear rental'
  },
  {
    id: 'arambol-beach',
    name: 'Arambol Beach',
    lat: 15.677314,
    lng: 73.705626,
    category: 'tourist',
    description: 'Vibrant beach famous for drum circles & sunsets'
  },
  {
    id: 'ashwem-beach',
    name: 'Ashwem Beach',
    lat: 15.648026,
    lng: 73.716273,
    category: 'tourist',
    description: 'Scenic, tranquil sandy paradise'
  },
  {
    id: 'radisson-resort',
    name: 'Radisson Beach Resort',
    lat: 15.662260,
    lng: 73.713367,
    category: 'hotel',
    description: 'Luxury upscale lodging & premium amenities'
  },
  {
    id: 'cafe-chia',
    name: 'Chia',
    lat: 15.664471,
    lng: 73.712713,
    category: 'restaurant',
    description: 'Organic cafe specializing in healthy delicacies'
  },
  {
    id: 'cafe-prana',
    name: 'Prana',
    lat: 15.664042,
    lng: 73.712875,
    category: 'restaurant',
    description: 'Artisanal modern healthy eatery'
  },
  {
    id: 'goa-gymkhana',
    name: 'Goa Gymkhana Club',
    lat: 15.661187,
    lng: 73.739613,
    category: 'restaurant',
    description: 'Prestigious premium elite club & lounge'
  },
  {
    id: 'talula-sea',
    name: 'Talula By The Sea',
    lat: 15.654585,
    lng: 73.715947,
    category: 'restaurant',
    description: 'Panoramic beachfront fine dining lounge'
  },
  {
    id: 'artjuna-cafe',
    name: 'Artjuna Café',
    lat: 15.580594,
    lng: 73.747614,
    category: 'restaurant',
    description: 'Famous green lifestyle garden cafe & boutique'
  },
  {
    id: 'mopa-airport',
    name: 'MOPA Airport',
    lat: 15.728306,
    lng: 73.867602,
    category: 'airport',
    description: 'New Manohar International Airport Goa'
  },
  {
    id: 'rosary-convent',
    name: 'Rosary Convent Primary School',
    lat: 15.664593,
    lng: 73.718269,
    category: 'school',
    description: 'Distinguished local convent educational institution'
  },
  {
    id: 'mandre-high',
    name: 'Mandre High School',
    lat: 15.662561,
    lng: 73.735004,
    category: 'school',
    description: 'Prominent regional co-educational high school'
  }
];


// Initial site calibration map settings
export const DEFAULT_OVERLAY_PARAMS: OverlayParams = {
  centerLat: 15.6714618,
  centerLng: 73.7320967,
  widthM: 116.7,
  heightM: 196.4,
  rotation: 1,
  opacity: 1
};

export const SITEPLAN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 1300" preserveAspectRatio="none">
  <!-- Legacy SVG site plan fallback -->
</svg>`;

export const FLOORPLANS = {
  '1bhk': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 500">
    <defs>
      <pattern id="wood1" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill="#FAF6EC"/>
        <line x1="0" y1="0" x2="0" y2="14" stroke="#EDE3CC" stroke-width="0.5"/>
        <line x1="7" y1="0" x2="7" y2="14" stroke="#EDE3CC" stroke-width="0.3" opacity="0.5"/>
      </pattern>
    </defs>
    <rect x="50" y="60" width="600" height="380" fill="url(#wood1)" stroke="#1C2219" stroke-width="2"/>
    <line x1="300" y1="60" x2="300" y2="280" stroke="#1C2219" stroke-width="3"/>
    <line x1="50" y1="280" x2="300" y2="280" stroke="#1C2219" stroke-width="3"/>
    <rect x="80" y="100" width="180" height="100" fill="#FFFFFF" stroke="#5B6A4E" stroke-width="0.8" rx="2" />
    <text x="170" y="152" text-anchor="middle" font-family="'Cardo', serif" font-weight="700" font-size="18" fill="#1C2219">Master Suite</text>
    <text x="170" y="172" text-anchor="middle" font-family="'Mulish', sans-serif" font-weight="300" font-size="10" fill="#424A3B" letter-spacing="1">3.6 × 3.0 METERS</text>
    <line x1="200" y1="280" x2="200" y2="440" stroke="#1C2219" stroke-width="3"/>
    <rect x="80" y="310" width="100" height="100" fill="#F0EAE1" stroke="#5B6A4E" stroke-width="0.6" rx="2"/>
    <text x="130" y="365" text-anchor="middle" font-family="'Cardo', serif" font-size="14" fill="#1C2219">En-suite</text>
    <line x1="450" y1="280" x2="450" y2="440" stroke="#1C2219" stroke-width="3"/>
    <rect x="220" y="310" width="210" height="100" fill="#F4ECE1" stroke="#5B6A4E" stroke-width="0.6" rx="2"/>
    <text x="325" y="362" text-anchor="middle" font-family="'Cardo', serif" font-size="16" fill="#1C2219">Kitchen · Island</text>
    <text x="325" y="380" text-anchor="middle" font-family="'Mulish', sans-serif" font-size="9" fill="#1C2219" font-weight="300" letter-spacing="1">4.2 × 3.0 m</text>
    <rect x="330" y="100" width="290" height="160" fill="#FBF9F4" stroke="#5B6A4E" stroke-width="0.6" rx="2"/>
    <text x="475" y="176" text-anchor="middle" font-family="'Cardo', serif" font-weight="700" font-size="22" fill="#1C2219">Living Room</text>
    <text x="475" y="198" text-anchor="middle" font-family="'Mulish', sans-serif" font-weight="300" font-size="10" fill="#1C2219" letter-spacing="1">4.4 × 3.8 METERS</text>
    <rect x="470" y="310" width="150" height="100" fill="#EAECC8" stroke="#5B6A4E" stroke-width="0.8" stroke-dasharray="3 3"/>
    <text x="545" y="365" text-anchor="middle" font-family="'Cardo', serif" font-size="14" font-style="italic" fill="#3A4631">Loggia Terrace</text>
    <g transform="translate(620, 80)">
      <circle r="14" fill="none" stroke="#5B6A4E" stroke-width="0.5"/>
      <polygon points="0,-12 3,0 0,-3 -3,0" fill="#C5A059"/>
    </g>
    <text x="350" y="480" text-anchor="middle" font-family="'Mulish', sans-serif" font-weight="300" font-size="9" fill="#424A3B" letter-spacing="3">EL CUENTO BY VIANAAR HOMES · INDICATIVE AREA LAYOUT</text>
  </svg>`,

  '2bhk': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
    <defs>
      <pattern id="wood2" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill="#FAF6EC"/>
        <line x1="0" y1="0" x2="0" y2="14" stroke="#EDE3CC" stroke-width="0.5"/>
        <line x1="7" y1="0" x2="7" y2="14" stroke="#EDE3CC" stroke-width="0.3" opacity="0.5"/>
      </pattern>
    </defs>
    <rect x="50" y="60" width="700" height="400" fill="url(#wood2)" stroke="#1C2219" stroke-width="2"/>
    <line x1="320" y1="60" x2="320" y2="460" stroke="#1C2219" stroke-width="3"/>
    <line x1="50" y1="240" x2="320" y2="240" stroke="#1C2219" stroke-width="3"/>
    <rect x="80" y="90" width="220" height="120" fill="#FFFFFF" stroke="#5B6A4E" stroke-width="0.8" rx="2"/>
    <text x="190" y="148" text-anchor="middle" font-family="'Cardo', serif" font-weight="700" font-size="20" fill="#1C2219">Master Suite</text>
    <text x="190" y="166" text-anchor="middle" font-family="'Mulish', sans-serif" font-size="9" fill="#424A3B" font-weight="300" letter-spacing="1">3.8 × 3.4 m</text>
    <rect x="80" y="270" width="220" height="100" fill="#FFFFFF" stroke="#5B6A4E" stroke-width="0.8" rx="2"/>
    <text x="190" y="318" text-anchor="middle" font-family="'Cardo', serif" font-weight="700" font-size="18" fill="#1C2219">Bedroom Two</text>
    <rect x="340" y="90" width="380" height="230" fill="#FBF9F4" stroke="#5B6A4E" stroke-width="0.8" rx="2"/>
    <text x="530" y="195" text-anchor="middle" font-family="'Cardo', serif" font-weight="700" font-size="26" fill="#1C2219">Living &amp; Dining Hall</text>
    <rect x="580" y="340" width="140" height="100" fill="#EAECC8" stroke="#5B6A4E" stroke-width="0.8" stroke-dasharray="3 3"/>
    <text x="650" y="396" text-anchor="middle" font-family="'Cardo', serif" font-size="15" font-style="italic" fill="#3A4631">Private Deck</text>
    <text x="400" y="500" text-anchor="middle" font-family="'Mulish', sans-serif" font-weight="300" font-size="9" fill="#424A3B" letter-spacing="3">EL CUENTO BY VIANAAR HOMES · SCALED RECONSTRUCTION</text>
  </svg>`,

  '3bhk': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560">
    <defs>
      <pattern id="wood3" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
        <rect width="14" height="14" fill="#FAF6EC"/>
        <line x1="0" y1="0" x2="0" y2="14" stroke="#EDE3CC" stroke-width="0.5"/>
        <line x1="7" y1="0" x2="7" y2="14" stroke="#EDE3CC" stroke-width="0.3" opacity="0.5"/>
      </pattern>
    </defs>
    <rect x="50" y="60" width="800" height="440" fill="url(#wood3)" stroke="#1C2219" stroke-width="2"/>
    <line x1="370" y1="60" x2="370" y2="500" stroke="#1C2219" stroke-width="3"/>
    <line x1="50" y1="230" x2="370" y2="230" stroke="#1C2219" stroke-width="3"/>
    <rect x="80" y="90" width="240" height="130" fill="#FFFFFF" stroke="#5B6A4E" stroke-width="0.8" rx="2"/>
    <text x="200" y="152" text-anchor="middle" font-family="'Cardo', serif" font-weight="700" font-size="22" fill="#1C2219">Master Court Suite</text>
    <rect x="390" y="90" width="430" height="250" fill="#FBF9F4" stroke="#5B6A4E" stroke-width="0.8" rx="2"/>
    <text x="605" y="210" text-anchor="middle" font-family="'Cardo', serif" font-weight="700" font-size="30" fill="#1C2219">Double-height Living Pavilion</text>
    <rect x="650" y="355" width="170" height="125" fill="#EAECC8" stroke="#5B6A4E" stroke-width="0.8" stroke-dasharray="3 3"/>
    <text x="735" y="420" text-anchor="middle" font-family="'Cardo', serif" font-size="16" font-style="italic" fill="#3A4631">Private Terrace Court</text>
    <text x="450" y="540" text-anchor="middle" font-family="'Mulish', sans-serif" font-weight="300" font-size="9" fill="#424A3B" letter-spacing="3">EL CUENTO BY VIANAAR HOMES · THE STORY OF SLOW LIVING</text>
  </svg>`
};

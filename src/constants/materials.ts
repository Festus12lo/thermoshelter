export interface VendorInfo {
  id: string;
  name: string;
  pricePerSqm: number;
  deliveryDays: number;
  url: string;
  inStock: boolean;
}

export interface MaterialDef {
  id: string;
  name: string;
  rValue?: number;
  albedo?: number;
  thermalMass?: string;
  ecoScore?: string;
  hex: string;
  desc: string;
  imageUrl?: string;
  vendors: VendorInfo[];
}

export const WALL_MATERIALS: MaterialDef[] = [
  {
    id: 'eps',
    name: 'EPS Insulated Panels',
    desc: 'Expanded Polystyrene (EPS) structural panels. Highly rapid deployment, excellent insulation, very lightweight.',
    rValue: 4.2,
    thermalMass: 'Low',
    ecoScore: 'Poor',
    imageUrl: '/materials/puf.jpg',
    vendors: [
      { id: 'w1', name: 'RapidShelter Mfg', pricePerSqm: 2000.00, deliveryDays: 2, inStock: true, url: '#' },
      { id: 'w2', name: 'Global Relief Supply', pricePerSqm: 2240.00, deliveryDays: 1, inStock: true, url: '#' }
    ],
    hex: '#c8c2b7'
  },
  {
    id: 'pir',
    name: 'PIR Foam Board',
    desc: 'Polyisocyanurate foam panels providing superior thermal resistance and fire performance for emergency use.',
    rValue: 6.0,
    thermalMass: 'Low',
    ecoScore: 'Moderate',
    imageUrl: '/materials/aac_blocks.jpg',
    vendors: [
      { id: 'w3', name: 'InsulCore', pricePerSqm: 3600.00, deliveryDays: 5, inStock: true, url: '#' },
    ],
    hex: '#cbd5e1'
  },
  {
    id: 'aerogel',
    name: 'Aerogel Composite',
    desc: 'Advanced aerogel infused fabric panels. Extremely thin and lightweight with industry-leading thermal resistance.',
    rValue: 10.5,
    thermalMass: 'Very Low',
    ecoScore: 'Good',
    imageUrl: '/materials/cavity_wall.jpg',
    vendors: [
      { id: 'w4', name: 'AeroTech Textiles', pricePerSqm: 12000.00, deliveryDays: 14, inStock: false, url: '#' }
    ],
    hex: '#e2e8f0'
  },
  {
    id: 'hempcrete',
    name: 'Modular Hempcrete',
    desc: 'Pre-cast modular hempcrete panels. Carbon negative, breathable, and provides decent thermal mass.',
    rValue: 2.5,
    thermalMass: 'Medium',
    ecoScore: 'Excellent',
    imageUrl: '/materials/ceb.jpg',
    vendors: [
      { id: 'w5', name: 'EcoBlock Solutions', pricePerSqm: 5200.00, deliveryDays: 10, inStock: true, url: '#' }
    ],
    hex: '#bbaea0'
  },
  {
    id: 'hollow_polymer',
    name: 'Hollow Polymer',
    desc: 'Extruded hollow recycled polymer interlocking panels. Can be filled with sand or earth on-site for mass.',
    rValue: 1.5,
    thermalMass: 'Variable',
    ecoScore: 'Good',
    imageUrl: '/materials/flyash.jpg',
    vendors: [
      { id: 'w6', name: 'PolyBuild Systems', pricePerSqm: 2800.00, deliveryDays: 4, inStock: true, url: '#' }
    ],
    hex: '#48525b'
  }
];

export const ROOF_MATERIALS: MaterialDef[] = [
  {
    id: 'galvanized',
    name: 'Corrugated Galvanized Iron',
    desc: 'Standard corrugated metal sheets. Ubiquitous, cheap, durable, but offers poor thermal resistance without insulation.',
    albedo: 0.45,
    thermalMass: 'Very Low',
    ecoScore: 'Moderate',
    imageUrl: '/materials/galvanized.jpg',
    vendors: [
      { id: 'r1', name: 'SteelWorks Direct', pricePerSqm: 960.00, deliveryDays: 1, inStock: true, url: '#' }
    ],
    hex: '#94a3b8'
  },
  {
    id: 'cool_roof',
    name: 'High-Albedo Cool Roof',
    desc: 'Membrane roof with highly reflective white coating to drastically reduce solar heat gain in hot climates.',
    albedo: 0.85,
    thermalMass: 'Low',
    ecoScore: 'Good',
    imageUrl: '/materials/cool_roof.jpg',
    vendors: [
      { id: 'r2', name: 'ThermoShield', pricePerSqm: 2800.00, deliveryDays: 3, inStock: true, url: '#' }
    ],
    hex: '#ffffff'
  },
  {
    id: 'low_e_alu',
    name: 'Low-E Aluminum Sheet',
    desc: 'Aluminum roofing with a low-emissivity finish to reflect radiant heat in extreme conditions.',
    albedo: 0.95,
    thermalMass: 'Low',
    ecoScore: 'Moderate',
    imageUrl: '/materials/slate.jpg',
    vendors: [
      { id: 'r3', name: 'AluSpec', pricePerSqm: 4400.00, deliveryDays: 5, inStock: true, url: '#' }
    ],
    hex: '#f8fafc'
  },
  {
    id: 'solar_absorbent',
    name: 'Solar Absorbent Membrane',
    desc: 'Dark roofing membrane designed specifically to maximize solar heat gain in extreme cold/arctic deployments.',
    albedo: 0.10,
    thermalMass: 'Low',
    ecoScore: 'Moderate',
    imageUrl: '/materials/terracotta.jpg',
    vendors: [
      { id: 'r4', name: 'ArcticShelter', pricePerSqm: 3200.00, deliveryDays: 7, inStock: true, url: '#' }
    ],
    hex: '#1e293b'
  }
];

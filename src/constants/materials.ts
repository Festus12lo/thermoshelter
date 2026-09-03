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
    imageUrl: '/materials/eps.jpg',
    vendors: [
      { id: 'w1', name: 'RapidShelter Mfg', pricePerSqm: 2000.00, deliveryDays: 2, inStock: true, url: 'https://dir.indiamart.com/search.mp?ss=eps+panels' },
      { id: 'w2', name: 'Global Relief Supply', pricePerSqm: 2240.00, deliveryDays: 1, inStock: true, url: 'https://dir.indiamart.com/search.mp?ss=insulated+sandwich+panels' }
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
    imageUrl: '/materials/pir.jpg',
    vendors: [
      { id: 'w3', name: 'InsulCore', pricePerSqm: 3600.00, deliveryDays: 5, inStock: true, url: 'https://dir.indiamart.com/search.mp?ss=pir+foam+board' },
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
    imageUrl: '/materials/aerogel.jpg',
    vendors: [
      { id: 'w4', name: 'AeroTech Textiles', pricePerSqm: 12000.00, deliveryDays: 14, inStock: false, url: 'https://dir.indiamart.com/search.mp?ss=aerogel+insulation' }
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
    imageUrl: '/materials/hempcrete.jpg',
    vendors: [
      { id: 'w5', name: 'EcoBlock Solutions', pricePerSqm: 5200.00, deliveryDays: 10, inStock: true, url: 'https://dir.indiamart.com/search.mp?ss=hempcrete+blocks' }
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
    imageUrl: '/materials/hollow_polymer.jpg',
    vendors: [
      { id: 'w6', name: 'PolyBuild Systems', pricePerSqm: 2800.00, deliveryDays: 4, inStock: true, url: 'https://dir.indiamart.com/search.mp?ss=hollow+plastic+panels' }
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
      { id: 'r1', name: 'SteelWorks Direct', pricePerSqm: 960.00, deliveryDays: 1, inStock: true, url: 'https://dir.indiamart.com/search.mp?ss=corrugated+galvanized+iron+sheets' }
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
      { id: 'r2', name: 'ThermoShield', pricePerSqm: 2800.00, deliveryDays: 3, inStock: true, url: 'https://dir.indiamart.com/search.mp?ss=cool+roof+coating' }
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
    imageUrl: '/materials/low_e_alu.jpg',
    vendors: [
      { id: 'r3', name: 'AluSpec', pricePerSqm: 4400.00, deliveryDays: 5, inStock: true, url: 'https://dir.indiamart.com/search.mp?ss=aluminum+roofing+sheets' }
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
    imageUrl: '/materials/solar_absorbent.jpg',
    vendors: [
      { id: 'r4', name: 'ArcticShelter', pricePerSqm: 3200.00, deliveryDays: 7, inStock: true, url: 'https://dir.indiamart.com/search.mp?ss=epdm+rubber+roofing' }
    ],
    hex: '#1e293b'
  }
];

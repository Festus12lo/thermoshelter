// @ts-nocheck
import type {} from '../types';

export const THERMAL_SPECS: Record<string, ComponentThermalSpec> = {
  roof: {
    id: 'roof',
    name: '25° Symmetrical Gable Roof Assembly',
    category: 'roof',
    rValueSI: 4.50, // m²·K/W
    rValueImperial: 25.55, // hr·ft²·°F/BTU
    uValueSI: 0.222, // W/m²·K
    thicknessMm: 160,
    conductivityK: 0.036, // W/m·K (effective insulated composite)
    colorHex: '#4f46e5', // Deep Indigo / High Resistance
    colorThree: 0x4f46e5,
    description: 'High-performance insulated roof assembly engineered to deflect intense overhead solar radiation during Indian dry-summer seasons and preserve internal warmth during cold winter nights.',
    materialsLayers: [
      'Weather-resistant slate/clay interlocking roof tiles (15mm)',
      'High-permeability breathable waterproofing underlayment (1mm)',
      '120mm Dense-pack cellulose / bio-fiber mineral wool insulation (k=0.036 W/m·K)',
      'Vapor control and airtightness membrane (0.5mm)',
      '24mm Solid timber interior tongue-and-groove ceiling decking'
    ]
  },
  walls: {
    id: 'walls',
    name: '300mm Monolithic Rammed Earth Exterior Envelope',
    category: 'wall',
    rValueSI: 2.10, // m²·K/W
    rValueImperial: 11.92, // hr·ft²·°F/BTU
    uValueSI: 0.476, // W/m²·K
    thicknessMm: 300,
    conductivityK: 0.143, // W/m·K
    colorHex: '#0d9488', // Teal / Medium-High Resistance
    colorThree: 0x0d9488,
    description: 'Heavy 300mm thick load-bearing monolithic rammed earth with natural mineral binders. Provides 9.2 hours of thermal phase lag, dampening diurnal outdoor temperature swings from 42°C peak to a steady 24–26°C indoor ambient.',
    materialsLayers: [
      'Breathable natural silicate breathable water-repellent sealer (external)',
      '300mm Compacted graded sand, gravel, clay subsoil with 6% lime-pozzolan binder',
      'Volumetric thermal heat capacity: 2,100 kJ/m³·K',
      'Internal fine clay-sand acoustic and hygroscopic finish plaster (8mm)'
    ]
  },
  interior: {
    id: 'interior',
    name: '150mm Compressed Stabilized Earth Partitions',
    category: 'interior',
    rValueSI: 1.05, // m²·K/W
    rValueImperial: 5.96, // hr·ft²·°F/BTU
    uValueSI: 0.952, // W/m²·K
    thicknessMm: 150,
    conductivityK: 0.143, // W/m·K
    colorHex: '#84cc16', // Lime Green / Moderate Internal Resistance
    colorThree: 0x84cc16,
    description: 'Internal room dividing walls constructed from 150mm CSEB blocks. Adds internal sensible thermal mass to regulate humidity and temper room-to-room temperature gradients.',
    materialsLayers: [
      '150mm Stabilized earth masonry blocks (CSEB)',
      'Natural clay-earth mortar jointing',
      'Non-toxic natural mineral casein paint finish'
    ]
  },
  door: {
    id: 'door',
    name: 'Main Insulated Entrance Door Assembly',
    category: 'door',
    rValueSI: 1.10, // m²·K/W
    rValueImperial: 6.25, // hr·ft²·°F/BTU
    uValueSI: 0.909, // W/m²·K
    thicknessMm: 50,
    conductivityK: 0.045, // W/m·K
    colorHex: '#eab308', // Amber Yellow
    colorThree: 0xeab308,
    description: 'Custom engineered solid plantation teak composite door featuring an internal expanded polyurethane thermal insulation core and dual airtight compression perimeter gaskets.',
    materialsLayers: [
      '12mm Plantation teak facing (exterior)',
      '26mm Rigid polyurethane high-density insulation core (k=0.024 W/m·K)',
      '12mm Solid teak interior backing panel',
      'Dual-perimeter EPDM silicone air-leakage compression seals'
    ]
  },
  foundation: {
    id: 'foundation',
    name: '0.30m Dressed Stone Plinth & Foundation',
    category: 'foundation',
    rValueSI: 0.80, // m²·K/W
    rValueImperial: 4.54, // hr·ft²·°F/BTU
    uValueSI: 1.250, // W/m²·K
    thicknessMm: 300,
    conductivityK: 0.375, // W/m·K
    colorHex: '#f97316', // Orange / Low-Moderate
    colorThree: 0xf97316,
    description: '300mm elevated dressed basalt/granite masonry plinth protecting the earthen envelope from rain splatter, groundwater capillary rise, and providing structural mass coupling to sub-grade.',
    materialsLayers: [
      '300mm Dressed granite and basalt stone blocks with lime-sand mortar',
      'Bituminous dual-layer Damp Proof Course (DPC) membrane at +0.30m FFL',
      'Compacted gravel capillary break bed'
    ]
  },
  windowFrame: {
    id: 'windowFrame',
    name: 'Thermally Broken Window Frame & Mullions',
    category: 'window',
    rValueSI: 0.65, // m²·K/W
    rValueImperial: 3.69, // hr·ft²·°F/BTU
    uValueSI: 1.538, // W/m²·K
    thicknessMm: 120,
    conductivityK: 0.185, // W/m·K
    colorHex: '#ea580c', // Dark Orange
    colorThree: 0xea580c,
    description: 'Deep-recessed sustainably harvested hardwood frames with internal thermal breaks to prevent condensation and thermal bridging at opening perimeters.',
    materialsLayers: [
      'FSC-certified seasoned timber exterior profile',
      'Internal polyamide thermal isolator insert',
      'Double weatherstripping gaskets'
    ]
  },
  glazing: {
    id: 'glazing',
    name: 'Double-Glazed Low-E Argon-Filled Units',
    category: 'window',
    rValueSI: 0.48, // m²·K/W
    rValueImperial: 2.73, // hr·ft²·°F/BTU
    uValueSI: 2.083, // W/m²·K
    thicknessMm: 24,
    conductivityK: 0.050, // W/m·K
    colorHex: '#ef4444', // Crimson Red / Low Resistance (Direct Solar Aperture)
    colorThree: 0xef4444,
    description: 'High-performance double glazing with pyrolytic soft-coat Low-E on surface #3, filled with 90% Argon gas to control radiant infrared heat transfer while admitting maximum daylight.',
    materialsLayers: [
      '4mm Clear float outer glass pane',
      '16mm Warm-edge spacer filled with 90% Argon gas (k=0.016 W/m·K)',
      'Microscopic metallic Low-Emissivity silver coating (e=0.04)',
      '4mm Clear float inner glass pane (SHGC = 0.38, VLT = 71%)'
    ]
  }
};

// Summary stats for whole-envelope energy calculations
export const ENVELOPE_THERMAL_SUMMARY = {
  totalGrossFloorArea: 70.0, // m²
  netUsableCarpetArea: 60.16, // m²
  roofArea: 84.53, // m² (including overhang slope)
  opaqueWallArea: 87.20, // m² (net of openings)
  totalGlazingArea: 14.88, // m²
  doorArea: 1.89, // m²
  plinthArea: 70.0, // m²
  averageEnvelopeRValueSI: 2.44, // Area-weighted m²·K/W
  averageEnvelopeRValueImperial: 13.85, // hr·ft²·°F/BTU
  averageEnvelopeUValueSI: 0.41, // W/m²·K
  windowToWallRatio: 14.6, // %
  annualCoolingEnergyReduction: 64.2, // % vs standard RCC/brick masonry
};


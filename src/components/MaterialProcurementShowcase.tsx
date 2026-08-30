import React, { useState } from 'react';

interface SupplierRecord {
  supplier_name: string;
  product_name: string;
  price_per_unit: number;
  currency: string;
  price_unit: string;
  availability_status: string;
  product_url: string;
  image_url: string;
  source_id: string;
  confidence: string;
  retrieval_timestamp: string;
}

interface MaterialCardData {
  material_id: string;
  material_name: string;
  category: string;
  form?: string;
  local_sourcing_status?: string;
  availability_in_ladakh?: string;
  sustainability_profile?: string;
  durability_notes?: string;
  fire_classification?: string;
  properties?: {
    thermal_conductivity_W_mK: number;
    density_kg_m3: number;
    density_min_kg_m3?: any;
    density_max_kg_m3?: any;
    specific_heat_J_kgK: number;
    thickness_mm: number;
    r_value_m2K_W: number;
    u_value_W_m2K: number;
    moisture_bound_max_pct?: any;
    source_id?: string;
  };
  visual?: {
    image_url?: string;
    has_image?: boolean;
    fallback_color?: string;
    fallback_pattern?: string;
  };
  procurement?: {
    material_id: string;
    suppliers_count: number;
    has_observed_prices: boolean;
    price_range_min?: number;
    price_range_max?: number;
    price_unit?: string;
    currency: string;
    lowest_supplier?: SupplierRecord;
    highest_supplier?: SupplierRecord;
    suppliers: SupplierRecord[];
    provenance: string;
    last_updated?: string;
  };
}

interface MaterialProcurementShowcaseProps {
  wallMaterialId: string;
  roofMaterialId: string;
  floorMaterialId?: string;
  allMaterials?: MaterialCardData[];
  designGeom?: any;
}

export const MaterialProcurementShowcase: React.FC<MaterialProcurementShowcaseProps> = ({
  allMaterials = [],
  designGeom
}) => {
  const [selectedMatId, setSelectedMatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Fallback mock material database if not fully loaded from API
  const defaultCards: Record<string, MaterialCardData> = {
    'MAT-ADOBE': {
      material_id: 'MAT-ADOBE',
      material_name: 'Adobe / Mud Brick',
      category: 'Earthen Construction',
      properties: { thermal_conductivity_W_mK: 0.70, density_kg_m3: 1800.0, specific_heat_J_kgK: 920.0, thickness_mm: 250.0, r_value_m2K_W: 0.357, u_value_W_m2K: 2.80 },
      visual: { fallback_color: '#C29B38', has_image: false },
      procurement: {
        material_id: 'MAT-ADOBE', suppliers_count: 2, has_observed_prices: true, price_range_min: 18.0, price_range_max: 22.0, price_unit: 'unit', currency: 'INR',
        provenance: 'OBSERVED_PRICE',
        suppliers: [
          { supplier_name: 'Ladakh Earth Builders', product_name: 'Traditional Sun-Dried Adobe', price_per_unit: 18.0, currency: 'INR', price_unit: 'unit', availability_status: 'IN_STOCK', product_url: 'https://indiamart.com/ladakh-earth/adobe', image_url: '', source_id: '', confidence: 'High', retrieval_timestamp: '' }
        ]
      }
    },
    'MAT-RAMMED': {
      material_id: 'MAT-RAMMED',
      material_name: 'Rammed Earth (Stabilized)',
      category: 'Earthen Construction',
      properties: { thermal_conductivity_W_mK: 1.50, density_kg_m3: 2000.0, specific_heat_J_kgK: 920.0, thickness_mm: 300.0, r_value_m2K_W: 0.200, u_value_W_m2K: 5.00 },
      visual: { fallback_color: '#A67C52', has_image: false },
      procurement: {
        material_id: 'MAT-RAMMED', suppliers_count: 2, has_observed_prices: true, price_range_min: 2400.0, price_range_max: 2800.0, price_unit: 'm3', currency: 'INR', provenance: 'OBSERVED_PRICE',
        suppliers: [
          { supplier_name: 'Indus Soil Tech', product_name: 'Gravel-Sand Stabilized Earth', price_per_unit: 2400.0, currency: 'INR', price_unit: 'm3', availability_status: 'IN_STOCK', product_url: 'https://indiamart.com/indus-soil/rammed', image_url: '', source_id: '', confidence: 'High', retrieval_timestamp: '' }
        ]
      }
    },
    'MAT-STEEL': {
      material_id: 'MAT-STEEL',
      material_name: 'Corrugated Steel Sheet',
      category: 'Roofing',
      properties: { thermal_conductivity_W_mK: 50.0, density_kg_m3: 7850.0, specific_heat_J_kgK: 500.0, thickness_mm: 0.5, r_value_m2K_W: 0.0001, u_value_W_m2K: 10000.0 },
      visual: { fallback_color: '#4A6B82', has_image: true, image_url: 'https://tatashaktee.com/assets/images/gc-sheet.jpg' },
      procurement: {
        material_id: 'MAT-STEEL', suppliers_count: 3, has_observed_prices: true, price_range_min: 520.0, price_range_max: 680.0, price_unit: 'm2', currency: 'INR', provenance: 'OBSERVED_PRICE',
        suppliers: [
          { supplier_name: 'Tata Shaktee', product_name: 'GC Sheet 0.5mm', price_per_unit: 520.0, currency: 'INR', price_unit: 'm2', availability_status: 'IN_STOCK', product_url: 'https://tatashaktee.com/products/gc-sheet', image_url: '', source_id: '', confidence: 'High', retrieval_timestamp: '' }
        ]
      }
    },
    'MAT-ROCKWOOL': {
      material_id: 'MAT-ROCKWOOL',
      material_name: 'Rockwool Insulation Board',
      category: 'Insulation',
      properties: { thermal_conductivity_W_mK: 0.035, density_kg_m3: 100.0, specific_heat_J_kgK: 840.0, thickness_mm: 100.0, r_value_m2K_W: 2.85, u_value_W_m2K: 0.35 },
      visual: { fallback_color: '#D4C9A8', has_image: false },
      procurement: {
        material_id: 'MAT-ROCKWOOL', suppliers_count: 4, has_observed_prices: true, price_range_min: 800.0, price_range_max: 1200.0, price_unit: 'm2', currency: 'INR', provenance: 'OBSERVED_PRICE',
        suppliers: [
          { supplier_name: 'Rockwool India', product_name: 'Thermal Insulation Board 100mm', price_per_unit: 850.0, currency: 'INR', price_unit: 'm2', availability_status: 'IN_STOCK', product_url: 'https://rockwool.com/in', image_url: '', source_id: '', confidence: 'High', retrieval_timestamp: '' }
        ]
      }
    }
  };

  const activeDict = allMaterials.length > 0
    ? allMaterials.reduce((acc, c) => ({ ...acc, [c.material_id]: c }), {} as Record<string, MaterialCardData>)
    : defaultCards;

  const dataList = Object.values(activeDict);

  const categories = ['All', ...Array.from(new Set(dataList.map(m => m.category)))];

  const filteredData = dataList.filter(m => {
    const matchesSearch = m.material_name.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'All' || m.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const activeCard = selectedMatId ? activeDict[selectedMatId] : null;

  const calculateRequiredQuantity = (mat: MaterialCardData) => {
    if (!designGeom) return { qty: 'N/A', label: '' };
    // Rough estimation logic
    const { length_m, width_m, height_m } = designGeom;
    const l = length_m || 6;
    const w = width_m || 4;
    const h = height_m || 2.8;
    const perimeter = 2 * (l + w);
    const wallArea = perimeter * h;
    const roofArea = (l + 1) * (w + 1); // rough pitch/overhang
    const thicknessM = (mat.properties?.thickness_mm || 100) / 1000.0;

    let qty = 0;
    let label = 'units';
    const pu = mat.procurement?.price_unit || 'unit';

    if (pu === 'm3') {
      qty = wallArea * thicknessM;
      label = 'm³';
    } else if (pu === 'm2') {
      qty = (mat.category === 'Roofing') ? roofArea : wallArea;
      label = 'm²';
    } else if (pu === 'unit') {
      // rough guess for bricks
      qty = (wallArea * thicknessM) / 0.005; // very rough
      label = 'units';
    } else {
      qty = wallArea;
      label = pu;
    }

    return { qty: qty.toFixed(1), label };
  };

  return (
    <div className="catalogue-container">
      {!selectedMatId ? (
        // --- GALLERY VIEW ---
        <div className="gallery-view">
          <header className="catalogue-header">
            <h2>MATERIALS & PROCUREMENT</h2>
            <div className="catalogue-controls">
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="catalogue-search"
              />
              <div className="catalogue-filters">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    [ {cat} ]
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="catalogue-grid">
            {filteredData.map(mat => {
              const pMin = mat.procurement?.price_range_min || '---';
              const pMax = mat.procurement?.price_range_max || '---';
              const c = mat.procurement?.currency || '₹';
              return (
                <div key={mat.material_id} className="product-card">
                  <div className="product-image-area" style={{ background: mat.visual?.fallback_color || '#333' }}>
                    {mat.visual?.has_image && mat.visual?.image_url && mat.visual.image_url !== 'IMAGE_NOT_AVAILABLE' ? (
                      <img src={mat.visual.image_url} alt={mat.material_name} />
                    ) : (
                      <div className="fallback-texture">{mat.material_id}</div>
                    )}
                  </div>
                  <div className="product-info-area">
                    <h3 className="product-name">{mat.material_name}</h3>
                    <p className="product-category">{mat.category}</p>
                    
                    <div className="product-specs-mini">
                      <span>{mat.properties?.thermal_conductivity_W_mK?.toFixed(3)} W/mK</span>
                      <span>{mat.properties?.density_kg_m3?.toFixed(0)} kg/m³</span>
                    </div>

                    <div className="product-price-area">
                      <div className="price-tag">{c} {pMin}–{c} {pMax}</div>
                      <div className="price-label-sub">OBSERVED PRICE</div>
                    </div>

                    <div className="product-actions">
                      <button onClick={() => setSelectedMatId(mat.material_id)} className="btn-compare">
                        [ Compare Suppliers ]
                      </button>
                      <button onClick={() => setSelectedMatId(mat.material_id)} className="btn-view-prod">
                        [ View Product ]
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // --- DETAIL VIEW ---
        activeCard && (
        <div className="detail-view">
          <button className="btn-back" onClick={() => setSelectedMatId(null)}>← Back to Catalogue</button>
          
          <div className="detail-hero">
            <h2>{activeCard.material_name.toUpperCase()}</h2>
            <div className="detail-image-large" style={{ background: activeCard.visual?.fallback_color || '#333' }}>
              {activeCard.visual?.has_image && activeCard.visual?.image_url && activeCard.visual.image_url !== 'IMAGE_NOT_AVAILABLE' ? (
                <img src={activeCard.visual.image_url} alt={activeCard.material_name} />
              ) : (
                <div className="fallback-texture large">[ LARGE PRODUCT IMAGE ]<br/>{activeCard.material_id}</div>
              )}
            </div>
          </div>

          <div className="detail-specs-grid">
            <div className="spec-panel">
              <h4>Technical Specification</h4>
              <hr/>
              <div className="spec-row"><span>Thickness</span> <span>{activeCard.properties?.thickness_mm} mm</span></div>
              <div className="spec-row"><span>Density</span> <span>{activeCard.properties?.density_kg_m3} kg/m³</span></div>
              <div className="spec-row"><span>Conductivity</span> <span>{activeCard.properties?.thermal_conductivity_W_mK} W/mK</span></div>
              <div className="spec-row"><span>R-value</span> <span>{activeCard.properties?.r_value_m2K_W} m²K/W</span></div>
              <div className="spec-row"><span>U-value</span> <span>{activeCard.properties?.u_value_W_m2K} W/m²K</span></div>
            </div>

            <div className="spec-panel req-panel">
              <h4>Required for your design</h4>
              <hr/>
              {designGeom ? (() => {
                const req = calculateRequiredQuantity(activeCard);
                const estMin = (activeCard.procurement?.price_range_min || 0) * parseFloat(req.qty);
                const estMax = (activeCard.procurement?.price_range_max || 0) * parseFloat(req.qty);
                return (
                  <>
                    <div className="spec-row"><span>Quantity</span> <span>{req.qty} {req.label}</span></div>
                    <div className="spec-row total-est"><span>Estimated total</span> <span>₹{estMin.toLocaleString()} – ₹{estMax.toLocaleString()}</span></div>
                  </>
                );
              })() : (
                <div className="spec-row"><span>No design active</span></div>
              )}
            </div>
          </div>

          <div className="supplier-comparison-panel">
            <h4>SUPPLIER COMPARISON</h4>
            <table className="supp-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Source</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeCard.procurement?.suppliers.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.supplier_name}</td>
                    <td>₹{s.price_per_unit.toFixed(1)} <small>/{s.price_unit}</small></td>
                    <td>{s.availability_status}</td>
                    <td>Verified</td>
                    <td>
                      <a href={s.product_url !== 'PURCHASE_URL_NOT_AVAILABLE' ? s.product_url : '#'} target="_blank" rel="noopener noreferrer" className="btn-visit">
                        [ VISIT SUPPLIER ]
                      </a>
                    </td>
                  </tr>
                ))}
                {(!activeCard.procurement?.suppliers || activeCard.procurement.suppliers.length === 0) && (
                  <tr><td colSpan={5}>No verified suppliers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )
      )}
    </div>
  );
};

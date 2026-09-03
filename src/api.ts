export interface DesignRequestPayload {
  location: string;
  occupants: number;
  purpose: string;
  thermal_objective: string;
}

export const generateDesign = async (payload: DesignRequestPayload) => {
  if (payload.purpose === 'emergency_shelter') {
    // Return mock data for emergency shelter based on thermal objective
    return new Promise(resolve => {
      setTimeout(() => {
        let wallMat = 'EPS Insulated Panels';
        let roofMat = 'Corrugated Galvanized Iron';
        let name = 'Standard Relief Configuration';
        let explanation = 'Baseline thermal strategy for emergency relief.';

        if (payload.thermal_objective === 'winter_warmth') {
          wallMat = 'Aerogel Composite';
          roofMat = 'Solar Absorbent Membrane';
          name = 'Arctic Deployment Configuration';
          explanation = 'Maximizes heat retention and solar gain for cold climates.';
        } else if (payload.thermal_objective === 'summer_cooling') {
          wallMat = 'PIR Foam Board';
          roofMat = 'High-Albedo Cool Roof';
          name = 'Desert Cooling Configuration';
          explanation = 'Maximizes heat rejection and provides high thermal resistance.';
        } else if (payload.thermal_objective === 'balanced') {
          wallMat = 'Modular Hempcrete';
          roofMat = 'Corrugated Galvanized Iron';
          name = 'Temperate Balanced Configuration';
          explanation = 'Uses thermal mass to regulate diurnal temperature swings.';
        }

        resolve({
          alternatives: [
            {
              id: 'mock-1',
              name: name,
              explanation: explanation,
              avg_indoor_temp_C: 22,
              min_indoor_temp_C: 18,
              max_indoor_temp_C: 26,
              solar_gain_kWh: payload.thermal_objective === 'winter_warmth' ? 25 : 5,
              heat_loss_kWh: payload.thermal_objective === 'winter_warmth' ? 4 : 12,
              wall_material: wallMat,
              roof_material: roofMat,
              time_series: [],
              heat_flow: [],
              comfort: []
            }
          ]
        });
      }, 1500); // simulate network delay
    });
  }

  const response = await fetch('http://127.0.0.1:8000/api/design', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to generate design: ' + response.statusText);
  }

  return response.json();
};

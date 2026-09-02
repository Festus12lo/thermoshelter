// @ts-nocheck
import React from 'react';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  Sunset, 
  ThermometerSun, 
  Compass, 
  ShieldCheck, 
  Sliders, 
  Wind,
  Layers,
  MapPin,
  Activity
} from 'lucide-react';
import type { SolarSettings, WeatherCondition } from '../types';

const LOCATIONS = [
  { id: 'leh', name: 'Leh (Cold Desert)' },
  { id: 'shimla', name: 'Shimla (Cold/Cloudy)' },
  { id: 'jaipur', name: 'Jaipur (Hot/Dry)' },
  { id: 'karur', name: 'Karur (Hot/Humid)' },
  { id: 'cherrapunji', name: 'Cherrapunji (Heavy Rain)' },
  { id: 'jaisalmer', name: 'Jaisalmer (Extreme Heat)' },
  { id: 'kanyakumari', name: 'Kanyakumari (Coastal)' },
  { id: 'dras', name: 'Dras (Extreme Cold)' },
  { id: 'mumbai', name: 'Mumbai (Warm/Humid)' },
  { id: 'delhi', name: 'New Delhi (Composite)' },
];

interface SolarSimulatorProps {
  solarSettings: SolarSettings;
  setSolarSettings: React.Dispatch<React.SetStateAction<SolarSettings>>;
}

export const SolarSimulator: React.FC<SolarSimulatorProps> = ({
  solarSettings,
  setSolarSettings,
}) => {
  const formatTime = (timeVal: number) => {
    const hours = Math.floor(timeVal);
    const minutes = Math.round((timeVal - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
  };

  const weatherOptions: { id: WeatherCondition; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'clear', label: 'Clear Sky', icon: <Sun className="w-3.5 h-3.5 text-amber-400" />, desc: 'Sharp crisp outdoor shadows with high directional beam' },
    { id: 'partlyCloudy', label: 'Partly Cloudy', icon: <CloudSun className="w-3.5 h-3.5 text-sky-400" />, desc: 'Dynamic drifting cloud shadows across ground' },
    { id: 'overcast', label: 'Overcast', icon: <Cloud className="w-3.5 h-3.5 text-stone-300" />, desc: 'Soft diffuse ambient contact shadows under eaves' },
    { id: 'monsoon', label: 'Monsoon Rain', icon: <CloudRain className="w-3.5 h-3.5 text-blue-400" />, desc: 'Dark storm sky with wet reflective ground plane' },
    { id: 'goldenHour', label: 'Golden Hour', icon: <Sunset className="w-3.5 h-3.5 text-orange-400" />, desc: 'Elongated warm amber shadows at low solar altitude' },
    { id: 'heatwave', label: 'Heatwave', icon: <ThermometerSun className="w-3.5 h-3.5 text-rose-500" />, desc: 'Harsh high-intensity short shadows in hot arid sun' },
  ];

  const getSolarImpactText = () => {
    const { timeOfDay, season, weather } = solarSettings;

    if (solarSettings.isLiveMode) {
      return {
        status: `Live Weather: ${solarSettings.liveLocation?.toUpperCase()}`,
        detail: `Actual Temp: ${solarSettings.liveTemp ?? '--'}°C | Radiation: ${solarSettings.liveSolarIntensity ?? '--'} W/m²`,
        badgeColor: 'bg-indigo-900/60 text-indigo-300 border-indigo-700',
      };
    }

    if (weather === 'monsoon') {
      return {
        status: 'Monsoon Rain & Wet Glare Protection',
        detail: 'Deep 0.45m overhangs and gable eaves channel heavy rainwater away from rammed earth walls while wet ground reflections illuminate overhang soffits.',
        badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800',
      };
    }

    if (weather === 'overcast') {
      return {
        status: 'Omnidirectional Diffuse Lighting',
        detail: 'Low shadow contrast; diffuse sky radiation illuminates north clerestory windows without causing uncomfortable interior glare.',
        badgeColor: 'bg-stone-800 text-stone-300 border-stone-700',
      };
    }

    if (weather === 'heatwave') {
      return {
        status: 'Extreme Heatwave Protection',
        detail: 'Direct solar radiation exceeds 1,100 W/m². High-mass 300mm rammed earth exterior absorbs intense peak afternoon flux.',
        badgeColor: 'bg-rose-950/80 text-rose-300 border-rose-800',
      };
    }

    if (season === 'summer') {
      if (timeOfDay >= 11 && timeOfDay <= 14) {
        return {
          status: 'Optimal Summer Overhang Shading',
          detail: 'High sun altitude (75°) is completely blocked from entering South windows by the 0.45m eaves overhang, keeping interior cool.',
          badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
        };
      }
      return {
        status: 'Summer Diffuse Lighting',
        detail: 'Rammed earth 300mm walls absorb exterior ambient heat with a 9.2-hour thermal delay.',
        badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700',
      };
    } else if (season === 'winter') {
      if (timeOfDay >= 10 && timeOfDay <= 15) {
        return {
          status: 'Active Passive Solar Heating',
          detail: 'Low winter sun angle (45°) easily passes beneath the 0.45m overhang, warming the high thermal mass floor and interior.',
          badgeColor: 'bg-orange-900/60 text-orange-300 border-orange-700',
        };
      }
      return {
        status: 'Night Thermal Retention',
        detail: 'Thermal mass radiates stored solar heat into bedrooms during chilly winter nights.',
        badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700',
      };
    }
    return {
      status: 'Equinox Balance',
      detail: 'Balanced solar ingress with steady cross-ventilation breezes across East-West openings.',
      badgeColor: 'bg-teal-900/60 text-teal-300 border-teal-700',
    };
  };

  const impact = getSolarImpactText();

  return (
    <div className="bg-stone-900/95 border border-stone-800 rounded-xl p-3.5 text-stone-200 shadow-xl backdrop-blur-md space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
            Solar Simulator
          </h3>
        </div>
        <div className="flex bg-stone-800 rounded-md p-0.5 border border-stone-700">
          <button 
            onClick={() => setSolarSettings(prev => ({...prev, isLiveMode: false, timeOfDay: 14.0}))}
            className={`px-2 py-0.5 text-[10px] rounded transition-all ${!solarSettings.isLiveMode ? 'bg-amber-600 text-white' : 'text-stone-400'}`}
          >
            Manual
          </button>
          <button 
            onClick={() => setSolarSettings(prev => ({...prev, isLiveMode: true, timeOfDay: 12.0}))}
            className={`px-2 py-0.5 text-[10px] rounded transition-all flex items-center gap-1 ${solarSettings.isLiveMode ? 'bg-indigo-600 text-white' : 'text-stone-400'}`}
          >
            <Activity className="w-3 h-3" /> Live
          </button>
        </div>
      </div>

      {solarSettings.isLiveMode && (
        <div className="mb-3">
          <label className="block text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Geographic Location
          </label>
          <select 
            value={solarSettings.liveLocation}
            onChange={(e) => setSolarSettings(prev => ({...prev, liveLocation: e.target.value}))}
            className="w-full bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-md p-1.5 outline-none focus:border-indigo-500"
          >
            {LOCATIONS.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Time of Day Slider */}
      <div>
        <div className="flex justify-between text-[11px] text-stone-400 mb-1 font-mono">
          <span>{solarSettings.isLiveMode ? '00:00 (Midnight)' : '06:00 AM (Sunrise)'}</span>
          <span className="text-amber-400 font-bold bg-amber-950/60 px-1 rounded">{formatTime(solarSettings.timeOfDay)}</span>
          <span>{solarSettings.isLiveMode ? '23:45 (Midnight)' : '06:00 PM (Sunset)'}</span>
        </div>
        <input
          id="slider-time-of-day"
          type="range"
          min={solarSettings.isLiveMode ? "0.0" : "6.0"}
          max={solarSettings.isLiveMode ? "23.75" : "18.0"}
          step="0.25"
          value={solarSettings.timeOfDay}
          onChange={(e) =>
            setSolarSettings((prev) => ({ ...prev, timeOfDay: parseFloat(e.target.value) }))
          }
          className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      {!solarSettings.isLiveMode && (
        <>
          {/* Season Buttons */}
      <div className="grid grid-cols-3 gap-1.5">
        {(['summer', 'equinox', 'winter'] as const).map((s) => (
          <button
            key={s}
            id={`btn-season-${s}`}
            onClick={() => setSolarSettings((prev) => ({ ...prev, season: s }))}
            className={`py-1.5 px-2 text-xs rounded-lg font-medium capitalize border transition-all text-center ${
              solarSettings.season === s
                ? 'bg-amber-600/90 text-white border-amber-500 shadow-sm'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            {s === 'summer' && '☀️ Summer'}
            {s === 'equinox' && '⛅ Equinox'}
            {s === 'winter' && '❄️ Winter'}
          </button>
        ))}
      </div>

      {/* Weather Condition Selector Grid */}
      <div>
        <label className="block text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-1.5">
          Outside Weather & Ambient Condition:
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {weatherOptions.map((w) => (
            <button
              key={w.id}
              id={`btn-weather-${w.id}`}
              onClick={() => setSolarSettings((prev) => ({ ...prev, weather: w.id }))}
              title={w.desc}
              className={`p-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all text-left truncate ${
                solarSettings.weather === w.id
                  ? 'bg-teal-700/80 text-white border-teal-500 shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              {w.icon}
              <span className="truncate text-[11px]">{w.label}</span>
            </button>
          ))}
        </div>
      </div>
      </>
    )}

      {/* Advanced Outdoor Shadow Controls */}
      <div className="pt-2 border-t border-stone-800/80 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-stone-400">
          <span>Shadow Softness / Penumbra:</span>
          <span className="font-mono text-amber-300 font-bold">
            {Math.round(solarSettings.shadowSoftness * 100)}%
          </span>
        </div>
        <input
          id="slider-shadow-softness"
          type="range"
          min="0.0"
          max="1.0"
          step="0.05"
          value={solarSettings.shadowSoftness}
          onChange={(e) =>
            setSolarSettings((prev) => ({ ...prev, shadowSoftness: parseFloat(e.target.value) }))
          }
          className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
        />

        <div className="flex items-center justify-between text-[11px] text-stone-400">
          <span>Shadow Intensity / Contrast:</span>
          <span className="font-mono text-cyan-300 font-bold">
            {Math.round(solarSettings.shadowIntensity * 100)}%
          </span>
        </div>
        <input
          id="slider-shadow-intensity"
          type="range"
          min="0.2"
          max="1.0"
          step="0.05"
          value={solarSettings.shadowIntensity}
          onChange={(e) =>
            setSolarSettings((prev) => ({ ...prev, shadowIntensity: parseFloat(e.target.value) }))
          }
          className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Solar Impact Diagnosis Card */}
      <div className={`p-2.5 rounded-lg border text-xs ${impact.badgeColor}`}>
        <div className="font-semibold flex items-center gap-1.5 mb-0.5">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>{impact.status}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-stone-300">
          {impact.detail}
        </p>
      </div>
    </div>
  );
};


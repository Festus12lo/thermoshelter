import React from 'react';
import { PenTool, AlertTriangle } from 'lucide-react';

interface FloorPlanOpening {
  opening_id: string;
  type: string;
  orientation: string;
  wall_side: string;
  center_x: number;
  center_y: number;
  width_m: number;
  height_m: number;
  area_m2: number;
  glazing: string;
}

interface RoomLayout {
  room_id: string;
  room_type: string;
  name: string;
  area_m2: number;
  privacy: string;
  x: number;
  y: number;
  w: number;
  h: number;
  requires_window: boolean;
  requires_door: boolean;
  is_load_bearing?: boolean;
}

interface StaircaseData {
  x: number;
  y: number;
  w: number;
  h: number;
  direction: string;
  num_treads: number;
}

interface SingleFloorPlan {
  title?: string;
  subtitle?: string;
  floor_label?: string;
  outer_boundary: number[][];
  inner_boundary: number[][];
  wall_thickness_m: number;
  openings: FloorPlanOpening[];
  room_layouts?: RoomLayout[];
  room_dimensions?: Array<{ room_id: string; label: string; center_x: number; center_y: number }>;
  has_corridor?: boolean;
  staircase?: StaircaseData;
  dimensions: Array<{ type: string; value_m: number; label: string; start: number[]; end: number[] }>;
  north_arrow_angle_deg: number;
  orientation_azimuth_deg: number;
  floor_area_m2: number;
  purpose_profile_id?: string;
  note?: string;
}

interface FloorPlanData extends SingleFloorPlan {
  is_multi_floor?: boolean;
  num_floors?: number;
  floor_plans?: SingleFloorPlan[];
}

interface OpeningData {
  opening_id: string;
  opening_type: string;
  orientation: string;
  width_m: number;
  height_m: number;
  area_m2: number;
}

interface RoomData {
  room_id: string;
  room_type: string;
  name: string;
  area_m2: number;
  privacy: string;
}

interface DesignStateData {
  geometry?: { length_m: number; width_m: number };
  envelope?: { wall_thickness_mm: number; wall_material_id: string };
  openings?: OpeningData[];
  rooms?: RoomData[];
  orientation_azimuth_deg?: number;
  purpose_profile_id?: string;
  design_name?: string;
}

interface FloorPlanViewerProps {
  floorPlan?: FloorPlanData;
  length: number;
  width: number;
  wallThicknessM?: number;
  orientationDeg: number;
  wallMaterial?: string;
  designState?: DesignStateData;
}

const ROOM_COLORS: Record<string, string> = {
  'SLEEPING': 'rgba(99, 102, 241, 0.15)',
  'LIVING': 'rgba(52, 211, 153, 0.15)',
  'KITCHEN': 'rgba(251, 191, 36, 0.15)',
  'STORAGE': 'rgba(148, 163, 184, 0.10)',
  'SERVICE': 'rgba(148, 163, 184, 0.10)',
  'ENTRY': 'rgba(96, 165, 250, 0.12)',
  'SHARED': 'rgba(167, 139, 250, 0.12)',
  'TREATMENT': 'rgba(244, 114, 182, 0.15)',
  'WAITING': 'rgba(251, 146, 60, 0.12)',
  'CIRCULATION': 'rgba(255, 255, 255, 0.04)',
};

const ROOM_BORDER_COLORS: Record<string, string> = {
  'SLEEPING': '#6366f1',
  'LIVING': '#34d399',
  'KITCHEN': '#fbbf24',
  'STORAGE': '#94a3b8',
  'SERVICE': '#64748b',
  'ENTRY': '#60a5fa',
  'SHARED': '#a78bfa',
  'TREATMENT': '#f472b6',
  'WAITING': '#fb923c',
  'CIRCULATION': '#475569',
};

const FurnitureSymbol: React.FC<{
  roomType: string; x: number; y: number; w: number; h: number;
}> = ({ roomType, x, y, w, h }) => {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const s = Math.min(w, h) * 0.3;

  switch (roomType) {
    case 'SLEEPING':
      return (
        <g opacity="0.4">
          <rect x={cx - s * 0.7} y={cy - s * 0.5} width={s * 1.4} height={s}
            fill="none" stroke="#818cf8" strokeWidth="1" />
          <rect x={cx - s * 0.65} y={cy - s * 0.45} width={s * 0.5} height={s * 0.3}
            fill="none" stroke="#818cf8" strokeWidth="0.8" rx="2" />
        </g>
      );
    case 'KITCHEN':
      return (
        <g opacity="0.4">
          <polyline points={`${cx - s * 0.6},${cy + s * 0.5} ${cx - s * 0.6},${cy - s * 0.5} ${cx + s * 0.2},${cy - s * 0.5}`}
            fill="none" stroke="#d97706" strokeWidth="1.2" />
          <circle cx={cx + s * 0.4} cy={cy - s * 0.3} r={s * 0.12} fill="none" stroke="#d97706" strokeWidth="0.8" />
          <circle cx={cx + s * 0.65} cy={cy - s * 0.3} r={s * 0.12} fill="none" stroke="#d97706" strokeWidth="0.8" />
          <rect x={cx - s * 0.55} y={cy - s * 0.15} width={s * 0.3} height={s * 0.25}
            fill="none" stroke="#d97706" strokeWidth="0.8" rx="2" />
        </g>
      );
    case 'LIVING':
      return (
        <g opacity="0.35">
          <polyline points={`${cx - s * 0.5},${cy + s * 0.5} ${cx - s * 0.5},${cy - s * 0.3} ${cx + s * 0.5},${cy - s * 0.3}`}
            fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x={cx - s * 0.15} y={cy + s * 0.05} width={s * 0.5} height={s * 0.3}
            fill="none" stroke="#10b981" strokeWidth="0.8" />
        </g>
      );
    case 'SERVICE':
      return (
        <g opacity="0.35">
          <ellipse cx={cx - s * 0.2} cy={cy} rx={s * 0.2} ry={s * 0.25}
            fill="none" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x={cx + s * 0.15} y={cy - s * 0.3} width={s * 0.4} height={s * 0.4}
            fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 1" />
        </g>
      );
    case 'ENTRY':
      return (
        <g opacity="0.3">
          <line x1={cx - s * 0.4} y1={cy + s * 0.2} x2={cx + s * 0.4} y2={cy + s * 0.2}
            stroke="#60a5fa" strokeWidth="1.5" />
          <line x1={cx - s * 0.4} y1={cy + s * 0.35} x2={cx + s * 0.4} y2={cy + s * 0.35}
            stroke="#60a5fa" strokeWidth="1" />
        </g>
      );
    default:
      return null;
  }
};

const StaircaseSymbol: React.FC<{
  staircase: StaircaseData; originX: number; originY: number; scale: number;
}> = ({ staircase, originX, originY, scale }) => {
  const sx = originX + staircase.x * scale;
  const sy = originY + staircase.y * scale;
  const sw = staircase.w * scale;
  const sh = staircase.h * scale;
  const treads = staircase.num_treads || 12;
  const treadH = sh / treads;

  return (
    <g>
      <rect x={sx} y={sy} width={sw} height={sh}
        fill="rgba(255,255,255,0.03)" stroke="#64748b" strokeWidth="1.2" />
      {Array.from({ length: treads }).map((_, i) => (
        <line key={`tread-${i}`}
          x1={sx} y1={sy + i * treadH} x2={sx + sw} y2={sy + i * treadH}
          stroke="#475569" strokeWidth="0.6" />
      ))}
      <line x1={sx + sw / 2} y1={sy + sh * 0.8}
        x2={sx + sw / 2} y2={sy + sh * 0.2}
        stroke="#94a3b8" strokeWidth="1.5" />
      <text x={sx + sw / 2} y={sy + sh + 12}
        textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontFamily="Inter, sans-serif">
        {staircase.direction === 'up' ? '\u25B2 UP' : '\u25BC DN'}
      </text>
    </g>
  );
};

const SingleFloorSVG: React.FC<{
  plan: SingleFloorPlan;
  L: number; W: number; wallThickness: number;
  wallMaterial: string;
  svgWidth: number; svgHeight: number;
  padding: number;
  showTitleBlock?: boolean;
  designName?: string;
}> = ({ plan, L, W, wallThickness, wallMaterial, svgWidth, svgHeight, padding, showTitleBlock, designName }) => {
  const t = wallThickness;
  const scale = Math.min((svgWidth - padding * 2) / (L + 1.5), (svgHeight - padding * 2 - (showTitleBlock ? 50 : 0)) / (W + 1.5));
  const originX = (svgWidth - L * scale) / 2;
  const originY = (svgHeight - W * scale) / 2 + 10 - (showTitleBlock ? 20 : 0);
  const outerWidthPx = L * scale;
  const outerHeightPx = W * scale;
  const wallPx = t * scale;
  const roomLayouts = plan.room_layouts ?? [];
  const openings = plan.openings ?? [];
  const northArrowAngle = plan.north_arrow_angle_deg ?? 0;

  const getWallFill = (mat: string) => {
    if (mat.includes('RAMMED') || mat.includes('CSEB')) return '#6b5438';
    if (mat.includes('STONE')) return '#5a6066';
    if (mat.includes('TIMBER')) return '#8b6940';
    if (mat.includes('BRICK')) return '#8b3d2e';
    if (mat.includes('STRAWBALE') || mat.includes('STRAWCLAY')) return '#9b8a52';
    if (mat.includes('AAC')) return '#7a8a8a';
    return '#4a5568';
  };
  const wallFill = getWallFill(wallMaterial);

  return (
    <>
      <defs>
        <pattern id="hatch-wall-lb" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={wallFill} strokeWidth="1.5" opacity="0.6" />
          <line x1="4" y1="0" x2="4" y2="8" stroke={wallFill} strokeWidth="0.8" opacity="0.3" />
        </pattern>
      </defs>

      <rect x={originX} y={originY} width={outerWidthPx} height={outerHeightPx}
        fill="url(#hatch-wall-lb)" stroke={wallFill} strokeWidth="2.5" />

      <rect x={originX + wallPx} y={originY + wallPx}
        width={outerWidthPx - 2 * wallPx} height={outerHeightPx - 2 * wallPx}
        fill="#0f1923" stroke="none" />

      {roomLayouts.map((room, i) => {
        const rx = originX + room.x * scale;
        const ry = originY + room.y * scale;
        const rw = room.w * scale;
        const rh = room.h * scale;
        const fillColor = ROOM_COLORS[room.room_type] ?? 'rgba(100,120,140,0.08)';
        const borderColor = ROOM_BORDER_COLORS[room.room_type] ?? '#475569';
        const isCorridor = room.room_type === 'CIRCULATION';

        return (
          <g key={`room-${i}`}>
            <rect x={rx} y={ry} width={rw} height={rh}
              fill={fillColor} stroke={borderColor}
              strokeWidth={isCorridor ? '0.8' : '1.2'}
              strokeDasharray={isCorridor ? '6 3' : '4 2'} />
            <text x={rx + rw / 2} y={ry + rh / 2 - (isCorridor ? 0 : 8)}
              textAnchor="middle" fill="#e2e8f0" fontSize={isCorridor ? '8' : '10'}
              fontWeight="600" fontFamily="Inter, sans-serif">
              {room.name}
            </text>
            {!isCorridor && (
              <text x={rx + rw / 2} y={ry + rh / 2 + 5}
                textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="Inter, sans-serif">
                {room.area_m2.toFixed(1)} m²
              </text>
            )}
            {!isCorridor && rw > 35 && rh > 25 && (
              <text x={rx + rw / 2} y={ry + rh / 2 + 16}
                textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="Inter, monospace">
                {(room.w).toFixed(1)}\u00D7{(room.h).toFixed(1)}m
              </text>
            )}
            {!isCorridor && rw > 40 && rh > 30 && (
              <FurnitureSymbol roomType={room.room_type} x={rx} y={ry} w={rw} h={rh} />
            )}
          </g>
        );
      })}

      {openings.map((op, i) => {
        const isWindow = op.type === 'WINDOW' || op.type === 'RABSAL_SUNSPACE';
        const opWidthPx = Math.min(op.width_m * scale, outerWidthPx * 0.8);
        let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
        switch (op.wall_side) {
          case 'top':
            x1 = originX + op.center_x * scale - opWidthPx / 2;
            y1 = originY + outerHeightPx; x2 = x1 + opWidthPx; y2 = y1; break;
          case 'bottom':
            x1 = originX + op.center_x * scale - opWidthPx / 2;
            y1 = originY; x2 = x1 + opWidthPx; y2 = y1; break;
          case 'right':
            x1 = originX + outerWidthPx; y1 = originY + op.center_y * scale - opWidthPx / 2;
            x2 = x1; y2 = y1 + opWidthPx; break;
          case 'left':
            x1 = originX; y1 = originY + op.center_y * scale - opWidthPx / 2;
            x2 = x1; y2 = y1 + opWidthPx; break;
        }

        if (isWindow) {
          const isHoriz = op.wall_side === 'top' || op.wall_side === 'bottom';
          const off = 2.5;
          return (
            <g key={`op-${i}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0f1923" strokeWidth="6" />
              {isHoriz ? (
                <>
                  <line x1={x1} y1={y1 - off} x2={x2} y2={y2 - off} stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1={x1} y1={y1 + off} x2={x2} y2={y2 + off} stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1={(x1+x2)/2} y1={y1 - off} x2={(x1+x2)/2} y2={y1 + off} stroke="#38bdf8" strokeWidth="0.8" />
                </>
              ) : (
                <>
                  <line x1={x1 - off} y1={y1} x2={x2 - off} y2={y2} stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1={x1 + off} y1={y1} x2={x2 + off} y2={y2} stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1={x1 - off} y1={(y1+y2)/2} x2={x1 + off} y2={(y1+y2)/2} stroke="#38bdf8" strokeWidth="0.8" />
                </>
              )}
            </g>
          );
        } else {
          const arcR = opWidthPx * 0.7;
          let arcPath = '';
          switch (op.wall_side) {
            case 'top':
              arcPath = `M ${x1} ${y1} A ${arcR} ${arcR} 0 0 0 ${x1 + arcR * 0.7} ${y1 - arcR * 0.7}`; break;
            case 'bottom':
              arcPath = `M ${x1} ${y1} A ${arcR} ${arcR} 0 0 1 ${x1 + arcR * 0.7} ${y1 + arcR * 0.7}`; break;
            case 'right':
              arcPath = `M ${x1} ${y1} A ${arcR} ${arcR} 0 0 0 ${x1 - arcR * 0.7} ${y1 + arcR * 0.7}`; break;
            case 'left':
              arcPath = `M ${x1} ${y1} A ${arcR} ${arcR} 0 0 1 ${x1 + arcR * 0.7} ${y1 + arcR * 0.7}`; break;
          }
          return (
            <g key={`op-${i}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0f1923" strokeWidth="6" />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
              <path d={arcPath} fill="none" stroke="#92400e" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
            </g>
          );
        }
      })}

      {plan.staircase && (
        <StaircaseSymbol staircase={plan.staircase} originX={originX} originY={originY} scale={scale} />
      )}

      {/* Dimension Lines */}
      <g>
        <line x1={originX} y1={originY + outerHeightPx + 25} x2={originX + outerWidthPx} y2={originY + outerHeightPx + 25}
          stroke="#60a5fa" strokeWidth="0.8" />
        <line x1={originX} y1={originY + outerHeightPx + 20} x2={originX} y2={originY + outerHeightPx + 30} stroke="#60a5fa" strokeWidth="0.8" />
        <line x1={originX + outerWidthPx} y1={originY + outerHeightPx + 20} x2={originX + outerWidthPx} y2={originY + outerHeightPx + 30} stroke="#60a5fa" strokeWidth="0.8" />
        <text x={originX + outerWidthPx / 2} y={originY + outerHeightPx + 40}
          textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="bold" fontFamily="Inter, monospace">
          {L.toFixed(2)} m
        </text>
      </g>
      <g>
        <line x1={originX - 25} y1={originY} x2={originX - 25} y2={originY + outerHeightPx} stroke="#60a5fa" strokeWidth="0.8" />
        <line x1={originX - 20} y1={originY} x2={originX - 30} y2={originY} stroke="#60a5fa" strokeWidth="0.8" />
        <line x1={originX - 20} y1={originY + outerHeightPx} x2={originX - 30} y2={originY + outerHeightPx} stroke="#60a5fa" strokeWidth="0.8" />
        <text x={originX - 35} y={originY + outerHeightPx / 2}
          textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="bold" fontFamily="Inter, monospace"
          transform={`rotate(-90, ${originX - 35}, ${originY + outerHeightPx / 2})`}>
          {W.toFixed(2)} m
        </text>
      </g>

      {/* North Arrow */}
      <g transform={`translate(${originX + outerWidthPx + 40}, ${originY + 30})`}>
        <circle cx="0" cy="0" r="18" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
        <line x1="0" y1="12" x2="0" y2="-12" stroke="#ef4444" strokeWidth="2"
          transform={`rotate(${northArrowAngle})`} />
        <polygon points="0,-14 -4,-8 4,-8" fill="#ef4444"
          transform={`rotate(${northArrowAngle})`} />
        <text x="0" y="-22" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">N</text>
      </g>

      {/* Section Cut A-A */}
      <g opacity="0.5">
        <line x1={originX - 15} y1={originY + outerHeightPx / 2}
          x2={originX + outerWidthPx + 15} y2={originY + outerHeightPx / 2}
          stroke="#f472b6" strokeWidth="0.6" strokeDasharray="8 4 2 4" />
        <text x={originX - 18} y={originY + outerHeightPx / 2 + 3}
          textAnchor="end" fill="#f472b6" fontSize="8" fontWeight="bold">A</text>
        <text x={originX + outerWidthPx + 18} y={originY + outerHeightPx / 2 + 3}
          textAnchor="start" fill="#f472b6" fontSize="8" fontWeight="bold">A</text>
      </g>

      {/* Scale Bar */}
      <g transform={`translate(${originX}, ${originY + outerHeightPx + 52})`}>
        <line x1="0" y1="0" x2={scale} y2="0" stroke="#94a3b8" strokeWidth="2" />
        <line x1="0" y1="-3" x2="0" y2="3" stroke="#94a3b8" strokeWidth="1" />
        <line x1={scale} y1="-3" x2={scale} y2="3" stroke="#94a3b8" strokeWidth="1" />
        <text x={scale / 2} y="12" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="Inter, monospace">
          1.00 m
        </text>
      </g>

      {plan.floor_label && (
        <text x={originX + outerWidthPx / 2} y={originY - 12}
          textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif"
          letterSpacing="1">
          {plan.floor_label.toUpperCase()}
        </text>
      )}

      {showTitleBlock && (
        <g>
          <rect x={svgWidth - 195} y={svgHeight - 55} width="190" height="50"
            fill="rgba(15,25,35,0.9)" stroke="#334155" strokeWidth="1" rx="3" />
          <text x={svgWidth - 100} y={svgHeight - 40} textAnchor="middle"
            fill="#e2e8f0" fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif">
            THERMOSHELTER - {(designName ?? 'Passive Shelter').toUpperCase()}
          </text>
          <text x={svgWidth - 100} y={svgHeight - 28} textAnchor="middle"
            fill="#94a3b8" fontSize="7" fontFamily="Inter, sans-serif">
            Scale: 1:{Math.round(1000 / scale)} | Area: {(L * W).toFixed(1)} m\u00B2
          </text>
          <text x={svgWidth - 100} y={svgHeight - 16} textAnchor="middle"
            fill="#64748b" fontSize="6.5" fontFamily="Inter, monospace">
            DWG-{plan.purpose_profile_id ?? 'GEN'}-001 | {new Date().toISOString().slice(0, 10)}
          </text>
        </g>
      )}
    </>
  );
};

export const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({
  floorPlan,
  length: propLength,
  width: propWidth,
  wallThicknessM: propWallThick,
  orientationDeg: propOrient,
  wallMaterial: propWallMat = 'MAT-RAMMED',
  designState,
}) => {
  const L = designState?.geometry?.length_m ?? propLength ?? 6.0;
  const W = designState?.geometry?.width_m ?? propWidth ?? 4.0;
  const t = (designState?.envelope?.wall_thickness_mm ?? (propWallThick ? propWallThick * 1000 : 300)) / 1000.0;
  const wallMaterial = designState?.envelope?.wall_material_id ?? propWallMat;
  const floorArea = L * W;

  const isMultiFloor = floorPlan?.is_multi_floor === true && floorPlan?.floor_plans;

  if (isMultiFloor && floorPlan?.floor_plans) {
    const svgWidth = 1300;
    const svgHeight = 500;
    const halfW = svgWidth / 2;

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <PenTool className="w-4 h-4 text-cyan-400" />
              2D Duplex Blueprint — Architecture-Grade (SVG)
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              {L.toFixed(1)}m × {W.toFixed(1)}m per floor • {floorPlan.floor_plans.length} floors • {(floorArea * 2).toFixed(1)} m² total
            </span>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-wider">NOT FOR CONSTRUCTION</span>
          </div>
        </div>
        <div className="w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 overflow-x-auto p-4 flex justify-center">
          <div className="min-w-[1000px] w-full">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
              <g>
                <SingleFloorSVG plan={floorPlan.floor_plans[0]} L={L} W={W}
                  wallThickness={t} wallMaterial={wallMaterial}
                  svgWidth={halfW} svgHeight={svgHeight} padding={70}
                  designName={designState?.design_name} />
              </g>
              <line x1={halfW} y1="20" x2={halfW} y2={svgHeight - 20}
                stroke="#334155" strokeWidth="1" strokeDasharray="6 4" />
              <g transform={`translate(${halfW}, 0)`}>
                <SingleFloorSVG plan={floorPlan.floor_plans[1]} L={L} W={W}
                  wallThickness={t} wallMaterial={wallMaterial}
                  svgWidth={halfW} svgHeight={svgHeight} padding={70}
                  showTitleBlock={true} designName={designState?.design_name} />
              </g>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const svgWidth = 680;
  const svgHeight = 500;
  const padding = 80;

  const singlePlan: SingleFloorPlan = floorPlan ?? {
    outer_boundary: [[0, 0], [L, 0], [L, W], [0, W], [0, 0]],
    inner_boundary: [[t, t], [L - t, t], [L - t, W - t], [t, W - t], [t, t]],
    wall_thickness_m: t,
    openings: [],
    room_layouts: [],
    dimensions: [],
    north_arrow_angle_deg: (360 - (designState?.orientation_azimuth_deg ?? propOrient ?? 180)) % 360,
    orientation_azimuth_deg: designState?.orientation_azimuth_deg ?? propOrient ?? 180,
    floor_area_m2: floorArea,
    purpose_profile_id: designState?.purpose_profile_id,
  };

  const computedRoomLayouts = singlePlan.room_layouts ?? [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <PenTool className="w-4 h-4 text-cyan-400" />
            2D Architectural Blueprint — Zone-Based (SVG)
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            {L.toFixed(1)}m × {W.toFixed(1)}m = {floorArea.toFixed(1)} m² gross
            {computedRoomLayouts.length > 0 && ` • ${computedRoomLayouts.filter(r => r.room_type !== 'CIRCULATION').length} zones`}
            {singlePlan.has_corridor && ' • corridor'}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-[10px] font-bold tracking-wider">NOT FOR CONSTRUCTION</span>
        </div>
      </div>
      <div className="w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 overflow-x-auto p-4 flex justify-center">
        <div className="min-w-[600px] w-full max-w-4xl">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
            <SingleFloorSVG plan={singlePlan} L={L} W={W}
              wallThickness={t} wallMaterial={wallMaterial}
              svgWidth={svgWidth} svgHeight={svgHeight} padding={padding}
              showTitleBlock={true} designName={designState?.design_name} />
          </svg>
        </div>
      </div>
    </div>
  );
};

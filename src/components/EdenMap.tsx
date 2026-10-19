import { Check, Lock } from "lucide-react";
import type { KeyboardEvent } from "react";
import type { NodeStatus } from "../progress/path";
import { MODE_STYLE } from "./icons";
import type { GameMode } from "../content/types";

export interface MapSite {
  id: string;
  mode: GameMode | "intro";
  label: string;
  status: NodeStatus;
}

interface EdenMapProps {
  sites: MapSite[];
  selectedId: string | null;
  currentId: string | null;
  onSelect: (id: string) => void;
}

/** Site positions in map units, in path order: the garden first, then a clockwise loop. */
const POSITIONS: [number, number][] = [
  [180, 150],
  [118, 98],
  [96, 196],
  [176, 244],
  [262, 204],
  [256, 102],
  [182, 50],
];

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/**
 * A stylised map of Eden after Genesis 2:8–14: a garden from which one river
 * parts into four, with the lands the text names beside them. The layout is
 * illustrative, not geographic.
 */
export function EdenMap({ sites, selectedId, currentId, onSelect }: EdenMapProps) {
  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  };
  const points = sites.map((_, i) => POSITIONS[i % POSITIONS.length]);
  const doneUntil = sites.findIndex((s) => s.status !== "completed");
  const lastDone = doneUntil === -1 ? sites.length - 1 : doneUntil;
  const route = (from: number, to: number) => points.slice(from, to + 1).map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

  return (
    <svg viewBox="0 0 360 300" role="group" aria-label="Map of Eden">
      <rect className="map-bg" width="360" height="300" />
      {/* Terrain contours */}
      <g className="map-contour">
        <ellipse cx="180" cy="150" rx="70" ry="52" />
        <ellipse cx="180" cy="150" rx="112" ry="86" />
        <ellipse cx="180" cy="150" rx="158" ry="122" />
      </g>
      {/* The four rivers, Genesis 2:10–14 */}
      <g className="map-river">
        <path d="M180 150 C 150 128, 110 96, 40 30" />
        <path d="M180 150 C 148 176, 104 222, 34 284" />
        <path d="M180 150 C 214 126, 262 88, 330 26" />
        <path d="M180 150 C 214 176, 266 226, 334 282" />
      </g>
      <g className="map-river-label">
        <text x="40" y="58" transform="rotate(38 40 58)">PISHON</text>
        <text x="30" y="250" transform="rotate(-40 30 250)">GIHON</text>
        <text x="292" y="38" transform="rotate(-40 292 38)">HIDDEKEL</text>
        <text x="292" y="262" transform="rotate(41 292 262)">EUPHRATES</text>
      </g>
      <g className="map-land-label">
        <text x="14" y="112">HAVILAH</text>
        <text x="14" y="160">CUSH</text>
        <text x="346" y="150" textAnchor="end">ASSYRIA</text>
      </g>
      {/* The garden */}
      <circle className="map-garden" cx="180" cy="150" r="34" />
      <text className="map-garden-label" x="180" y="196" textAnchor="middle">EDEN</text>

      {/* Expedition route: travelled part solid, the rest dashed */}
      {lastDone > 0 && <path className="map-route map-route--done" d={route(0, lastDone)} />}
      <path className="map-route" d={route(lastDone, points.length - 1)} />

      {sites.map((site, i) => {
        const [x, y] = points[i];
        const Icon = site.status === "completed" ? Check : site.status === "locked" ? Lock : MODE_STYLE[site.mode].icon;
        const selected = site.id === selectedId;
        return (
          <g
            key={site.id}
            className={`map-site map-site--${site.status}${selected ? " is-selected" : ""}`}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            aria-label={site.label}
            onClick={() => onSelect(site.id)}
            onKeyDown={(e) => onKey(e, site.id)}
          >
            <circle cx={x} cy={y} r="30" fill="transparent" />
            <circle className="map-site__ring" cx={x} cy={y} r="26" />
            {site.id === currentId && <rect className="map-site__pulse" x={x - 15} y={y - 15} width="30" height="30" rx="6" />}
            <rect className="map-site__gem" x={x - 15} y={y - 15} width="30" height="30" rx="6" />
            <svg className="map-site__icon" x={x - 9} y={y - 9} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <Icon size={24} strokeWidth={2.6} />
            </svg>
            <text className="map-site__num" x={x} y={y + 33} textAnchor="middle">
              {ROMAN[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

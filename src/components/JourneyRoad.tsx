import { Check, Lock, Trophy, type LucideIcon } from "lucide-react";
import { useState } from "react";
import type { NodeStatus } from "../progress/path";

export interface RoadStop {
  id: string;
  name: string;
  icon: LucideIcon;
  status: NodeStatus;
  /** Second line: "Done", "Locked", a tier summary... */
  state: string;
  /** Call to action on the current stop, e.g. "Play". */
  action?: string;
  /** Shown when a locked stop is tapped. */
  lockedHint?: string;
  onOpen: () => void;
}

interface JourneyRoadProps {
  stops: RoadStop[];
  finish: { name: string; won: boolean };
}

const WIDTH = 340;
const ROW = 124;
const TOP = 56;
/**
 * Horizontal swing of the road, in pixels from the centre line. A stop never
 * sits on the centre line itself, so its label always fits on one side.
 */
const SWING = [-30, -90, -60, 30, 90, 60];

/**
 * One story drawn as a winding road with square milestone stones and a label
 * beside every stop. The travelled part of the road turns gold.
 */
export function JourneyRoad({ stops, finish }: JourneyRoadProps) {
  const [shaking, setShaking] = useState<string | null>(null);
  const points = [...stops, null].map((_, i) => ({ x: WIDTH / 2 + SWING[i % SWING.length], y: TOP + i * ROW }));
  const height = TOP + stops.length * ROW + TOP;

  const segment = (from: number, to: number) => {
    let d = `M${points[from].x} ${points[from].y}`;
    for (let i = from + 1; i <= to; i++) {
      const a = points[i - 1];
      const b = points[i];
      d += ` C${a.x} ${a.y + ROW / 2} ${b.x} ${b.y - ROW / 2} ${b.x} ${b.y}`;
    }
    return d;
  };
  const firstOpen = stops.findIndex((s) => s.status !== "completed");
  const travelled = firstOpen === -1 ? stops.length : firstOpen;

  return (
    <div className="road" style={{ height }}>
      <svg className="road__svg" width={WIDTH} height={height} aria-hidden="true">
        <path className="road__bed" d={segment(0, points.length - 1)} />
        {travelled > 0 && <path className="road__done" d={segment(0, travelled)} />}
        <path className="road__dash" d={segment(0, points.length - 1)} />
      </svg>

      {stops.map((stop, i) => {
        const { x, y } = points[i];
        const big = stop.status === "available" || stop.status === "in-progress";
        const half = big ? 38 : 32;
        const labelLeft = x > WIDTH / 2;
        const Icon = stop.status === "completed" ? Check : stop.status === "locked" ? Lock : stop.icon;
        const position = labelLeft
          ? { right: WIDTH - x - half, top: y, transform: "translateY(-50%)" }
          : { left: x - half, top: y, transform: "translateY(-50%)" };
        return (
          <button
            key={stop.id}
            type="button"
            className={`stop stop--${stop.status}${labelLeft ? " stop--left" : ""}${shaking === stop.id ? " is-shaking" : ""}`}
            style={position}
            aria-label={`${stop.name}. ${stop.state}`}
            onClick={() => {
              if (stop.status === "locked") {
                setShaking(stop.id);
                window.setTimeout(() => setShaking(null), 1600);
              } else stop.onOpen();
            }}
          >
            <span className="stop__stone">
              <Icon size={big ? 34 : 28} strokeWidth={2.6} aria-hidden="true" />
            </span>
            <span className="stop__label">
              <span className="stop__name">{stop.name}</span>
              <span className="stop__state">{stop.state}</span>
              {shaking === stop.id && stop.lockedHint && <span className="stop__hint">{stop.lockedHint}</span>}
              {stop.action && <span className="stop__go">{stop.action}</span>}
            </span>
          </button>
        );
      })}

      {(() => {
        const { x, y } = points[stops.length];
        const labelLeft = x > WIDTH / 2;
        const position = labelLeft
          ? { right: WIDTH - x - 32, top: y, transform: "translateY(-50%)" }
          : { left: x - 32, top: y, transform: "translateY(-50%)" };
        return (
          <div className={`stop stop--finish${finish.won ? " is-won" : ""}${labelLeft ? " stop--left" : ""}`} style={position}>
            <span className="stop__stone">
              <Trophy size={28} strokeWidth={2.6} aria-hidden="true" />
            </span>
            <span className="stop__label" style={{ background: "transparent", boxShadow: "none" }}>
              <span className="stop__name">{finish.name}</span>
            </span>
          </div>
        );
      })()}
    </div>
  );
}

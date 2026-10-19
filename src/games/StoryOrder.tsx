import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useMemo, useRef, useState, type PointerEvent } from "react";
import { Button } from "../components/Button";
import { formatRef, getContent } from "../content";
import type { StoryEvent } from "../content/types";
import type { GameProps } from "../engine/types";
import { useI18n } from "../i18n";
import { playCue } from "../lib/feedback";
import { shuffleChanged } from "../lib/random";
import { GameFooter, PromptCard } from "./shared";

const GAP = 10;

export function StoryOrder({ step, locked, onResolve }: GameProps<"story-order">) {
  const { t, language } = useI18n();
  const pack = getContent(language.code);
  const initial = useMemo(
    () => shuffleChanged(step.events, step.id, (a, b) => a.every((e, i) => e.id === b[i].id)),
    [step],
  );
  const [order, setOrder] = useState<StoryEvent[]>(initial);
  const [checked, setChecked] = useState(false);
  const [drag, setDrag] = useState<{ id: string; offset: number } | null>(null);
  const dragRef = useRef<{ id: string; startY: number; height: number } | null>(null);
  const disabled = checked || locked;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
  };

  const onPointerDown = (e: PointerEvent<HTMLElement>, id: string) => {
    if (disabled) return;
    const card = (e.currentTarget as HTMLElement).closest(".story-card") as HTMLElement | null;
    dragRef.current = { id, startY: e.clientY, height: (card?.offsetHeight ?? 64) + GAP };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id, offset: 0 });
    playCue("tap");
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    if (!d) return;
    let dy = e.clientY - d.startY;
    const index = order.findIndex((ev) => ev.id === d.id);
    if (dy > d.height / 2 && index < order.length - 1) {
      move(index, index + 1);
      d.startY += d.height;
      dy -= d.height;
    } else if (dy < -d.height / 2 && index > 0) {
      move(index, index - 1);
      d.startY -= d.height;
      dy += d.height;
    }
    setDrag({ id: d.id, offset: dy });
  };

  const endDrag = () => {
    dragRef.current = null;
    setDrag(null);
  };

  const check = () => {
    const allRight = order.every((ev, i) => ev.id === step.events[i].id);
    setChecked(true);
    onResolve({
      correct: allRight,
      correctCount: allRight ? 1 : 0,
      incorrectCount: allRight ? 0 : 1,
      detail: allRight ? undefined : (
        <div>
          <strong>{t("feedback.yourOrder")}</strong>
          <ol className="order-list">
            {step.events.map((ev) => (
              <li key={ev.id}>{ev.label}</li>
            ))}
          </ol>
        </div>
      ),
    });
  };

  return (
    <>
      <PromptCard>
        <p className="prompt-card__text">{step.prompt}</p>
      </PromptCard>
      <ol className="story-list">
        {order.map((ev, i) => {
          const isDragging = drag?.id === ev.id;
          const status = checked ? (ev.id === step.events[i].id ? " is-correct" : " is-wrong") : "";
          return (
            <li
              key={ev.id}
              className={`story-card${isDragging ? " is-dragging" : ""}${status}`}
              style={isDragging ? { transform: `translateY(${drag.offset}px)` } : undefined}
            >
              <span
                className="story-card__handle"
                onPointerDown={(e) => onPointerDown(e, ev.id)}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                role="img"
                aria-label={t("game.dragHandle", { label: ev.label })}
              >
                <GripVertical size={22} aria-hidden="true" />
              </span>
              <span className="story-card__index" aria-label={t("game.position", { n: i + 1 })}>
                {i + 1}
              </span>
              <span className="story-card__body">
                <span className="story-card__label">{ev.label}</span>
                {checked && <span className="story-card__ref">{formatRef(pack, ev.ref)}</span>}
              </span>
              <span className="story-card__arrows">
                <button type="button" className="mini-btn" onClick={() => move(i, i - 1)} disabled={disabled || i === 0} aria-label={t("game.moveUp", { label: ev.label })}>
                  <ChevronUp size={20} strokeWidth={2.8} />
                </button>
                <button type="button" className="mini-btn" onClick={() => move(i, i + 1)} disabled={disabled || i === order.length - 1} aria-label={t("game.moveDown", { label: ev.label })}>
                  <ChevronDown size={20} strokeWidth={2.8} />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <GameFooter>
        <Button block onClick={check} disabled={disabled}>
          {t("common.check")}
        </Button>
      </GameFooter>
    </>
  );
}

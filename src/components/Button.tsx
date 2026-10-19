import type { ButtonHTMLAttributes, ReactNode } from "react";
import { playCue } from "../lib/feedback";

type Variant = "primary" | "secondary" | "blue" | "coral" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "md" | "lg";
  block?: boolean;
  icon?: ReactNode;
}

/** Chunky pressable button with a solid "ledge" that compresses on press. */
export function Button({ variant = "primary", size = "lg", block, icon, className = "", children, onClick, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn--${variant} btn--${size}${block ? " btn--block" : ""} ${className}`}
      onClick={(e) => {
        playCue("tap");
        onClick?.(e);
      }}
      {...rest}
    >
      {icon}
      {children && <span>{children}</span>}
    </button>
  );
}

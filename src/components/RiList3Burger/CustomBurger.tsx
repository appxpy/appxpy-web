import { useState } from "react";

interface BurgerProps {
  color?: string;
  direction?: "left" | "right";
  distance?: "sm" | "md" | "lg";
  duration?: number;
  easing?: string;
  hideOutline?: boolean;
  label?: string;
  lines?: number;
  onToggle?: (isToggled: boolean) => void;
  render: (props: {
    barHeight: number;
    barStyles: React.CSSProperties;
    burgerStyles: React.CSSProperties;
    easing: string;
    handler: () => void;
    isLeft: boolean;
    isToggled: boolean;
    label?: string;
    margin: number;
    move: number;
    time: number;
    topOffset: number;
    width: number;
  }) => React.ReactElement;
  rounded?: boolean;
  size?: number;
  toggle?: (isToggled: boolean) => void;
  toggled?: boolean;
}

const area = 48;

export const Burger: React.FC<BurgerProps> = ({
  direction = "left",
  distance = "md",
  duration = 0.4,
  easing = "cubic-bezier(0, 0, 0, 1)",
  hideOutline = true,
  label,
  lines = 3,
  onToggle,
  render,
  rounded = false,
  size = 32,
  toggle,
  toggled,
}: BurgerProps) => {
  const [toggledInternal, toggleInternal] = useState(false);

  const width = Math.max(12, Math.min(area, size));
  const room = Math.round((area - width) / 2);

  const barHeightRaw = width / 12;
  const barHeight = Math.round(barHeightRaw);

  const space = distance === "lg" ? 0.25 : distance === "sm" ? 0.75 : 0.5;
  const marginRaw = width / (lines * (space + (lines === 3 ? 1 : 1.25)));
  const margin = Math.round(marginRaw);

  const height = barHeight * lines + margin * (lines - 1);
  const topOffset = Math.round((area - height) / 2);

  const translate =
    lines === 3
      ? distance === "lg"
        ? 4.0425
        : distance === "sm"
        ? 5.1625
        : 4.6325
      : distance === "lg"
      ? 6.7875
      : distance === "sm"
      ? 8.4875
      : 7.6675;
  const deviation =
    (barHeightRaw - barHeight + (marginRaw - margin)) / (lines === 3 ? 1 : 2);
  const move = parseFloat((width / translate - deviation / (4 / 3)).toFixed(2));
  const time = Math.max(0, duration);

  const burgerStyles: React.CSSProperties = {
    cursor: "pointer",
    height: `${area}px`,
    position: "relative",
    transition: `${time}s ${easing}`,
    userSelect: "none",
    width: `${area}px`,
  };

  const barStyles: React.CSSProperties = {
    height: `${barHeight}px`,
    left: `${room}px`,
    position: "absolute",
  };

  if (hideOutline) {
    burgerStyles["outline"] = "none";
  }

  if (rounded) {
    barStyles["borderRadius"] = "9em";
  }

  const toggleFunction = toggle || toggleInternal;
  const isToggled = toggled !== undefined ? toggled : toggledInternal;

  const handler = () => {
    toggleFunction(!isToggled);

    if (typeof onToggle === "function") onToggle(!isToggled);
  };

  return render({
    barHeight,
    barStyles,
    burgerStyles,
    easing,
    handler,
    isLeft: direction === "left",
    isToggled,
    label,
    margin,
    move,
    time,
    topOffset,
    width,
  });
};

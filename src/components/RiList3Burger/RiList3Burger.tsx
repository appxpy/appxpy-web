import React from "react";
import { Burger } from "./CustomBurger";

interface RiList3FadeProps {
  size: number;
}

export const RiList3Fade: React.FC<RiList3FadeProps> = (
  props: RiList3FadeProps
) => (
  <Burger
    {...props}
    render={(o) => (
      <div
        className="hamburger-react group hover:opacity-70"
        aria-label={o.label}
        aria-expanded={o.isToggled}
        data-testid="fade"
        onClick={o.handler}
        onKeyUp={(e) => e.key === "Enter" && o.handler()}
        role="button"
        style={o.burgerStyles}
        tabIndex={0}
      >
        <div
          style={{
            ...o.barStyles,
            width: `${o.width}px`,
            top: `${o.topOffset}px`,
            transition: `${o.time}s ${o.easing}`,
            transform: `${
              o.isToggled
                ? `rotate(${45 * (o.isLeft ? -1 : 1)}deg) translate(${
                    o.move * (o.isLeft ? -1 : 1)
                  }px, ${o.move}px)`
                : "none"
            }`,
          }}
          className="bg-primary group-hover:bg-transparent outline-[1px] outline-offset-[-.5px] outline-primary outline"
        />

        <div
          style={{
            ...o.barStyles,
            width: `${Math.round(o.width * (2 / 3))}px`,
            top: `${o.topOffset + o.barHeight + o.margin}px`,
            left: "unset",
            right: `${o.barStyles.left}`,
            transition: `${o.time}s ${o.easing}`,
            opacity: `${o.isToggled ? "0" : "1"}`,
          }}
          className="bg-primary group-hover:bg-transparent outline-[1px] outline-offset-[-.5px] outline-primary outline"
        />

        <div
          style={{
            ...o.barStyles,
            width: `${o.width}px`,
            top: `${o.topOffset + o.barHeight * 2 + o.margin * 2}px`,
            transition: `${o.time}s ${o.easing}`,
            transform: `${
              o.isToggled
                ? `rotate(${45 * (o.isLeft ? 1 : -1)}deg) translate(${
                    o.move * (o.isLeft ? -1 : 1)
                  }px, ${o.move * -1}px)`
                : "none"
            }`,
          }}
          className="bg-primary group-hover:bg-transparent outline-[1px] outline-offset-[-.5px] outline-primary outline"
        />
      </div>
    )}
  />
);

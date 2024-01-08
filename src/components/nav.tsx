import React from "react";
import { ReactComponent as LogoSVG } from "../assets/appxpy-logo.svg";

interface LogoProps {
  size: number;
}

export const Logo: React.FC<LogoProps> = ({ ...props }: LogoProps) => {
  const hw = `${props.size}px`;
  return (
    <div
      className="relative flex items-center justify-center group"
      style={{ width: hw, height: hw }}
    >
      <LogoSVG
        width={hw}
        height={hw}
        className="stroke-primary stroke-[25] hover:fill-transparent hover:opacity-70 fill-primary transition-all duration-300"
      ></LogoSVG>
    </div>
  );
};

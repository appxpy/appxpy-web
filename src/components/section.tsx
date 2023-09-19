import React from "react";

interface SectionProps {
  id?: string;
  className?: string[];
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Section = ({ ...props }: SectionProps) => {
  const classes = props.className ? props.className : [];
  const style = props.style ? props.style : {};
  const id = props.id ? props.id : "";
  const idInner = id ? id + "-inner" : "";

  return (
    <section id={id} className={[...classes].join(" ")} style={style}>
      <div
        id={idInner}
        className={`flex flex-1 flex-col gap-6 ${
          props.id === "titles"
            ? "md:flex-row md:justify-between md:gap-16 lg:flex-row lg:gap-32 lg:justify-end"
            : ""
        } ${
          props.id == "links"
            ? "[&>:not(:last-child)]:hidden lg:[&>:not(:last-child)]:flex lg:flex-row lg:justify-center"
            : ""
        }`}
      >
        {props.children}
      </div>
    </section>
  );
};

import React from "react";

interface LinksItemProps {
  href: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const LinksItem: React.FC<LinksItemProps> = ({
  href,
  disabled,
  children,
}: LinksItemProps) => {
  const disabledLinkStyle: React.CSSProperties = {
    color: "gray",
    pointerEvents: "none",
  };
  return (
    <div className="flex flex-nowrap flex-row items-center justify-end">
      <a
        className="m-0 p-0 text-primary opacity-80 text-base font-medium leading-4 flex items-center gap-[6px] no-underline lowercase lg:text-start lg:[writing-mode:vertical-lr] lg:rotate-180"
        href={href}
        style={disabled ? disabledLinkStyle : {}}
      >
        {children}
      </a>
    </div>
  );
};

interface LinksTitle {
  type: "title" | "subtitle";
  text: string;
}

interface LinksProps {
  id?: string;
  title: LinksTitle[];
  children?: React.ReactNode;
}

const Links: React.FC<LinksProps> = ({ id, title, children }: LinksProps) => {
  const multilineTitle: React.ReactNode = title.map(
    (value: LinksTitle, index: number) => {
      if (value.type === "subtitle") {
        return (
          <h2
            key={index}
            className="inline-block m-0 text-right text-transparent stroke tracking-[6px] opacity-70 lg:uppercase lg:text-start lg:overflow-hidden lg:h-[calc(4ch+32px)] lg:tracking-wider text-[32px] font-bold lg:hidden"
          >
            {value.text}
          </h2>
        );
      }
      return (
        <h1
          key={index}
          className="m-0 text-right text-transparent stroke tracking-[6px] opacity-70 lg:uppercase lg:text-start lg:overflow-hidden lg:w-[calc(4ch+32px)] lg:-rotate-90 lg:-translate-y-1/2 lg:-translate-x-1/2 text-[46px] lg:text-[72px] font-bold"
        >
          {value.text}
        </h1>
      );
    }
  );
  return (
    <div
      id={id ? id : ""}
      className="flex w-full flex-nowrap flex-row items-center justify-end"
    >
      <div className="flex flex-col flex-nowrap items-end justify-center gap-6 lg:flex-row">
        <div className="flex lg:w-6 flex-col flex-nowrap select-none">
          {multilineTitle}
        </div>
        <div className="w-[180px] opacity-50 h-px bg-primary rotate-[175deg] lg:w-px lg:h-[140px]"></div>
        <div className="flex flex-col flex-nowrap items-end justify-center gap-[6px] lg:flex-row lg:gap-[12px]">
          {children}
        </div>
      </div>
    </div>
  );
};

export { Links, LinksItem };
export type { LinksItemProps, LinksProps };
